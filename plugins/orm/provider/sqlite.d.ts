/**
 * @fileoverview SQLite provider implementation for the Gaman ORM.
 */
import { Database } from 'sqlite';
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
export declare class SQLiteProvider implements GamanProvider {
    /**
     * The SQLite database instance.
     */
    db: Database;
    /**
     * Establishes a connection to the SQLite database.
     * Opens a database file named 'data.db' in the current directory.
     * @returns A promise that resolves when the connection is established.
     */
    connect(): Promise<void>;
    /**
     * Closes the connection to the SQLite database.
     * @returns A promise that resolves when the connection is closed.
     */
    disconnect(): Promise<void>;
    /**
     * Finds multiple records in the specified table.
     * @template T The type of the objects to retrieve.
     * @param table The name of the table to query.
     * @param query Optional query object to filter results using WHERE clauses.
     * @returns A promise resolving to an array of matching records.
     */
    find<T>(table: string, query?: object): Promise<T[]>;
    /**
     * Finds a single record in the specified table.
     * @template T The type of the object to retrieve.
     * @param table The name of the table to query.
     * @param query Query object to match exactly one record.
     * @returns A promise resolving to the matching record or null.
     */
    findOne<T>(table: string, query: object): Promise<T | null>;
    /**
     * Inserts a new record into the specified table.
     * @template T The type of the object to insert.
     * @param table The name of the table to insert into.
     * @param data The data object to insert.
     * @returns A promise that resolves when the insertion is complete.
     */
    insert<T extends object>(table: string, data: T): Promise<void>;
    /**
     * Updates records in the specified table.
     * @template T The type of the objects being updated.
     * @param table The name of the table to update.
     * @param query Query object to identify records to update.
     * @param data Partial data object with fields to update.
     * @returns A promise that resolves when the update is complete.
     */
    update<T>(table: string, query: object, data: Partial<T>): Promise<void>;
    /**
     * Deletes records in the specified table.
     * @template T The type of the objects being deleted.
     * @param table The name of the table to delete from.
     * @param query Query object to identify records to delete.
     * @returns A promise that resolves when the deletion is complete.
     */
    delete<T>(table: string, query: object): Promise<void>;
}
