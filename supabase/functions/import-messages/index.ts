import {markAsImportedQuery, pool, selectQuery} from './queries.ts';
import { buildCreateMessageBody, createMessageUrl, headers, sendError } from './utils.ts';
import { Row } from "./types.ts";
import { QueryObjectResult } from "https://deno.land/x/postgres@v0.17.0/query/query.ts";

Deno.serve(async (_req: Request) => {
    const client = await pool.connect()
    const result: QueryObjectResult<Row> = await client.queryObject({text: selectQuery});
    const rows: Row[] = result.rows;
    const message_ids: number[] = []
    for (const row of rows) {
        message_ids.push(row.message_id)
    }
    console.log(message_ids)
    await client.queryObject({
        text: markAsImportedQuery,
        args: [message_ids]
    })
    for (const row of rows) {
        const startTime = Date.now();
        let fullName: string | null;
        if (row.first_name && row.last_name) {
            fullName = `${row.first_name} ${row.last_name}`;
        } else {
            fullName = row.first_name || row.last_name
        }
        const data = buildCreateMessageBody(
            Number(row.user_id),
            row.phone,
            fullName,
            row.message_text,
            row.outbound,
            row.message_date
        );
        const response = await fetch(createMessageUrl, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(data)
        });
        if (response.ok) {
            console.log("Successfully imported message:", row.message_id);
        } else {
            await sendError(client, row.message_id, response)
        }
        await new Promise(r => setTimeout(r, Math.max(0, 1000 - (Date.now() - startTime))))
    }
    return new Response("OK", {
      status: 200
    })
})
