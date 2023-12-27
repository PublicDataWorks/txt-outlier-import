import {
  Organization,
  RequestAuthor,
  RequestBody,
  RequestConversation,
  RequestRule,
  RequestUser,
  RuleType,
} from "./types.ts";
import {
  authors,
  Conversation,
  conversationHistory,
  conversations,
  conversationsUsers,
  ConversationUser,
  Err,
  errors,
  organizations,
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
import { eq } from "npm:drizzle-orm";

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
  const newUsers: User[] = requestUsers.map((
    { id, email, name, avatar_url },
  ) => ({ id, email, name, avatarUrl: avatar_url }));
  const ids: string[] = newUsers.map(({ id }) => id!);
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

const upsertOrganization = async (
  // deno-lint-ignore no-explicit-any
  tx: PostgresJsTransaction<any, any>,
  requestOrganization: Organization,
) => {
  const organization: Organization = {
    id: requestOrganization.id,
    name: requestOrganization.name,
  };
  await tx.insert(organizations).values(organization).onConflictDoUpdate({
    target: organizations.id,
    set: { ...organization },
  });
};

const upsertAuthor = async (
  tx: PostgresJsTransaction<any, any>,
  request_authors: RequestAuthor[],
) => {
  if (request_authors.length > 0) {
    const author = {
      // TODO: handle multiple authors
      name: request_authors[0].name,
      phoneNumber: request_authors[0].phone_number,
    };
    await tx.insert(authors).values(author).onConflictDoUpdate({
      target: authors.phoneNumber,
      set: { name: author.name },
    });
  }
};

export const upsertConversation = async (
  // deno-lint-ignore no-explicit-any
  tx: PostgresJsTransaction<any, any>,
  requestConvo: RequestConversation,
  changeType: string | null,
) => {
  await upsertOrganization(tx, requestConvo.organization);
  await upsertAuthor(tx, requestConvo.authors);
  // TODO: handle external authors
  const existingConvo = await tx.select().from(conversations).where(
    eq(conversations.id, requestConvo.id),
  );
  if (existingConvo.length > 0) {
    const convoHistory = {
      conversationId: requestConvo.id,
      changeType: changeType,
    };
    await tx.insert(conversationHistory).values(convoHistory);
  }
  const convo: Conversation = {
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
    organizationId: requestConvo.organization.id,
    closed: changeType === RuleType.ConversationClosed
      ? false
      : changeType === RuleType.ConversationReopened
      ? true
      : undefined,
  };
  await tx.insert(conversations).values(convo).onConflictDoUpdate({
    target: conversations.id,
    set: { ...convo },
  });

  const users: RequestUser[] = [];
  const convoUser: ConversationUser[] = [];
  for (const user of requestConvo.users) {
    users.push({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: "",
    });
    convoUser.push({
      conversationId: convo.id!,
      userId: user.id,
      unassigned: user.unassigned,
      closed: user.closed,
      archived: user.archived,
      trashed: user.trashed,
      junked: user.junked,
      assigned: user.assigned,
      flagged: user.flagged,
      snoozed: user.snoozed,
    });
  }
  await upsertUsers(tx, users);
  await tx.insert(conversationsUsers).values(convoUser).onConflictDoUpdate({
    target: [conversationsUsers.conversationId, conversationsUsers.userId],
    set: {
      unassigned: sql`excluded.unassigned`,
      closed: sql`excluded.closed`,
      archived: sql`excluded.archived`,
      trashed: sql`excluded.trashed`,
      junked: sql`excluded.junked`,
      assigned: sql`excluded.assigned`,
      flagged: sql`excluded.flagged`,
      snoozed: sql`excluded.snoozed`,
    },
  });
};
