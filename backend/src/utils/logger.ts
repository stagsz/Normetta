import winston from 'winston';
import { config } from '../config';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const isTest = process.env.NODE_ENV === 'test';
const isVercel = !!process.env.VERCEL;

const fileTransports =
  !isTest && !isVercel
    ? [
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
        }),
      ]
    : [];

export const logger = winston.createLogger({
  level: config.isDevelopment ? 'debug' : 'info',
  silent: isTest,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports: isTest
    ? []
    : [
        new winston.transports.Console({
          format: combine(colorize(), logFormat),
        }),
        ...fileTransports,
      ],
});

// Create logs directory only in local environments with file transports
import fs from 'fs';
if (!isTest && !isVercel && !fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}
