import { AppError, RequestBody, RequestRule, RequestUser } from "./types.ts";
import {
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
  appError: AppError,
) => {
  const err: Err = {
    ruleId: requestBody.rule.id,
    ruleDescription: requestBody.rule.description,
    ruleType: requestBody.rule.type,
    message: appError.message,
    requestBody: requestBody,
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
    console.log(existingUser?.avatarUrl);
    console.log(user.avatarUrl);
    console.log(existingUser?.avatarUrl !== user.avatarUrl);
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
