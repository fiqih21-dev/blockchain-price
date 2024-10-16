import { HttpStatus } from '@nestjs/common';

type TRabbitCommand = 'get:price/oneDay' | 'post:price/alert' | 'post:price/swap';

export interface IRabbitError {
  type: ERabbitErrorCode;
  httpError: IHttpRabbitError | null;
}

export interface IRabbitMessage<T = any> {
  command: TRabbitCommand;
  correlationId: string;
  data: T;
  error: IRabbitError | null;
  startTime?: number;
}

export enum ERabbitErrorCode {
  VALIDATION = '01',
  FETCH_ERROR = '02',
  INVALID_COMMAND = '400',
  UNKNOWN = '500',
  HTTP = 'http',
}

export interface IHttpRabbitError {
  statusCode: HttpStatus;
  message: string;
}
