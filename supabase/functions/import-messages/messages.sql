--- First step, insert all the phone numbers into authors. If a phone number does not already exist in author it might be because it had unsubscribed.
INSERT INTO public.authors (
    phone_number,
    unsubscribed
)
WITH RankedMessages AS (
    SELECT
        st.phone,
        ROW_NUMBER() OVER(
            PARTITION BY st.phone
            ORDER BY sm.id
        ) AS rn
    FROM
        legacy.sms_threads st
    JOIN
        legacy.sms_messages sm
        ON st.id = sm.thread_id
    WHERE message_text IS NOT NULL
)
SELECT
    phone AS phone_number,
    true AS unsubscribed
FROM RankedMessages
WHERE rn = 1
ORDER BY phone_number
ON CONFLICT DO NOTHING;

--- Next step, insert sms message data into twilio table
INSERT INTO public.twilio_messages (
    id,
    preview,
    type,
    delivered_at,
    created_at,
    updated_at,
    "references",
    from_field,
    to_field
)
SELECT
    *
FROM (
    WITH RankedMessages AS (
        SELECT
            message_text,
            message_date,
            direction = 'Send' AS outbound,
            sm.id AS message_id,
            st.phone,
            ROW_NUMBER() OVER (
                PARTITION BY st.phone, sm.message_date, sm.message_text, direction
                ORDER BY sm.id
            ) AS rn
        FROM
            legacy.sms_threads st
        JOIN
            legacy.sms_messages sm
            ON st.id = sm.thread_id
        WHERE message_text IS NOT NULL
    )
    SELECT
        uuid_generate_v4() AS id,
        message_text AS preview,
        'sms' AS type,
        TO_TIMESTAMP((message_date - (25567 + 1)) * 24 * 60 * 60 * 1000 / 1000)::TIMESTAMPTZ AS delivered_at,
        NOW() AS created_at,
        NOW() AS updated_at,
        ARRAY[phone || '+18336856203'] AS "references",
        CASE
            WHEN outbound = true THEN phone
            ELSE '+18336856203'
        END AS to_field,
        CASE
            WHEN outbound = true THEN '+18336856203'
            ELSE phone
        END AS from_field
    FROM RankedMessages
    WHERE rn = 1
    ORDER BY message_id
) AS subquery_alias;
