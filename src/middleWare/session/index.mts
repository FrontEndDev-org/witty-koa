import session, {
  SessionOptions,
  MemoryStore,
  SessionStore,
} from 'koa-generic-session';
import Redis, { RedisOptions } from 'ioredis';
import Koa from 'koa';

// todo 没有redisOptions用内存维护。
// todo 通过ignorePath过滤掉一些不需要session的请求。
export function sessionMiddleWare({
  redisOptions,
  ignorePath,
  sessionOptions = {} as SessionOptions,
}: {
  redisOptions?: RedisOptions;
  ignorePath?: RegExp[];
  sessionOptions?: SessionOptions;
}): Koa.Middleware {
  let store: SessionStore;
  if (redisOptions) {
    if (redisOptions.db === undefined) {
      redisOptions.db = 0;
    }
    const client = new Redis(redisOptions);
    store = {
      async get(sid) {
        const res = await client.get(sid);
        if (res) {
          return JSON.parse(res);
        }
        return undefined;
      },
      async set(sid, session, ttl) {
        if (ttl) {
          ttl = Math.ceil(ttl / 1000);
          await client.setex(sid, ttl, JSON.stringify(session));
        } else {
          await client.set(sid, JSON.stringify(session));
        }
      },
      async destroy(sid) {
        await client.del(sid);
      },
    };
  } else {
    store = new MemoryStore();
  }
  const sessionMiddleWare = session({
    // cookie 的 key
    key: 'sid',
    // redis 数据库的前缀
    prefix: 'sid:',
    store,
    ...sessionOptions,
  });
  return async (ctx, next) => {
    if (ignorePath?.some((item) => item.test(ctx.path))) {
      return next();
    }
    return sessionMiddleWare(ctx, next);
  };
}
