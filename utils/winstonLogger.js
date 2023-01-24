const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;


const lataamoFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});


const logger = createLogger({
    transports: [
        new transports.Console()
    ],
    format: combine(
        label({ label: 'Lataamo ilmoittamo' }),
        timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        lataamoFormat
    ),
});

module.exports = logger;
