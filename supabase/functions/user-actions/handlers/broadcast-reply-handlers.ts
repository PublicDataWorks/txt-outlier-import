import { RequestBody } from "../types.ts";
import { PostgresJsDatabase } from "npm:drizzle-orm/postgres-js";
import { outgoingMessages } from "../drizzle/schema.ts";
import { and, eq, gte, lt } from "npm:drizzle-orm";

export const deletePendingSecondBroadcastMessage = async (
  db: PostgresJsDatabase,
  requestBody: RequestBody,
) => {
  const requestMessage = requestBody.message!;
  const deliveredAtUnixTimestamp = requestMessage.delivered_at * 1000;
  const deliveredDate = new Date(deliveredAtUnixTimestamp);
  deliveredDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(deliveredDate);
  nextDay.setDate(deliveredDate.getDate() + 1);
  const deletedMessages = await db.delete(outgoingMessages)
    .where(
      and(
        // gte(outgoingMessages.createdAt, deliveredDate.getTime() / 1000), // TODO: get delay from broadcast
        // lt(outgoingMessages.createdAt, nextDay.getTime() / 1000),
        eq(outgoingMessages.isSecond, true),
        eq(
          outgoingMessages.recipientPhoneNumber,
          requestMessage.from_field.id,
        ),
      ),
    )
    .returning();

  console.log(
    "Deleted pending second message rows from OutgoingMessages ",
    deletedMessages,
  ); // Log any affected rows
};
