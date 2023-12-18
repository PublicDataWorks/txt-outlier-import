## Steps to follow

### Step 1: Deploying Supabase Edge Function
Follow the guide provided by Supabase to link and deploy an Edge Function. The guide can be found at [Supabase Edge Function Quickstart](https://supabase.com/docs/guides/functions/quickstart).

#### Step 2: Deploying `cron.sql`
Next, follow Supabase's guide to deploy the `cron.sql` function. This will schedule the execution of your data import function every minute. The guide can be found at [Supabase Scheduled Functions](https://supabase.com/docs/guides/functions/schedule-functions).

### Step 3: Monitoring
After deploying the functions, monitor the `public.import_message_errors` for any errors that occur during the import process. 
