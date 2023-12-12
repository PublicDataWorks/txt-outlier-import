SELECT cron.schedule(
	'import-messages-cron',
	'* * * * *',
	$$
	    SELECT net.http_get(
		url:='https://<project-ref>.supabase.co/functions/v1/import-messages',
		headers:='{
		    "Content-Type": "application/json",
		    "Authorization": "Bearer <token>"
		}'::JSONB
	    );
	$$
);
