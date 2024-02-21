import { describe, it } from 'https://deno.land/std@0.210.0/testing/bdd.ts'
import { assertEquals } from 'https://deno.land/std@0.210.0/assert/mod.ts'

import { req } from './utils.ts'
import { teams } from '../drizzle/schema.ts'
import { teamChangeRequest } from './fixtures/team-change-request.ts'
import supabase from '../database.ts'

describe(
  'Team',
  { sanitizeOps: false, sanitizeResources: false },
  () => {
    it('change', async () => {
      const existingTeams = await supabase.select().from(teams)
      assertEquals(existingTeams.length, 0)
      await req(JSON.stringify(teamChangeRequest))

      const newTeam = await supabase.select().from(teams)
      assertEquals(newTeam.length, 1)
      assertEquals(newTeam[0].id, teamChangeRequest.conversation.team!.id)
      assertEquals(newTeam[0].name, teamChangeRequest.conversation.team!.name)
      assertEquals(
        newTeam[0].organizationId,
        teamChangeRequest.conversation.team!.organization,
      )
    })

    it('upsert', async () => {
      await req(JSON.stringify(teamChangeRequest))
      const body = JSON.parse(JSON.stringify(teamChangeRequest))
      body.conversation.team.name = 'new name'
      await req(JSON.stringify(body))

      const newTeam = await supabase.select().from(teams)
      assertEquals(newTeam.length, 1)
      assertEquals(newTeam[0].id, teamChangeRequest.conversation.team!.id)
      assertEquals(newTeam[0].name, 'new name')
      assertEquals(
        newTeam[0].organizationId,
        teamChangeRequest.conversation.team!.organization,
      )
    })
  },
)
