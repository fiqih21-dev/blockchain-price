import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Price } from 'src/modules/database/price.entity';
import { IFindPriceResponse, ISwapResponse, TSetAlertSchema, TSwapSchema } from 'src/modules/blockchain/blockchain.dto';
import { RabbitError } from 'src/modules/common/app-error/rabbit-error';
import { Validator } from 'src/modules/common/validator/validator';
import { SetAlertSchema, SwapSchema } from 'src/modules/blockchain/blockchain.validator';
import { IBaseResponse } from 'src/modules/common/dto/response.dto';
import { IPrice } from 'src/modules/database/db.dto';
import { Alert } from 'src/modules/database/alert.entity';
import { ERabbitErrorCode } from 'src/modules/core/rabbitmq/rabbitmq.dto';
import Moralis from 'moralis';
import { configFn } from 'src/config';
import moment from 'moment';

@Injectable()
export class BlockchainService {
  private readonly CHAIN_ETH = configFn().CHAIN_ETH!;
  private readonly ADDRESS_WBTC = configFn().ADDRESS_WBTC!;
  private readonly ADDRESS_WETH = configFn().ADDRESS_WETH!;
  private readonly PERCENT_FEE = Number(configFn().PERCENT_FEE!);

  constructor(
    @InjectRepository(Price) private readonly priceRepository: Repository<Price>,
    @InjectRepository(Alert) private readonly alertRepository: Repository<Alert>,
  ) {}

  async getOneDayPrice(): Promise<IFindPriceResponse> {
    try {
      const now = moment();
      const from = moment().subtract(24, 'hours');

      const allPrices: Price[] = await this.priceRepository
        .createQueryBuilder('price')
        .where('price.createdAt BETWEEN :from AND :now', { from: from.toDate(), now: now.toDate() })
        .orderBy('price.createdAt', 'DESC')
        .getMany();

      const hourlyPrices = this.getHourlyPrices(allPrices);

      return {
        status_code: HttpStatus.OK,
        message: 'success',
        data: {
          prices: hourlyPrices.map((item) => ({
            ...item,
            id: undefined,
          })) as unknown as Omit<IPrice, 'id'>[],
        },
      };
    } catch (e) {
      RabbitError.handleError(e);
      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to retrieve prices',
        data: { prices: [] },
      };
    }
  }

  private getHourlyPrices(prices: Price[]): Price[] {
    const hourlyPrices: Price[] = [];
    let currentTime = moment();

    for (let i = 0; i < 24; i++) {
      const price = prices.find((p) => moment(p.createdAt).isSameOrBefore(currentTime));

      if (price) {
        hourlyPrices.push(price);
      }

      currentTime = currentTime.subtract(1, 'hour');
    }

    return hourlyPrices;
  }

  async setAlert(data: unknown): Promise<IBaseResponse> {
    try {
      const validatedData = Validator.validate({
        schema: SetAlertSchema,
        data: <TSetAlertSchema>data,
      });

      const { chain, dollar, email } = validatedData;

      const created = this.alertRepository.create({ chain: chain, dollar: Number(dollar), email: email });
      await this.alertRepository.save(created);

      if (!created) {
        throw new RabbitError(ERabbitErrorCode.HTTP, {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Create alert failed',
        });
      }

      return {
        status_code: HttpStatus.OK,
        message: 'success',
      };
    } catch (e) {
      RabbitError.handleError(e);
    }
  }

  async swap(data: unknown): Promise<ISwapResponse> {
    try {
      const validatedData = Validator.validate({
        schema: SwapSchema,
        data: <TSwapSchema>data,
      });

      const [WBTC, WETH] = await Promise.all([
        Moralis.EvmApi.token.getTokenPrice({
          chain: this.CHAIN_ETH,
          include: 'percent_change',
          address: this.ADDRESS_WBTC,
        }),
        Moralis.EvmApi.token.getTokenPrice({
          chain: this.CHAIN_ETH,
          include: 'percent_change',
          address: this.ADDRESS_WETH,
        }),
      ]);

      const ethToBtc = WETH.raw.usdPrice / WBTC.raw.usdPrice;
      const result = validatedData.eth * ethToBtc;
      const fee = (this.PERCENT_FEE / 100) * validatedData.eth;

      return {
        status_code: HttpStatus.OK,
        message: 'success',
        data: {
          result: result,
          fee: fee,
          finalResult: result - fee,
        },
      };
    } catch (e) {
      RabbitError.handleError(e);
    }
  }
}
