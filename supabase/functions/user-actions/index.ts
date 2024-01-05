import { RequestBody, RuleType } from "./types.ts";
import { handleNewComment } from "./handlers/comment-handler.ts";
import { handleTeamChange } from "./handlers/team-handler.ts";

import { drizzle, PostgresJsDatabase } from "npm:drizzle-orm/postgres-js";
import postgres from "npm:postgres";
import { handleLabelChange } from "./handlers/label-handler.ts";
import {
  handleConversationAssigneeChange,
  handleConversationClosed,
} from "./handlers/conversation-handler.ts";
import { handleTwilioMessage } from "./handlers/twilio-message-handler.ts";
import { handleError } from "./handlers/utils.ts";

const client = postgres(Deno.env.get("DB_POOL_URL")!, { prepare: false });
const db: PostgresJsDatabase = drizzle(client);

Deno.serve(async (req) => {
  let requestBody: RequestBody;

  try {
    requestBody = await req.json();
    console.log(requestBody);
  } catch (err) {
    console.error(`Bad Request: Invalid JSON: ${err}`);
    return new Response("", { status: 400 });
  }

  try {
    switch (requestBody.rule.type) {
      case RuleType.NewComment:
        await handleNewComment(db, requestBody);
        break;
      case RuleType.TeamChanged:
        await handleTeamChange(db, requestBody);
        break;
      case RuleType.LabelChanged:
        await handleLabelChange(db, requestBody);
        break;
      case RuleType.ConversationClosed:
      case RuleType.ConversationReopened:
        await handleConversationClosed(db, requestBody, requestBody.rule.type);
        break;
      case RuleType.ConversationAssigneeChange:
        await handleConversationAssigneeChange(db, requestBody);
        break;
      case RuleType.IncomingTwilioMessage:
        await handleTwilioMessage(db, requestBody);
        break;
      default:
        throw new Error(`Unhandled rule type: ${requestBody.rule.type}`);
    }

    console.log(`Successfully handled rule: ${requestBody.rule.id}`);
    return new Response("Ok", { status: 200 });
  } catch (err) {
    console.error(
      `An error occurred: ${err.message}.
    Request body: ${JSON.stringify(requestBody)}
    Stack trace: ${err.stack}`,
    );
    await handleError(db, requestBody, err);
    return new Response("", { status: 400 });
  }
});
