import { describe, it } from 'testing/bdd.ts'
import { assertEquals } from 'testing/asserts.ts'
import { eq } from 'drizzle-orm'

import { outgoingMessages } from '../drizzle/schema.ts'
import { db, req } from './utils.ts'
import { createOutgoingMessages } from './fixtures/outgoing-message.ts'
import { newIncomingSmsRequest } from './fixtures/incoming-twilio-message-request.ts'

describe(
  'Broadcast reply',
  { sanitizeOps: false, sanitizeResources: false },
  () => {
    it('receive reply before sending first message', async () => {
      await createOutgoingMessages()
      const messagesBefore = await db.select().from(outgoingMessages)
      assertEquals(messagesBefore.length, 2)

      await req(JSON.stringify(newIncomingSmsRequest))
      const messagesAfter = await db.select().from(outgoingMessages)
      assertEquals(messagesAfter.length, 2)
    })

    it('receive reply after sending first message', async () => {
      await createOutgoingMessages()
      await db.delete(outgoingMessages).where(eq(outgoingMessages.isSecond, false))
      const messagesBefore = await db.select().from(outgoingMessages)
      assertEquals(messagesBefore.length, 1)

      await req(JSON.stringify(newIncomingSmsRequest))
      const messagesAfter = await db.select().from(outgoingMessages)
      assertEquals(messagesAfter.length, 0)
    })

    it('receive reply after sending second message', async () => {
      await createOutgoingMessages()
      await db.delete(outgoingMessages)
      const messagesBefore = await db.select().from(outgoingMessages)
      assertEquals(messagesBefore.length, 0)

      await req(JSON.stringify(newIncomingSmsRequest))
      const messagesAfter = await db.select().from(outgoingMessages)
      assertEquals(messagesAfter.length, 0)
    })
  },
)
