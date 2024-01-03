import {
  RequestAuthor,
  RequestBody,
  RequestConversation,
  RequestOrganization,
  RequestRule,
  RequestUser,
  RuleType,
} from "./types.ts";
import {
  Author,
  authors,
  Conversation,
  ConversationAssignee,
  ConversationAssigneeHistory,
  ConversationAuthor,
  conversationHistory,
  conversations,
  conversationsAssignees,
  conversationsAssigneesHistory,
  conversationsAuthors,
  conversationsLabels,
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
import {
  pruneConversation,
  pruneConversationAssignee,
  pruneConversationAssigneeHistory,
  pruneConversationUser,
  pruneOrg,
  pruneRule,
} from "./pruner.ts";

export const upsertRule = async (
  // deno-lint-ignore no-explicit-any
  tx: PostgresJsTransaction<any, any>,
  requestRule: RequestRule,
) => {
  const newRule = pruneRule(requestRule);
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
  if (requestUsers.length === 0) return;

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

export const upsertConversation = async (
  // deno-lint-ignore no-explicit-any
  tx: PostgresJsTransaction<any, any>,
  requestConvo: RequestConversation,
  closed: boolean | null = null,
  assignee_changed = false, // true: assignee changed handled by caller
) => {
  // TODO: missing color field
  await upsertOrganization(tx, requestConvo.organization);
  const inserted_ids: number[] = await upsertAuthor(tx, requestConvo.authors);
  // TODO: handle external authors
  const convo = pruneConversation(requestConvo);
  if (closed !== null) {
    convo.closed = closed;
  }
  const assignees = [];
  if (!assignee_changed) {
    // This is an unsync convo, no assignee change emitted
    const existingConvo = await tx.select().from(conversations).where(
      eq(conversations.id, convo.id!),
    );
    if (existingConvo.length === 0 && requestConvo.assignees.length > 0) {
      for (const assignee of requestConvo.assignees) {
        assignees.push(pruneConversationAssignee(assignee, requestConvo.id));
      }
    }
  }
  await tx.insert(conversations).values(convo).onConflictDoUpdate({
    target: conversations.id,
    set: { ...convo },
  });
  const convoAuthors: ConversationAuthor[] = [];
  for (const authorId of inserted_ids) {
    convoAuthors.push({
      conversationId: convo.id!,
      authorId,
    });
  }
  await tx.insert(conversationsAuthors).values(convoAuthors)
    .onConflictDoNothing();
  await upsertConversationsUsers(tx, requestConvo);
  if (!assignee_changed && assignees.length > 0) {
    await tx.insert(conversationsAssignees).values(assignees);
  }
};

const upsertOrganization = async (
  // deno-lint-ignore no-explicit-any
  tx: PostgresJsTransaction<any, any>,
  requestOrganization: RequestOrganization,
) => {
  const org = pruneOrg(requestOrganization);
  await tx.insert(organizations).values(org).onConflictDoUpdate({
    target: organizations.id,
    set: { name: org.name },
  });
};

const upsertConversationsUsers = async (
  // deno-lint-ignore no-explicit-any
  tx: PostgresJsTransaction<any, any>,
  requestConvo: RequestConversation,
) => {
  if (requestConvo.users.length === 0) return;
  const users: RequestUser[] = [];
  const convoUser: ConversationUser[] = [];
  for (const user of requestConvo.users) {
    users.push({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: "",
    });
    convoUser.push(pruneConversationUser(user, requestConvo.id));
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

const upsertAuthor = async (
  // deno-lint-ignore no-explicit-any
  tx: PostgresJsTransaction<any, any>,
  request_authors: RequestAuthor[],
): Promise<number[]> => {
  if (request_authors.length === 0) return [];
  const uniqueAuthors = new Set<Author>();
  for (const author of request_authors) {
    // TODO: Some authors have only name, no phone number
    if (!author.phone_number) {
      continue;
    }
    uniqueAuthors.add({
      name: author.name,
      phoneNumber: author.phone_number,
    });
  }
  const inserted = await tx.insert(authors).values([...uniqueAuthors])
    .onConflictDoUpdate({
      target: authors.phoneNumber,
      set: {
        name: sql`excluded.name`,
      },
    }).returning({ insertedId: authors.id });
  return inserted.map(({ insertedId }) => insertedId);
};
