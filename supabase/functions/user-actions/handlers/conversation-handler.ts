import { PostgresJsDatabase } from "npm:drizzle-orm/postgres-js";
import { upsertLatestConversation, upsertRule } from "../utils.ts";
import { RequestBody } from "../types.ts";

export const handleConversationClosed = async (
  db: PostgresJsDatabase,
  requestBody: RequestBody,
) => {
  await db.transaction(async (tx) => {
    await upsertRule(tx, requestBody.rule);
    await upsertLatestConversation(tx, requestBody.conversation);
  });
};
