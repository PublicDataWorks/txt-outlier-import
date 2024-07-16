# Missive Webhook Handler - Supabase Edge Function

## Overview

This Deno-based backend, hosted on Supabase Edge Functions, aims to synchronize Missive data into our Supabase database for later processing.

The webhooks are triggered by Missive rules. For more information on how to set up and manage these rules, please refer to the [Missive Rules Overview](https://missiveapp.com/help/rules/overview).

## Webhook Types

The backend handles the following Missive webhook types:

1. New Comment
2. Label Change
3. Conversation Closed
4. Conversation Reopened
5. Conversation Assignee Change

## Technical Stack

- **Language**: Deno
- **Hosting**: Supabase Edge Functions
- **Database**: PostgreSQL (Supabase)

## Database Migrations

To create a new migration, follow these steps:

1. Change directory into ./drizzle
2. Run `npm install`
3. Edit the Drizzle config to point to the existing Supabase database.
4. Run `npm run introspect` to import the schema.
5. Run `npm run migration:generate` to generate a new migration (note: you need to change the import statements in schema.ts from 'npm:drizzle-orm/pg-core' to 'drizzle-orm/pg-core').

## Running Tests

```bash
supabase start
cd supabase/functions/user-actions
supabase functions serve --no-verify-jwt --env-file=supabase/functions/user-actions/tests/.env.test
deno test --no-check --allow-all --env=tests/.env.test -q
```

## Running Locally

Follow these steps to run the project locally:

1. Create a `.env` file from the `.env-example` file.

2. Run Deno server by itself:
```bash
deno task dev
```
or run the Supabase Edge function:
- Add DB_POOL_URL=postgresql://supabase_admin:postgres@db:5432/postgres to `supabase/functions/user-actions/tests/.env.test` 
- Run
```bash
supabase functions serve --no-verify-jwt --env-file=supabase/functions/user-actions/tests/.env.test
```
## Supabase Functions Management

### Deployment Management

#### Deploy a new version
```bash
supabase functions deploy user-actions
```

#### Delete a function
```bash
supabase functions delete user-actions
```

### Secrets Management
#### View all secrets
```bash
supabase secrets list
```

#### Set secrets for your project
```bash
supabase secrets set NAME1=VALUE1 NAME2=VALUE2
```

#### Unset secrets for your project
```bash
supabase secrets unset NAME1 NAME2
```
