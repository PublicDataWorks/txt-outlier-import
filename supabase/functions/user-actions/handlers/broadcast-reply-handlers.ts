import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { and, eq, gt, lt } from 'drizzle-orm'
import { addMinutes } from 'date-fns/index.js'

import { RequestBody, TwilioRequestMessage } from '../types.ts'
import {
  broadcastSentMessageStatus,
  outgoingMessages,
  UnsubscribedMessage,
  unsubscribedMessages,
} from '../drizzle/schema.ts'

const UNSUBSCRIBED_TERMS = ['stop', 'unsubscribe']

const handleBroadcastReply = async (db: PostgresJsDatabase, requestBody: RequestBody) => {
  const requestMessage = requestBody.message!
  const isReplyToFirstMessage = await deletePendingSecondBroadcastMessage(db, requestMessage)
  if (!isReplyToFirstMessage && UNSUBSCRIBED_TERMS.includes(requestMessage.preview.toLowerCase())) {
    // It may not be a reply to second message
    const deliveredDate = new Date(requestMessage.delivered_at * 1000)
    const last12Hours = addMinutes(deliveredDate, -12 * 60)
    const sentMessage = await db.select().from(broadcastSentMessageStatus).where(
      and(
        eq(broadcastSentMessageStatus.recipientPhoneNumber, requestMessage.from_field.id),
        eq(broadcastSentMessageStatus.isSecond, true),
        lt(last12Hours, broadcastSentMessageStatus.createdAt),
        gt(deliveredDate, broadcastSentMessageStatus.createdAt),
      ),
    )
    if (sentMessage.length > 0) {
      const newUnsubscribedMessage: UnsubscribedMessage = {
        broadcastId: sentMessage[0].broadcastId,
        twilioMessageId: requestMessage.id,
        replyTo: sentMessage[0].id,
      }
      await db.insert(unsubscribedMessages).values(newUnsubscribedMessage)
    }
  }
}

// Return value === true: it's a reply to first message
const deletePendingSecondBroadcastMessage = async (
  db: PostgresJsDatabase,
  requestMessage: TwilioRequestMessage,
): Promise<boolean> => {
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
      .returning({ deletedId: outgoingMessages.id })
    if (deletedIds.length) return true
  }
  return false
}

export { handleBroadcastReply }
