import {
  RequestAuthor,
  RequestBody,
  RequestConversation,
  RequestOrganization,
  RequestRule,
  RequestUser,
} from "./types.ts";
import {
  Author,
  authors,
  ConversationAuthor,
  conversations,
  conversationsAssignees,
  conversationsAuthors,
  conversationsUsers,
  ConversationUser,
  Err,
  errors,
  organizations,
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
  adaptConversation,
  adaptConversationAssignee,
  adaptConversationUser,
  adaptOrg,
  adaptRule,
} from "./adapters.ts";

export const upsertRule = async (
  // deno-lint-ignore no-explicit-any
  tx: PostgresJsTransaction<any, any>,
  requestRule: RequestRule,
) => {
  const newRule = adaptRule(requestRule);
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
      existingUser.name !== user.name
    ) {
      changelogs.push({
        name: user.name,
        email: user.email,
        userId: user.id!,
      });
    }
  }
  await tx.insert(users).values(newUsers).onConflictDoUpdate({
    target: rules.id,
    set: {
      name: sql`excluded.name`,
      email: sql`excluded.email`,
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
  assigneeChanged = false, // true: assignee changed handled by caller
  upsertOrg = true,
  teamId: string | null = null,
) => {
  // TODO: missing color field
  if (upsertOrg) {
    await upsertOrganization(tx, requestConvo.organization);
  }
  const inserted: Author[] = await upsertAuthor(tx, requestConvo.authors);
  // TODO: handle external authors
  const convo = adaptConversation(requestConvo);
  if (closed !== null) {
    convo.closed = closed;
  }
  if (teamId) {
    convo.teamId = teamId;
  }
  const assignees = [];
  if (!assigneeChanged) {
    // This is an unsync convo, no assignee change emitted
    const existingConvo = await tx.select().from(conversations).where(
      eq(conversations.id, convo.id!),
    );
    if (existingConvo.length === 0 && requestConvo.assignees.length > 0) {
      for (const assignee of requestConvo.assignees) {
        assignees.push(adaptConversationAssignee(assignee, requestConvo.id));
      }
    }
  }
  await tx.insert(conversations).values(convo).onConflictDoUpdate({
    target: conversations.id,
    set: { ...convo },
  });
  const convoAuthors: ConversationAuthor[] = [];
  for (const author of inserted) {
    convoAuthors.push({
      conversationId: convo.id!,
      authorPhoneNumber: author.phoneNumber,
    });
  }
  await tx.insert(conversationsAuthors).values(convoAuthors)
    .onConflictDoNothing();
  await upsertConversationsUsers(tx, requestConvo);
  if (!assigneeChanged && assignees.length > 0) {
    await tx.insert(conversationsAssignees).values(assignees);
  }
};

export const upsertOrganization = async (
  // deno-lint-ignore no-explicit-any
  tx: PostgresJsTransaction<any, any>,
  requestOrganization: RequestOrganization,
) => {
  const org = adaptOrg(requestOrganization);
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
    convoUser.push(adaptConversationUser(user, requestConvo.id));
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

export const upsertAuthor = async (
  // deno-lint-ignore no-explicit-any
  tx: PostgresJsTransaction<any, any>,
  request_authors: RequestAuthor[],
): Promise<Author[]> => {
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
  return await tx.insert(authors).values([...uniqueAuthors])
    .onConflictDoUpdate({
      target: authors.phoneNumber,
      set: {
        name: sql`excluded.name`,
      },
    }).returning();
};
