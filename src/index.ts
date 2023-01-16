import Koa from 'koa';
import Router from '@koa/router';
import Application from 'koa';
import { setController } from './controller';
import { ControllerInterface } from './controller/type';

export function startServer({ controllers, middlewares, port }: Props) {
  const app = new Koa();
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
