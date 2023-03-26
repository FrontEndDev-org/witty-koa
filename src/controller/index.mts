import Router, { RouterParamContext } from '@koa/router';
import {
  ControllerInterface,
  ControllerPrototype,
  RouterParam,
  Validate,
} from './type.mjs';
import Koa from 'koa';
import { ParamType } from './enum.mjs';
import { File as MulterFile } from '@koa/multer';
import { groupBy, method } from 'lodash-es';
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

function paramValidate(
  value: unknown,
  { validates, param, type }: RouterParam
) {
  if (!validates || !validates.length) {
    return;
  }
  for (const validate of validates!) {
    if (validate.required && (!value || !(value as unknown[]).length)) {
      if (validate.message) {
        throw new ResponseError({
          code: ResponseErrorCode.PARAM,
          message: `${type} parameter error: ${validate.message}`,
        });
      } else {
        throw new ResponseError({
          code: ResponseErrorCode.PARAM,
          message: `${type} parameter error: ${param} is required`,
        });
      }
    }
    if (
      validate.reg &&
      (typeof value !== 'string' || !validate.reg.test(value as string))
    ) {
      if (validate.message) {
        throw new ResponseError({
          code: ResponseErrorCode.PARAM,
          message: `${type} parameter error: ${validate.message}`,
        });
      } else {
        throw new ResponseError({
          code: ResponseErrorCode.PARAM,
          message: `${type} parameter error: ${param} is not legal`,
        });
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
