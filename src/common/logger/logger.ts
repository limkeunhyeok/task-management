import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const LogLevel = {
  SILLY: 'silly',
  DEBUG: 'debug',
  VERBOSE: 'verbose',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

export const getWinstonLogger = () => {
  const isProd = process.env.NODE_ENV === 'prod';

  const devFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.ms(),
    winston.format.prettyPrint({ colorize: true, depth: 2 }),
    winston.format.errors(),
  );

  const prodFormat = winston.format.combine(
    winston.format.timestamp({ alias: 'timestamp' }),
    winston.format.ms(),
    winston.format.errors(),
    winston.format.printf(
      ({
        timestamp,
        level,
        context,
        message,
        ...rest
      }: winston.Logform.TransformableInfo) =>
        JSON.stringify({
          timestamp,
          level,
          context,
          message,
          ...rest,
        }),
    ),
    winston.format.colorize({ all: true }),
  );

  return WinstonModule.createLogger({
    level: isProd ? LogLevel.INFO : LogLevel.SILLY,
    transports: [
      new winston.transports.Console({
        level: isProd ? LogLevel.INFO : LogLevel.SILLY,
        format: isProd ? prodFormat : devFormat,
      }),
    ],
  });
};
