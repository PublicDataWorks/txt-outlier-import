import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { afterAll, beforeEach } from "testing/bdd.ts";
import { assert } from "testing/asserts.ts";
import httpMocks from "node-mocks-http";
import { handler } from "../index.ts";
import supabase, { client } from "../database.ts";

beforeEach(async () => {
  await supabase.execute(sql.raw(DROP_ALL_TABLES));
  const sqlScript = Deno.readTextFileSync("drizzle/0000_smooth_mathemanic.sql");
  await supabase.execute(sql.raw(sqlScript));
});

afterAll(async () => {
  await client.end();
});

export const DROP_ALL_TABLES = `
  DROP TABLE IF EXISTS "errors" CASCADE;
  DROP TABLE IF EXISTS "rules" CASCADE;
  DROP TABLE IF EXISTS "users" CASCADE;
  DROP TABLE IF EXISTS "comments" CASCADE;
  DROP TABLE IF EXISTS "conversations" CASCADE;
  DROP TABLE IF EXISTS "comments_mentions" CASCADE;
  DROP TABLE IF EXISTS "teams" CASCADE;
  DROP TABLE IF EXISTS "conversation_history" CASCADE;
  DROP TABLE IF EXISTS "organizations" CASCADE;
  DROP TABLE IF EXISTS "conversations_assignees" CASCADE;
  DROP TABLE IF EXISTS "conversations_assignees_history" CASCADE;
  DROP TABLE IF EXISTS "conversations_authors" CASCADE;
  DROP TABLE IF EXISTS "authors" CASCADE;
  DROP TABLE IF EXISTS "conversations_labels" CASCADE;
  DROP TABLE IF EXISTS "labels" CASCADE;
  DROP TABLE IF EXISTS "conversations_users" CASCADE;
  DROP TABLE IF EXISTS "tasks_assignees" CASCADE;
  DROP TABLE IF EXISTS "twilio_messages" CASCADE;
  DROP TABLE IF EXISTS "user_history" CASCADE;
  DROP TABLE IF EXISTS "broadcast_sent_message_status" CASCADE;
  DROP TABLE IF EXISTS "outgoing_messages" CASCADE;
`;

export const req = async (body: string) => {
  const headers = new Headers({
    "Content-Type": "application/json; charset=UTF-8",
    "X-Hook-Signature": "123456",
  });

  const request = httpMocks.createRequest({
    method: "POST",
    url: "/",
    headers: Object.fromEntries(headers.entries()),
    body,
  });
  request.json = function () {
    return JSON.parse(this.body);
  };
  request.headers = new Headers(request.headers);

  console.log("kyky", request.headers.get("X-Hook-Signature"));
  const response = await handler(request);
  await response.text();
  assert(response.ok);
};
