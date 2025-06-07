import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { db, eq, sql, tables } from "@openllm/db";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { posthog } from "./posthog";
import { stripe } from "./routes/payments";

import type { ServerTypes } from "./vars";
import type Stripe from "stripe";

export async function ensureStripeCustomer(
	organizationId: string,
): Promise<string> {
	const organization = await db.query.organization.findFirst({
		where: {
			id: organizationId,
		},
	});

	if (!organization) {
		throw new Error(`Organization not found: ${organizationId}`);
	}

	let stripeCustomerId = organization.stripeCustomerId;
	if (!stripeCustomerId) {
		const customer = await stripe.customers.create({
			metadata: {
				organizationId,
			},
		});
		stripeCustomerId = customer.id;

		await db
			.update(tables.organization)
			.set({
				stripeCustomerId,
			})
			.where(eq(tables.organization.id, organizationId));
	}

	return stripeCustomerId;
}

/**
 * Unified helper to resolve organizationId from various Stripe event sources
 * and validate that the organization exists in the database.
 */
async function resolveOrganizationFromStripeEvent(eventData: {
	metadata?: { organizationId?: string };
	customer?: string;
	subscription?: string;
	lines?: { data?: Array<{ metadata?: { organizationId?: string } }> };
}): Promise<{ organizationId: string; organization: any } | null> {
	let organizationId: string | null = null;

	// 1. Try to get organizationId from direct metadata
	if (eventData.metadata?.organizationId) {
		organizationId = eventData.metadata.organizationId;
		console.log(`Found organizationId in direct metadata: ${organizationId}`);
	}

	// 2. Check line items metadata (common in invoices)
	if (!organizationId && eventData.lines?.data) {
		console.log(
			`Checking ${eventData.lines.data.length} line items for organizationId`,
		);
		for (const lineItem of eventData.lines.data) {
			if (lineItem.metadata?.organizationId) {
				organizationId = lineItem.metadata.organizationId;
				console.log(
					`Found organizationId in line item metadata: ${organizationId}`,
				);
				break;
			}
		}
	}

	// 3. Try to get from subscription metadata if subscription ID is available
	if (!organizationId && eventData.subscription) {
		try {
			const stripeSubscription = await stripe.subscriptions.retrieve(
				eventData.subscription,
			);
			if (stripeSubscription.metadata?.organizationId) {
				organizationId = stripeSubscription.metadata.organizationId;
				console.log(
					`Found organizationId in subscription metadata: ${organizationId}`,
				);
			}
		} catch (error) {
			console.error("Error retrieving subscription:", error);
		}
	}

	// 4. Fallback: find organization by Stripe customer ID
	if (!organizationId && eventData.customer) {
		const organization = await db.query.organization.findFirst({
			where: {
				stripeCustomerId: eventData.customer,
			},
		});

		if (organization) {
			organizationId = organization.id;
			console.log(
				`Found organizationId via customer lookup: ${organizationId}`,
			);
		}
	}

	if (!organizationId) {
		console.error(`Organization not found for event data:`, {
			hasMetadata: !!eventData.metadata,
			customer: eventData.customer,
			subscription: eventData.subscription,
			lineItemsCount: eventData.lines?.data?.length || 0,
		});
		return null;
	}

	// Validate that the organization exists
	const organization = await db.query.organization.findFirst({
		where: {
			id: organizationId,
		},
	});

	if (!organization) {
		console.error(
			`Organization with ID ${organizationId} does not exist in database`,
		);
		return null;
	}

	console.log(
		`Successfully resolved organization: ${organization.name} (${organization.id})`,
	);
	return { organizationId, organization };
}

export const stripeRoutes = new OpenAPIHono<ServerTypes>();

const webhookHandler = createRoute({
	method: "post",
	path: "/webhook",
	request: {},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: z.object({
						received: z.boolean(),
					}),
				},
			},
			description: "Webhook received successfully",
		},
	},
});

stripeRoutes.openapi(webhookHandler, async (c) => {
	const sig = c.req.header("stripe-signature");

	if (!sig) {
		throw new HTTPException(400, {
			message: "Missing stripe-signature header",
		});
	}

	try {
		const body = await c.req.raw.text();
		const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

		const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

		console.log(JSON.stringify({ kind: "stripe-event", payload: event }));

		switch (event.type) {
			case "payment_intent.succeeded":
				await handlePaymentIntentSucceeded(event);
				break;
			case "payment_intent.payment_failed":
				await handlePaymentIntentFailed(event);
				break;
			case "setup_intent.succeeded":
				await handleSetupIntentSucceeded(event);
				break;
			case "invoice.payment_succeeded":
				await handleInvoicePaymentSucceeded(event);
				break;
			case "customer.subscription.updated":
				await handleSubscriptionUpdated(event);
				break;
			case "customer.subscription.deleted":
				await handleSubscriptionDeleted(event);
				break;
			default:
				console.log(`Unhandled event type: ${event.type}`);
		}

		return c.json({ received: true });
	} catch (error) {
		console.error("Webhook error:", error);
		throw new HTTPException(400, {
			message: `Webhook error: ${error instanceof Error ? error.message : "Unknown error"}`,
		});
	}
});

async function handlePaymentIntentSucceeded(
	event: Stripe.PaymentIntentSucceededEvent,
) {
	const paymentIntent = event.data.object;
	const { metadata, amount } = paymentIntent;

	const result = await resolveOrganizationFromStripeEvent({
		metadata,
	});

	if (!result) {
		console.error("Could not resolve organization from payment intent");
		return;
	}

	const { organizationId, organization } = result;

	// Convert amount from cents to dollars
	const totalAmountInDollars = amount / 100;

	// Get the credit amount (base amount without fees) from metadata
	const creditAmount = paymentIntent.metadata?.baseAmount
		? parseFloat(paymentIntent.metadata.baseAmount)
		: totalAmountInDollars; // Fallback for legacy transactions

	// Update organization credits with credit amount only (fees are not added as credits)
	await db
		.update(tables.organization)
		.set({
			credits: sql`${tables.organization.credits} + ${creditAmount}`,
		})
		.where(eq(tables.organization.id, organizationId));

	// Check if this is an auto top-up with an existing pending transaction
	const transactionId = metadata?.transactionId;
	if (transactionId) {
		// Update existing pending transaction
		const updatedTransaction = await db
			.update(tables.transaction)
			.set({
				status: "completed",
				description: "Auto top-up completed via Stripe webhook",
				creditAmount: creditAmount.toString(),
				totalAmount: totalAmountInDollars.toString(),
			})
			.where(eq(tables.transaction.id, transactionId))
			.returning()
			.then((rows) => rows[0]);

		if (updatedTransaction) {
			console.log(
				`Updated pending transaction ${transactionId} to completed for organization ${organizationId}`,
			);
		} else {
			console.warn(
				`Could not find pending transaction ${transactionId} for organization ${organizationId}`,
			);
			// Fallback: create new transaction record
			await db.insert(tables.transaction).values({
				organizationId,
				type: "credit_topup",
				amount: totalAmountInDollars.toString(), // Legacy field
				creditAmount: creditAmount.toString(),
				totalAmount: totalAmountInDollars.toString(),
				currency: paymentIntent.currency.toUpperCase(),
				status: "completed",
				stripePaymentIntentId: paymentIntent.id,
				description: "Credit top-up via Stripe (fallback)",
			});
		}
	} else {
		// Create new transaction record (for manual top-ups or old auto top-ups)
		await db.insert(tables.transaction).values({
			organizationId,
			type: "credit_topup",
			amount: totalAmountInDollars.toString(), // Legacy field
			creditAmount: creditAmount.toString(),
			totalAmount: totalAmountInDollars.toString(),
			currency: paymentIntent.currency.toUpperCase(),
			status: "completed",
			stripePaymentIntentId: paymentIntent.id,
			description: "Credit top-up via Stripe",
		});
	}

	posthog.groupIdentify({
		groupType: "organization",
		groupKey: organizationId,
		properties: {
			name: organization.name,
		},
	});
	posthog.capture({
		distinctId: "organization",
		event: "credits_purchased",
		groups: {
			organization: organizationId,
		},
		properties: {
			amount: creditAmount,
			totalPaid: totalAmountInDollars,
			source: "payment_intent",
			organization: organizationId,
		},
	});

	console.log(
		`Added ${creditAmount} credits to organization ${organizationId} (paid ${totalAmountInDollars} including fees)`,
	);
}

async function handlePaymentIntentFailed(
	event: Stripe.PaymentIntentPaymentFailedEvent,
) {
	const paymentIntent = event.data.object;
	const { metadata } = paymentIntent;

	const result = await resolveOrganizationFromStripeEvent({
		metadata,
	});

	if (!result) {
		console.error("Could not resolve organization from failed payment intent");
		return;
	}

	const { organizationId } = result;

	// Check if this is an auto top-up with an existing pending transaction
	const transactionId = metadata?.transactionId;
	if (transactionId) {
		// Update existing pending transaction to failed
		const updatedTransaction = await db
			.update(tables.transaction)
			.set({
				status: "failed",
				description: `Auto top-up failed via Stripe webhook: ${paymentIntent.last_payment_error?.message || "Unknown error"}`,
			})
			.where(eq(tables.transaction.id, transactionId))
			.returning()
			.then((rows) => rows[0]);

		if (updatedTransaction) {
			console.log(
				`Updated pending transaction ${transactionId} to failed for organization ${organizationId}`,
			);
		} else {
			console.warn(
				`Could not find pending transaction ${transactionId} for organization ${organizationId}`,
			);
		}
	}

	console.log(
		`Payment intent failed for organization ${organizationId}: ${paymentIntent.last_payment_error?.message || "Unknown error"}`,
	);
}

async function handleSetupIntentSucceeded(
	event: Stripe.SetupIntentSucceededEvent,
) {
	const setupIntent = event.data.object;
	const { metadata, payment_method } = setupIntent;
	const organizationId = metadata?.organizationId;

	if (!organizationId || !payment_method) {
		console.error("Missing organizationId or payment_method in setupIntent");
		return;
	}

	let stripeCustomerId;
	try {
		stripeCustomerId = await ensureStripeCustomer(organizationId);
	} catch (error) {
		console.error(`Error ensuring Stripe customer: ${error}`);
		return;
	}

	const paymentMethodId =
		typeof payment_method === "string" ? payment_method : payment_method.id;

	await stripe.paymentMethods.attach(paymentMethodId, {
		customer: stripeCustomerId,
	});

	const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

	const existingPaymentMethods = await db.query.paymentMethod.findMany({
		where: {
			organizationId,
		},
	});

	const isDefault = existingPaymentMethods.length === 0;

	await db.insert(tables.paymentMethod).values({
		stripePaymentMethodId: paymentMethodId,
		organizationId,
		type: paymentMethod.type,
		isDefault,
	});
}

async function handleInvoicePaymentSucceeded(
	event: Stripe.InvoicePaymentSucceededEvent,
) {
	const invoice = event.data.object;
	const { customer, metadata } = invoice;
	const subscription = (invoice as any).subscription;

	// Extract subscription ID from line items if not directly available
	let subscriptionId =
		typeof subscription === "string" ? subscription : subscription?.id;
	if (
		!subscriptionId &&
		invoice.lines &&
		invoice.lines.data &&
		invoice.lines.data.length > 0
	) {
		const firstLineItem = invoice.lines.data[0];
		if (
			firstLineItem.parent &&
			firstLineItem.parent.subscription_item_details
		) {
			subscriptionId =
				firstLineItem.parent.subscription_item_details.subscription;
		}
	}

	console.log(
		`Processing invoice payment succeeded for customer: ${customer}, subscription: ${subscriptionId}`,
	);

	if (!subscriptionId) {
		console.log("Not a subscription invoice, skipping");
		return; // Not a subscription invoice
	}

	const result = await resolveOrganizationFromStripeEvent({
		metadata: metadata as { organizationId?: string } | undefined,
		customer: typeof customer === "string" ? customer : customer?.id,
		subscription: subscriptionId,
		lines: invoice.lines,
	});

	if (!result) {
		console.error(
			`Organization not found for customer: ${customer}, subscription: ${subscriptionId}`,
		);
		return;
	}

	const { organizationId, organization } = result;

	console.log(
		`Found organization: ${organization.name} (${organization.id}), current plan: ${organization.plan}`,
	);

	// Create transaction record for subscription start
	await db.insert(tables.transaction).values({
		organizationId,
		type: "subscription_start",
		amount: (invoice.amount_paid / 100).toString(),
		currency: invoice.currency.toUpperCase(),
		status: "completed",
		stripePaymentIntentId: (invoice as any).payment_intent,
		stripeInvoiceId: invoice.id,
		description: "Pro subscription started",
	});

	// Update organization to pro plan and mark subscription as not cancelled
	try {
		const result = await db
			.update(tables.organization)
			.set({
				plan: "pro",
				subscriptionCancelled: false,
			})
			.where(eq(tables.organization.id, organizationId))
			.returning();

		console.log(
			`Successfully upgraded organization ${organizationId} to pro plan. Updated rows:`,
			result.length,
		);

		// Verify the update
		const updatedOrganization = await db.query.organization.findFirst({
			where: {
				id: organizationId,
			},
		});

		console.log(
			`Verification - organization plan is now: ${updatedOrganization?.plan}`,
		);

		// Track subscription creation in PostHog
		posthog.groupIdentify({
			groupType: "organization",
			groupKey: organizationId,
			properties: {
				name: organization.name,
			},
		});
		posthog.capture({
			distinctId: "organization",
			event: "subscription_created",
			groups: {
				organization: organizationId,
			},
			properties: {
				plan: "pro",
				organization: organizationId,
				subscriptionId: subscriptionId,
				source: "stripe_invoice",
			},
		});
	} catch (error) {
		console.error(
			`Error updating organization ${organizationId} to pro plan:`,
			error,
		);
		throw error;
	}
}

async function handleSubscriptionUpdated(
	event: Stripe.CustomerSubscriptionUpdatedEvent,
) {
	const subscription = event.data.object;
	const { customer, metadata } = subscription;

	const current_period_end =
		subscription.items.data.length > 0
			? subscription.items.data[0].current_period_end
			: undefined;

	const result = await resolveOrganizationFromStripeEvent({
		metadata: metadata as { organizationId?: string } | undefined,
		customer: typeof customer === "string" ? customer : customer?.id,
		subscription: subscription.id,
	});

	if (!result) {
		console.error(`Organization not found for customer: ${customer}`);
		return;
	}

	const { organizationId, organization } = result;

	// Update plan expiration date
	const planExpiresAt = current_period_end
		? new Date(current_period_end * 1000)
		: undefined;

	// Check if subscription is active and organization was previously cancelled
	const isSubscriptionActive = subscription.status === "active";
	const wasSubscriptionCancelled = organization.subscriptionCancelled;

	// Create transaction record for subscription cancellation if it was cancelled
	if (!isSubscriptionActive && !wasSubscriptionCancelled) {
		await db.insert(tables.transaction).values({
			organizationId,
			type: "subscription_cancel",
			amount: "0",
			currency: "USD",
			status: "completed",
			stripeInvoiceId: subscription.latest_invoice as string,
			description: "Pro subscription cancelled",
		});
	}

	await db
		.update(tables.organization)
		.set({
			planExpiresAt,
			subscriptionCancelled: !isSubscriptionActive,
		})
		.where(eq(tables.organization.id, organizationId));

	// Track subscription reactivation if it was previously cancelled and is now active
	if (isSubscriptionActive && wasSubscriptionCancelled) {
		posthog.groupIdentify({
			groupType: "organization",
			groupKey: organizationId,
			properties: {
				name: organization.name,
			},
		});
		posthog.capture({
			distinctId: "organization",
			event: "subscription_reactivated",
			groups: {
				organization: organizationId,
			},
			properties: {
				plan: "pro",
				organization: organizationId,
				source: "stripe_subscription_updated",
			},
		});
		console.log(`Reactivated subscription for organization ${organizationId}`);
	}

	console.log(
		`Updated subscription for organization ${organizationId}, expires at: ${planExpiresAt}, cancelled: ${!isSubscriptionActive}`,
	);
}

async function handleSubscriptionDeleted(
	event: Stripe.CustomerSubscriptionDeletedEvent,
) {
	const subscription = event.data.object;
	const { customer, metadata } = subscription;

	const result = await resolveOrganizationFromStripeEvent({
		metadata: metadata as { organizationId?: string } | undefined,
		customer: typeof customer === "string" ? customer : customer?.id,
	});

	if (!result) {
		console.error(`Organization not found for customer: ${customer}`);
		return;
	}

	const { organizationId } = result;

	// Create transaction record for subscription end
	await db.insert(tables.transaction).values({
		organizationId,
		type: "subscription_end",
		amount: "0",
		currency: "USD",
		status: "completed",
		stripeInvoiceId: subscription.latest_invoice as string,
		description: "Pro subscription ended",
	});

	// Downgrade organization to free plan and mark subscription as cancelled
	await db
		.update(tables.organization)
		.set({
			plan: "free",
			stripeSubscriptionId: null,
			planExpiresAt: null,
			subscriptionCancelled: true,
		})
		.where(eq(tables.organization.id, organizationId));

	// Track subscription cancellation in PostHog
	posthog.groupIdentify({
		groupType: "organization",
		groupKey: organizationId,
		properties: {
			name: result.organization.name,
		},
	});
	posthog.capture({
		distinctId: "organization",
		event: "subscription_cancelled",
		groups: {
			organization: organizationId,
		},
		properties: {
			previousPlan: "pro",
			newPlan: "free",
			organization: organizationId,
			source: "stripe_subscription_deleted",
		},
	});

	console.log(`Downgraded organization ${organizationId} to free plan`);
}
