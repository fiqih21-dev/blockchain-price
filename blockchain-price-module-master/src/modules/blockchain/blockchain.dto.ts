import { IBaseResponse } from 'src/modules/common/dto/response.dto';
import { SetAlertSchema, SwapSchema } from 'src/modules/blockchain/blockchain.validator';
import { z } from 'zod';
import { IPrice } from 'src/modules/database/db.dto';

export type TSetAlertSchema = z.TypeOf<typeof SetAlertSchema>;
export type TSwapSchema = z.TypeOf<typeof SwapSchema>;

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
