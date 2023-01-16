import {} from '@koa/router';
export enum Method {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  OPTIONS = 'options',
  PATCH = 'patch',
  // CONNECT = 'connect',
  // TRACE = 'trace',
  HEAD = 'head',
}

export enum ParamType {
  HEADER = 'header',
  BODY = 'body',
  QUERY = 'query',
  PARAM = 'param',
}
