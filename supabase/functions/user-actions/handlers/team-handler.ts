import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

import { conversationHistory, teams } from '../drizzle/schema.ts'
import { upsertConversation, upsertOrganization, upsertRule } from './utils.ts'
import { RequestBody, RuleType } from '../types.ts'

export const handleTeamChange = async (
  db: PostgresJsDatabase,
  requestBody: RequestBody,
) => {
  await db.transaction(async (tx) => {
    await upsertRule(tx, requestBody.rule)
    await upsertOrganization(tx, requestBody.conversation.organization)
    const teamData = {
      id: requestBody.conversation.team!.id,
      name: requestBody.conversation.team!.name,
      organizationId: requestBody.conversation.organization.id,
    }
    await tx.insert(teams).values(teamData).onConflictDoUpdate({
      target: teams.id,
      set: { name: teamData.name, organizationId: teamData.organizationId },
    })
    await upsertConversation(
      tx,
      requestBody.conversation,
      null,
      false,
      false,
      requestBody.conversation.team!.id,
    )
    const convoHistory = {
      conversationId: requestBody.conversation.id,
      changeType: RuleType.TeamChanged,
      teamId: requestBody.conversation.team!.id,
    }
    await tx.insert(conversationHistory).values(convoHistory)
  })
}
