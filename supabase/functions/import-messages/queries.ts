import * as postgres from 'https://deno.land/x/postgres@v0.17.0/mod.ts'
const databaseUrl = Deno.env.get('SUPABASE_DB_URL')!
export const pool = new postgres.Pool(databaseUrl, 1, false)
export const selectQuery = `
  WITH RankedMessages AS (
    SELECT 
      message_text,
      direction = 'Send' AS outbound,
      message_date,
      sm.id AS message_id,
      st.phone,
      ROW_NUMBER() OVER(
        PARTITION BY st.phone, sm.message_date, sm.message_text, direction 
        ORDER BY sm.id
      ) AS rn
    FROM
      legacy.sms_threads st
    JOIN
      legacy.sms_messages sm 
      ON st.id = sm.thread_id
    WHERE sm.id > (SELECT latest_id FROM legacy.import_message_progress LIMIT 1) and message_text is not null
  )
  SELECT 
    message_text, outbound, message_date, message_id, phone
  FROM RankedMessages
  WHERE rn = 1 
  ORDER BY message_id
  LIMIT 40
`

export const insertErrorQuery = `
  INSERT INTO legacy.import_message_errors(message_id, status_code, text, error_time)
  VALUES($1, $2, $3, $4)
`

export const updateLatestMessageIdQuery = `
  UPDATE legacy.import_message_progress SET latest_id = $1
`

export const markAsImportedQuery = `
  UPDATE legacy.sms_messages SET imported = true WHERE id = ANY($1)
`
