import winston from 'winston';

const isDevelopment = process.env.NODE_ENV === 'development';

// Custom format
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = JSON.stringify(meta, null, 2);
    }
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaStr}`;
  })
);

const transports = [
  // Console output
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      customFormat
    ),
  }),
];

// Add file logging in production
if (!isDevelopment) {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: customFormat,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: customFormat,
    })
  );
}

export const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: customFormat,
  transports,
  exceptionHandlers: [
    new winston.transports.Console({
      format: customFormat,
    }),
  ],
});

export default logger;
