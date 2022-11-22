SELECT VIDEO_ID, TO_CHAR(ARCHIVED_DATE, 'DD.MM.YYYY') ARCHIVED_DATE FROM VIDEOS
WHERE ARCHIVED_DATE >= $1 AND ARCHIVED_DATE <= $2 and ACTUAL_ARCHIVED_DATE IS NULL and ERROR_DATE IS NULL and DELETION_DATE IS NULL and
    FIRST_NOTIFICATION_SENT_AT IS NOT NULL and SECOND_NOTIFICATION_SENT_AT IS NULL and THIRD_NOTIFICATION_SENT_AT IS NULL and
    SKIP_EMAIL IS FALSE ORDER BY VIDEO_CREATION_DATE ASC;
