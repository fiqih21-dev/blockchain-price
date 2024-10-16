import { Injectable } from '@nestjs/common';
import { RabbitmqService } from 'src/modules/core/rabbitmq/rabbitmq.service';
import { v4 as uuidv4 } from 'uuid';
import { IRabbitMessage } from 'src/modules/core/rabbitmq/rabbitmq.dto';
import { AppError } from 'src/modules/common/app-error/app-error';
import { Validator } from 'src/modules/common/validator/validator';
import {
  IFindPriceResponse,
  ISwapResponse,
  TSetAlertSchema,
  TSwapSchema,
} from 'src/modules/blockchain/blockchain.dto';
import { SetAlertSchema, SwapSchema } from 'src/modules/blockchain/blockchain.validator';
import { IBaseResponse } from 'src/modules/common/dto/response.dto';
@Injectable()
export class BlockchainService {
  constructor(private readonly rabbitInstance: RabbitmqService) {}

  async get(): Promise<IFindPriceResponse> {
    try {
      const message: IRabbitMessage<null> = {
        command: 'get:price/oneDay',
        correlationId: uuidv4(),
        data: null,
        error: null,
      };

      const response =
        await this.rabbitInstance.send<IFindPriceResponse>(message);

      return response.data;
    } catch (error) {
      AppError.handleError(error);
    }
  }

  async setAlert(data: any): Promise<IBaseResponse> {
    try {
      const validatedData = Validator.validate({
        schema: SetAlertSchema,
        data: <TSetAlertSchema>data,
      });

      const message: IRabbitMessage<TSetAlertSchema> = {
        command: 'post:price/alert',
        correlationId: uuidv4(),
        data: validatedData,
        error: null,
      };

      const response = await this.rabbitInstance.send<IBaseResponse>(message);

      return response.data;
    } catch (error) {
      AppError.handleError(error);
    }
  }

  async swap(data: any): Promise<ISwapResponse> {
    try {
      const validatedData = Validator.validate({
        schema: SwapSchema,
        data: <TSwapSchema>data,
      });

      const message: IRabbitMessage<TSwapSchema> = {
        command: 'post:price/swap',
        correlationId: uuidv4(),
        data: validatedData,
        error: null,
      };

      const response = await this.rabbitInstance.send<ISwapResponse>(message);

      return response.data;
    } catch (error) {
      AppError.handleError(error);
    }
  }
}
