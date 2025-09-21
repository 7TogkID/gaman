// store/sql.ts
import * as sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import type { IGamanSessionStore } from '..';

export class SQLStore implements IGamanSessionStore {
	private db!: Database;

	constructor(private file: string = 'session.db') {}

	async init() {
		this.db = await open({
			filename: this.file,
			driver: sqlite3.Database,
		});

		await this.db.exec(`
      CREATE TABLE IF NOT EXISTS gaman_sessions (
        id TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        expiresAt INTEGER
      )
    `);
	}

	async get(key: string) {
		const row = await this.db.get(
			'SELECT value, expiresAt FROM gaman_sessions WHERE id = ?',
			key,
		);
		if (!row) return null;
		if (row.expiresAt && Date.now() > row.expiresAt) {
			await this.delete(key);
			return null;
		}
		return row.value;
	}

	async set(key: string, value: string, maxAge?: number) {
		const expiresAt = maxAge ? Date.now() + maxAge * 1000 : null;
		await this.db.run(
			'INSERT OR REPLACE INTO gaman_sessions (id, value, expiresAt) VALUES (?, ?, ?)',
			key,
			value,
			expiresAt,
		);
	}

	async has(key: string) {
		const val = await this.get(key);
		return val !== null;
	}

	async delete(key: string) {
		await this.db.run('DELETE FROM gaman_sessions WHERE id = ?', key);
	}
}
