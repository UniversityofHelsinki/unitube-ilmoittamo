SELECT NAME, DESCRIPTION, SUBJECT, HEADER_FI, FOOTER_FI, HEADER_SV, FOOTER_SV, HEADER_EN, FOOTER_EN, MODIFIED
FROM EMAIL_TEMPLATES
WHERE NAME = $1;