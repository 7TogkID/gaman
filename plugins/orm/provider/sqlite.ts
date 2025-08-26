import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { GamanProvider } from './base';

export class SQLiteProvider implements GamanProvider {
	db!: Database;

	async connect() {
		this.db = await open({ filename: 'data.db', driver: sqlite3.Database });
	}

	async disconnect() {
		await this.db.close();
	}

	async find<T>(table: string, query: object = {}): Promise<T[]> {
		const keys = Object.keys(query);
		const where = keys.length
			? `WHERE ${keys.map((k) => `${k} = ?`).join(' AND ')}`
			: '';
		const values = Object.values(query);
		return this.db.all(`SELECT * FROM ${table} ${where}`, values);
	}

	async findOne<T>(table: string, query: object): Promise<T | null> {
		const rows = await this.find<T>(table, query);
		return rows[0] || null;
	}

	async insert<T extends object>(table: string, data: T): Promise<void> {
		const keys = Object.keys(data);
		const placeholders = keys.map(() => '?').join(', ');
		const values = Object.values(data);
		await this.db.run(
			`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
			values,
		);
	}

	async update<T>(
		table: string,
		query: object,
		data: Partial<T>,
	): Promise<void> {
		const qKeys = Object.keys(query);
		const dKeys = Object.keys(data);
		const where = qKeys.map((k) => `${k} = ?`).join(' AND ');
		const set = dKeys.map((k) => `${k} = ?`).join(', ');
		const values = [...Object.values(data), ...Object.values(query)];
		await this.db.run(`UPDATE ${table} SET ${set} WHERE ${where}`, values);
	}

	async delete<T>(table: string, query: object): Promise<void> {
		const qKeys = Object.keys(query);
		const where = qKeys.map((k) => `${k} = ?`).join(' AND ');
		const values = Object.values(query);
		await this.db.run(`DELETE FROM ${table} WHERE ${where}`, values);
	}
}
