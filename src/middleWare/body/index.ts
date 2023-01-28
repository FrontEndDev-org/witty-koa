import Koa from 'koa';
import multer, { Options, File } from '@koa/multer';
import { rm } from 'node:fs/promises';
// todo options
export function bodyMiddleWare(
  options: Options = { dest: 'uploads/' }
): Koa.Middleware {
  const upload = multer(options);
  return async (context, next) => {
    try {
      return await upload.any()(context, next);
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
