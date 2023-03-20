import Koa, { Next } from 'koa';
import multer, { Options, File } from '@koa/multer';
import { rm } from 'node:fs/promises';
import bodyParser from 'koa-bodyparser';
export function bodyMiddleWare(
  options: Options = { dest: 'uploads/' }
): Koa.Middleware {
  const upload = multer(options);
  const bodyParser_ = bodyParser();
  return async (context, next) => {
    try {
      if (context.request.is('multipart/form-data')) {
        return await upload.any()(context, next);
      } else {
        await bodyParser_(context, (() => undefined) as unknown as Koa.Next);
        return await next();
      }
    } catch (e) {
      throw e;
    } finally {
      if (context.files && context.files.length) {
        queueMicrotask(() => {
          for (const file of context.files as File[]) {
            rm(file.path);
          }
        });
      }
    }
  };
}
