import {
  ERabbitErrorCode,
  IHttpRabbitError,
  IRabbitError,
} from 'src/modules/core/rabbitmq/rabbitmq.dto';

export class RabbitError extends Error {
  private readonly httpError: IHttpRabbitError | null;

  constructor(type: ERabbitErrorCode.HTTP, httpError: IHttpRabbitError);
  constructor(
    type: Exclude<ERabbitErrorCode, ERabbitErrorCode.HTTP>,
    httpError?: null,
  );
  constructor(
    type: ERabbitErrorCode,
    httpError: IHttpRabbitError | null = null,
  ) {
    super(type);
    this.httpError = httpError;
  }

  generateError(): IRabbitError {
    return {
      type: <ERabbitErrorCode>this.message,
      httpError: this.httpError,
    };
  }
  public static handleError(error: unknown): never {
    if (error instanceof RabbitError) throw error;
    throw new RabbitError(ERabbitErrorCode.FETCH_ERROR);
  }

  public static handleCommandError(error: unknown): void {
    if (error instanceof RabbitError) {
      console.error('Error:', error.generateError());
    } else {
      console.error('Error:', {
        type: ERabbitErrorCode.UNKNOWN,
        data: null,
      });
    }
  }
}
