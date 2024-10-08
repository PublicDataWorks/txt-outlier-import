import * as log from 'log'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { and, desc, eq, gt, lt } from 'drizzle-orm'
import { addMinutes } from 'date-fns/index.js'

import { RequestBody, TwilioRequestMessage } from '../types.ts'
import {
  authors,
  broadcastSentMessageStatus,
  lookupTemplate,
  outgoingMessages,
  twilioMessages,
  UnsubscribedMessage,
  unsubscribedMessages,
} from '../drizzle/schema.ts'
import { delay } from './utils.ts'
import { getMissiveMessage } from '../services/missive.ts'

const UNSUBSCRIBED_TERMS = ['stop', 'unsubscribe']
const START_TERMS = ['start']

const handleBroadcastReply = async (db: PostgresJsDatabase, requestBody: RequestBody) => {
  const requestMessage = requestBody.message!
  // Check if it's a reply to first message
  await deletePendingSecondBroadcastMessage(db, requestMessage)
  const deliveredDate = new Date(requestMessage.delivered_at * 1000)
  const last36Hours = addMinutes(deliveredDate, -36 * 60)
  const sentMessage = await db
    .select()
    .from(broadcastSentMessageStatus)
    .where(
      and(
        eq(broadcastSentMessageStatus.recipientPhoneNumber, requestMessage.from_field.id),
        lt(last36Hours.toISOString(), broadcastSentMessageStatus.createdAt),
        gt(deliveredDate.toISOString(), broadcastSentMessageStatus.createdAt),
      ),
    ).orderBy(
      desc(broadcastSentMessageStatus.createdAt),
      desc(broadcastSentMessageStatus.id),
    ).limit(1)
  if (sentMessage.length > 0) {
    await db
      .update(twilioMessages)
      .set({ isBroadcastReply: true, replyToBroadcast: sentMessage[0].broadcastId })
      .where(eq(twilioMessages.id, requestMessage.id))
  }
  if (UNSUBSCRIBED_TERMS.includes(requestMessage.preview.trim().toLowerCase())) {
    const newUnsubscribedMessage: UnsubscribedMessage = {
      broadcastId: sentMessage[0] ? sentMessage[0].broadcastId : null,
      twilioMessageId: requestMessage.id,
      replyTo: sentMessage[0] ? sentMessage[0].id : null,
    }
    await db.insert(unsubscribedMessages).values(newUnsubscribedMessage)
    await db
      .update(authors)
      .set({ unsubscribed: true })
      .where(eq(authors.phoneNumber, requestMessage.from_field.id))
  } else if (START_TERMS.includes(requestMessage.preview.trim().toLowerCase())) {
    await db
      .update(authors)
      .set({ unsubscribed: false })
      .where(eq(authors.phoneNumber, requestMessage.from_field.id))
  }
}

const deletePendingSecondBroadcastMessage = async (
  db: PostgresJsDatabase,
  requestMessage: TwilioRequestMessage,
): Promise<void> => {
  const firstMessage = await db
    .select()
    .from(outgoingMessages)
    .where(
      and(
        eq(outgoingMessages.isSecond, false),
        eq(outgoingMessages.recipientPhoneNumber, requestMessage.from_field.id),
        eq(outgoingMessages.processed, false),
      ),
    )
  if (firstMessage.length === 0) {
    // First message was sent
    await db
      .delete(outgoingMessages)
      .where(
        and(
          eq(outgoingMessages.isSecond, true),
          eq(outgoingMessages.recipientPhoneNumber, requestMessage.from_field.id),
        ),
      )
  }
}

const handleBroadcastOutgoing = async (db: PostgresJsDatabase, requestBody: RequestBody) => {
  const message = requestBody.message!
  const sentStatus = await db
    .select()
    .from(broadcastSentMessageStatus)
    .where(eq(broadcastSentMessageStatus.missiveId, message.id))
    .limit(1)

  if (sentStatus.length > 0) {
    const secretKeyLookup = await db
      .select()
      .from(lookupTemplate)
      .where(eq(lookupTemplate.name, 'missive_secret_for_broadcast_twilio_status_updater'))
      .limit(1)

    if (secretKeyLookup.length === 0) {
      log.error('Missive secret key not found in lookup table')
      return
    }
    const missiveSecretKey = secretKeyLookup[0].content

    const randomDelay = Math.floor(Math.random() * 1001)
    await delay(randomDelay)

    const response = await getMissiveMessage(message.id, missiveSecretKey)
    if (response) {
      const missiveMessage = response.messages
      if (missiveMessage.external_id) {
        const updateData = {
          twilioSentAt: missiveMessage.delivered_at ? new Date(missiveMessage.delivered_at * 1000) : null,
          twilioId: missiveMessage.external_id,
          twilioSentStatus: missiveMessage.delivered_at ? 'delivered' : 'sent',
        }
        await db
          .update(broadcastSentMessageStatus)
          .set(updateData)
          .where(eq(broadcastSentMessageStatus.missiveId, message.id))
        log.info(
          `Successfully updated broadcastSentMessageStatus for ${message.id}. Data: ${JSON.stringify(updateData)}`,
        )
      } else {
        const updateData = {
          twilioSentAt: null,
          twilioId: null,
          twilioSentStatus: 'undelivered',
        }
        await db
          .update(broadcastSentMessageStatus)
          .set(updateData)
          .where(eq(broadcastSentMessageStatus.missiveId, message.id))
        log.info(`Message ${message.id} marked as undelivered.`)
      }
    } else {
      log.info(`Failed to get message ${message.id}.`)
    }
  }
}

export { handleBroadcastOutgoing, handleBroadcastReply }
