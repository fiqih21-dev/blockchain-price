import { sanitizeAndValidateString } from 'src/modules/common/utils/common.utils';
import { z } from 'zod';

const ChainEnum = z.enum(['ETHEREUM', 'POLYGON']);

export const SetAlertSchema = z.object({
  chain: ChainEnum.transform((val) => sanitizeAndValidateString(val, 'chain')),
  dollar: z
    .string()
    .trim()
    .min(1)
    .refine((value) => !isNaN(parseFloat(value)) && isFinite(parseFloat(value))),
  email: z
    .string()
    .trim()
    .min(1)
    .transform((val) => sanitizeAndValidateString(val, 'email')),
});

export const SwapSchema = z.object({
  eth: z.preprocess((val) => Number(val), z.number()),
});
