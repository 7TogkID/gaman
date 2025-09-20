import { MongoClient, Collection } from 'mongodb';
import type { IGamanSessionStore } from '..';

interface SessionDoc {
	_id: string;
	value: string;
	expiresAt?: Date;
}

export class MongoDBStore implements IGamanSessionStore {
	private client!: MongoClient;
	private collection!: Collection<SessionDoc>;

	constructor(
		private dbName: string,
		private url = 'mongodb://localhost:27017',
		private collName = 'gaman_sessions',
	) {}

	async init() {
		this.client = new MongoClient(this.url);
		await this.client.connect();
		const db = this.client.db(this.dbName);
		this.collection = db.collection<SessionDoc>(this.collName);

		// TTL index
		await this.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
	}

	async get(key: string) {
		const doc = await this.collection.findOne({ _id: key });
		return doc?.value ?? null;
	}

	async set(key: string, value: string, maxAge?: number) {
		const expiresAt = maxAge ? new Date(Date.now() + maxAge * 1000) : undefined;
		await this.collection.updateOne({ _id: key }, { $set: { value, expiresAt } }, { upsert: true });
	}

	async has(key: string) {
		const val = await this.get(key);
		return val !== null;
	}

	async delete(key: string) {
		await this.collection.deleteOne({ _id: key });
	}
}
