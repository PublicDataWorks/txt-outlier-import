This serverless function use DrizzleORM hosted on supabase edge function:

- Run `npm install` to install dev dependencies (only needed in case you want to
use the Drizzle toolkit)

- Edit drizzle config to point to existing supabase database

- Use `npm run introspect` to import schema

This serverless function uses DrizzleORM and is hosted on Supabase Edge Functions:

1. Run `npm install` to install dev dependencies (only needed in case you want to use the Drizzle toolkit).

2. Edit the Drizzle configuration to point to your existing Supabase database.

3. Use `npm run introspect` to import the schema.

4. Run tests:
   - Run `supabase start`.

   - `cd supabase/functions/user-actions`.

   - Run `supabase functions serve --no-verify-jwt --env-file=supabase/functions/user-actions/tests/.env.test`.

   - Run `deno test --no-check --allow-all --env=tests/.env.test -q`.
