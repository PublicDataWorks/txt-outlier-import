import {
  RequestBody,
  RequestConversation,
  RequestRule,
  RequestUser,
} from "./types.ts";
import {
  ConversationLatest,
  conversationLatest,
  Err,
  errors,
  Rule,
  rules,
  User,
  UserHistory,
  userHistory,
  users,
} from "./drizzle/schema.ts";
import {
  PostgresJsDatabase,
  PostgresJsTransaction,
} from "npm:drizzle-orm/postgres-js";
import { inArray, sql } from "npm:drizzle-orm";

export const upsertRule = async (
  // deno-lint-ignore no-explicit-any
  tx: PostgresJsTransaction<any, any>,
  requestRule: RequestRule,
) => {
  const newRule: Rule = {
    id: requestRule.id,
    description: requestRule.description,
    type: requestRule.type,
  };
  await tx.insert(rules).values(newRule).onConflictDoUpdate({
    target: rules.id,
    set: { description: newRule.description, type: newRule.type },
  });
};

export const handleError = async (
  db: PostgresJsDatabase,
  requestBody: RequestBody,
  appError: Error,
) => {
  const err: Err = {
    ruleId: requestBody.rule.id,
    ruleDescription: requestBody.rule.description,
    ruleType: requestBody.rule.type,
    message: appError.message,
    requestBody: JSON.stringify(requestBody),
  };
  await db.insert(errors).values(err);
};

export const upsertUsers = async (
  // deno-lint-ignore no-explicit-any
  tx: PostgresJsTransaction<any, any>,
  requestUsers: RequestUser[],
) => {
  const newUsers: User[] = requestUsers.map((u) => {
    const { id, email, name, avatar_url } = u;
    return { id, email, name, avatarUrl: avatar_url };
  });
  const ids: string[] = newUsers.map((u) => u.id!);
  const existingUsers = await tx.select().from(users).where(
    inArray(users.id, ids),
  );
  const changelogs: UserHistory[] = [];
  for (const user of newUsers) {
    const existingUser = existingUsers.find((u) => u.id === user.id);
    if (
      !existingUser || existingUser.email !== user.email ||
      existingUser.name !== user.name ||
      existingUser.avatarUrl !== user.avatarUrl
    ) {
      changelogs.push({
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        userId: user.id!,
      });
    }
  }
  await tx.insert(users).values(newUsers).onConflictDoUpdate({
    target: rules.id,
    set: {
      name: sql`excluded.name`,
      email: sql`excluded.email`,
      avatarUrl: sql`excluded.avatar_url`,
    },
  });
  if (changelogs.length > 0) {
    await tx.insert(userHistory).values(changelogs);
  }
};

export const upsertLatestConversation = async (
  // deno-lint-ignore no-explicit-any
  tx: PostgresJsTransaction<any, any>,
  requestConvo: RequestConversation,
  closed: boolean,
) => {
  const convo: ConversationLatest = {
    id: requestConvo.id,
    createdAt: String(new Date(requestConvo.created_at * 1000)),
    subject: requestConvo.subject,
    latestMessageSubject: requestConvo.latest_message_subject,
    messagesCount: requestConvo.messages_count,
    draftsCount: requestConvo.drafts_count,
    sendLaterMessagesCount: requestConvo.send_later_messages_count,
    attachmentsCount: requestConvo.attachments_count,
    tasksCount: requestConvo.tasks_count,
    completedTasksCount: requestConvo.completed_tasks_count,
    assigneeNames: requestConvo.assignee_names,
    assigneeEmails: requestConvo.assignee_emails,
    sharedLabelNames: requestConvo.shared_label_names,
    webUrl: requestConvo.web_url,
    appUrl: requestConvo.app_url,
    closed,
  };
  await tx.insert(conversationLatest).values(convo).onConflictDoUpdate({
    target: conversationLatest.id,
    set: { ...convo },
  });

  const users: RequestUser[] = [];
  for (const user of requestConvo.users) {
    users.push({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: "",
    });
    await upsertUsers(tx, users);
  }
};

// Function to replace placeholders in the template
export function replacePlaceholders(template, replacements) {
  return template.replace(/<%=\s*(\w+)\s*%>/g, (match, p1) => {
    return replacements[p1] !== undefined ? replacements[p1] : match;
  });
}
