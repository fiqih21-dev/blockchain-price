import {
  Catch,
  ExceptionFilter,
  NotFoundException,
  ArgumentsHost,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { requestLoggerService } from 'src/modules/common/utils/common.utils';
import { configFn } from 'src/config';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<FastifyReply>();
    const statusCode = exception.getStatus();

    if (configFn().APP_ENABLE_LOG === 'true') {
      const req = ctx.getRequest<FastifyRequest>();
      const responseTime = Date.now() - (<any>req.raw).startTime;

      requestLoggerService({
        level: 'error',
        ip: <string>req.headers['x-forwarded-for'] || req.ip,
        method: req.method,
        statusCode: statusCode,
        originalUrl: req.originalUrl,
        responseTime: responseTime,
      });
    }

    res.status(statusCode).send('404 page not found');
  }
}
