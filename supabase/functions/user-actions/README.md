This serverless function use DrizzleORM hosted on Supabase edge function. To create a new migration, follow these steps:

- Change directory into ./drizzle.
- Run npm install to install the development dependencies.
- Edit the Drizzle config to point to the existing Supabase database.
- Use npm run introspect to import the schema.
- Use npm run migration:generate to generate a new migration (note: you need to change from 'npm:drizzle-orm/pg-core' to from 'drizzle-orm/pg-core').


### Run tests:
```bash
supabase start
cd supabase/functions/user-actions
supabase functions serve --no-verify-jwt --env-file=supabase/functions/user-actions/tests/.env.test
deno test --no-check --allow-all --env=tests/.env.test -q
```

### Running Locally

Follow these steps to run the project locally:

1. Create a `.env` file from the `.env-example` file.

2. Run:

```bash
deno task dev
```

### Supabase Functions Management

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
