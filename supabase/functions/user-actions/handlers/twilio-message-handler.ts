import { PostgresJsDatabase, PostgresJsTransaction } from 'drizzle-orm/postgres-js'

import { RequestBody } from '../types.ts'

import { upsertAuthor, upsertConversation, upsertRule } from './utils.ts'
import { twilioMessages } from '../drizzle/schema.ts'
import { adaptTwilioMessage, adaptTwilioRequestAuthor } from '../adapters.ts'

export const handleTwilioMessage = async (
  db: PostgresJsDatabase,
  requestBody: RequestBody,
) => {
  await db.transaction(async (tx) => {
    await upsertRule(tx, requestBody.rule)
    await upsertConversation(tx, requestBody.conversation)
    await insertTwilioMessage(tx, requestBody)
  })
}

const insertTwilioMessage = async (
  // deno-lint-ignore no-explicit-any
  tx: PostgresJsTransaction<any, any>,
  requestBody: RequestBody,
) => {
  const requestMessage = requestBody.message!
  const twilioAuthors = new Set([
    adaptTwilioRequestAuthor(requestMessage.from_field),
    adaptTwilioRequestAuthor(requestMessage.to_fields[0]), // TODO: Handle multiple recipients
  ])
  const filteredTwilioAuthors = [...twilioAuthors].filter((twilioAuthor) =>
    !requestBody.conversation.authors.some((author) => author.phone_number === twilioAuthor.phone_number)
  )
  await upsertAuthor(tx, filteredTwilioAuthors)
  // Sample data:
  // from_field: {
  //       id: "AC0d82ffb9b12d5acf383ca62f1d78c54a",
  //       name: "+1 (833) 685-6203",
  //       username: "+18336856203"
  //     },
  const twilioMessage = adaptTwilioMessage(
    requestMessage,
    requestMessage.from_field.username ? requestMessage.from_field.username : requestMessage.from_field.id,
    requestMessage.to_fields[0].username ? requestMessage.to_fields[0].username : requestMessage.to_fields[0].id,
  )
  await tx.insert(twilioMessages).values(twilioMessage)
}
