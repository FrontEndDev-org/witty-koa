import Koa from 'koa';
import Router from '@koa/router';
import Application from 'koa';
import { setController } from './controller';
import { ControllerInterface } from './controller/type';

export function startServer({ controllers, middlewares, port }: Props) {
  const app = new Koa();
  // cookies 依赖需要这个key,用于防止生成的 cookie 的 被串改 todo: 配置。
  app.keys = ['123456', '123456'];
  const router = new Router();
  for (const middleware of middlewares) {
    app.use(middleware);
  }

  for (const controller of controllers) {
    setController(router, controller as ControllerInterface);
  }
  app.use(router.routes());
  app.listen(port);
}

interface Props {
  middlewares: Application.Middleware[];
  controllers: unknown[];
  port: number;
}

export * from './controller/index';
export * from './middleWare/index';
export { File as BodyFile } from '@koa/multer';
