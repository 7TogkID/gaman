import type { IGamanSessionStore } from '..';

interface SessionEntry {
	value: string;
	expiresAt: number;
}

export class MemoryStore implements IGamanSessionStore {
	private store = new Map<string, SessionEntry>();

	async get(key: string): Promise<string | null> {
		const entry = this.store.get(key);
		if (!entry) return null;

		if (Date.now() > entry.expiresAt) {
			this.store.delete(key);
			return null;
		}

		return entry.value;
	}

	async set(key: string, value: string, maxAge: number = 86400): Promise<void> {
		const expiresAt = Date.now() + maxAge * 1000;
		this.store.set(key, { value, expiresAt });
	}

	async has(key: string): Promise<boolean> {
		const entry = this.store.get(key);
		if (!entry || Date.now() > entry.expiresAt) {
			this.store.delete(key);
			return false;
		}
		return true;
	}

	async delete(key: string): Promise<void> {
		this.store.delete(key);
	}
}
