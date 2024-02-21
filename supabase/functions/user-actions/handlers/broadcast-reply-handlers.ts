import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { and, eq, lt } from 'drizzle-orm'
import { addMinutes } from 'date-fns/index.js'

import { RequestBody, TwilioRequestMessage } from '../types.ts'
import { broadcastSentMessageStatus, outgoingMessages } from '../drizzle/schema.ts'

const handleBroadcastReply = async (db: PostgresJsDatabase, requestBody: RequestBody) => {
  // const requestMessage = requestBody.message!
  // const isReplyToFirstMessage = await deletePendingSecondBroadcastMessage(db, requestMessage)
  if (!false) {
    
    // It may not be a reply to second message
    const deliveredDate = new Date(1708506805 * 1000)
    const last12Hours = addMinutes(deliveredDate, -12 * 60)
    const res = await db.select().from(broadcastSentMessageStatus).where(
      and(
        // eq(broadcastSentMessageStatus.recipientPhoneNumber, '+13306795612'),
        lt(broadcastSentMessageStatus.createdAt, last12Hours),
      )
    )
    console.log(last12Hours, res)

    // const deletedMessages = await db.delete(outgoingMessages)
  }

}
// Return value === true: it's a reply to first message
const deletePendingSecondBroadcastMessage = async (db: PostgresJsDatabase, requestMessage: TwilioRequestMessage): Promise<boolean> => {
  const firstMessage = await db.select().from(outgoingMessages).where(
    and(
      eq(outgoingMessages.isSecond, false),
      eq(outgoingMessages.recipientPhoneNumber, requestMessage.from_field.id),
      eq(outgoingMessages.processed, false),
    ),
  )
  if (firstMessage.length === 0) {
    // First message was sent
    const deletedIds: { deletedId: number }[] = await db.delete(outgoingMessages)
      .where(
        and(
          eq(outgoingMessages.isSecond, true),
          eq(outgoingMessages.recipientPhoneNumber, requestMessage.from_field.id),
        ),
      )
      .returning({ deletedId: outgoingMessages.id });
    if (deletedIds.length) return true
  }
  return false
}

export { handleBroadcastReply }
