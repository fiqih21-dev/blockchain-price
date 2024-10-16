import base58check from 'base58check'
import moment from 'moment';
import { DATE_FORMAT } from 'src/modules/common/constants/common.constants';
import Decimal from 'decimal.js';
import { Logger } from '@nestjs/common';
import { ERabbitErrorCode } from 'src/modules/core/rabbitmq/rabbitmq.dto';
import numeral from 'numeral';
import Currency from './currency';
import Timezone from './timezone';

export const isValidDate = (val: string): boolean => {
  return moment(val, DATE_FORMAT, true).isValid();
};

export const isDateExpired = (val: string): boolean => {
  const date = moment(val, DATE_FORMAT, true);
  const duration = moment.duration(moment().diff(date)).asSeconds();
  return duration <= 60;
};

export const isValidMongoId = (id: string): boolean => {
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(id);
};

export const safeJsonParse = <T>(data: string): T | null => {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const formatNominal = (nominal: number) => {
  let parts = nominal.toString().split('.');
  let beforeDecimal = parts[0];
  let afterDecimal = parts[1] || '';

  let format;
  if (beforeDecimal.length > 3) {
    format = '0,0.00';
  } else if (/^0*$/.test(afterDecimal)) {
    format = '0,0.00';
  } else {
    format = '0,0.00000';
  }

  return numeral(nominal).format(format);
};

export const convertBigintsToNumbers = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(convertBigintsToNumbers);
  } else if (typeof data === 'object' && data !== null) {
    return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, convertBigintsToNumbers(value)]));
  } else if (typeof data === 'bigint') {
    const num = Number(data);
    return num <= Number.MAX_SAFE_INTEGER ? num : data.toString();
  } else {
    return data;
  }
};

export const generateRandomNumber = (length: number): number => {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;

  // Generate a random number in the range [min, max]
  let randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  // Ensure the last digit is not 0
  while (randomNumber % 10 === 0) {
    randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  }

  return randomNumber;
};

export const generateRandomString = (length: number): string => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const generateZeroString = (digitCount: number): string => {
  if (digitCount <= 0) {
    return '';
  }

  let zeroString = '';
  for (let i = 0; i < digitCount; i++) {
    zeroString += '0';
  }

  return zeroString;
};

export const sanitizeAndValidateString = (value: string, fieldName: string) => {
  const allowedCharactersRegex = /^[a-zA-Z0-9_,.\-@/:.+= ]+$/;

  if (!allowedCharactersRegex.test(value)) {
    throw new Error(`${fieldName} contains invalid characters. Only alphanumeric characters and certain special characters are allowed.`);
  }

  return value;
};

export const getTokenDetails = ({ network, tokenAddress }: { network: string; tokenAddress: string }): { name: string; decimal: string } => {
  network = network.toUpperCase();
  const tokenAddresses = {
    [network]: {
      [process.env[`${network}_USDT_ADDRESS`] as string]: process.env[`${network}_USDT_NAME`] as string,
      [process.env[`${network}_USDC_ADDRESS`] as string]: process.env[`${network}_USDC_NAME`] as string,
    },
  };

  const tokenName = tokenAddresses[network]?.[tokenAddress];
  if (!tokenName) {
    throw new Error('token address not found');
  }

  return {
    name: tokenName,
    decimal: process.env[`${network}_${tokenName.toUpperCase()}_DECIMAL`] as string,
  };
};

export const calculateFee = (type: 'PERCENT' | 'FIXED', feeValue: string, amountFiat: string, cryptoRate: string = "1", tokenDecimal: number = 6) => {
  let feeAmountFiat, feeAmountCrypto;

  if (type === 'PERCENT') {
    feeAmountFiat = new Decimal(feeValue).times(Number(amountFiat)).div(100).toNumber();
    feeAmountCrypto = Number(Number(feeAmountFiat / Number(cryptoRate)).toFixed(tokenDecimal));
  } else if (type === 'FIXED') {
    feeAmountFiat = new Decimal(feeValue).times(cryptoRate).toNumber();
    feeAmountCrypto = new Decimal(feeValue).toNumber();
  } else {
    console.error('Fee type is not valid');
    throw new Error('Fee type is not valid');
  }

  return { feeAmountFiat, feeAmountCrypto };
};

export const pickFee = (feePercent: number, feeFixed: number, fiatAmount: number): { feeType: 'PERCENT' | 'FIXED'; fee: string } => {
  const percentFee = (feePercent * fiatAmount) / 100;
  const feeType = percentFee > feeFixed ? 'PERCENT' : 'FIXED';
  const fee = percentFee > feeFixed ? feePercent : feeFixed;
  return { feeType, fee: fee.toString() };
};

export const getCurrencyByCountry = (country: string): string => {
  const normalizedCountry = country.toLowerCase();
  for (const [currency, countryName] of Object.entries(Currency.availableCurrency)) {
    if (countryName.toLowerCase() === normalizedCountry) {
      return currency;
    }
  }
  return 'UNKNOWN';
};

export const getTimezoneByCountry = (country: string): string | null => {
  const normalizedCountry = country.toLowerCase();
  for (const [country, timezone] of Object.entries(Timezone.availableTimezone)) {
    if (country.toLowerCase() === normalizedCountry) {
      return timezone;
    }
  }
  return null;
};

export const tronToEvmAddress = (tronAddress: string) => {
  const decoded = base58check.decode(tronAddress).data
  const evmAddress = '0x' + decoded.slice(-20).toString('hex')
  return evmAddress
}


const requestLogger = new Logger('RequestLogger');

interface IRequestLogger {
  level: 'log' | 'error';
  ip: string;
  method: string;
  statusCode: number;
  originalUrl: string;
  responseTime: number;
}

export const requestLoggerService = (data: IRequestLogger): void => {
  requestLogger[data.level](`${data.ip}::${data.method}::${data.statusCode}::${data.originalUrl}::${data.responseTime}ms`);
};

const rabbitLogger = new Logger('RabbitLogger');

interface IRabbitLogger {
  level: 'log' | 'error';
  correlationId: string;
  error: ERabbitErrorCode | null;
  command: string;
  responseTime: number;
}

export const rabbitLoggerService = (data: IRabbitLogger): void => {
  rabbitLogger[data.level](`${data.correlationId}::${rabbitErrorMessage(data.error)}::${data.command}::${data.responseTime}ms`);
};

const rabbitErrorMessage = (code: ERabbitErrorCode | null): string => {
  if (!code) return 'success';
  return Object.keys(ERabbitErrorCode).find((key) => ERabbitErrorCode[key as keyof typeof ERabbitErrorCode] === code) ?? 'UNKNOWN_RABBIT_ERROR';
};
