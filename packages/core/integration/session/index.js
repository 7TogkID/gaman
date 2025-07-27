"use strict";
/**
 * @module
 * GamanJS session integration.
 *
 * Provides pluggable session storage using various drivers:
 * memory, file, redis, mongodb, and sql (sqlite).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.session = session;
const tslib_1 = require("tslib");
const __1 = require("..");
const symbol_1 = require("../../symbol");
const logger_1 = require("../../utils/logger");
const file_1 = require("./store/file");
const memory_1 = require("./store/memory");
const mongo_1 = require("./store/mongo");
const redis_1 = require("./store/redis");
const sql_1 = require("./store/sql");
/** Export all session context */
tslib_1.__exportStar(require("../../context/session"), exports);
/**
 * GamanJS session integration handler.
 *
 * Automatically initializes the correct store based on driver config.
 * Logs missing dependencies for optional drivers and gracefully exits.
 */
function session(options = {}) {
    const { secret = process.env.GAMAN_KEY || "", driver = { type: "cookies" }, maxAge = 86400, secure = true, } = options;
    return (0, __1.defineIntegration)((app) => ({
        name: "gaman-session",
        priority: "normal",
        async onLoad() {
            if (driver.type === "redis") {
                // Ensure redis is installed
                try {
                    await Promise.resolve().then(() => require("redis"));
                }
                catch {
                    logger_1.Log.error("Redis is not installed.");
                    logger_1.Log.error("Please install it with: §l§fnpm install redis§r");
                    process.exit(1);
                }
                // @ts-ignore
                driver[symbol_1.SESSION_STORE_SYMBOL] = new redis_1.RedisStore(driver.url);
            }
            else if (driver.type === "sql") {
                // Ensure sqlite and sqlite3 are installed
                try {
                    await Promise.resolve().then(() => require("sqlite3"));
                    await Promise.resolve().then(() => require("sqlite"));
                }
                catch {
                    logger_1.Log.error("Sqlite is not installed.");
                    logger_1.Log.error("Please install it with: §l§fnpm install sqlite3 sqlite§r");
                    process.exit(1);
                }
                const sqlStore = new sql_1.SQLStore(driver.file);
                await sqlStore.init();
                // @ts-ignore
                driver[symbol_1.SESSION_STORE_SYMBOL] = sqlStore;
            }
            else if (driver.type === "mongodb") {
                // Ensure mongodb is installed
                try {
                    await Promise.resolve().then(() => require("mongodb"));
                }
                catch {
                    logger_1.Log.error("MongoDB is not installed.");
                    logger_1.Log.error("Please install it with: §l§fnpm install mongodb§r");
                    process.exit(1);
                }
                const mongoStore = new mongo_1.MongoDBStore(driver.dbName, driver.uri, driver.collection);
                await mongoStore.init();
                // @ts-ignore
                driver[symbol_1.SESSION_STORE_SYMBOL] = mongoStore;
            }
            else if (driver.type === "memory") {
                // @ts-ignore
                driver[symbol_1.SESSION_STORE_SYMBOL] = new memory_1.MemoryStore();
            }
            else if (driver.type === "file") {
                // @ts-ignore
                driver[symbol_1.SESSION_STORE_SYMBOL] = new file_1.FileStore(driver.dir);
            }
            else {
                // cookies-based session (stateless)
                // @ts-ignore
                driver[symbol_1.SESSION_STORE_SYMBOL] = undefined;
            }
            // Store session config globally in the app
            // @ts-ignore
            app[symbol_1.SESSION_OPTIONS_SYMBOL] = {
                secret,
                driver,
                maxAge,
                secure,
            };
        },
    }));
}
