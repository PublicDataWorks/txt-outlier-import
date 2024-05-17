import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { and, desc, eq, gt, lt } from 'drizzle-orm'
import { addMinutes } from 'date-fns/index.js'

import { RequestBody, TwilioRequestMessage } from '../types.ts'
import {
  authors,
  broadcastSentMessageStatus,
  outgoingMessages,
  twilioMessages,
  UnsubscribedMessage,
  unsubscribedMessages,
} from '../drizzle/schema.ts'

const UNSUBSCRIBED_TERMS = ['stop', 'unsubscribe']

const handleBroadcastReply = async (db: PostgresJsDatabase, requestBody: RequestBody) => {
  const requestMessage = requestBody.message!
  // Check if it's a reply to first message
  await deletePendingSecondBroadcastMessage(db, requestMessage)
  const deliveredDate = new Date(requestMessage.delivered_at * 1000)
  const last36Hours = addMinutes(deliveredDate, -36 * 60)
  const sentMessage = await db.select().from(broadcastSentMessageStatus).where(
    and(
      eq(broadcastSentMessageStatus.recipientPhoneNumber, requestMessage.from_field.id),
      lt(last36Hours, broadcastSentMessageStatus.createdAt),
      gt(deliveredDate, broadcastSentMessageStatus.createdAt),
    ),
  ).orderBy(desc(broadcastSentMessageStatus.createdAt), desc(broadcastSentMessageStatus.id)).limit(1)
  if (sentMessage.length > 0) {
    await db.update(twilioMessages)
      .set({ isBroadcastReply: true })
      .where(eq(twilioMessages.id, requestMessage.id))
  }
  if (UNSUBSCRIBED_TERMS.includes(requestMessage.preview.toLowerCase())) {
    const newUnsubscribedMessage: UnsubscribedMessage = {
      broadcastId: sentMessage[0] ? sentMessage[0].broadcastId : null,
      twilioMessageId: requestMessage.id,
      replyTo: sentMessage[0] ? sentMessage[0].id : null,
    }
    await db.insert(unsubscribedMessages).values(newUnsubscribedMessage)
    await db.update(authors).set({ unsubscribed: true })
      .where(eq(authors.phoneNumber, requestMessage.to_fields))
  }
}

const deletePendingSecondBroadcastMessage = async (
  db: PostgresJsDatabase,
  requestMessage: TwilioRequestMessage,
): Promise<void> => {
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

export { handleBroadcastReply }
