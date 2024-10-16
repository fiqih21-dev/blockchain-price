import { z } from 'zod';

const APP_ENV_LIST = ['local', 'develop', 'staging', 'master'];

export const envSchema = z.object({
  APP_NAME: z.string().trim().min(1),
  APP_ENV: z
    .string()
    .trim()
    .min(1)
    .refine((val) => APP_ENV_LIST.includes(val), {
      message: `APP_ENV must be either ${APP_ENV_LIST.join(', ')}`,
    }),
  APP_PORT: z.preprocess((val) => Number(val), z.number()),
  APP_HOST: z.string().trim().min(1),
  APP_ENABLE_LOG: z.enum(['true', 'false']),

  RABBIT_USERNAME: z.string().trim().min(1),
  RABBIT_PASSWORD: z.string().trim().min(1),
  RABBIT_PROTOCOL: z.string().trim().min(1),
  RABBIT_HOSTNAME: z.string().trim().min(1),
  RABBIT_PORT: z.preprocess((val) => Number(val), z.number()),
  RABBIT_VHOST: z.string().trim().min(1),
  RABBIT_RECEIVE_FROM: z.string().trim().min(1),

  MYSQL_HOST: z.string().trim().min(1),
  MYSQL_PORT: z.preprocess((val) => Number(val), z.number()),
  MYSQL_USERNAME: z.string().trim().min(1),
  MYSQL_PASSWORD: z.string().trim().min(1),
  MYSQL_DATABASE: z.string().trim().min(1),

  EMAIL_ADMIN_SENDGRID: z.string().trim().min(1),
  SENDGRID_API_KEY: z.string().trim().min(1),
  SENDGRID_EMAIL_FROM: z.string().trim().min(1),
  SENDGRID_TEMPLATE_ID_PRICE: z.string().trim().min(1),
  SENDGRID_TEMPLATE_ID_ALERT: z.string().trim().min(1),

  MORALIS_API_KEY: z.string().trim().min(1),
  CHAIN_ETH: z.string().trim().min(1),
  ADDRESS_WETH: z.string().trim().min(1),
  ADDRESS_WBTC: z.string().trim().min(1),
  CHAIN_POL: z.string().trim().min(1),
  ADDRESS_WMATIC: z.string().trim().min(1),

  TIME_SAVE: z.preprocess((val) => Number(val), z.number()),
  TIME_COMPARE: z.preprocess((val) => Number(val), z.number()),
  PERCENT_COMPARE: z.preprocess((val) => Number(val), z.number()),
  PERCENT_FEE: z.preprocess((val) => Number(val), z.number()),
});

export const configFn = () =>
  ({
    APP_NAME: process.env.APP_NAME,
    APP_ENV: process.env.APP_ENV,
    APP_PORT: process.env.APP_PORT,
    APP_HOST: process.env.APP_HOST,
    APP_ENABLE_LOG: process.env.APP_ENABLE_LOG,

    RABBIT_USERNAME: process.env.RABBIT_USERNAME,
    RABBIT_PASSWORD: process.env.RABBIT_PASSWORD,
    RABBIT_PROTOCOL: process.env.RABBIT_PROTOCOL,
    RABBIT_HOSTNAME: process.env.RABBIT_HOSTNAME,
    RABBIT_PORT: process.env.RABBIT_PORT,
    RABBIT_VHOST: process.env.RABBIT_VHOST,
    RABBIT_RECEIVE_FROM: process.env.RABBIT_RECEIVE_FROM,

    MYSQL_HOST: process.env.MYSQL_HOST,
    MYSQL_PORT: process.env.MYSQL_PORT,
    MYSQL_USERNAME: process.env.MYSQL_USERNAME,
    MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
    MYSQL_DATABASE: process.env.MYSQL_DATABASE,

    EMAIL_ADMIN_SENDGRID: process.env.EMAIL_ADMIN_SENDGRID,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    SENDGRID_EMAIL_FROM: process.env.SENDGRID_EMAIL_FROM,
    SENDGRID_TEMPLATE_ID_PRICE: process.env.SENDGRID_TEMPLATE_ID_PRICE,
    SENDGRID_TEMPLATE_ID_ALERT: process.env.SENDGRID_TEMPLATE_ID_ALERT,

    MORALIS_API_KEY: process.env.MORALIS_API_KEY,
    CHAIN_ETH: process.env.CHAIN_ETH,
    ADDRESS_WETH: process.env.ADDRESS_WETH,
    ADDRESS_WBTC: process.env.ADDRESS_WBTC,
    CHAIN_POL: process.env.CHAIN_POL,
    ADDRESS_WMATIC: process.env.ADDRESS_WMATIC,
    TIME_SAVE: process.env.TIME_SAVE,
    TIME_COMPARE: process.env.TIME_COMPARE,
    PERCENT_COMPARE: process.env.PERCENT_COMPARE,
    PERCENT_FEE: process.env.PERCENT_FEE,
  }) as const;
