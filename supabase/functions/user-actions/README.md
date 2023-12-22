This serverless function use DrizzleORM hosted on supabase edge function

Run `npm install` to install dev dependencies (only needed in case you want to use the Drizzle toolkit)

Edit drizzle config to point to existing supabase database

Use `npm run introspect` to import schema
deno cache --lock=deno.lock --lock-write *.ts

deno run --lock=deno.lock --cached-only --allow-env --allow-net --watch index.ts
