import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { HttpError } from 'src/modules/common/app-error/http-error';
import { FastifyRequest, FastifyReply } from 'fastify';
import { requestLoggerService } from 'src/modules/common/utils/common.utils';

@Catch(HttpError)
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: HttpError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<FastifyRequest>();
    const res = ctx.getResponse<FastifyReply>();

    const statusCode = exception.getStatus();
    const responseTime = Date.now() - (<any>req.raw).startTime;

    requestLoggerService({
      level: 'error',
      ip: <string>req.headers['x-forwarded-for'] || req.ip,
      method: req.method,
      statusCode: statusCode,
      originalUrl: req.originalUrl,
      responseTime: responseTime,
    });

    res.status(statusCode).send(exception.getResponse());
  }
}
