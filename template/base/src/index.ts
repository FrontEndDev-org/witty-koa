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
} from '../../../src/index.mjs';
import { sessionMiddleWare } from '../../../src/middleWare/session/index.mjs';
import { Context } from 'koa';
@Controller('/hello')
export class ImageToPptController {
  @Get('/world')
  async getXx(@Query('a') a: string, ctx: Context): Promise<unknown> {
    const session = ctx.session as unknown as { count: number };
    session.count = session.count || 0;
    session.count++;
    console.log(session.count);
    return { count: session.count };
  }

  /**
   * 文件上传
   * @param files
   */
  @Post()
  async postXx(
    @Body('file') files: BodyFile[],
    @Body('a') a: string
  ): Promise<unknown> {
    return { hello: 'world!' };
  }
  @Put()
  async aa(@Body('a') a: string, @Body('b') b: BodyFile[]): Promise<unknown> {
    console.log(b);
    return { hello: a };
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
  port: 3003,
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
