import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { and, eq } from 'drizzle-orm'

import { RequestBody } from '../types.ts'
import { outgoingMessages } from '../drizzle/schema.ts'

export const deletePendingSecondBroadcastMessage = async (
  db: PostgresJsDatabase,
  requestBody: RequestBody,
) => {
  const requestMessage = requestBody.message!
  const firstMessage = await db.select().from(outgoingMessages).where(
    and(
      eq(outgoingMessages.isSecond, false),
      eq(outgoingMessages.recipientPhoneNumber, requestMessage.from_field.id),
      eq(outgoingMessages.processed, false),
    ),
  )
  if (firstMessage.length === 0) {
    // First message was sent
    await db.delete(outgoingMessages)
      .where(
        and(
          eq(outgoingMessages.isSecond, true),
          eq(outgoingMessages.recipientPhoneNumber, requestMessage.from_field.id),
        ),
      )
  }
}
