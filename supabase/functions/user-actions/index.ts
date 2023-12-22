import { AppError, RequestBody, RuleType } from "./types.ts";
import { handleError } from "./utils.ts";
import { handleNewComment } from "./new-comment.ts";

import { drizzle, PostgresJsDatabase } from "npm:drizzle-orm/postgres-js";
import postgres from "npm:postgres";

const client = postgres(Deno.env.get("DB_POOL_URL")!, { prepare: false });
const db: PostgresJsDatabase = drizzle(client);

Deno.serve(async (req) => {
  let requestBody: RequestBody;
  try {
    requestBody = await req.json();
  } catch (err) {
    console.error(`Bad Request: Invalid JSON: ${err}`);
    return new Response("", { status: 400 });
  }

  try {
    if (requestBody.rule.type === RuleType.NewComment) {
      await handleNewComment(db, requestBody);
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
