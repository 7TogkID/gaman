/**
 * @module
 * GamanJS session integration.
 *
 * Provides pluggable session storage using various drivers:
 * memory, file, redis, mongodb, and sql (sqlite).
 */
/** Export all session context */
export * from "../../context/session";
/**
 * Configuration options for each session store type.
 */
export type IGamanSessionDriverOptions = {
    type: "cookies";
} | {
    type: "memory";
} | {
    type: "redis";
    /** Redis connection URL. Default: `redis://localhost:6379` */
    url?: string;
} | {
    type: "file";
    /** Directory to store session files. Default: `./sessions` */
    dir?: string;
} | {
    type: "sql";
    /** SQLite file path. Default: `session.db` */
    file?: string;
} | {
    type: "mongodb";
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
export declare function session(options?: IGamanSessionOptions): import("..").IntegrationFactory<import("../../types").AppConfig>;
