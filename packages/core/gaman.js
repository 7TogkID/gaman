"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineBootstrap = defineBootstrap;
const gaman_app_1 = require("./gaman-app");
const load_env_1 = require("./utils/load-env");
const logger_1 = require("./utils/logger");
async function defineBootstrap(mainBlock, cb) {
    logger_1.Log.log(`Starting Gaman application...`);
    (0, load_env_1.loadEnv)();
    if (!process.env.GAMAN_KEY) {
        logger_1.Log.error("Missing GAMAN_KEY in your environment.\n" +
            "Please generate one by running the following command:\n\n" +
            "  npx gaman key:generate\n");
        return process.exit();
    }
    const app = new gaman_app_1.GamanApp(mainBlock);
    cb(app);
}
