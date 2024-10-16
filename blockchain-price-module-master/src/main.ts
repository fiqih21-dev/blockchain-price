import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger, VersioningType } from '@nestjs/common';
import { configFn, envSchema } from 'src/config';
import helmet from '@fastify/helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LoggingInterceptor } from 'src/modules/common/interceptors/logging.interceptor';
import { NotFoundExceptionFilter } from 'src/modules/common/exception-filters/not-found-exception.filter';
import { HttpErrorFilter } from 'src/modules/common/exception-filters/http-error-exception.filter';

async function bootstrap() {
  // Validate env configuration
  const validatedEnv = envSchema.safeParse(configFn());
  if (!validatedEnv.success) {
    throw new Error(JSON.stringify(validatedEnv.error.flatten().fieldErrors));
  }
  const { APP_PORT, APP_HOST, APP_NAME, APP_ENV, APP_ENABLE_LOG } =
    validatedEnv.data;

  const logger = new Logger('BootstrapLogger');

  // Fastify HTTP Server
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
  });
  // app.enableCors();
  app.enableShutdownHooks();
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });

  if (APP_ENABLE_LOG === 'true') {
    app.use((req: any, _: any, next: any) => {
      req.startTime = Date.now();
      next();
    });
    app.useGlobalInterceptors(new LoggingInterceptor());
    app.useGlobalFilters(new NotFoundExceptionFilter(), new HttpErrorFilter());
  } else {
    app.useGlobalFilters(new NotFoundExceptionFilter());
  }

  if (['local', 'develop'].includes(APP_ENV)) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(APP_NAME)
      .setDescription(
        'Nestjs Fastify Module Scaffolding build using Nestjs, Fastify, RabbitMQ, Redis, and MongoDB',
      )
      .setVersion('1.0.0')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('swagger', app, document, {
      jsonDocumentUrl: 'swagger/json',
    });
  }

  process.on('unhandledRejection', (reason, promise) => {
    logger.fatal('Unhandled Rejection with reason:', reason);
    console.error(promise);
  });

  process.on('uncaughtException', (error) => {
    logger.fatal('Uncaught Exception:', error.stack);
  });

  await app.listen(APP_PORT, APP_HOST, () => {
    logger.verbose(`${APP_NAME} running at http://${APP_HOST}:${APP_PORT}`);
  });
}
bootstrap();
