/**
 * @module
 * GamanJS session integration.
 *
 * Provides pluggable session storage using various drivers:
 * memory, file, redis, mongodb, and sql (sqlite).
 */

import { defineIntegration } from '..';
import { SESSION_OPTIONS_SYMBOL, SESSION_STORE_SYMBOL } from '../../symbol';
import { Log } from '../../utils';
import { FileStore } from './store/file';
import { MemoryStore } from './store/memory';
import { MongoDBStore } from './store/mongo';
import { RedisStore } from './store/redis';
import { SQLStore } from './store/sql';

/**
 * Configuration options for each session store type.
 */
export type IGamanSessionDriverOptions =
	| { type: 'cookies' }
	| { type: 'memory' }
	| {
			type: 'redis';
			/** Redis connection URL. Default: `redis://localhost:6379` */
			url?: string;
	  }
	| {
			type: 'file';
			/** Directory to store session files. Default: `./sessions` */
			dir?: string;
	  }
	| {
			type: 'sql';
			/** SQLite file path. Default: `session.db` */
			file?: string;
	  }
	| {
			type: 'mongodb';
			/** MongoDB database name */
			dbName: string;
			/** MongoDB URI. Default: `mongodb://localhost:27017` */
			uri?: string;
			/** MongoDB collection name. Default: `gaman_sessions` */
			collection?: string;
	  };

/**
 * Global session configuration.
 */
export interface IGamanSessionOptions {
	/** Session secret key */
	secret?: string;

	/** Selected session driver and its config */
	driver?: IGamanSessionDriverOptions;

	/** Max session lifetime in seconds. Default: 86400 (1 day) */
	maxAge?: number;

	/** Whether cookies require HTTPS. Default: `true` */
	secure?: boolean;
}

/**
 * GamanJS session integration handler.
 *
 * Automatically initializes the correct store based on driver config.
 * Logs missing dependencies for optional drivers and gracefully exits.
 */
export function session(options: IGamanSessionOptions = {}) {
	const {
		secret = process.env.GAMAN_KEY || '',
		driver = { type: 'cookies' },
		maxAge = 86400,
		secure = true,
	} = options;

	return defineIntegration({
		name: 'gaman-session',
		priority: 'normal',
		async onLoad(app) {
			if (driver.type === 'redis') {
				// Ensure redis is installed
				try {
					await import('redis');
				} catch {
					Log.error('Redis is not installed.');
					Log.error('Please install it with: §l§fnpm install redis§r');
					process.exit(1);
				}
				// @ts-ignore
				driver[SESSION_STORE_SYMBOL] = new RedisStore(driver.url);
			} else if (driver.type === 'sql') {
				// Ensure sqlite and sqlite3 are installed
				try {
					await import('sqlite3');
					await import('sqlite');
				} catch {
					Log.error('Sqlite is not installed.');
					Log.error('Please install it with: §l§fnpm install sqlite3 sqlite§r');
					process.exit(1);
				}
				const sqlStore = new SQLStore(driver.file);
				await sqlStore.init();
				// @ts-ignore
				driver[SESSION_STORE_SYMBOL] = sqlStore;
			} else if (driver.type === 'mongodb') {
				// Ensure mongodb is installed
				try {
					await import('mongodb');
				} catch {
					Log.error('MongoDB is not installed.');
					Log.error('Please install it with: §l§fnpm install mongodb§r');
					process.exit(1);
				}
				const mongoStore = new MongoDBStore(driver.dbName, driver.uri, driver.collection);
				await mongoStore.init();
				// @ts-ignore
				driver[SESSION_STORE_SYMBOL] = mongoStore;
			} else if (driver.type === 'memory') {
				// @ts-ignore
				driver[SESSION_STORE_SYMBOL] = new MemoryStore();
			} else if (driver.type === 'file') {
				// @ts-ignore
				driver[SESSION_STORE_SYMBOL] = new FileStore(driver.dir);
			} else {
				// cookies-based session (stateless)
				// @ts-ignore
				driver[SESSION_STORE_SYMBOL] = undefined;
			}

			// Store session config globally in the app
			// @ts-ignore
			app[SESSION_OPTIONS_SYMBOL] = {
				secret,
				driver,
				maxAge,
				secure,
			};
		},
	});
}
