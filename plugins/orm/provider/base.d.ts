/**
 * @fileoverview Interface for database providers in the Gaman ORM.
 */
/**
 * Interface that all database providers must implement to work with GamanORM.
 * Providers handle the actual database interactions, allowing for different backends like SQLite, PostgreSQL, etc.
 */
export interface GamanProvider {
    /**
     * Establishes a connection to the database.
     * @returns A promise that resolves when the connection is established.
     */
    connect(): Promise<void>;
    /**
     * Closes the connection to the database.
     * @returns A promise that resolves when the connection is closed.
     */
    disconnect(): Promise<void>;
    /**
     * Finds multiple records in the specified table.
     * @template T The type of the objects to retrieve.
     * @param collection The name of the table or collection.
     * @param query Optional query object to filter results.
     * @returns A promise resolving to an array of matching records.
     */
    find<T extends object>(collection: string, query?: object): Promise<T[]>;
    /**
     * Finds a single record in the specified table.
     * @template T The type of the object to retrieve.
     * @param collection The name of the table or collection.
     * @param query Query object to match exactly one record.
     * @returns A promise resolving to the matching record or null.
     */
    findOne<T extends object>(collection: string, query: object): Promise<T | null>;
    /**
     * Inserts a new record into the specified table.
     * @template T The type of the object to insert.
     * @param collection The name of the table or collection.
     * @param data The data object to insert.
     * @returns A promise that resolves when the insertion is complete.
     */
    insert<T extends object>(collection: string, data: T): Promise<void>;
    /**
     * Updates records in the specified table.
     * @template T The type of the objects being updated.
     * @param collection The name of the table or collection.
     * @param query Query object to identify records to update.
     * @param data Partial data object with fields to update.
     * @returns A promise that resolves when the update is complete.
     */
    update<T extends object>(collection: string, query: object, data: Partial<T>): Promise<void>;
    /**
     * Deletes records in the specified table.
     * @template T The type of the objects being deleted.
     * @param collection The name of the table or collection.
     * @param query Query object to identify records to delete.
     * @returns A promise that resolves when the deletion is complete.
     */
    delete<T extends object>(collection: string, query: object): Promise<void>;
}
