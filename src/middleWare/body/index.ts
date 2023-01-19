import Koa from 'koa';
import multer, { Options, File } from '@koa/multer';
import { rm } from 'node:fs/promises';
// todo options
export function bodyMiddleWare(
  options: Options = { dest: 'uploads/' }
): Koa.Middleware {
  const upload = multer(options);
  return async (context, next) => {
    const res = await upload.any()(context, next);
    if (context.files && context.files.length) {
      queueMicrotask(() => {
        for (const file of context.files as File[]) {
          rm(file.path);
        }
      });
    }
    return res;
  };
}
