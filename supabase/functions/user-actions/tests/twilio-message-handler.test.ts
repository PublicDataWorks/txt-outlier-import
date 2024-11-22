import { describe, it } from 'https://deno.land/std@0.210.0/testing/bdd.ts'
import { assertEquals } from 'https://deno.land/std@0.210.0/assert/mod.ts'
import { eq } from 'drizzle-orm'

import supabase from '../database.ts'
import { authors } from '../drizzle/schema.ts'
import { newIncomingSmsRequest } from './fixtures/incoming-twilio-message-request.ts'
import { req } from './utils.ts'

describe(
  'Resubscribe',
  { sanitizeOps: false, sanitizeResources: false },
  () => {
    it('successfully resubscribes an unsubscribed author', async () => {
      const phoneNumber = '+11234567891'

      await supabase.insert(authors).values({
        phoneNumber,
        unsubscribed: true,
      })

      const authorBefore = await supabase
        .select()
        .from(authors)
        .where(eq(authors.phoneNumber, phoneNumber))
      assertEquals(authorBefore[0].unsubscribed, true)

      const resubscribeMsg = structuredClone(newIncomingSmsRequest)
      resubscribeMsg.message!.preview = 'start11232'
      resubscribeMsg.message!.from_field.id = phoneNumber

      await req(JSON.stringify(resubscribeMsg))

      const authorAfter = await supabase
        .select()
        .from(authors)
        .where(eq(authors.phoneNumber, phoneNumber))
      assertEquals(authorAfter[0].unsubscribed, false)
    })

    it('does nothing for already subscribed author', async () => {
      const phoneNumber = '+11234567892'
      const conversationId = 'test-conversation-id'

      await supabase.insert(authors).values({
        phoneNumber,
        unsubscribed: false,
      })

      const resubscribeMsg = structuredClone(newIncomingSmsRequest)
      resubscribeMsg.message!.preview = 'start'
      resubscribeMsg.message!.from_field.id = phoneNumber
      resubscribeMsg.conversation.id = conversationId

      await req(JSON.stringify(resubscribeMsg))

      const authorAfter = await supabase
        .select()
        .from(authors)
        .where(eq(authors.phoneNumber, phoneNumber))
      assertEquals(authorAfter[0].unsubscribed, false)
    })

    it('ignores non-resubscribe terms', async () => {
      const phoneNumber = '+11234567893'
      const conversationId = 'test-conversation-id'

      await supabase.insert(authors).values({
        phoneNumber,
        unsubscribed: true,
      })

      const resubscribeMsg = structuredClone(newIncomingSmsRequest)
      resubscribeMsg.message!.preview = 'hello'
      resubscribeMsg.message!.from_field.id = phoneNumber
      resubscribeMsg.conversation.id = conversationId

      await req(JSON.stringify(resubscribeMsg))

      const authorAfter = await supabase
        .select()
        .from(authors)
        .where(eq(authors.phoneNumber, phoneNumber))
      assertEquals(authorAfter[0].unsubscribed, true)
    })
  },
)
