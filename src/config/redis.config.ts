export const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  dbs: {
    auth: Number(process.env.REDIS_AUTH_DB) || 1,
    default: Number(process.env.REDIS_DB) || 0,
  },
};

export default redisConfig;
