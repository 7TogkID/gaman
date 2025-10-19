 /**
  * @fileoverview SQLite provider implementation for the Gaman ORM.
  */

 import sqlite3 from 'sqlite3';
 import { open, Database } from 'sqlite';
 import { GamanProvider } from './base.js';

 /**
  * SQLite implementation of the GamanProvider interface.
  * Uses the 'sqlite' package with 'sqlite3' driver for database operations.
  *
  * @example
  * ```typescript
  * const provider = new SQLiteProvider();
  * await provider.connect();
  * const users = await provider.find<User>('users');
  * await provider.disconnect();
  * ```
  */
 export class SQLiteProvider implements GamanProvider {
 	/**
 	 * The SQLite database instance.
 	 */
 	db!: Database;

 	/**
 	 * Establishes a connection to the SQLite database.
 	 * Opens a database file named 'data.db' in the current directory.
 	 * @returns A promise that resolves when the connection is established.
 	 */
 	async connect(): Promise<void> {
 		this.db = await open({ filename: 'data.db', driver: sqlite3.Database });
 	}

 	/**
 	 * Closes the connection to the SQLite database.
 	 * @returns A promise that resolves when the connection is closed.
 	 */
 	async disconnect(): Promise<void> {
 		await this.db.close();
 	}

 	/**
 	 * Finds multiple records in the specified table.
 	 * @template T The type of the objects to retrieve.
 	 * @param table The name of the table to query.
 	 * @param query Optional query object to filter results using WHERE clauses.
 	 * @returns A promise resolving to an array of matching records.
 	 */
 	async find<T>(table: string, query: object = {}): Promise<T[]> {
 		const keys = Object.keys(query);
 		const where = keys.length
 			? `WHERE ${keys.map((k) => `${k} = ?`).join(' AND ')}`
 			: '';
 		const values = Object.values(query);
 		return this.db.all(`SELECT * FROM ${table} ${where}`, values);
 	}

 	/**
 	 * Finds a single record in the specified table.
 	 * @template T The type of the object to retrieve.
 	 * @param table The name of the table to query.
 	 * @param query Query object to match exactly one record.
 	 * @returns A promise resolving to the matching record or null.
 	 */
 	async findOne<T>(table: string, query: object): Promise<T | null> {
 		const rows = await this.find<T>(table, query);
 		return rows[0] || null;
 	}

 	/**
 	 * Inserts a new record into the specified table.
 	 * @template T The type of the object to insert.
 	 * @param table The name of the table to insert into.
 	 * @param data The data object to insert.
 	 * @returns A promise that resolves when the insertion is complete.
 	 */
 	async insert<T extends object>(table: string, data: T): Promise<void> {
 		const keys = Object.keys(data);
 		const placeholders = keys.map(() => '?').join(', ');
 		const values = Object.values(data);
 		await this.db.run(
 			`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
 			values,
 		);
 	}

 	/**
 	 * Updates records in the specified table.
 	 * @template T The type of the objects being updated.
 	 * @param table The name of the table to update.
 	 * @param query Query object to identify records to update.
 	 * @param data Partial data object with fields to update.
 	 * @returns A promise that resolves when the update is complete.
 	 */
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

 	/**
 	 * Deletes records in the specified table.
 	 * @template T The type of the objects being deleted.
 	 * @param table The name of the table to delete from.
 	 * @param query Query object to identify records to delete.
 	 * @returns A promise that resolves when the deletion is complete.
 	 */
 	async delete<T>(table: string, query: object): Promise<void> {
 		const qKeys = Object.keys(query);
 		const where = qKeys.map((k) => `${k} = ?`).join(' AND ');
 		const values = Object.values(query);
 		await this.db.run(`DELETE FROM ${table} WHERE ${where}`, values);
 	}
 }
