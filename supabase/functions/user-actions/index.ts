import {Server} from "https://deno.land/std@0.208.0/http/server.ts";
import {createClient} from 'https://esm.sh/@supabase/supabase-js'
import {AppError, RequestBody} from "./types.ts";
import {convertRequestCommentToCommentRecord, upsertAuthor, insertRule, insertComment, handleError} from "./utils.ts";

const port = 443;


const certFile = "/Users/mac/certs/localhost.crt";
const keyFile = "/Users/mac/certs/localhost.key";


const handler = async (request: Request) => {
    let client
    let requestBody: RequestBody = {} as RequestBody
    try {
        client = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {global: {headers: {Authorization: request.headers.get('Authorization')!}}}
        )
        requestBody = await request.json()
        await insertRule(client, requestBody.rule)
        await upsertAuthor(client, requestBody.comment.author)
        const comment = convertRequestCommentToCommentRecord(requestBody.comment);
        await insertComment(client, comment)
        return new Response("Ok", {status: 200})
    } catch (err) {
        if (err instanceof AppError) {
            console.error(`AppError occurred: ${err.message}`);
            await handleError(client, requestBody, err)
        } else {
            console.error(`An error occurred: ${err.message}`);
            return new Response(String(err?.message ?? err), {status: 500})
        }
    }
};
const server = new Server({port, handler});
await server.listenAndServeTls(certFile, keyFile);
