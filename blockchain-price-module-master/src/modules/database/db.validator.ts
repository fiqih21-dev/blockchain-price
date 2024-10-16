import { isValidMongoId, sanitizeAndValidateString } from 'src/modules/common/utils/common.utils';
import { z } from 'zod';

export const MongoIdSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1)
    .refine((val) => isValidMongoId(val)),
});

const CryptoBillingSchema = z.object({
  receiverAddress: z.string().trim().min(1),
});

const FiatBillingSchema = z.object({
  bank: z.string().trim().min(1),
  accountNumber: z.string().trim().min(1),
  accountName: z.string().trim().min(1),
});

const BillingSchema = z.object({
  crypto: CryptoBillingSchema,
  fiat: FiatBillingSchema,
});

export const UserDataSchema = z.object({
  merchant_id: z
    .string()
    .trim()
    .min(1)
    .refine((value) => !isNaN(parseFloat(value)) && isFinite(parseFloat(value))),
  merchantAddress: z.string().trim().min(1),
  merchantUrl: z.string().trim().min(1),
  notificationUrl: z.string().trim().min(1),
  businessName: z.string().trim().min(1),
  ownerName: z.string().trim().min(1),
  password: z.string().trim().min(1),
  phone: z
    .string()
    .trim()
    .min(1)
    .refine((value) => !isNaN(parseFloat(value)) && isFinite(parseFloat(value))),
  country: z.string().trim().min(1),
  timezone: z.string().trim().min(1),
  disbursementMethod: z.string().trim().min(1),
  email: z.string().trim().min(1).email(),
  apiKey: z.string().trim().min(1),
  billing: BillingSchema,
  role: z.string().trim().min(1),
});

export const CreateOrderSchema = z.object({
  order_no: z.string().trim().min(1),
  merchant_id: z
    .string()
    .trim()
    .min(1)
    .refine((value) => !isNaN(parseFloat(value)) && isFinite(parseFloat(value))),
  amount: z
    .string()
    .trim()
    .min(1)
    .refine((value) => !isNaN(parseFloat(value)) && isFinite(parseFloat(value)))
    .refine((value) => parseFloat(value) >= 100, {
      message: 'Amount must be at least 100',
    })
    .transform((val) => !val || sanitizeAndValidateString(val, 'Amount')),
  currency: z.string().trim().min(1),
  phone: z
    .string()
    .trim()
    .min(1)
    .optional()
    .refine((value) => !value || (!isNaN(parseFloat(value)) && isFinite(parseFloat(value))))
    .transform((val) => !val || sanitizeAndValidateString(val, 'Phone')),
  name: z
    .string()
    .trim()
    .min(1)
    .optional()
    .transform((val) => !val || sanitizeAndValidateString(val, 'Name')),
  email: z
    .string()
    .trim()
    .email()
    .min(1)
    .optional()
    .transform((val) => !val || sanitizeAndValidateString(val, 'Email')),
});

export const GetOrderSchema = z.object({
  order_no: z
    .string()
    .trim()
    .min(1)
    .transform((val) => sanitizeAndValidateString(val, 'Order Number')),
});

export const CheckOrderRateSchema = z.object({
  tokenAddress: z
    .string()
    .trim()
    .min(1)
    .transform((val) => sanitizeAndValidateString(val, 'tokenAddress')),
  transactionID: z
    .string()
    .trim()
    .min(1)
    .transform((val) => sanitizeAndValidateString(val, 'transactionID')),
  network: z
    .string()
    .trim()
    .min(1)
    .transform((val) => sanitizeAndValidateString(val, 'network')),
});

export const CreateQrSchema = z.object({
  tokenAddress: z
    .string()
    .trim()
    .min(1)
    .transform((val) => sanitizeAndValidateString(val, 'tokenAddress')),
  transactionID: z
    .string()
    .trim()
    .min(1)
    .transform((val) => sanitizeAndValidateString(val, 'transactionID')),
  network: z
    .string()
    .trim()
    .min(1)
    .transform((val) => sanitizeAndValidateString(val, 'network')),
  walletType: z
    .string()
    .trim()
    .min(1)
    .transform((val) => sanitizeAndValidateString(val, 'walletType')),
});
