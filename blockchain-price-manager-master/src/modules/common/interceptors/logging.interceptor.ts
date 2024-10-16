import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { FastifyRequest, FastifyReply } from 'fastify';
import { requestLoggerService } from 'src/modules/common/utils/common.utils';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<FastifyRequest>();
    const res = ctx.getResponse<FastifyReply>();

    return next.handle().pipe(
      tap(() => {
        const statusCode = res.statusCode;
        const responseTime = Date.now() - (<any>req.raw).startTime;
        requestLoggerService({
          level: 'log',
          ip: <string>req.headers['x-forwarded-for'] || req.ip,
          method: req.method,
          statusCode: statusCode,
          originalUrl: req.originalUrl,
          responseTime: responseTime,
        });
      }),
    );
  }
}
