import { ReplacementDictionary, RequestBody, RuleType } from "./types.ts";
import { handleError, insertHistory, replacePlaceholders } from "./utils.ts";
import { handleNewComment } from "./handlers/comment-handler.ts";
import { handleTeamChange } from "./handlers/team-handler.ts";
import {
  markdownTemplateBody,
  markdownTemplateHeader,
} from "./templates/slack.ts";
import { SlackAPI } from "https://deno.land/x/deno_slack_api@2.1.1/mod.ts";

import { drizzle, PostgresJsDatabase } from "npm:drizzle-orm/postgres-js";
import postgres from "npm:postgres";
import { handleLabelChange } from "./handlers/label-handler.ts";
import {
  handleConversationAssigneeChange,
  handleConversationStatusChanged,
} from "./handlers/conversation-handler.ts";
import { handleTwilioMessage } from "./handlers/twilio-message-handler.ts";
import { verify } from "./authenticate.ts";

const client = postgres(Deno.env.get("DB_POOL_URL")!, { prepare: false });
const db: PostgresJsDatabase = drizzle(client);

const SLACK_CHANNEL_ID = Deno.env.get("SLACK_CHANNEL")!;

Deno.serve(async (req) => {
  let requestBody: RequestBody;
  const replacementDictionary: ReplacementDictionary = {};
  const clientIps = ips(req) || [""];

  const client = SlackAPI(Deno.env.get("SLACK_API_TOKEN")!);

  try {
    requestBody = await req.json();
    console.log(requestBody);
  } catch (err) {
    console.error(`Bad Request: Invalid JSON: ${err}`);
    replacementDictionary.failureHost = clientIps;
    replacementDictionary.failureDetails = "Missing request body";
    await sendToSlack(client, replacementDictionary);
    return new Response("", { status: 202 });
  }

  const requestHeaderSig = req.headers.get("X-Hook-Signature");
  if (!requestHeaderSig) {
    console.error("Bad Request: X-Hook-Signature header is missing");
    replacementDictionary.failureHost = clientIps;
    replacementDictionary.failureDetails = "Missing authentication header";
    replacementDictionary.failedRequestDetails = JSON.stringify(
      requestBody,
      null,
      2,
    ).toString();
    replacementDictionary.failedRule = requestBody.rule.type;
    await sendToSlack(client, replacementDictionary);
    return new Response("", { status: 202 });
  } else {
    const verified = await verify(requestHeaderSig, requestBody);
    if (!verified) {
      replacementDictionary.failureHost = clientIps;
      replacementDictionary.failureDetails = "Mismatched authentication header";
      replacementDictionary.failedRequestDetails = JSON.stringify(
        requestBody,
        null,
        2,
      ).toString();
      replacementDictionary.failedRule = requestBody.rule.type;
      await sendToSlack(client, replacementDictionary);
      return new Response("", { status: 202 });
    }
  }

  await insertHistory(db, requestBody);

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
        await handleConversationStatusChanged(
          db,
          requestBody,
          requestBody.rule.type,
        );
        break;
      case RuleType.ConversationAssigneeChange:
        await handleConversationAssigneeChange(db, requestBody);
        break;
      case RuleType.IncomingTwilioMessage:
        await handleTwilioMessage(db, requestBody);
        break;
      case RuleType.OutgoingTwilioMessage:
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

// Function to send message to Slack
async function sendToSlack(
  client: any,
  data: ReplacementDictionary,
): Promise<void> {
  const head = replacePlaceholders(markdownTemplateHeader, data);
  const body = replacePlaceholders(markdownTemplateBody, data);

  try {
    // Call the chat.postMessage method using the WebClient
    const result = await client.chat.postMessage({
      channel: SLACK_CHANNEL_ID,
      text: head,
    });
    if (result.ok) {
      await client.chat.postMessage({
        channel: SLACK_CHANNEL_ID,
        text: body,
        thread_ts: result.ts,
      });
    } else {
      throw new Error(`Failed to send message: ${result}`);
    }
  } catch (error) {
    console.error("Error sending message to Slack:", error.message);
  }
}

function ips(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(/\s*,\s*/).toString();
}
