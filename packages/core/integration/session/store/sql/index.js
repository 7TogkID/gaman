"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLStore = void 0;
// store/sql.ts
const sqlite3 = require("sqlite3");
const sqlite_1 = require("sqlite");
class SQLStore {
    constructor(file = 'session.db') {
        this.file = file;
    }
    async init() {
        this.db = await (0, sqlite_1.open)({
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
    async get(key) {
        const row = await this.db.get('SELECT value, expiresAt FROM gaman_sessions WHERE id = ?', key);
        if (!row)
            return null;
        if (row.expiresAt && Date.now() > row.expiresAt) {
            await this.delete(key);
            return null;
        }
        return row.value;
    }
    async set(key, value, maxAge) {
        const expiresAt = maxAge ? Date.now() + maxAge * 1000 : null;
        await this.db.run('INSERT OR REPLACE INTO gaman_sessions (id, value, expiresAt) VALUES (?, ?, ?)', key, value, expiresAt);
    }
    async has(key) {
        const val = await this.get(key);
        return val !== null;
    }
    async delete(key) {
        await this.db.run('DELETE FROM gaman_sessions WHERE id = ?', key);
    }
}
exports.SQLStore = SQLStore;
