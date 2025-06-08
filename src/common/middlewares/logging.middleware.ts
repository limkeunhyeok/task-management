import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { v4 } from 'uuid';
import { LogLevel } from '../logger/logger';

export interface ExtendedRequest
  extends Request<
    {
      [key: string]: string;
    },
    unknown,
    unknown
  > {
  requestId?: string;
}

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private logger: Logger;

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  use(req: ExtendedRequest, res: Response, next: NextFunction) {
    const { originalUrl, method, query, ip, body } = req;
    const userAgent = req.get('user-agent') || ''; // header에서 가져옴

    const requestId = v4();
    req.requestId = requestId;

    const logContents = {
      requestId,
      path: originalUrl,
      method,
      ip,
      userAgent,
      requestBody: JSON.stringify(body),
      requestQuery: JSON.stringify(query),
    };

    this.logger.log({
      level: LogLevel.INFO,
      ...logContents,
      message: 'A rest request has arrived.',
    });

    res.on('finish', () => {
      if (res.locals.hasError) return; // Error 로그는 filter에서 처리

      const { statusCode } = res;
      const contentLength = res.get('content-length') || '';

      this.logger.log({
        level: LogLevel.INFO,
        statusCode,
        contentLength,
        ...logContents,
        message: 'Send a rest response.',
      });
    });

    next();
  }
}
