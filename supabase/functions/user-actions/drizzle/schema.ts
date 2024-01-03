import { pgTable, pgEnum, bigint, timestamp, uuid, boolean, text, index, unique, uniqueIndex, integer, jsonb, serial } from "npm:drizzle-orm/pg-core"

export const keyStatus = pgEnum("key_status", ['default', 'valid', 'invalid', 'expired'])
export const keyType = pgEnum("key_type", ['aead-ietf', 'aead-det', 'hmacsha512', 'hmacsha256', 'auth', 'shorthash', 'generichash', 'kdf', 'secretbox', 'secretstream', 'stream_xchacha20'])
export const factorType = pgEnum("factor_type", ['totp', 'webauthn'])
export const factorStatus = pgEnum("factor_status", ['unverified', 'verified'])
export const aalLevel = pgEnum("aal_level", ['aal1', 'aal2', 'aal3'])
export const codeChallengeMethod = pgEnum("code_challenge_method", ['s256', 'plain'])
export const requestStatus = pgEnum("request_status", ['PENDING', 'SUCCESS', 'ERROR'])


export const commentsMentions = pgTable("comments_mentions", {
	id: serial("id").primaryKey(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	commentId: uuid("comment_id").notNull().references(() => comments.id, { onDelete: "cascade" } ),
	userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" } ),
	isUser: boolean("is_user").notNull(),
	teamId: uuid("team_id"),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
});

export const team = pgTable("team", {
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	teamName: text("team_name"),
	id: uuid("id").primaryKey().notNull(),
	organization: uuid("organization"),
	conversationId: uuid("conversation_id"),
});

export const errors = pgTable("errors", {
	id: serial("id").primaryKey(),
	requestBody: text("request_body").notNull(),
	ruleType: text("rule_type"),
	ruleId: uuid("rule_id"),
	ruleDescription: text("rule_description"),
	message: text("message").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const tasksAssignees = pgTable("tasks_assignees", {
	id: serial("id").primaryKey(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	commentId: uuid("comment_id").notNull().references(() => comments.id, { onDelete: "cascade" } ),
	userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
});

export const userHistory = pgTable("user_history", {
	id: serial("id").primaryKey(),
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

export const labels = pgTable("labels", {
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: text("name").default('').notNull(),
	nameWithParentNames: text("name_with_parent_names").default('').notNull(),
	color: text("color"),
	parent: uuid("parent"),
	shareWithOrganization: boolean("share_with_organization").default(false).notNull(),
	visibility: text("visibility"),
},
(table) => {
	return {
		labelsUuidKey: unique("labels_uuid_key").on(table.id),
	}
});

export const conversationsLabels = pgTable("conversations_labels", {
	id: serial("id").primaryKey(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" } ),
	labelId: uuid("label_id").notNull().references(() => labels.id, { onDelete: "cascade" } ),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
},
(table) => {
	return {
		conversationLabel: uniqueIndex("conversation_label").on(table.conversationId, table.labelId),
	}
});

export const conversationsAssignees = pgTable("conversations_assignees", {
	id: serial("id").primaryKey(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	unassigned: boolean("unassigned").default(false).notNull(),
	closed: boolean("closed").default(false).notNull(),
	archived: boolean("archived").default(false).notNull(),
	trashed: boolean("trashed").default(false).notNull(),
	junked: boolean("junked").default(false).notNull(),
	assigned: boolean("assigned").default(false).notNull(),
	flagged: boolean("flagged").default(false).notNull(),
	snoozed: boolean("snoozed").default(false).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" } ),
	userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
});

export const conversationsUsers = pgTable("conversations_users", {
	id: serial("id").primaryKey(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" } ),
	userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	unassigned: boolean("unassigned").default(false).notNull(),
	closed: boolean("closed").default(false).notNull(),
	archived: boolean("archived").default(false).notNull(),
	trashed: boolean("trashed").default(false).notNull(),
	junked: boolean("junked").default(false).notNull(),
	assigned: boolean("assigned").default(false).notNull(),
	flagged: boolean("flagged").default(false).notNull(),
	snoozed: boolean("snoozed").default(false).notNull(),
},
(table) => {
	return {
		conversationsUsersUniqueKey: unique("conversations_users_unique_key").on(table.conversationId, table.userId),
	}
});

export const conversationHistory = pgTable("conversation_history", {
	id: serial("id").primaryKey(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" } ),
	changeType: text("change_type"),
});

export const conversationsAuthors = pgTable("conversations_authors", {
	id: serial("id").primaryKey(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" } ),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	authorId: bigint("author_id", { mode: "number" }).notNull().references(() => authors.id, { onDelete: "cascade" } ),
});

export const conversationsAssigneesHistory = pgTable("conversations_assignees_history", {
	id: serial("id").primaryKey(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	unassigned: boolean("unassigned").default(false).notNull(),
	closed: boolean("closed").default(false).notNull(),
	archived: boolean("archived").default(false).notNull(),
	trashed: boolean("trashed").default(false).notNull(),
	junked: boolean("junked").default(false).notNull(),
	assigned: boolean("assigned").default(false).notNull(),
	flagged: boolean("flagged").default(false).notNull(),
	snoozed: boolean("snoozed").default(false).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	conversationHistoryId: bigint("conversation_history_id", { mode: "number" }).references(() => conversationHistory.id, { onDelete: "cascade" } ),
});

export const authors = pgTable("authors", {
	id: serial("id").primaryKey(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	name: text("name"),
	phoneNumber: text("phone_number").notNull(),
},
(table) => {
	return {
		authorsPhoneNumberKey: unique("authors_phone_number_key").on(table.phoneNumber),
	}
});

export const conversations = pgTable("conversations", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	messagesCount: integer("messages_count").default(0).notNull(),
	draftsCount: integer("drafts_count").default(0).notNull(),
	sendLaterMessagesCount: integer("send_later_messages_count").default(0).notNull(),
	attachmentsCount: integer("attachments_count").default(0).notNull(),
	tasksCount: integer("tasks_count").default(0).notNull(),
	completedTasksCount: integer("completed_tasks_count").default(0).notNull(),
	subject: text("subject"),
	latestMessageSubject: text("latest_message_subject"),
	assigneeNames: text("assignee_names"),
	assigneeEmails: text("assignee_emails"),
	sharedLabelNames: text("shared_label_names"),
	webUrl: text("web_url").notNull(),
	appUrl: text("app_url").notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	closed: boolean("closed"),
	organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" } ),
},
(table) => {
	return {
		conversationUuidKey: unique("conversation_uuid_key").on(table.id),
	}
});

export const organizations = pgTable("organizations", {
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	name: text("name").notNull(),
	id: uuid("id").defaultRandom().primaryKey().notNull(),
});

export const rules = pgTable("rules", {
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	description: text("description").notNull(),
	type: text("type").notNull(),
	id: uuid("id").defaultRandom().primaryKey().notNull(),
},
(table) => {
	return {
		rulesUuidKey: unique("rules_uuid_key").on(table.id),
	}
});

export const comments = pgTable("comments", {
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	body: text("body"),
	attachment: jsonb("attachment"),
	taskCompletedAt: timestamp("task_completed_at", { withTimezone: true, mode: 'string' }),
	authorId: uuid("author_id").notNull().references(() => users.id),
	isTask: boolean("is_task").default(false).notNull(),
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	conversationId: uuid("conversation_id").references(() => conversations.id, { onDelete: "cascade" } ),
},
(table) => {
	return {
		commentsUuidKey: unique("comments_uuid_key").on(table.id),
	}
});

export const users = pgTable("users", {
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	email: text("email"),
	name: text("name"),
	avatarUrl: text("avatar_url"),
	id: uuid("id").primaryKey().notNull(),
},
(table) => {
	return {
		usersUuidKey: unique("users_uuid_key").on(table.id),
	}
});

export type Rule = typeof rules.$inferInsert;
export type User = typeof users.$inferInsert;
export type UserHistory = typeof userHistory.$inferInsert;
export type Err = typeof errors.$inferInsert;
export type Comment = typeof comments.$inferInsert;
export type CommentMention = typeof commentsMentions.$inferInsert;
export type Team = typeof team.$inferInsert;
export type Conversation = typeof conversations.$inferInsert;
export type Label = typeof labels.$inferInsert;
export type ConversationLabel = typeof conversationsLabels.$inferInsert;
export type Author = typeof authors.$inferInsert;
export type ConversationUser = typeof conversationsUsers.$inferInsert;
export type ConversationAssignee = typeof conversationsAssignees.$inferInsert;
export type ConversationAssigneeHistory = typeof conversationsAssigneesHistory.$inferInsert;
export type Organization = typeof organizations.$inferInsert;
export type ConversationAuthor = typeof conversationsAuthors.$inferInsert;
