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
  RABBIT_SEND_TO: z.string().trim().min(1),
  RABBIT_REQUEST_TIMEOUT: z.preprocess((val) => Number(val), z.number()),
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
    RABBIT_SEND_TO: process.env.RABBIT_SEND_TO,
    RABBIT_REQUEST_TIMEOUT: process.env.RABBIT_REQUEST_TIMEOUT,
  }) as const;
