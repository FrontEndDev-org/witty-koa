import Koa from 'koa';
import multer, { Options } from '@koa/multer';
// todo options
export function bodyMiddleWare(
  options: Options = { dest: 'uploads/' }
): Koa.Middleware {
  const upload = multer(options);
  return async (context, next) => {
    return await upload.any()(context, next);
  };
}
