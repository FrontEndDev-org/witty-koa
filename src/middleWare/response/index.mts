import Koa from 'koa';
import { ResponseError } from './Error.mjs';
// todo options
export function responseMiddleWare({
  format,
}: { format?: (resBody: unknown) => unknown } = {}): Koa.Middleware {
  return async (context, next) => {
    try {
      const value = await next();
      if (value !== undefined) {
        if (!format) {
          context.body = value;
        } else {
          context.body = format(value);
        }
      }
    } catch (e) {
      if (e instanceof ResponseError) {
        context.response.status = e.data.status!;
        context.body = {
          code: e.data.code,
          message: e.data.message,
        };
      } else if (e instanceof Error) {
        context.response.status = 500;
        context.body = {
          message: e.message,
          stack: e.stack,
        };
      } else {
        context.response.status = 500;
        context.body = e;
      }
    }
  };
}
export { ResponseError } from './Error.mjs';
