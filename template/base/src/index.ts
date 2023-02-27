import {
  startServer,
  responseMiddleWare,
  bodyMiddleWare,
  Controller,
  Body,
  Post,
  BodyFile,
  Get,
  Query,
  Put,
  ResponseError,
  mongodbMiddleWare,
  Mongodb,
  MongodbParam,
} from '../../../src/index';
import { sessionMiddleWare } from '../../../src/middleWare/session';
import Koa, { Context } from 'koa';
@Controller('/hello')
export class ImageToPptController {
  @Get('/world')
  async getXx(@Query('a') a: string, ctx: Context): Promise<unknown> {
    const session = ctx.session as any;
    session.count = session.count || 0;
    session.count++;
    return { count: session.count };
  }

  /**
   * 文件上传
   * @param files
   */
  @Post()
  async postXx(@Body('file') files: BodyFile[]): Promise<unknown> {
    return { hello: 'world!' };
  }

  /**
   * 异常
   */
  @Get('/error')
  async xx(): Promise<unknown> {
    throw new ResponseError({ code: 0, message: '错误!' });
  }
}

startServer({
  port: 3001,
  controllers: [new ImageToPptController()],
  middlewares: [
    sessionMiddleWare({
      redisOptions: {
        host: '124.222.113.110',
        port: 6379,
        password: '123456',
        db: 0,
      },
    }),
    responseMiddleWare(),
    bodyMiddleWare(),
  ],
});
