import redis from 'redis';
import type { IGamanSessionStore } from '..';

export class RedisStore implements IGamanSessionStore {
	private client;

	constructor(redisUrl: string = 'redis://localhost:6379') {
		this.client = redis.createClient({
			url: redisUrl,
			socket: {
				reconnectStrategy: (retries) => Math.min(retries * 100, 3000), // Exponential backoff
			},
		});
		this.client.connect().catch(console.error);
	}

	async get(key: string) {
		return await this.client.get(`gaman:session:${key}`);
	}

	async set(key: string, value: string, maxAge: number = 86400) {
		await this.client.set(`gaman:session:${key}`, value, { EX: maxAge });
	}

	async has(key: string) {
		const exists = await this.client.exists(`gaman:session:${key}`);
		return exists === 1;
	}

	async delete(key: string) {
		await this.client.del(`gaman:session:${key}`);
	}
}
