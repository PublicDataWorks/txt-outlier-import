This serverless function use DrizzleORM hosted on supabase edge function

Run `npm install` to install dev dependencies (only needed in case you want to use the Drizzle toolkit)

Edit drizzle config to point to existing supabase database

Use `drizzle-kit introspect:pg` to import schema

For all library import e.g

`import {drizzle, PostgresJsDatabase} from 'drizzle-orm/postgres-js'`

need to have the `npm:` prefix before pushing to supabase edge function
//TODO find a way to automate this