import { PostgresJsDatabase } from "npm:drizzle-orm/postgres-js";
import { upsertConversation, upsertRule } from "../utils.ts";
import { RequestBody } from "../types.ts";

export const handleConversationClosed = async (
  db: PostgresJsDatabase,
  requestBody: RequestBody,
  changeType: string
) => {
  await db.transaction(async (tx) => {
    await upsertRule(tx, requestBody.rule);
    await upsertConversation(tx, requestBody.conversation, changeType);
  });
};

export const handleConversationAssigneeChange = async (
  db: PostgresJsDatabase,
  requestBody: RequestBody,
) => {
  await db.transaction(async (tx) => {
    await upsertRule(tx, requestBody.rule);
    await upsertConversation(tx, requestBody.conversation, null);
  });
};
