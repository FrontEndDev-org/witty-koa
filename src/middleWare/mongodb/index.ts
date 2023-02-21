import Koa from 'koa';
import mongodb, {
  ClientSession,
  Db,
  MongoClient,
  MongoClientOptions,
} from 'mongodb';
import { Method } from '../../controller/enum';

// todo options
interface Options {
  url: string;
  dbName: string;
  mongoClientOptions?: MongoClientOptions;
}
export interface MongodbParam {
  getDb(): Promise<Db>;
}

export function mongodbWare({
  url,
  dbName,
  mongoClientOptions = {},
}: Options): Koa.Middleware {
  const { MongoClient } = mongodb;
  const defaultDbName = dbName;
  return async (context, next) => {
    let client: MongoClient;
    let session: ClientSession;
    const defaultDbName = dbName;
    context.mongodb = {
      async getDb(dbName = defaultDbName) {
        if (!client) {
          client = new MongoClient(url, {
            minPoolSize: 1,
            maxPoolSize: 10,
            ...mongoClientOptions,
          });
          await client.connect();
          if (
            [Method.PUT, Method.POST, Method.DELETE].includes(
              context.method.toLowerCase() as Method
            )
          ) {
            session = client.startSession();
            session!.startTransaction();
          }
        }
        // Database Name
        return client.db(dbName);
      },
    };
    try {
      const res = await next();
      if (session!) {
        await session.commitTransaction();
        await session.endSession();
      }
      return res;
    } catch (e) {
      if (session!) {
        await session.abortTransaction();
        await session.endSession();
      }
      throw e;
    } finally {
      if (client!) {
        await client.close();
      }
    }
  };
}
