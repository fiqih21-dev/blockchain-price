import { HttpException, HttpStatus } from '@nestjs/common';
import { configFn } from 'src/config';
import { ERabbitErrorCode } from 'src/modules/core/rabbitmq/rabbitmq.dto';
import { IBaseResponse } from 'src/modules/common/dto/response.dto';

interface AppErrorArgs {
  statusCode: HttpStatus;
  message?: string;
  additionalInfo?: object;
  debug?: any;
}

export class AppError extends HttpException {
  constructor(args: AppErrorArgs) {
    const errorResponse = AppError.generateErrorResponse(args);
    super(errorResponse, args.statusCode);
  }

  private static generateErrorResponse(args: AppErrorArgs): IBaseResponse {
    const { APP_ENV } = configFn();
    const message = args.message
      ? args.message
      : AppError.defaultMessage(args.statusCode);

    return {
      status_code: args.statusCode,
      message: message,
      ...(args.additionalInfo && {
        ...args.additionalInfo,
      }),
      ...(APP_ENV === 'local' && {
        debug: args.debug,
      }),
    };
  }

  private static defaultMessage(status: HttpStatus) {
    return (
      Object.keys(HttpStatus).find(
        (key) => HttpStatus[key as keyof typeof HttpStatus] === status,
      ) ?? 'INTERNAL_SERVER_ERROR'
    );
  }

  public static handleError(error: unknown): never {
    if (error instanceof AppError) throw error;

    if (error instanceof Error) {
      switch (error.message) {
        case ERabbitErrorCode.VALIDATION:
        case ERabbitErrorCode.INVALID_COMMAND:
          throw new AppError({
            statusCode: HttpStatus.BAD_GATEWAY,
            debug: error.message,
          });

        case ERabbitErrorCode.FETCH_ERROR:
        case ERabbitErrorCode.MANAGER_SEND_TO_RABBIT_ERROR:
        case ERabbitErrorCode.MANAGER_CONSUME_TIMEOUT:
          throw new AppError({
            statusCode: HttpStatus.SERVICE_UNAVAILABLE,
            debug: error.message,
          });

        case ERabbitErrorCode.HTTP:
        case ERabbitErrorCode.UNKNOWN:
        default:
          throw new AppError({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            debug: error.message,
          });
      }
    }

    throw new AppError({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      debug: error instanceof Error ? error.message : error,
    });
  }
}
