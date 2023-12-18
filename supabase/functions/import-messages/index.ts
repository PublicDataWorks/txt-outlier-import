import {markAsImportedQuery, pool, selectQuery, updateLatestMessageIdQuery} from './queries.ts';
import { buildCreateMessageBody, createMessageUrl, headers, sendError } from './utils.ts';
import { Row } from "./types.ts";
import { QueryObjectResult } from "https://deno.land/x/postgres@v0.17.0/query/query.ts";

Deno.serve(async (_req: Request) => {
    const client = await pool.connect()
    try {
        const result: QueryObjectResult<Row> = await client.queryObject({text: selectQuery});
        const rows: Row[] = result.rows;
        if (rows.length === 0) {
            return new Response("No more messages to import")
        }
        const latest_id = rows[rows.length - 1].message_id;
        await client.queryObject({
            text: updateLatestMessageIdQuery,
            args: [latest_id]
        })
        const imported_message_ids: number[] = []
        for (const row of rows) {
            const startTime = Date.now();
            const data = buildCreateMessageBody(
                row.phone,
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
                imported_message_ids.push(row.message_id)
            } else {
                await sendError(client, row.message_id, response)
            }
            console.log("Successfully imported messages", row.message_id)
            await new Promise(r => setTimeout(r, Math.max(0, 1000 - (Date.now() - startTime))))
        }
        await client.queryObject({
            text: markAsImportedQuery,
            args: [imported_message_ids]
        })
        return new Response("OK")
    } finally {
        client.release()
    }
})
