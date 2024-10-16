import moment from 'moment';
import { DATE_FORMAT } from 'src/modules/common/constants/common.constants';
import { Logger } from '@nestjs/common';

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

export const sanitizeAndValidateString = (
  value: string,
  fieldName: string,
): string => {
  const allowedCharactersRegex = /^[a-zA-Z0-9_,.\-@/:.+= ]+$/;

  if (!allowedCharactersRegex.test(value)) {
    throw new Error(
      `${fieldName} contains invalid characters. Only alphanumeric characters and certain special characters are allowed.`,
    );
  }

  return value;
};

export const checkString = (value: string | string[]): boolean => {
  var regexPattern = /^[a-zA-Z0-9_,.\-@/:.+= ]+$/;

  if (Array.isArray(value)) {
    for (let item of value) {
      if (!regexPattern.test(item)) {
        return false;
      }
    }
    return true;
  } else {
    return regexPattern.test(value);
  }
};

export const sanitizeObject = (obj: any): any => {
  if (Array.isArray(obj)) {
    for (let index = 0; index < obj.length; index++) {
      obj[index] = sanitizeObject(obj[index]);
      if (obj[index] === false) return false;
    }
  } else if (typeof obj === 'object' && obj !== null) {
    for (let key of Object.keys(obj)) {
      const value = obj[key];
      if (typeof value === 'string') {
        if (value.length > 0) {
          const isValid = checkString(value);
          if (!isValid) {
            return false;
          }
        }
      } else if (typeof value === 'object') {
        const result = sanitizeObject(value);
        if (result === false) return false;
      }
    }
  }
  return obj;
};

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
  requestLogger[data.level](
    `${data.ip}::${data.method}::${data.statusCode}::${data.originalUrl}::${data.responseTime}ms`,
  );
};
