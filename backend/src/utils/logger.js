const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const config = require('../config');

const loggingConfig = config.logging;
const logDir = loggingConfig.dir;
const rotationConfig = loggingConfig.rotation;

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    const baseLog = { timestamp, level, message };
    if (stack) {
      baseLog.stack = stack;
    }
    return JSON.stringify(baseLog);
  })
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    if (stack) {
      return `${timestamp} [${level}]: ${message}\n${stack}`;
    }
    return `${timestamp} [${level}]: ${message}`;
  })
);

const serverConfig = config.server;

const logger = winston.createLogger({
  level: loggingConfig.level,
  format: logFormat,
  transports: [
    // Error logs - daily rotation
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: rotationConfig.datePattern,
      level: 'error',
      maxFiles: rotationConfig.maxFiles
    }),
    // Combined logs - daily rotation
    new DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: rotationConfig.datePattern,
      maxFiles: rotationConfig.maxFiles
    })
  ]
});

// Add console output for non-production environments
if (serverConfig.env !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

module.exports = logger;