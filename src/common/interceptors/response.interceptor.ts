import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

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
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
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
