import { HttpStatus } from '@nestjs/common';

export interface IBaseResponse {
  status_code: HttpStatus;
  message: string;
}
