import { at, isEmpty } from 'lodash-es';
import { RouterParam, ValidateNumberOptions, ValidateType } from './type.mjs';
import { ResponseError } from '../middleWare/index.mjs';
import { ResponseErrorType } from '../middleWare/response/Error.mjs';

function requiredValidate(value: unknown, path?: string): boolean {
  if (!path) {
    if ((typeof value !== 'number' && isEmpty(value)) || Number.isNaN(value)) {
      return false;
    }
  } else {
    if (value) {
      const [v] = at(value as Record<string, unknown>, path);
      return requiredValidate(v);
    }
  }
  return true;
}

function regValidate(value: unknown, reg: RegExp, path?: string): boolean {
  if (!path) {
    return typeof value === 'string' && reg.test(value as string);
  } else {
    if (value) {
      const [v] = at(value as Record<string, unknown>, path);
      return regValidate(v, reg);
    }
  }
  return true;
}

function numberValidate(
  value: unknown,
  options?: ValidateNumberOptions,
  path?: string
): boolean {
  if (!path) {
    if (typeof value === 'number') {
      if (!options) {
        return true;
      } else {
        if (options.range) {
          return value > options.range[0] && value < options.range[1];
        }
      }
    }
    return false;
  } else {
    if (value) {
      const [v] = at(value as Record<string, unknown>, path);
      return numberValidate(v, options);
    }
  }
  return true;
}

export function paramValidate(
  value: unknown,
  { validates, param, type }: RouterParam
) {
  if (!validates || !validates.length) {
    return;
  }
  for (const validate of validates!) {
    switch (validate.type) {
      case ValidateType.REQUIRED: {
        const path = validate[ValidateType.REQUIRED]!.path;
        if (!requiredValidate(value, path)) {
          if (validate.message) {
            throw new ResponseError({
              error: ResponseErrorType.INVALID_REQUEST,
              error_description: `${type} parameter error: ${validate.message}`,
            });
          } else {
            throw new ResponseError({
              error: ResponseErrorType.INVALID_REQUEST,
              error_description: `${type} parameter error: required value is empty, key: ${
                param + (path ? (param ? '.' + path : path) : '') || type
              }`,
            });
          }
        }
        break;
      }
      case ValidateType.REG: {
        const { value: reg, path } = validate[ValidateType.REG]!;
        if (!regValidate(value, reg!, path)) {
          if (validate.message) {
            throw new ResponseError({
              error: ResponseErrorType.INVALID_REQUEST,
              error_description: `${type} parameter error: ${validate.message}`,
            });
          } else {
            throw new ResponseError({
              error: ResponseErrorType.INVALID_REQUEST,
              error_description: `${type} parameter error: illegal value, key: ${
                param + (path ? (param ? '.' + path : path) : '') || type
              }`,
            });
          }
        }
        break;
      }
      case ValidateType.NUMBER: {
        const { value: options, path } = validate[ValidateType.NUMBER]!;
        if (!numberValidate(value, options!, path)) {
          if (validate.message) {
            throw new ResponseError({
              error: ResponseErrorType.INVALID_REQUEST,
              error_description: `${type} parameter error: ${validate.message}`,
            });
          } else {
            throw new ResponseError({
              error: ResponseErrorType.INVALID_REQUEST,
              error_description: `${type} parameter error: value should be a legal number value, key: ${
                param + (path ? (param ? '.' + path : path) : '') || type
              }`,
            });
          }
        }
        break;
      }
    }
  }
}
