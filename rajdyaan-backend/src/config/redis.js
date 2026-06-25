import Redis from 'ioredis';

let redisClient;

export const connectRedis = async () => {
  return new Promise((resolve, reject) => {
    try {
      redisClient = new Redis(process.env.REDIS_URL, {
        lazyConnect: true,
        maxRetriesPerRequest: 0,
      });

      redisClient.on('error', (err) => {
        console.error('Redis connection error:', err.message);
      });

      redisClient.connect()
        .then(() => {
          console.log('Redis connected');
          resolve(redisClient);
        })
        .catch(err => {
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });
};

export default redisClient;
