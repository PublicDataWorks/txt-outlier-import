import {RequestBody} from "../types.ts";
import {PostgresJsDatabase} from "npm:drizzle-orm/postgres-js";
import {upsertAuthor, upsertConversation, upsertRule} from "../utils.ts";
import {PostgresJsTransaction} from "npm:drizzle-orm/postgres-js";
import {twilioMessages} from "../drizzle/schema.ts";
import {adaptTwilioRequestAuthor, adaptTwilioMessage} from "../adapters.ts";

export const handleTwilioMessage = async (db: PostgresJsDatabase, requestBody: RequestBody) => {
  await db.transaction(async (tx) => {
    await upsertRule(tx, requestBody.rule);
    await upsertConversation(tx, requestBody.conversation);
    await insertTwilioMessage(tx, requestBody);
  });
}

const insertTwilioMessage = async (
  // deno-lint-ignore no-explicit-any
  tx: PostgresJsTransaction<any, any>,
  requestBody: RequestBody
) => {
  const requestMessage = requestBody.message!
  const twilioAuthors = new Set([
    adaptTwilioRequestAuthor(requestMessage.from_field),
    adaptTwilioRequestAuthor(requestMessage.to_fields[0]), // TODO: Handle multiple recipients
    adaptTwilioRequestAuthor(requestMessage.account_author),
    adaptTwilioRequestAuthor(requestMessage.account_recipients[0]), // TODO: Handle multiple recipients
  ])
  const filteredTwilioAuthors = [...twilioAuthors].filter(twilioAuthor =>
    !requestBody.conversation.authors.some(author => author.phone_number === twilioAuthor.phone_number)
  );
  await upsertAuthor(tx, filteredTwilioAuthors);
  const twilioMessage = adaptTwilioMessage(requestMessage, requestMessage.from_field.id, requestMessage.from_field.id, requestMessage.from_field.id, requestMessage.from_field.id);
  await tx.insert(twilioMessages).values(twilioMessage);
}
