import Router, { RouterParamContext } from '@koa/router';
import {
  ControllerInterface,
  ControllerPrototype,
  RouterParam,
} from './type.mjs';
import Koa from 'koa';
import { ParamType } from './enum.mjs';
import { File as MulterFile } from '@koa/multer';
import { groupBy } from 'lodash-es';
import { paramValidate } from './paramValidate.mjs';

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
        case ParamType.SESSION:
          if (param.param) {
            return context.session[param.param];
          } else {
            return context.session;
          }
        case ParamType.MONGODB:
          return context.mongodb;
      }
    });
}

export * from './decorators.mjs';
