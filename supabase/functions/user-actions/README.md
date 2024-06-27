This serverless function use DrizzleORM hosted on supabase edge function:

- Run `npm install` to install dev dependencies (only needed in case you want to
  use the Drizzle toolkit)

- Edit drizzle config to point to existing supabase database

- Use `npm run introspect` to import schema

This serverless function uses DrizzleORM and is hosted on Supabase Edge
Functions:

1. Run `npm install` to install dev dependencies (only needed in case you want
   to use the Drizzle toolkit).

2. Edit the Drizzle configuration to point to your existing Supabase database.

3. Use `npm run introspect` to import the schema.

4. Run tests:
   - Run `supabase start`.

   - `cd supabase/functions/user-actions`.

   - Run
     `supabase functions serve --no-verify-jwt --env-file=supabase/functions/user-actions/tests/.env.test`.

   - Run `deno test --no-check --allow-all --env=tests/.env.test -q`.

## Running Locally

Follow these steps to run the project locally:

1. Create a `.env` file from the `.env-example` file. You can do this by copying the `.env-example` file and renaming the copy to `.env`. Then, replace the placeholder values in the `.env` file with your actual values.

2. Run the Deno task for development. You can do this by running the following command in your terminal:

```bash
deno task dev
```

## Supabase Functions Management

## Deployment Management
### Deploy a new version
```bash
supabase functions deploy user-actions
```

### Delete a function
```bash
supabase functions delete user-actions
```

## Secrets Management
### View all secrets
```bash
supabase secrets list
```

### Set secrets for your project
```bash
supabase secrets set NAME1=VALUE1 NAME2=VALUE2
```

### Unset secrets for your project
```bash
supabase secrets unset NAME1 NAME2
```
