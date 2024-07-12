ALTER TABLE "comments" ALTER COLUMN "attachment" SET DATA TYPE jsonb;

CREATE POLICY "Allow anonymous access"
ON authors
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow anonymous access"
ON comments
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow anonymous access"
ON twilio_messages
FOR SELECT
TO anon
USING (true);
