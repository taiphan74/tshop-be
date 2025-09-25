import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
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
        return throwError(() => ({
          success: false,
          error: error.message || error,
          message: error.message || 'An error occurred',
          code: error.status || 500,
          timestamp: new Date().toISOString(),
        }));
      }),
    );
  }
}
