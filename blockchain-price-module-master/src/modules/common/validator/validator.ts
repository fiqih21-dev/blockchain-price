import { ZodObject, ZodRawShape } from 'zod';
import { RabbitError } from 'src/modules/common/app-error/rabbit-error';
import { ERabbitErrorCode } from 'src/modules/core/rabbitmq/rabbitmq.dto';

interface IValidatorArgs<T> {
  schema: ZodObject<ZodRawShape>;
  data: T;
}

export class Validator {
  static validate<T>({ schema, data }: IValidatorArgs<T>): T {
    const result = schema.safeParse(data);
    if (!result.success) {
      console.log(result?.error?.flatten().fieldErrors);
      throw new RabbitError(ERabbitErrorCode.VALIDATION);
    }
    return <T>result.data;
  }
}
