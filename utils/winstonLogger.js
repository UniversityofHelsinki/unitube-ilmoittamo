const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const DailyRotateFile = require('winston-daily-rotate-file');

const LOG_DIR = './logs';


const lataamoFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});


const logger = createLogger({
    format: combine(
        label({ label: 'lataamo ilmoittamo' }),
        timestamp(),
        lataamoFormat
    ),
    transports: [
        // https://medium.com/@davidmcintosh/winston-a-better-way-to-log-793ac19044c5
        new DailyRotateFile({
            filename: `${LOG_DIR}/lataamo-info-%DATE%.log`,
            level: 'info',
            datePattern: 'YYYY-MM-DD'}),
        new DailyRotateFile({
            filename: `${LOG_DIR}/lataamo-warning-%DATE%.log`,
            level: 'warn',
            datePattern: 'YYYY-MM-DD'}),
        new DailyRotateFile({
            filename: `${LOG_DIR}/lataamo-error-%DATE%.log`,
            level: 'error',
            datePattern: 'YYYY-MM-DD'})
    ]
});

module.exports = logger;
