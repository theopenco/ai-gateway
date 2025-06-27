import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { db } from "@llmgateway/db";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { stripe } from "./payments";
import { ensureStripeCustomer } from "../stripe";

import type { ServerTypes } from "../vars";

export const subscriptions = new OpenAPIHono<ServerTypes>();

const createProSubscription = createRoute({
	method: "post",
	path: "/create-pro-subscription",
	request: {
		body: {
			content: {
				"application/json": {
					schema: z.object({
						billingCycle: z
							.enum(["monthly", "yearly"])
							.optional()
							.default("monthly"),
					}),
				},
			},
		},
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: z.object({
						checkoutUrl: z.string(),
					}),
				},
			},
			description: "Stripe Checkout session created successfully",
		},
	},
});

subscriptions.openapi(createProSubscription, async (c) => {
	const user = c.get("user");
	const { billingCycle } = c.req.valid("json");

	if (!user) {
		throw new HTTPException(401, {
			message: "Unauthorized",
		});
	}

	const userOrganization = await db.query.userOrganization.findFirst({
		where: {
			userId: user.id,
		},
		with: {
			organization: true,
		},
	});

	if (!userOrganization || !userOrganization.organization) {
		throw new HTTPException(404, {
			message: "Organization or user not found",
		});
	}

	const organization = userOrganization.organization;

	// Check if organization already has a pro subscription
	if (organization.plan === "pro" && organization.stripeSubscriptionId) {
		throw new HTTPException(400, {
			message: "Organization already has an active pro subscription",
		});
	}

	try {
		const stripeCustomerId = await ensureStripeCustomer(organization.id);

		// Determine which price ID to use based on billing cycle
		const priceId =
			billingCycle === "yearly"
				? process.env.STRIPE_PRO_YEARLY_PRICE_ID
				: process.env.STRIPE_PRO_MONTHLY_PRICE_ID;

		if (!priceId) {
			throw new HTTPException(500, {
				message: `STRIPE_PRO_${billingCycle === "yearly" ? "YEARLY_" : "MONTHLY_"}PRICE_ID environment variable is not set`,
			});
		}

		// Create Stripe Checkout session
		const session = await stripe.checkout.sessions.create({
			customer: stripeCustomerId,
			mode: "subscription",
			line_items: [
				{
					price: priceId,
					quantity: 1,
				},
			],
			success_url: `${process.env.UI_URL || "http://localhost:3002"}/dashboard/settings/billing?success=true`,
			cancel_url: `${process.env.UI_URL || "http://localhost:3002"}/dashboard/settings/billing?canceled=true`,
			metadata: {
				organizationId: organization.id,
				plan: "pro",
				billingCycle,
			},
			subscription_data: {
				metadata: {
					organizationId: organization.id,
					plan: "pro",
					billingCycle,
				},
			},
		});

		if (!session.url) {
			throw new HTTPException(500, {
				message: "Failed to generate checkout URL",
			});
		}

		return c.json({
			checkoutUrl: session.url,
		});
	} catch (error) {
		console.error("Stripe checkout session error:", error);
		throw new HTTPException(500, {
			message: `Failed to create checkout session: ${error}`,
		});
	}
});

const cancelProSubscription = createRoute({
	method: "post",
	path: "/cancel-pro-subscription",
	request: {},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: z.object({
						success: z.boolean(),
					}),
				},
			},
			description: "Pro subscription canceled successfully",
		},
	},
});

subscriptions.openapi(cancelProSubscription, async (c) => {
	const user = c.get("user");

	if (!user) {
		throw new HTTPException(401, {
			message: "Unauthorized",
		});
	}

	const userOrganization = await db.query.userOrganization.findFirst({
		where: {
			userId: user.id,
		},
		with: {
			organization: true,
		},
	});

	if (!userOrganization || !userOrganization.organization) {
		throw new HTTPException(404, {
			message: "Organization not found",
		});
	}

	const organization = userOrganization.organization;

	if (!organization.stripeSubscriptionId) {
		throw new HTTPException(400, {
			message: "No active subscription found",
		});
	}

	try {
		// Cancel the subscription at the end of the current period
		await stripe.subscriptions.update(organization.stripeSubscriptionId, {
			cancel_at_period_end: true,
		});

		// let the webhook handler the rest to unify the logic
		await new Promise((resolve) => {
			setTimeout(resolve, 5000);
		});

		return c.json({
			success: true,
		});
	} catch (error) {
		console.error("Stripe subscription cancellation error:", error);
		throw new HTTPException(500, {
			message: "Failed to cancel subscription",
		});
	}
});

const resumeProSubscription = createRoute({
	method: "post",
	path: "/resume-pro-subscription",
	request: {},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: z.object({
						success: z.boolean(),
					}),
				},
			},
			description: "Pro subscription resumed successfully",
		},
	},
});

subscriptions.openapi(resumeProSubscription, async (c) => {
	const user = c.get("user");

	if (!user) {
		throw new HTTPException(401, {
			message: "Unauthorized",
		});
	}

	const userOrganization = await db.query.userOrganization.findFirst({
		where: {
			userId: user.id,
		},
		with: {
			organization: true,
		},
	});

	if (!userOrganization || !userOrganization.organization) {
		throw new HTTPException(404, {
			message: "Organization not found",
		});
	}

	const organization = userOrganization.organization;

	if (!organization.stripeSubscriptionId) {
		throw new HTTPException(400, {
			message: "No active subscription found",
		});
	}

	try {
		// Check if subscription is actually cancelled
		const subscription = await stripe.subscriptions.retrieve(
			organization.stripeSubscriptionId,
		);

		if (!subscription.cancel_at_period_end) {
			throw new HTTPException(400, {
				message: "Subscription is not cancelled",
			});
		}

		// Resume the subscription by setting cancel_at_period_end to false
		await stripe.subscriptions.update(organization.stripeSubscriptionId, {
			cancel_at_period_end: false,
		});

		// let the webhook handler the rest to unify the logic
		await new Promise((resolve) => {
			setTimeout(resolve, 5000);
		});

		return c.json({
			success: true,
		});
	} catch (error) {
		console.error("Stripe subscription resume error:", error);
		throw new HTTPException(500, {
			message: "Failed to resume subscription",
		});
	}
});

const upgradeToYearlyPlan = createRoute({
	method: "post",
	path: "/upgrade-to-yearly",
	request: {},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: z.object({
						success: z.boolean(),
					}),
				},
			},
			description: "Subscription upgraded to yearly successfully",
		},
	},
});

subscriptions.openapi(upgradeToYearlyPlan, async (c) => {
	const user = c.get("user");

	if (!user) {
		throw new HTTPException(401, {
			message: "Unauthorized",
		});
	}

	const userOrganization = await db.query.userOrganization.findFirst({
		where: {
			userId: user.id,
		},
		with: {
			organization: true,
		},
	});

	if (!userOrganization || !userOrganization.organization) {
		throw new HTTPException(404, {
			message: "Organization not found",
		});
	}

	const organization = userOrganization.organization;

	if (!organization.stripeSubscriptionId) {
		throw new HTTPException(400, {
			message: "No active subscription found",
		});
	}

	try {
		// Get current subscription to check if it's already yearly
		const subscription = await stripe.subscriptions.retrieve(
			organization.stripeSubscriptionId,
		);

		// Check if already on yearly plan
		const currentPriceId = subscription.items.data[0]?.price.id;
		const yearlyPriceId = process.env.STRIPE_PRO_YEARLY_PRICE_ID;
		if (!yearlyPriceId) {
			throw new HTTPException(500, {
				message: "Yearly price ID is not configured",
			});
		}

		if (currentPriceId === yearlyPriceId) {
			throw new HTTPException(400, {
				message: "Subscription is already on yearly plan",
			});
		}

		// Update subscription to yearly plan
		await stripe.subscriptions.update(organization.stripeSubscriptionId, {
			items: [
				{
					id: subscription.items.data[0].id,
					price: yearlyPriceId,
				},
			],
			proration_behavior: "create_prorations",
			metadata: {
				...subscription.metadata,
				billingCycle: "yearly",
			},
		});

		return c.json({
			success: true,
		});
	} catch (error) {
		console.error("Stripe subscription upgrade error:", error);
		throw new HTTPException(500, {
			message: "Failed to upgrade subscription to yearly plan",
		});
	}
});

const getSubscriptionStatus = createRoute({
	method: "get",
	path: "/status",
	request: {},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: z.object({
						plan: z.enum(["free", "pro"]),
						subscriptionId: z.string().nullable(),
						planExpiresAt: z.string().nullable(),
						subscriptionCancelled: z.boolean(),
						billingCycle: z.enum(["monthly", "yearly"]).nullable(),
					}),
				},
			},
			description: "Subscription status retrieved successfully",
		},
	},
});

subscriptions.openapi(getSubscriptionStatus, async (c) => {
	const user = c.get("user");

	if (!user) {
		throw new HTTPException(401, {
			message: "Unauthorized",
		});
	}

	const userOrganization = await db.query.userOrganization.findFirst({
		where: {
			userId: user.id,
		},
		with: {
			organization: true,
		},
	});

	if (!userOrganization || !userOrganization.organization) {
		throw new HTTPException(404, {
			message: "Organization not found",
		});
	}

	const organization = userOrganization.organization;

	// Get billing cycle from Stripe subscription if available
	let billingCycle: "monthly" | "yearly" | null = null;
	if (organization.stripeSubscriptionId) {
		try {
			const subscription = await stripe.subscriptions.retrieve(
				organization.stripeSubscriptionId,
			);
			const currentPriceId = subscription.items.data[0]?.price.id;
			const yearlyPriceId = process.env.STRIPE_PRO_YEARLY_PRICE_ID;
			if (!yearlyPriceId) {
				throw new HTTPException(500, {
					message: "STRIPE_PRO_YEARLY_PRICE_ID environment variable is not set",
				});
			}
			billingCycle = currentPriceId === yearlyPriceId ? "yearly" : "monthly";
		} catch (error) {
			console.error("Error fetching subscription details:", error);
		}
	}

	return c.json({
		plan: organization.plan || "free",
		subscriptionId: organization.stripeSubscriptionId,
		planExpiresAt: organization.planExpiresAt?.toISOString() || null,
		subscriptionCancelled: organization.subscriptionCancelled || false,
		billingCycle,
	});
});
