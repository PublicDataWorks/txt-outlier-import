import { describe, it } from 'testing/bdd.ts'
import { assertEquals } from 'testing/asserts.ts'
import { eq } from 'drizzle-orm'
import { faker } from 'faker'

import { broadcastSentMessageStatus, outgoingMessages, unsubscribedMessages } from '../drizzle/schema.ts'
import { req } from './utils.ts'
import { createOutgoingMessages } from './fixtures/outgoing-message.ts'
import { newIncomingSmsRequest } from './fixtures/incoming-twilio-message-request.ts'
import supabase from '../database.ts'

describe(
  'Broadcast reply to first message',
  { sanitizeOps: false, sanitizeResources: false },
  () => {
    it('receive reply before sending first message', async () => {
      await createOutgoingMessages()
      const messagesBefore = await supabase.select().from(outgoingMessages)
      assertEquals(messagesBefore.length, 2)

      await req(JSON.stringify(newIncomingSmsRequest))
      const messagesAfter = await supabase.select().from(outgoingMessages)
      assertEquals(messagesAfter.length, 2)
    })

    it('receive reply after sending first message', async () => {
      await createOutgoingMessages()
      await supabase.delete(outgoingMessages).where(eq(outgoingMessages.isSecond, false))
      const messagesBefore = await supabase.select().from(outgoingMessages)
      assertEquals(messagesBefore.length, 1)

      await req(JSON.stringify(newIncomingSmsRequest))
      const messagesAfter = await supabase.select().from(outgoingMessages)
      assertEquals(messagesAfter.length, 0)
    })

    it('receive reply after sending second message', async () => {
      await createOutgoingMessages()
      await supabase.delete(outgoingMessages)
      const messagesBefore = await supabase.select().from(outgoingMessages)
      assertEquals(messagesBefore.length, 0)

      await req(JSON.stringify(newIncomingSmsRequest))
      const messagesAfter = await supabase.select().from(outgoingMessages)
      assertEquals(messagesAfter.length, 0)
    })
  },
)

describe(
  'Unsubscribe',
  { sanitizeOps: false, sanitizeResources: false },
  () => {
    it('unsubscribe after sending second message', async () => {
      await createOutgoingMessages()
      await supabase.delete(outgoingMessages)
      await seedSentMessages()
      const unsubscribeBefore = await supabase.select().from(unsubscribedMessages)
      assertEquals(unsubscribeBefore.length, 0)

      const unsubscribeMsg = newIncomingSmsRequest
      unsubscribeMsg.message!.preview = 'unsubscribe'
      unsubscribeMsg.message!.delivered_at = Date.now() / 1000 + 10000
      await req(JSON.stringify(unsubscribeMsg))

      const unsubscribeAfter = await supabase.select().from(unsubscribedMessages)
      assertEquals(unsubscribeAfter.length, 1)
      assertEquals(unsubscribeAfter[0].broadcastId, 1)
      assertEquals(unsubscribeAfter[0].replyTo, 2)
      assertEquals(unsubscribeAfter[0].twilioMessageId, unsubscribeMsg.message!.id)
    })

    it('stop after sending second message', async () => {
      await createOutgoingMessages()
      await supabase.delete(outgoingMessages)
      await seedSentMessages()

      const unsubscribeMsg = newIncomingSmsRequest
      unsubscribeMsg.message!.preview = 'stop'
      unsubscribeMsg.message!.delivered_at = Date.now() / 1000 + 11 * 60 * 60
      await req(JSON.stringify(unsubscribeMsg))

      const unsubscribeAfter = await supabase.select().from(unsubscribedMessages)
      assertEquals(unsubscribeAfter.length, 1)
      assertEquals(unsubscribeAfter[0].broadcastId, 1)
      assertEquals(unsubscribeAfter[0].replyTo, 2)
      assertEquals(unsubscribeAfter[0].twilioMessageId, unsubscribeMsg.message!.id)
    })

    it('other term not count as unsubscribe', async () => {
      await createOutgoingMessages()
      await supabase.delete(outgoingMessages)
      await seedSentMessages()

      const unsubscribeMsg = newIncomingSmsRequest
      unsubscribeMsg.message!.preview = 'quit'
      unsubscribeMsg.message!.delivered_at = Date.now() / 1000 + 10000
      await req(JSON.stringify(unsubscribeMsg))

      const unsubscribeAfter = await supabase.select().from(unsubscribedMessages)
      assertEquals(unsubscribeAfter.length, 0)
    })

    it('stop after 12 hours not counted', async () => {
      await createOutgoingMessages()
      await supabase.delete(outgoingMessages)
      await seedSentMessages()

      const unsubscribeMsg = newIncomingSmsRequest
      unsubscribeMsg.message!.preview = 'stop'
      unsubscribeMsg.message!.delivered_at = Date.now() / 1000 + 14 * 60 * 60
      await req(JSON.stringify(unsubscribeMsg))
      const unsubscribeAfter = await supabase.select().from(unsubscribedMessages)
      assertEquals(unsubscribeAfter.length, 0)
    })

    it('stop before second message not counted', async () => {
      await createOutgoingMessages()
      await supabase.delete(outgoingMessages)
      await seedSentMessages()

      const unsubscribeMsg = newIncomingSmsRequest
      unsubscribeMsg.message!.preview = 'stop'
      unsubscribeMsg.message!.delivered_at = Date.now() / 1000 - 10000
      await req(JSON.stringify(unsubscribeMsg))
      const unsubscribeAfter = await supabase.select().from(unsubscribedMessages)
      assertEquals(unsubscribeAfter.length, 0)
    })
  },
)

const seedSentMessages = async () => {
  const sentMessages = [
    {
      recipientPhoneNumber: '+11234567891',
      missiveId: faker.random.uuid(),
      missiveConversationId: faker.random.uuid(),
      broadcastId: 1,
      isSecond: false,
      twilioSentStatus: 'delivered',
      message: 'first m',
    },
    {
      recipientPhoneNumber: '+11234567891',
      missiveId: faker.random.uuid(),
      missiveConversationId: faker.random.uuid(),
      broadcastId: 1,
      isSecond: true,
      twilioSentStatus: 'delivered',
      message: 'second m',
    },
  ]
  await supabase.insert(broadcastSentMessageStatus).values(sentMessages)
}
