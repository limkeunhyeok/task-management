import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ExtendedRequest } from '../middlewares/logging.middleware';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger: Logger;

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const req = ctx.getRequest<ExtendedRequest>();
    const res = ctx.getResponse<Response>();

    res.locals.hasError = true; // logging middleware가 res 로그를 출력하지 않도록

    const { originalUrl, method, query, ip, body, requestId } = req;
    const userAgent = req.get('user-agent') || ''; // header에서 가져옴

    const logContents = {
      requestId,
      path: originalUrl,
      method,
      ip,
      userAgent,
      requestBody: JSON.stringify(body),
      requestQuery: JSON.stringify(query),
    };

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception && typeof exception === 'object' && 'message' in exception
        ? (exception as Error).message
        : 'Unhandled error occurred.';

    const exceptionCode =
      exception instanceof HttpException
        ? exception.name
        : InternalServerErrorException.name;

    const stack =
      exception && typeof exception === 'object' && 'stack' in exception
        ? String((exception as Error).stack)
        : undefined;

    this.logger.error({
      message,
      ...logContents,
      status: httpStatus,
      error: exception,
    });

    res.status(httpStatus).json({
      status: httpStatus,
      code: exceptionCode,
      message,
      ...(stack && { stack }),
    });
  }
}
