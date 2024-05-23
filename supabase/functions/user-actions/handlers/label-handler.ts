import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { upsertConversation, upsertLabel, upsertRule } from './utils.ts'
import { RequestBody } from '../types.ts'

export const handleLabelChange = async (
  db: PostgresJsDatabase,
  requestBody: RequestBody,
) => {
  await db.transaction(async (tx) => {
    await upsertRule(tx, requestBody.rule)
    await upsertConversation(tx, requestBody.conversation)
    await upsertLabel(tx, requestBody.conversation)
  })
}
