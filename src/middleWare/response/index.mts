import Koa from 'koa';
import { ResponseError, ResponseErrorType } from './Error.mjs';
import { Method } from '../../controller/enum.mjs';
// todo options
export function responseMiddleWare({
  format,
}: { format?: (resBody: unknown) => unknown } = {}): Koa.Middleware {
  return async (context, next) => {
    try {
      const value = await next();
      if (value) {
        if (!format) {
          context.body = value;
        } else {
          context.body = format(value);
        }
      } else {
        if (context.method.toLowerCase() === Method.GET) {
          throw new ResponseError({
            error: ResponseErrorType.NOT_FOUND,
            error_description: 'Not found!',
          });
        }
      }
    } catch (e) {
      if (e instanceof ResponseError) {
        context.response.status = e.data.status!;
        delete e.data.status;
        if (context.query?.state) {
          e.data.state = context.query?.state as string;
        }
        context.body = e.data;
      } else if (e instanceof Error) {
        context.response.status = 500;
        context.body = {
          error: ResponseErrorType.SERVER_ERROR,
          error_description: e.message,
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
