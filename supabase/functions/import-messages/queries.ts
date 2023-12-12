import * as postgres from 'https://deno.land/x/postgres@v0.17.0/mod.ts'
const databaseUrl = Deno.env.get('SUPABASE_DB_URL')!;
export const pool = new postgres.Pool(databaseUrl, 3, true)
export const selectQuery = `
  SELECT
    thread_id,
    message_text,
    direction = 'Send' AS outbound,
    first_name,
    last_name,
    message_date,
    sm.index AS message_id,
    st.phone,
    m.index AS user_id
  FROM
    sms_threads st
  JOIN
    user_master m USING(phone)
  JOIN
    sms_messages sm ON st.id = sm.thread_id
  WHERE sm.imported = false
  ORDER BY thread_id
  LIMIT 40
`;

export const insertErrorQuery = `
  INSERT INTO import_message_errors(message_id, status_code, text, error_time)
  VALUES($1, $2, $3, $4)
`;

export const markAsImportedQuery = `
  UPDATE sms_messages SET imported = true WHERE index = ANY($1)
`;
