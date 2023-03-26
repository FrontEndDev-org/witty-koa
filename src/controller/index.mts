import Router, { RouterParamContext } from '@koa/router';
import {
  ControllerInterface,
  ControllerPrototype,
  RouterParam,
  ValidateNumberOptions,
  ValidateType,
} from './type.mjs';
import Koa from 'koa';
import { ParamType } from './enum.mjs';
import { File as MulterFile } from '@koa/multer';
import { at, groupBy, isEmpty, range } from 'lodash-es';
import { ResponseError } from '../middleWare/index.mjs';
import { ResponseErrorCode } from '../middleWare/response/Error.mjs';

export function setController(router: Router, controller: ControllerInterface) {
  const { prefix, routerOptionMap }: ControllerPrototype =
    controller.constructor.prototype;
  for (const routerName in routerOptionMap) {
    const { method, path, cb, params } = routerOptionMap[routerName];
    router[method!](prefix + path, async (context) => {
      const paramValues = getParams(params, context);
      if (params) {
        for (let i = 0; i < params!.length; i++) {
          paramValidate(paramValues[i], params![i]);
        }
      }
      return cb!.call(controller, ...paramValues, context);
    });
  }
}

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

function paramValidate(
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
              code: ResponseErrorCode.PARAM,
              message: `${type} parameter error: ${validate.message}`,
            });
          } else {
            throw new ResponseError({
              code: ResponseErrorCode.PARAM,
              message: `${type} parameter error: required value is empty, key: ${
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
              code: ResponseErrorCode.PARAM,
              message: `${type} parameter error: ${validate.message}`,
            });
          } else {
            throw new ResponseError({
              code: ResponseErrorCode.PARAM,
              message: `${type} parameter error: illegal value, key: ${
                param || type
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
              code: ResponseErrorCode.PARAM,
              message: `${type} parameter error: ${validate.message}`,
            });
          } else {
            throw new ResponseError({
              code: ResponseErrorCode.PARAM,
              message: `${type} parameter error: value should be a legal number value, key: ${
                param || type
              }`,
            });
          }
        }
        break;
      }
    }
  }
}

function getParams(
  params: RouterParam[] = [],
  context: Koa.ParameterizedContext & RouterParamContext
): unknown[] {
  return params
    .sort((a, b) => a.index - b.index)
    .map((param) => {
      switch (param.type) {
        case ParamType.PARAM:
          if (param.param) {
            return context.params[param.param];
          }
          return context.params;
        case ParamType.QUERY:
          if (param.param) {
            return context.query[param.param];
          }
          return context.query;
        case ParamType.HEADER:
          if (param.param) {
            return context.headers[param.param];
          }
          return context.headers;
        case ParamType.BODY:
          const { body = {}, files = [] } = context.request as unknown as {
            body: Record<string, unknown>;
            files: MulterFile[];
          };
          if (param.param) {
            if (param.param in body) {
              return body[param.param];
            } else {
              return files.filter((file) => file.fieldname === param.param);
            }
          } else {
            return {
              ...body,
              ...groupBy(files, (file) => file.fieldname),
            };
          }
        case ParamType.MONGODB:
          return context.mongodb;
      }
    });
}

export * from './decorators.mjs';
