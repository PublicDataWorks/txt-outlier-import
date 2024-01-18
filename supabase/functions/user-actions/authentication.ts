import { ErrorDetail, RequestBody } from "./types.ts";
import { decodeHex } from "https://deno.land/std@0.210.0/encoding/hex.ts";
import { SlackAPI } from "https://deno.land/x/deno_slack_api@2.1.1/mod.ts";
import { SlackAPIClient } from "https://deno.land/x/deno_slack_api@2.1.1/types.ts";
import {
  markdownTemplateBody,
  markdownTemplateHeader,
} from "./templates/slack.ts";
import { isTesting } from "./database.ts";

export const verify = async (
  hash: string,
  requestBody: RequestBody,
): Promise<boolean> => {
  if (isTesting) return true;
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
  const cleanedHeaderSig = hash.startsWith(keyPrefix)
    ? hash.slice(keyPrefix.length)
    : hash;

  const receivedSignature = decodeHex(cleanedHeaderSig);

  return await crypto.subtle.verify(
    { name: "HMAC", hash: "SHA-256" },
    key,
    receivedSignature,
    data.buffer,
  );
};

export const authenticationFailed = async (
  req: Request,
  failureDetails: string,
  requestBody?: RequestBody,
) => {
  const errorDetail: ErrorDetail = {
    failureHost: ips(req),
    failureDetails,
    failedRequestDetails: requestBody
      ? JSON.stringify(requestBody, null, 2)
      : "",
    failedRule: requestBody ? requestBody.rule.type : "",
  };
  const client = SlackAPI(Deno.env.get("SLACK_API_TOKEN")!);
  await sendToSlack(client, errorDetail);
};

const ips = (req: Request): string => {
  return req.headers.get("x-forwarded-for")?.split(/\s*,\s*/).toString() || "";
};

async function sendToSlack(
  client: SlackAPIClient,
  data: ErrorDetail,
) {
  const head = replacePlaceholders(markdownTemplateHeader, data);
  const body = replacePlaceholders(markdownTemplateBody, data);
  const result = await client.chat.postMessage({
    channel: Deno.env.get("SLACK_CHANNEL")!,
    text: head,
  });
  if (result.ok) {
    await client.chat.postMessage({
      channel: Deno.env.get("SLACK_CHANNEL")!,
      text: body,
      thread_ts: result.ts,
    });
  } else {
    throw new Error(`Failed to send message: ${result}`);
  }
}

// Function to replace placeholders in the template
function replacePlaceholders(
  template: string,
  replacements: ErrorDetail,
): string {
  return template.replace(/<%=\s*(\w+)\s*%>/g, (match, p1) => {
    return replacements[p1] !== undefined ? replacements[p1] : match;
  });
}
