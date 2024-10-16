import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: FastifyRequest, _: FastifyReply, next: () => void) {
    console.log(
      `${req.headers['x-forwarded-for'] || req.ip}::${req.method}::${req.originalUrl}`,
    );
    next();
  }
}
