import {PostgresJsDatabase} from "npm:drizzle-orm/postgres-js";
import {team} from "../drizzle/schema.ts";
import {upsertRule} from "../utils.ts";
import {RequestBody} from "../types.ts";

export const handleTeamChange = async (
    db: PostgresJsDatabase,
    requestBody: RequestBody,
) => {
    await db.transaction(async (tx) => {
    await upsertRule(tx, requestBody.rule);
    if (requestBody.conversation.team) {
        const teamData = {
            teamName: requestBody.conversation.team.name,
            teamId: requestBody.conversation.team.id,
            organization: requestBody.conversation.team.organization,
            conversationId: requestBody.conversation.id,
        };
        await tx.insert(team).values(teamData);
        //TODO: UPSERT CONVERSATION INFO TO CONVERSATIONS
        }
    });
};
