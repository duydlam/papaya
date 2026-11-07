import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { ApiResponse } from '@papaya/contracts';
import moment from 'moment';
import { map, Observable } from 'rxjs';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const { statusCode } = context.switchToHttp().getResponse();
    return next
      .handle()
      .pipe(
        map((data): ApiResponse<unknown> | undefined =>
          data === undefined
            ? undefined
            : { data, statusCode, timestamp: moment().toISOString() },
        ),
      );
  }
}
