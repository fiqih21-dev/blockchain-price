import { ZodObject, ZodRawShape } from 'zod';
import { AppError } from 'src/modules/common/app-error/app-error';
import { HttpStatus } from '@nestjs/common';

interface IValidatorArgs<T> {
  schema: ZodObject<ZodRawShape>;
  data: T;
}

export class Validator {
  static validate<T>({ schema, data }: IValidatorArgs<T>): T {
    const result = schema.safeParse(data);
    if (!result.success) {
      const fieldErrors = result?.error?.flatten().fieldErrors;
      const message = Object.entries(fieldErrors)
        .map(
          ([key, value]) =>
            `${key}: ${Array.isArray(value) ? value.join(', ') : 'Bad Request'}`,
        )
        .join('; ');
      throw new AppError({
        statusCode: HttpStatus.BAD_REQUEST,
        message: message,
        debug: result.error.flatten().fieldErrors,
      });
    }
    return <T>result.data;
  }
}
