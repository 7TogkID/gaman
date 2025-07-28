import { MongoClient } from 'mongodb';
export class MongoDBStore {
    constructor(dbName, url = 'mongodb://localhost:27017', collName = 'gaman_sessions') {
        this.dbName = dbName;
        this.url = url;
        this.collName = collName;
    }
    async init() {
        this.client = new MongoClient(this.url);
        await this.client.connect();
        const db = this.client.db(this.dbName);
        this.collection = db.collection(this.collName);
        // TTL index
        await this.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    }
    async get(key) {
        const doc = await this.collection.findOne({ _id: key });
        return doc?.value ?? null;
    }
    async set(key, value, maxAge) {
        const expiresAt = maxAge ? new Date(Date.now() + maxAge * 1000) : undefined;
        await this.collection.updateOne({ _id: key }, { $set: { value, expiresAt } }, { upsert: true });
    }
    async has(key) {
        const val = await this.get(key);
        return val !== null;
    }
    async delete(key) {
        await this.collection.deleteOne({ _id: key });
    }
}
