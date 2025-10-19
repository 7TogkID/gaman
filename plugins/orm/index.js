/**
 * @fileoverview Gaman ORM Plugin
 *
 * This module provides a lightweight Object-Relational Mapping (ORM) system for Gaman applications.
 * It supports basic CRUD operations, data casting, and model relations through a provider-based architecture.
 *
 * Key features:
 * - Database-agnostic via providers (e.g., SQLite)
 * - Automatic data type casting
 * - Model-based relations (hasMany, belongsTo, hasOne)
 * - Simple query interface
 *
 * @example
 * ```typescript
 * import { GamanORM, BaseModel, SQLiteProvider } from '@gaman/orm';
 *
 * const orm = new GamanORM(new SQLiteProvider());
 * class User extends BaseModel<User> {
 *   // Define model options
 * }
 * ```
 */
/**
 * The main ORM class that handles database connections and operations.
 */
export { GamanORM } from './orm.js';
/**
 * Base model class for defining database models with casting and relations.
 */
export { BaseModel } from './model/base.js';
/**
 * SQLite implementation of the GamanProvider interface.
 */
export { SQLiteProvider } from './provider/sqlite.js';
