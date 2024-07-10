ALTER TABLE "comments" ALTER COLUMN "attachment" SET DATA TYPE jsonb;

CREATE POLICY "Allow anonymous access"
ON authors
FOR SELECT
TO anon
USING (true);
