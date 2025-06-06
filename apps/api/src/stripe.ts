import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { db, eq, sql, tables } from "@openllm/db";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { posthog } from "./posthog";
import { stripe } from "./routes/payments";

import type { ServerTypes } from "./vars";

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
				updatedAt: new Date(),
			})
			.where(eq(tables.organization.id, organizationId));
	}

	return stripeCustomerId;
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
				await handlePaymentIntentSucceeded(event.data.object);
				break;
			case "payment_intent.payment_failed":
				break;
			case "setup_intent.succeeded":
				await handleSetupIntentSucceeded(event.data.object);
				break;
			case "invoice.payment_succeeded":
				await handleInvoicePaymentSucceeded(event.data.object);
				break;
			case "customer.subscription.updated":
				await handleSubscriptionUpdated(event.data.object);
				break;
			case "customer.subscription.deleted":
				await handleSubscriptionDeleted(event.data.object);
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

async function handlePaymentIntentSucceeded(paymentIntent: any) {
	const { metadata, amount } = paymentIntent;
	const { organizationId } = metadata;

	if (!organizationId) {
		console.error("Missing organizationId in paymentIntent metadata");
		return;
	}

	const organization = await db.query.organization.findFirst({
		where: {
			id: organizationId,
		},
	});

	if (!organization) {
		console.error(`Organization not found: ${organizationId}`);
		return;
	}

	// Convert amount from cents to dollars
	const amountInDollars = amount / 100;

	// Update organization credits
	await db
		.update(tables.organization)
		.set({
			credits: sql`${tables.organization.credits} + ${amountInDollars}`,
			updatedAt: new Date(),
		})
		.where(eq(tables.organization.id, organizationId));

	// Insert entry into organization_action table
	await db.insert(tables.organizationAction).values({
		organizationId,
		type: "credit",
		amount: amountInDollars.toString(),
		description: "Payment received via Stripe",
		createdAt: new Date(),
		updatedAt: new Date(),
	});

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
			amount: amountInDollars,
			source: "payment_intent",
			organization: organizationId,
		},
	});

	console.log(
		`Added ${amountInDollars} credits to organization ${organizationId}`,
	);
}

async function handleSetupIntentSucceeded(setupIntent: any) {
	const { metadata, payment_method } = setupIntent;
	const { organizationId } = metadata;

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

	await stripe.paymentMethods.attach(payment_method, {
		customer: stripeCustomerId,
	});

	const paymentMethod = await stripe.paymentMethods.retrieve(payment_method);

	const existingPaymentMethods = await db.query.paymentMethod.findMany({
		where: {
			organizationId,
		},
	});

	const isDefault = existingPaymentMethods.length === 0;

	await db.insert(tables.paymentMethod).values({
		stripePaymentMethodId: payment_method,
		organizationId,
		type: paymentMethod.type,
		isDefault,
		createdAt: new Date(),
		updatedAt: new Date(),
	});
}

async function handleInvoicePaymentSucceeded(invoice: any) {
	const { customer, subscription } = invoice;

	if (!subscription) {
		return; // Not a subscription invoice
	}

	// Try to get organization ID from subscription metadata first
	let organizationId = null;

	// Check if we have organizationId in the invoice metadata
	if (metadata && metadata.organizationId) {
		organizationId = metadata.organizationId;
	} else {
		// Fallback: get subscription details to find organizationId
		try {
			const stripeSubscription =
				await stripe.subscriptions.retrieve(subscription);
			if (
				stripeSubscription.metadata &&
				stripeSubscription.metadata.organizationId
			) {
				organizationId = stripeSubscription.metadata.organizationId;
			}
		} catch (error) {
			console.error("Error retrieving subscription:", error);
		}
	}

	// If we still don't have organizationId, try to find by customer ID
	if (!organizationId) {
		const organization = await db.query.organization.findFirst({
			where: {
				stripeCustomerId: customer,
			},
		});

		if (organization) {
			organizationId = organization.id;
		}
	}

	if (!organizationId) {
		console.error(
			`Organization not found for customer: ${customer}, subscription: ${subscription}`,
		);
		return;
	}

	// Update organization to pro plan
	await db
		.update(tables.organization)
		.set({
			plan: "pro",
			updatedAt: new Date(),
		})
		.where(eq(tables.organization.id, organizationId));

	console.log(`Upgraded organization ${organizationId} to pro plan`);
}

async function handleSubscriptionUpdated(subscription: any) {
	const { customer, current_period_end } = subscription;

	// Find organization by Stripe customer ID
	const organization = await db.query.organization.findFirst({
		where: {
			stripeCustomerId: customer,
		},
	});

	if (!organization) {
		console.error(`Organization not found for customer: ${customer}`);
		return;
	}

	// Update plan expiration date
	const planExpiresAt = new Date(current_period_end * 1000);

	await db
		.update(tables.organization)
		.set({
			planExpiresAt,
			updatedAt: new Date(),
		})
		.where(eq(tables.organization.id, organization.id));

	console.log(
		`Updated subscription for organization ${organization.id}, expires at: ${planExpiresAt}`,
	);
}

async function handleSubscriptionDeleted(subscription: any) {
	const { customer } = subscription;

	// Find organization by Stripe customer ID
	const organization = await db.query.organization.findFirst({
		where: {
			stripeCustomerId: customer,
		},
	});

	if (!organization) {
		console.error(`Organization not found for customer: ${customer}`);
		return;
	}

	// Downgrade organization to free plan
	await db
		.update(tables.organization)
		.set({
			plan: "free",
			stripeSubscriptionId: null,
			planExpiresAt: null,
			updatedAt: new Date(),
		})
		.where(eq(tables.organization.id, organization.id));

	console.log(`Downgraded organization ${organization.id} to free plan`);
}
