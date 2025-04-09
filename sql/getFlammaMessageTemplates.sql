SELECT headingFI, headingEN, headingSV, linkTextFI, linkTextEN, linkTextSV, linkUrlFI, linkUrlEN, linkUrlSV, messageFI, messageEN, messageSV
FROM EMAIL_TEMPLATES
WHERE headingFI = $1;