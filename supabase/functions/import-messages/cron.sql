SELECT cron.schedule(
	'invoke-import-messages-every-minute',
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
