import math
import os

import pandas as pd
from sqlalchemy import create_engine


db_url = os.environ["DB_URL"]
engine = create_engine(db_url)

query = """
SELECT 'Users' as "Group Membership", 'Main' as "Phone 1 - Type", phone as "Phone 1 - Value"
FROM user_phones
WHERE phone NOT IN (
    SELECT phone
    FROM sms_threads st
    JOIN sms_messages sm ON sm.thread_id = st.id
    WHERE TRIM(LOWER(message_text)) ILIKE ANY (ARRAY['UNSUBSCRIBE', 'END', 'CANCEL', 'QUIT', 'STOPALL', 'STOP'])
) AND sms_enabled = true
UNION (
    SELECT 'Users' as "Group Membership", 'Main' as "Phone 1 - Type", phone as "Phone 1 - Value"
    FROM user_master
    WHERE phone NOT IN (
        SELECT phone FROM user_master_unsubscribes
    )
)
"""

df_result = pd.read_sql_query(query, engine)
no_rows_per_file = 40_000
n_files = math.ceil(df_result.shape[0] / no_rows_per_file)
for i in range(n_files):
    df_temp = df_result.iloc[i * no_rows_per_file : (i + 1) * no_rows_per_file]
    df_temp.to_csv(f"output_{i + 1}.csv", index=False)
