export class MemoryStore {
    constructor() {
        this.store = new Map();
    }
    async get(key) {
        const entry = this.store.get(key);
        if (!entry)
            return null;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    }
    async set(key, value, maxAge = 86400) {
        const expiresAt = Date.now() + maxAge * 1000;
        this.store.set(key, { value, expiresAt });
    }
    async has(key) {
        const entry = this.store.get(key);
        if (!entry || Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return false;
        }
        return true;
    }
    async delete(key) {
        this.store.delete(key);
    }
}
