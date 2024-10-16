import { IBaseResponse } from 'src/modules/common/dto/response.dto';
import {
  SetAlertSchema,
  SwapSchema,
} from 'src/modules/blockchain/blockchain.validator';
import { z } from 'zod';

import { ApiProperty } from '@nestjs/swagger';

export class SetAlertDto {
  @ApiProperty({ example: 'ETHEREUM', enum: ['ETHEREUM', 'POLYGON'] })
  chain: string = '';

  @ApiProperty({ example: '2000' })
  dollar: string = '';

  @ApiProperty({ example: 'example@gmail.com' })
  email: string = '';
}

export class SwapDto {
  @ApiProperty({ example: 2000 })
  eth: number = 0;
}

export type TSetAlertSchema = z.TypeOf<typeof SetAlertSchema>;
export type TSwapSchema = z.TypeOf<typeof SwapSchema>;

export interface IPrice {
  _id: string;
  network: string;
  tokenName: string;
  tokenAddress: string;
  tokenSymbol: string;
  price: string;
}

export interface IFindPriceResponse extends IBaseResponse {
  data: { prices: Omit<IPrice, '_id' | '__v' | 'isDeleted' | 'deletedAt'>[] };
}

export interface ISwapResponse extends IBaseResponse {
  data: {
    result: number;
    fee: number;
    finalResult: number;
  };
}
