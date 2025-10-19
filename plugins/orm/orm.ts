/**
 * @fileoverview GamanORM class for handling database operations.
 * This module provides a simple ORM interface that delegates to a provider for actual database interactions.
 */

 import { GamanProvider } from './provider/base.js';

/**
 * GamanORM is a lightweight Object-Relational Mapping class that provides basic CRUD operations.
 * It acts as a facade over a database provider, allowing for easy switching between different database backends.
 *
 * @example
 * ```typescript
 * const orm = new GamanORM(new SQLiteProvider());
 * await orm.connect();
 * const users = await orm.find<User>('users', { active: true });
 * await orm.disconnect();
 * ```
 */
export class GamanORM {
	/**
	 * Creates an instance of GamanORM with the specified provider.
	 * @param provider The database provider to use for operations.
	 */
	constructor(private provider: GamanProvider) {}

	/**
	 * Establishes a connection to the database via the provider.
	 * @returns A promise that resolves when the connection is established.
	 */
	async connect(): Promise<void> {
		await this.provider.connect();
	}

	/**
	 * Closes the connection to the database via the provider.
	 * @returns A promise that resolves when the connection is closed.
	 */
	async disconnect(): Promise<void> {
		await this.provider.disconnect();
	}

	/**
	 * Finds multiple records in the specified table that match the query.
	 * @template T The type of the objects to retrieve.
	 * @param table The name of the table to query.
	 * @param query Optional query object to filter results. If omitted, returns all records.
	 * @returns A promise that resolves to an array of matching records.
	 */
	async find<T extends object>(table: string, query?: T): Promise<T[]> {
		return this.provider.find<T>(table, query);
	}

	/**
	 * Finds a single record in the specified table that matches the query.
	 * @template T The type of the object to retrieve.
	 * @param table The name of the table to query.
	 * @param query Query object to filter results. Must match exactly one record.
	 * @returns A promise that resolves to the matching record or null if not found.
	 */
	async findOne<T extends object>(table: string, query: T): Promise<T | null> {
		return this.provider.findOne<T>(table, query);
	}

	/**
	 * Inserts a new record into the specified table.
	 * @template T The type of the object to insert.
	 * @param table The name of the table to insert into.
	 * @param data The data object to insert.
	 * @returns A promise that resolves when the insertion is complete.
	 */
	async insert<T extends object>(table: string, data: T): Promise<void> {
		return this.provider.insert<T>(table, data);
	}

	/**
	 * Updates records in the specified table that match the query.
	 * @template T The type of the objects being updated.
	 * @param table The name of the table to update.
	 * @param query Query object to identify records to update.
	 * @param data Partial data object with fields to update.
	 * @returns A promise that resolves when the update is complete.
	 */
	async update<T extends object>(
		table: string,
		query: T,
		data: Partial<T>,
	): Promise<void> {
		return this.provider.update<T>(table, query, data);
	}

	/**
	 * Deletes records in the specified table that match the query.
	 * @template T The type of the objects being deleted.
	 * @param table The name of the table to delete from.
	 * @param query Query object to identify records to delete.
	 * @returns A promise that resolves when the deletion is complete.
	 */
	async delete<T extends object>(table: string, query: T): Promise<void> {
		return this.provider.delete<T>(table, query);
	}
}
