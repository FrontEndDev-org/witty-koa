import { ResponseError } from '../middleWare/response/Error.mjs';

export const RESPONSE_ERROR = {
  BodyFormat: error(1, 'body格式错误'),
  QueryFormat: error(2, 'query格式错误'),
  ParamFormat: error(3, 'param格式错误'),
  NotFound: error(4, '未查询到数据'),
};
function error(code: number, message: string) {
  return (suffixMessage = '') =>
    new ResponseError({
      code,
      message: message + (suffixMessage ? ':' + suffixMessage : ''),
    });
}
