import { PostgresJsDatabase } from "npm:drizzle-orm/postgres-js";
import { Team, team } from "../drizzle/schema.ts";
import { upsertRule } from "../utils.ts";
import { RequestBody } from "../types.ts";

export const handleTeamChange = async (
  db: PostgresJsDatabase,
  requestBody: RequestBody,
) => {
  await db.transaction(async (tx) => {
    await upsertRule(db, requestBody.rule);
    if (requestBody.conversation.team) {
      const teamData = {
        teamName: requestBody.conversation.team.name,
        teamId: requestBody.conversation.team.id,
        organization: requestBody.conversation.team.organization,
      };
      const teamObj: Team = { ...teamData };
      await tx.insert(team).values(teamObj);
    }
  });
};
