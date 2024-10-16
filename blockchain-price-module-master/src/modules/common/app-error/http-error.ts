import { HttpException, HttpStatus } from '@nestjs/common';
import { configFn } from 'src/config';
import { IBaseResponse } from 'src/modules/common/dto/response.dto';

interface HttpErrorArgs<T> {
  statusCode: HttpStatus;
  message?: string;
  debug?: any;
  customResponse?: T;
}

export class HttpError<T = unknown> extends HttpException {
  constructor(args: HttpErrorArgs<T>) {
    const errorResponse = args.customResponse
      ? args.customResponse
      : HttpError.generateErrorResponse(args);
    super(errorResponse, args.statusCode);
  }

  private static generateErrorResponse(
    args: HttpErrorArgs<unknown>,
  ): IBaseResponse {
    const { APP_ENV } = configFn();
    const message = args.message
      ? args.message
      : HttpError.defaultMessage(args.statusCode);

    return {
      status_code: args.statusCode,
      message: message,
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
    if (error instanceof HttpError) throw error;
    throw new HttpError({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'UNKNOWN',
      debug: error instanceof Error ? error.message : error,
    });
  }
}
