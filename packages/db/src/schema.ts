import {
	boolean,
	decimal,
	integer,
	json,
	pgTable,
	real,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { customAlphabet } from "nanoid";

export const UnifiedFinishReason = {
	COMPLETED: "completed",
	LENGTH_LIMIT: "length_limit",
	CONTENT_FILTER: "content_filter",
	GATEWAY_ERROR: "gateway_error",
	UPSTREAM_ERROR: "upstream_error",
	CANCELED: "canceled",
	UNKNOWN: "unknown",
} as const;

export type UnifiedFinishReason =
	(typeof UnifiedFinishReason)[keyof typeof UnifiedFinishReason];

const generate = customAlphabet(
	"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
);

export const shortid = (size = 20) => generate(size);

export const user = pgTable("user", {
	id: text().primaryKey().$defaultFn(shortid),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp()
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
	name: text(),
	email: text().notNull().unique(),
	emailVerified: boolean().notNull().default(false),
	image: text(),
});

export const session = pgTable("session", {
	id: text().primaryKey().$defaultFn(shortid),
	expiresAt: timestamp().notNull().defaultNow(),
	token: text().notNull().unique(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp()
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
	ipAddress: text(),
	userAgent: text(),
	userId: text()
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text().primaryKey().$defaultFn(shortid),
	accountId: text().notNull(),
	providerId: text().notNull(),
	userId: text()
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text(),
	refreshToken: text(),
	idToken: text(),
	accessTokenExpiresAt: timestamp(),
	refreshTokenExpiresAt: timestamp(),
	scope: text(),
	password: text(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp()
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const verification = pgTable("verification", {
	id: text().primaryKey().$defaultFn(shortid),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp().notNull().defaultNow(),
	createdAt: timestamp(),
	updatedAt: timestamp().$onUpdate(() => new Date()),
});

export const organization = pgTable("organization", {
	id: text().primaryKey().notNull().$defaultFn(shortid),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp()
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
	name: text().notNull(),
	stripeCustomerId: text(),
	credits: decimal().notNull().default("0"),
});

export const userOrganization = pgTable("user_organization", {
	id: text().primaryKey().notNull().$defaultFn(shortid),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp()
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
	userId: text().notNull(),
	organizationId: text().notNull(),
});

export const project = pgTable("project", {
	id: text().primaryKey().notNull().$defaultFn(shortid),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp()
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
	name: text().notNull(),
	organizationId: text().notNull(),
	cachingEnabled: boolean().notNull().default(false),
	cacheDurationSeconds: integer().notNull().default(60),
	mode: text({
		enum: ["api-keys", "credits", "hybrid"],
	})
		.notNull()
		.default("api-keys"),
});

export const apiKey = pgTable("api_key", {
	id: text().primaryKey().notNull().$defaultFn(shortid),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp()
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
	token: text().notNull().unique(),
	description: text().notNull(),
	status: text({
		enum: ["active", "inactive", "deleted"],
	}).default("active"),
	projectId: text().notNull(),
});

export const providerKey = pgTable(
	"provider_key",
	{
		id: text().primaryKey().notNull().$defaultFn(shortid),
		createdAt: timestamp().notNull().defaultNow(),
		updatedAt: timestamp()
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
		token: text().notNull(),
		provider: text().notNull(),
		baseUrl: text(), // Optional base URL for custom providers
		status: text({
			enum: ["active", "inactive", "deleted"],
		}).default("active"),
		organizationId: text().notNull(),
	},
	(table) => [],
);

export const log = pgTable("log", {
	id: text().primaryKey().notNull().$defaultFn(shortid),
	requestId: text().notNull(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp()
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
	organizationId: text().notNull(),
	projectId: text().notNull(),
	apiKeyId: text().notNull(),
	providerKeyId: text().notNull(),
	duration: integer().notNull(),
	requestedModel: text().notNull(),
	requestedProvider: text(),
	usedModel: text().notNull(),
	usedProvider: text().notNull(),
	responseSize: integer().notNull(),
	content: text(),
	finishReason: text(),
	unifiedFinishReason: text(),
	promptTokens: decimal(),
	completionTokens: decimal(),
	totalTokens: decimal(),
	messages: json().notNull(),
	temperature: real(),
	maxTokens: integer(),
	topP: real(),
	frequencyPenalty: real(),
	presencePenalty: real(),
	hasError: boolean().default(false),
	errorDetails: json(),
	cost: real(),
	inputCost: real(),
	outputCost: real(),
	estimatedCost: boolean().default(false),
	canceled: boolean().default(false),
	streamed: boolean().default(false),
	cached: boolean().default(false),
	mode: text({
		enum: ["api-keys", "credits", "hybrid"],
	})
		.notNull()
		.default("api-keys"),
	usedMode: text({
		enum: ["api-keys", "credits"],
	})
		.notNull()
		.default("api-keys"),
});

export const passkey = pgTable("passkey", {
	id: text().primaryKey().$defaultFn(shortid),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp()
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
	name: text(),
	publicKey: text().notNull(),
	userId: text()
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	credentialID: text().notNull(),
	counter: integer().notNull(),
	deviceType: text(),
	backedUp: boolean(),
	transports: text(),
});

export const paymentMethod = pgTable("payment_method", {
	id: text().primaryKey().$defaultFn(shortid),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
	stripePaymentMethodId: text().notNull(),
	organizationId: text().notNull(),
	type: text().notNull(), // "card", "sepa_debit", etc.
	isDefault: boolean().notNull().default(false),
});

export const organizationAction = pgTable("organization_action", {
	id: text().primaryKey().$defaultFn(shortid),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp()
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
	organizationId: text().notNull(),
	type: text({
		enum: ["credit", "debit"],
	}).notNull(),
	amount: decimal().notNull(),
	description: text(),
});
