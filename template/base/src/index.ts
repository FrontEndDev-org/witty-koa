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
} from 'witty-koa';
@Controller('/hello')
export class ImageToPptController {
  @Get('/world')
  async getXx(@Query('a') a: string): Promise<unknown> {
    return { hello: 'world!' };
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
  middlewares: [responseMiddleWare(), bodyMiddleWare()],
});
