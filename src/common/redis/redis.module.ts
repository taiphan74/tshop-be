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
            lazyConnect: true,
          });

          // Attach error handler to prevent unhandled error events
          r.on('error', (err) => {
            // In production you'd use a logger; for now, print a message
            // but don't crash the process on DNS/connection errors.
            // eslint-disable-next-line no-console
            console.warn(`[ioredis] client (${c.name}) error:`, err && err.message ? err.message : err);
          });

          // Try to connect but don't block if redis host is unreachable.
          r.connect().catch(() => {
            // suppress connect error; 'error' handler above will report it
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
