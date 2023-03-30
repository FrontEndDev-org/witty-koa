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
  ParamRequired,
  ParamReg,
  ParamNumber,
} from '../../../src/index.mjs';
import { sessionMiddleWare } from '../../../src/middleWare/session/index.mjs';
import { Context } from 'koa';
@Controller('/hello')
export class ImageToPptController {
  @Post()
  async get(
    @Body() @ParamRequired() @ParamNumber('a', { range: [1, 10] }) a: string,
    ctx: Context
  ): Promise<unknown> {
    const session = ctx.session as unknown as { count: number };
    ctx.cookies.set('a', '1', { httpOnly: false });
    session.count = session.count || 0;
    session.count++;
    console.log(session.count);
    return { count: session.count, a };
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
    throw new ResponseError({ error: '0', error_description: '错误!' });
  }
}

startServer({
  port: 3000,
  controllers: [new ImageToPptController()],
  middlewares: [
    sessionMiddleWare({
      // redisOptions: {
      //   host: '127.0.0.1',
      //   port: 6379,
      //   password: undefined,
      //   db: 0,
      // },
    }),
    responseMiddleWare(),
    bodyMiddleWare(),
  ],
});
