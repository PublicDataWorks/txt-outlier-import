import {
  boolean,
  index,
  integer,
  json,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "npm:drizzle-orm/pg-core";

export const keyStatus = pgEnum("key_status", [
  "default",
  "valid",
  "invalid",
  "expired",
]);
export const keyType = pgEnum("key_type", [
  "aead-ietf",
  "aead-det",
  "hmacsha512",
  "hmacsha256",
  "auth",
  "shorthash",
  "generichash",
  "kdf",
  "secretbox",
  "secretstream",
  "stream_xchacha20",
]);
export const factorType = pgEnum("factor_type", ["totp", "webauthn"]);
export const factorStatus = pgEnum("factor_status", ["unverified", "verified"]);
export const aalLevel = pgEnum("aal_level", ["aal1", "aal2", "aal3"]);
export const codeChallengeMethod = pgEnum("code_challenge_method", [
  "s256",
  "plain",
]);
export const requestStatus = pgEnum("request_status", [
  "PENDING",
  "SUCCESS",
  "ERROR",
]);

export const errors = pgTable("errors", {
  id: serial("id").primaryKey(),
  requestBody: json("request_body").notNull(),
  ruleType: text("rule_type"),
  ruleId: uuid("rule_id"),
  ruleDescription: text("rule_description"),
  message: text("message").notNull(),
});

export const commentsMentions = pgTable("comments_mentions", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow().notNull(),
  commentId: uuid("comment_id").notNull().references(() => comments.id, {
    onDelete: "cascade",
  }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  isUser: boolean("is_user").notNull(),
  teamId: uuid("team_id"),
});

export const labels = pgTable("labels", {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
  uuid: uuid("uuid").defaultRandom().notNull(),
  name: text("name").default("").notNull(),
  nameWithParentNames: text("name_with_parent_names").default("").notNull(),
  color: text("color"),
  parent: uuid("parent"),
  shareWithOrganization: boolean("share_with_organization").default(false)
    .notNull(),
  visibility: text("visibility"),
});

export const tasksAssignees = pgTable("tasks_assignees", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
  commentId: uuid("comment_id").notNull().references(() => comments.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  userId: uuid("user_id").notNull().references(() => users.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
});

export const userHistory = pgTable("user_history", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow().notNull(),
  name: text("name"),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  userId: uuid("user_id").notNull().references(() => users.id, {
    onDelete: "cascade",
  }),
}, (table) => {
  return {
    idxUserHistoryId: index("idx_user_history_id").on(table.id),
  };
});

export const conversation = pgTable("conversation", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow().notNull(),
  closed: boolean("closed").default(false).notNull(),
});

export const conversationsLabels = pgTable("conversations_labels", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow().notNull(),
  conversationUuid: uuid("conversation_uuid").references(
    () => conversationLatest.uuid,
    { onDelete: "cascade" },
  ),
  labelUuid: uuid("label_uuid").references(() => conversationLatest.uuid, {
    onDelete: "cascade",
  }),
}, (table) => {
  return {
    conversationLabel: uniqueIndex("conversation_label").on(
      table.conversationUuid,
      table.labelUuid,
    ),
  };
});

export const conversationLatest = pgTable("conversation_latest", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
  messagesCount: integer("messages_count").default(0).notNull(),
  draftsCount: integer("drafts_count").default(0).notNull(),
  sendLaterMessagesCount: integer("send_later_messages_count").default(0)
    .notNull(),
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
}, (table) => {
  return {
    conversationLatestUuidKey: unique("conversation_latest_uuid_key").on(
      table.uuid,
    ),
  };
});

export const rules = pgTable("rules", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
  description: text("description").notNull(),
  type: text("type").notNull(),
});

export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
  body: text("body"),
  attachment: jsonb("attachment"),
  taskCompletedAt: timestamp("task_completed_at", {
    withTimezone: true,
    mode: "string",
  }),
  authorId: uuid("author_id").notNull().references(() => users.id, {
    onDelete: "cascade",
  }),
  isTask: boolean("is_task").default(false).notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
  email: text("email"),
  name: text("name"),
  avatarUrl: text("avatar_url"),
});

export const team = pgTable("team", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow().notNull(),
  teamName: text("team_name"),
  teamId: uuid("team_id"),
  organization: uuid("organization"),
});

export type Rule = typeof rules.$inferInsert;
export type User = typeof users.$inferInsert;
export type UserHistory = typeof userHistory.$inferInsert;
export type Err = typeof errors.$inferInsert;
export type Comment = typeof comments.$inferInsert;
export type CommentMention = typeof commentsMentions.$inferInsert;
export type Team = typeof team.$inferInsert;
export type ConversationLatest = typeof conversationLatest.$inferInsert;
export type Label = typeof labels.$inferInsert;
export type ConversationLabel = typeof conversationsLabels.$inferInsert;
