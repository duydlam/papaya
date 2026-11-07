import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { ApiErrorResponse } from '@papaya/contracts';
import _ from 'lodash';
import moment from 'moment';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';
    const responseMessage = _.get(errorResponse, 'message', errorResponse);
    const message = _.isString(responseMessage)
      ? responseMessage
      : _.isArray(responseMessage) && _.every(responseMessage, _.isString)
        ? responseMessage
        : 'Internal server error';
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        exception instanceof Error ? exception.message : 'Unhandled exception',
        exception instanceof Error ? exception.stack : undefined,
      );
    }
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: moment().toISOString(),
    } satisfies ApiErrorResponse);
  }
}
