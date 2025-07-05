import { db, tables } from "@llmgateway/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { passkey } from "better-auth/plugins/passkey";
import { Resend } from "resend";

import { rateLimit } from "./rate-limiter";

const apiUrl = process.env.API_URL || "http://localhost:4002";
const uiUrl = process.env.UI_URL || "http://localhost:3002";
const originUrls =
	process.env.ORIGIN_URL || "http://localhost:3002,http://localhost:4002";
const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail =
	process.env.RESEND_FROM_EMAIL || "contact@llmgateway.io";

export const auth: ReturnType<typeof betterAuth> = betterAuth({
	advanced: {
		crossSubDomainCookies: {
			enabled: true,
			domain: new URL(apiUrl).hostname,
		},
		defaultCookieAttributes: {
			domain: new URL(apiUrl).hostname,
		},
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
		expiresIn: 60 * 60 * 24 * 30, // 30 days
		updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
	},
	basePath: "/auth",
	trustedOrigins: originUrls.split(","),
	plugins: [
		passkey({
			rpID: process.env.PASSKEY_RP_ID || "localhost",
			rpName: process.env.PASSKEY_RP_NAME || "LLMGateway",
			origin: uiUrl,
		}),
	],
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user: tables.user,
			session: tables.session,
			account: tables.account,
			verification: tables.verification,
			passkey: tables.passkey,
		},
	}),
	emailAndPassword: {
		enabled: true,
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, token }) => {
			// Check rate limit for this email
			const rateLimitResult = rateLimit(user.email);
			if (!rateLimitResult.allowed) {
				const minutes = Math.floor((rateLimitResult.remainingTime || 0) / 60);
				const seconds = (rateLimitResult.remainingTime || 0) % 60;
				throw new Error(
					`Too many verification email requests. Please wait ${minutes}:${seconds.toString().padStart(2, "0")} before requesting another.`,
				);
			}

			const url = `${apiUrl}/auth/verify-email?token=${token}&&callbackURL=${uiUrl}/dashboard`;
			if (!resendApiKey) {
				console.log(`email verification link: ${url}`);
				console.error(
					"RESEND_API_KEY is not set. Email verification will not work.",
				);
				return;
			}

			const resend = new Resend(resendApiKey);

			await resend.emails.send({
				from: resendFromEmail,
				to: user.email,
				subject: "Verify your email address",
				html: `
					<h1>Welcome to LLMGateway!</h1>
					<p>Please click the link below to verify your email address:</p>
					<a href="${url}">Verify Email</a>
					<p>If you didn't create an account, you can safely ignore this email.</p>
				`,
			});
		},
	},
	secret: process.env.AUTH_SECRET || "your-secret-key",
	baseURL: uiUrl || "http://localhost:4002",
	hooks: {
		after: createAuthMiddleware(async (ctx) => {
			// Check if this is a signup event
			if (ctx.path.startsWith("/sign-up")) {
				const newSession = ctx.context.newSession;

				// If we have a new session with a user, create default org and project
				if (newSession?.user) {
					const userId = newSession.user.id;

					// Create a default organization
					const [organization] = await db
						.insert(tables.organization)
						.values({
							name: "Default Organization",
						})
						.returning();

					// Link user to organization
					await db.insert(tables.userOrganization).values({
						userId,
						organizationId: organization.id,
					});

					// Create a default project
					await db.insert(tables.project).values({
						name: "Default Project",
						organizationId: organization.id,
						mode: process.env.HOSTED === "true" ? "credits" : "hybrid",
					});
				}
			}
		}),
	},
});

export interface Variables {
	user: typeof auth.$Infer.Session.user | null;
	session: typeof auth.$Infer.Session.session | null;
}
