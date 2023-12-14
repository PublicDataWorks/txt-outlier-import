import math
import os

import pandas as pd
from sqlalchemy import create_engine


db_url = os.environ["DB_URL"]
engine = create_engine(db_url)

query = """
SELECT
    'Users' as "Group Membership",
    'Main' as "Phone 1 - Type",
    phone as "Phone 1 - Value",
    MAX(first_name) as "Given Name",
    MAX(last_name) as "Family Name"
FROM (
    SELECT
        phone,
        NULL AS first_name,
        NULL AS last_name
    FROM user_locations ul
    RIGHT JOIN (
        SELECT *
        FROM user_phones up
        WHERE phone NOT IN (
            SELECT DISTINCT phone
            FROM sms_messages sm
            JOIN sms_threads st ON sm."thread_id" = st."id"
            WHERE TRIM(LOWER(message_text)) ILIKE
            ANY (ARRAY['UNSUBSCRIBE', 'END', 'CANCEL', 'QUIT', 'STOPALL', 'STOP'])
        ) AND sms_enabled = true
    ) AS sub ON ul.id = sub.id
    UNION (
        SELECT phone, first_name, last_name
        FROM user_master um
        WHERE phone NOT IN (
            SELECT phone FROM user_master_unsubscribes
        )
    )
) AS combined
GROUP BY phone
"""

df_result = pd.read_sql_query(query, engine)
no_rows_per_file = 25_000
n_files = math.ceil(df_result.shape[0] / no_rows_per_file)
for i in range(n_files):
    df_temp = df_result.iloc[i * no_rows_per_file : (i + 1) * no_rows_per_file]
    df_temp.to_csv(f"output_{i + 1}.csv", index=False)
