import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';

export interface StandardResponse<T = any> {
  success: boolean;
  data?: T;
  error?: any;
  message?: string;
  code?: number;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        let serializedData = data;
        if (data && typeof data === 'object' && data.constructor !== Object && data.constructor !== Array) {
          serializedData = plainToInstance(data.constructor, data);
        }
        return {
          success: true,
          data: serializedData,
          timestamp: new Date().toISOString(),
        };
      }),
      catchError((error) => {
        const status = error.status || 500;
        const message = error.message || 'An error occurred';
        return throwError(() => new HttpException({
          success: false,
          error: message,
          message,
          code: status,
          timestamp: new Date().toISOString(),
        }, status));
      }),
    );
  }
}
