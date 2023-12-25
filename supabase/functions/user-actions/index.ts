import {ReplacementDictionary, RequestBody, RuleType} from "./types.ts";
import {handleError, replacePlaceholders} from "./utils.ts";
import { handleNewComment } from "./handlers/comment-handler.ts";
import { handleTeamChange } from "./handlers/team-handler.ts";
import { markdownTemplateHeader, markdownTemplateBody } from "./templates/slack.ts"
import { decodeHex } from "https://deno.land/std@0.210.0/encoding/hex.ts";
import { SlackAPI } from "https://deno.land/x/deno_slack_api@2.1.1/mod.ts";

import { drizzle, PostgresJsDatabase } from "npm:drizzle-orm/postgres-js";
import postgres from "npm:postgres";
import { handleLabelChange } from "./handlers/label-handler.ts";

const client = postgres(Deno.env.get("DB_POOL_URL")!, { prepare: false });
const db: PostgresJsDatabase = drizzle(client);

const SLACK_CHANNEL_ID = Deno.env.get("SLACK_CHANNEL")!;

Deno.serve(async (req) => {
  let requestBody: RequestBody;
  const replacementDictionary: ReplacementDictionary = {};
  const clientIps = ips(req) || [''];

  const client = SlackAPI(Deno.env.get("SLACK_API_TOKEN")!);

  try {
    requestBody = await req.json();
    console.log(requestBody);
  } catch (err) {
    console.error(`Bad Request: Invalid JSON: ${err}`);
    replacementDictionary.failureHost = clientIps;
    replacementDictionary.failureDetails = "Missing request body";
    await sendToSlack(client, replacementDictionary);
    return new Response("", { status: 400 });
  }

  const requestHeaderSig = req.headers.get('X-Hook-Signature');
  if (!requestHeaderSig) {
    console.error('Bad Request: X-Hook-Signature header is missing');
    replacementDictionary.failureHost = clientIps;
    replacementDictionary.failureDetails = "Missing authentication header";
    replacementDictionary.failedRequestDetails = JSON.stringify(requestBody, null, 2).toString();
    replacementDictionary.failedRule = requestBody.rule.type;
    await sendToSlack(client, replacementDictionary);
    return new Response("", { status: 400 });
  } else {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(requestBody));

    const keyBuf = encoder.encode(Deno.env.get("HMAC_SECRET")!);

    const key = await crypto.subtle.importKey(
        "raw",
        keyBuf,
        { name: "HMAC", hash: "SHA-256" },
        true,
        ["sign", "verify"],
    );

    const keyPrefix = "sha256=";
      const cleanedHeaderSig = requestHeaderSig.startsWith(keyPrefix)
          ? requestHeaderSig.slice(keyPrefix.length)
          : requestHeaderSig;

      const receivedSignature = decodeHex(cleanedHeaderSig);

      const verified = await crypto.subtle.verify({ name: "HMAC", hash: "SHA-256" }, key, receivedSignature, data.buffer);

      if (!verified){
        replacementDictionary.failureHost = clientIps;
        replacementDictionary.failureDetails = "Mismatched authentication header";
        replacementDictionary.failedRequestDetails = JSON.stringify(requestBody, null, 2).toString();
        replacementDictionary.failedRule = requestBody.rule.type;
        await sendToSlack(client, replacementDictionary);
        return new Response("", { status: 400 });
      }
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
        // Add more cases as needed for different rule types
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
async function sendToSlack(client: any, data: ReplacementDictionary): Promise<void> {
  const head = replacePlaceholders(markdownTemplateHeader, data)
  const body = replacePlaceholders(markdownTemplateBody, data)

  try {
    // Call the chat.postMessage method using the WebClient
    const result = await client.chat.postMessage({
      channel: SLACK_CHANNEL_ID,
      text: head
    });
    if (result.ok){
      const result2 = await client.chat.postMessage({
        channel: SLACK_CHANNEL_ID,
        text: body,
        thread_ts: result.ts
      });
    } else {
      throw new Error(`Failed to send message: ${result}`);
    }
  }
  catch (error) {
    console.error('Error sending message to Slack:', error.message);
  }
}

function ips(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(/\s*,\s*/).toString();
}