import { pgTable, pgEnum, bigint, json, text, uuid, foreignKey, timestamp, boolean, index, jsonb } from "npm:drizzle-orm/pg-core"
import { sql } from "npm:drizzle-orm"

export const keyStatus = pgEnum("key_status", ['default', 'valid', 'invalid', 'expired'])
export const keyType = pgEnum("key_type", ['aead-ietf', 'aead-det', 'hmacsha512', 'hmacsha256', 'auth', 'shorthash', 'generichash', 'kdf', 'secretbox', 'secretstream', 'stream_xchacha20'])
export const factorType = pgEnum("factor_type", ['totp', 'webauthn'])
export const factorStatus = pgEnum("factor_status", ['unverified', 'verified'])
export const aalLevel = pgEnum("aal_level", ['aal1', 'aal2', 'aal3'])
export const codeChallengeMethod = pgEnum("code_challenge_method", ['s256', 'plain'])
export const requestStatus = pgEnum("request_status", ['PENDING', 'SUCCESS', 'ERROR'])


export const errors = pgTable("errors", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	requestBody: json("request_body").notNull(),
	ruleType: text("rule_type"),
	ruleId: uuid("rule_id"),
	ruleDescription: text("rule_description"),
	message: text("message").notNull(),
});

export const commentsMentions = pgTable("comments_mentions", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	commentId: uuid("comment_id").notNull().references(() => comments.id, { onDelete: "cascade" } ),
	userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	isUser: boolean("is_user").notNull(),
	teamId: uuid("team_id"),
});

export const tasksAssignees = pgTable("tasks_assignees", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	commentId: uuid("comment_id").notNull().references(() => comments.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" } ),
});

export const userHistory = pgTable("user_history", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	name: text("name"),
	email: text("email"),
	avatarUrl: text("avatar_url"),
	userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
},
(table) => {
	return {
		idxUserHistoryId: index("idx_user_history_id").on(table.id),
	}
});

export const conversation = pgTable("conversation", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	closed: boolean("closed").default(false).notNull(),
});

export const conversationLatest = pgTable("conversation_latest", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const rules = pgTable("rules", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	description: text("description").notNull(),
	type: text("type").notNull(),
});

export const comments = pgTable("comments", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	body: text("body").notNull(),
	attachment: jsonb("attachment"),
	taskCompletedAt: timestamp("task_completed_at", { withTimezone: true, mode: 'string' }),
	authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
});

export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	email: text("email"),
	name: text("name"),
	avatarUrl: text("avatar_url"),
});