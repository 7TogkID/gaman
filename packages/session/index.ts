/**
 * @module
 * GamanJS session integration.
 *
 * Provides pluggable session storage using various drivers:
 * memory, file, redis, mongodb, and sql (sqlite).
 */

import { defineIntegration } from '@gaman/core/integration';
import { Log } from '@gaman/common/utils/logger';
import { GamanSession } from './session';
import { MemoryStore } from './store/memory';
import { FileStore } from './store/file';

const SESSION_OPTIONS_SYMBOL = Symbol.for('gaman.sessionOptions');
const SESSION_STORE_SYMBOL = Symbol.for('gaman.sessionStore');

declare global {
	namespace Gaman {
		interface Context {
			session: GamanSession;
		}
	}
}
export {};

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

	return defineIntegration((app) => ({
		name: 'gaman-session',
		priority: 'very-high',
		async onLoad() {
			if (driver.type === 'redis') {
				// Ensure redis is installed
				try {
					await import('redis');
					const { RedisStore } = await import('./store/redis');

					// @ts-ignore
					driver[SESSION_STORE_SYMBOL] = new RedisStore(driver.url);
				} catch {
					Log.error('Redis is not installed.');
					Log.error('Please install it with: §l§fnpm install redis§r');
					process.exit(1);
				}
			} else if (driver.type === 'sql') {
				// Ensure sqlite and sqlite3 are installed
				try {
					await import('sqlite3');
					await import('sqlite');

					const { SQLStore } = await import('./store/sql');
					const sqlStore = new SQLStore(driver.file);
					await sqlStore.init();
					// @ts-ignore
					driver[SESSION_STORE_SYMBOL] = sqlStore;
				} catch {
					Log.error('Sqlite is not installed.');
					Log.error('Please install it with: §l§fnpm install sqlite3 sqlite§r');
					process.exit(1);
				}
			} else if (driver.type === 'mongodb') {
				// Ensure mongodb is installed
				try {
					await import('mongodb');
					const { MongoDBStore } = await import('./store/mongo');
					const mongoStore = new MongoDBStore(
						driver.dbName,
						driver.uri,
						driver.collection,
					);
					await mongoStore.init();
					// @ts-ignore
					driver[SESSION_STORE_SYMBOL] = mongoStore;
				} catch {
					Log.error('MongoDB is not installed.');
					Log.error('Please install it with: §l§fnpm install mongodb§r');
					process.exit(1);
				}
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
		async onRequest(ctx) {
			ctx.session = new GamanSession(app, ctx.cookies, ctx.request);
			return undefined;
		},
	}));
}
