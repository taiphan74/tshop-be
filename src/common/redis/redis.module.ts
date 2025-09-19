import { Global, Module, DynamicModule } from '@nestjs/common';
import Redis from 'ioredis';
import { redisConfig } from '../../config/redis.config';

export const REDIS_CLIENTS = 'REDIS_CLIENTS';

export interface RedisClientOptions {
  name: string;
  db?: number;
}

@Global()
@Module({})
export class RedisModule {
  static forRoot(clients: RedisClientOptions[]): DynamicModule {
    const providers = clients.map((c) => {
      const provider = {
        provide: `REDIS_CLIENT_${c.name.toUpperCase()}`,
        useFactory: () => {
          const r = new Redis({
            host: redisConfig.host,
            port: redisConfig.port,
            db: c.db ?? redisConfig.dbs.default,
          });
          return r;
        },
      };
      return provider;
    });

    return {
      module: RedisModule,
      providers: providers,
      exports: providers,
    };
  }
}
