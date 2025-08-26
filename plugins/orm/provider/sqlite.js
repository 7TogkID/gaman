import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
export class SQLiteProvider {
    async connect() {
        this.db = await open({ filename: 'data.db', driver: sqlite3.Database });
    }
    async disconnect() {
        await this.db.close();
    }
    async find(table, query = {}) {
        const keys = Object.keys(query);
        const where = keys.length
            ? `WHERE ${keys.map((k) => `${k} = ?`).join(' AND ')}`
            : '';
        const values = Object.values(query);
        return this.db.all(`SELECT * FROM ${table} ${where}`, values);
    }
    async findOne(table, query) {
        const rows = await this.find(table, query);
        return rows[0] || null;
    }
    async insert(table, data) {
        const keys = Object.keys(data);
        const placeholders = keys.map(() => '?').join(', ');
        const values = Object.values(data);
        await this.db.run(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`, values);
    }
    async update(table, query, data) {
        const qKeys = Object.keys(query);
        const dKeys = Object.keys(data);
        const where = qKeys.map((k) => `${k} = ?`).join(' AND ');
        const set = dKeys.map((k) => `${k} = ?`).join(', ');
        const values = [...Object.values(data), ...Object.values(query)];
        await this.db.run(`UPDATE ${table} SET ${set} WHERE ${where}`, values);
    }
    async delete(table, query) {
        const qKeys = Object.keys(query);
        const where = qKeys.map((k) => `${k} = ?`).join(' AND ');
        const values = Object.values(query);
        await this.db.run(`DELETE FROM ${table} WHERE ${where}`, values);
    }
}
