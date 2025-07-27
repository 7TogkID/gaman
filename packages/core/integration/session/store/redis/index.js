import * as redis from 'redis';
export class RedisStore {
    constructor(redisUrl = 'redis://localhost:6379') {
        this.client = redis.createClient({
            url: redisUrl,
            socket: {
                reconnectStrategy: (retries) => Math.min(retries * 100, 3000), // Exponential backoff
            },
        });
        this.client.connect().catch(console.error);
    }
    async get(key) {
        return await this.client.get(`gaman:session:${key}`);
    }
    async set(key, value, maxAge = 86400) {
        await this.client.set(`gaman:session:${key}`, value, { EX: maxAge });
    }
    async has(key) {
        const exists = await this.client.exists(`gaman:session:${key}`);
        return exists === 1;
    }
    async delete(key) {
        await this.client.del(`gaman:session:${key}`);
    }
}
