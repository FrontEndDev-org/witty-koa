import session, { SessionOptions } from 'koa-generic-session';
import Redis, { RedisOptions } from 'ioredis';
import Koa from 'koa';

// todo options
export function sessionMiddleWare({
  redisOptions,
  sessionOptions = {} as SessionOptions,
}: {
  redisOptions: RedisOptions;
  sessionOptions?: SessionOptions;
}): Koa.Middleware {
  if (redisOptions.db === undefined) {
    redisOptions.db = 0;
  }
  const client = new Redis(redisOptions);
  return session({
    // cookie 的 key
    key: 'sid',
    // redis 数据库的前缀
    prefix: 'sid:',
    store: {
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
    },
    ...sessionOptions,
  });
}
