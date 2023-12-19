import {createClient} from 'https://esm.sh/@supabase/supabase-js'
import {AppError, RequestBody, RuleType} from "./types.ts";
import {handleError} from "./utils.ts";
import {handle_new_comment} from "./new_comment.ts";


Deno.serve(async (req) => {
    const client = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {global: {headers: {Authorization: req.headers.get('Authorization')!}}}
    )
    let requestBody: RequestBody;
    try {
      requestBody = await req.json();
      // console.log(requestBody)
    } catch (err) {
        console.error(`Bad Request: Invalid JSON: ${err}`)
        return new Response('', { status: 400 });
    }

    try {
        if (requestBody.rule.type === RuleType.NewComment) {
            await handle_new_comment(client, requestBody)
        }
        console.log(`Successfully handled rule: ${requestBody.rule.id}`)
        return new Response("Ok", {status: 200})
    } catch (err) {
        console.error(`An error occurred: ${err.message}`);
        if (err instanceof AppError) {
            await handleError(client, requestBody, err)
        }
        return new Response(String(err?.message ?? err), {status: 400})
    }
})
