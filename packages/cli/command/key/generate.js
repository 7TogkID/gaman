"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateKeyCommand = void 0;
const crypto_1 = require("crypto");
const path = require("path");
const fs = require("fs/promises");
const command_1 = require("../command");
const logger_1 = require("@gaman/core/utils/logger");
const textformat_1 = require("@gaman/core/utils/textformat");
const fs_1 = require("fs");
class GenerateKeyCommand extends command_1.Command {
    constructor() {
        super('key:generate', 'Generate a secure key for GAMAN_KEY', 'gaman key:generate', []);
    }
    async execute(args) {
        const envPath = path.join(process.cwd(), '.env');
        const gamanKey = (0, crypto_1.randomBytes)(32).toString('hex');
        if ((0, fs_1.existsSync)(envPath) && !args['force']) {
            const read = await fs.readFile(envPath);
            if (read.toString('utf8').includes('GAMAN_KEY')) {
                logger_1.Log.warn('GAMAN_KEY already exists, if you wan`t replace use command:');
                logger_1.Log.warn(`   ${textformat_1.TextFormat.GRAY}npx gaman key:generate --force${textformat_1.TextFormat.RESET}`);
                return;
            }
        }
        await fs.writeFile(envPath, `GAMAN_KEY=${gamanKey}\n`);
        logger_1.Log.info('Generated GAMAN_KEY and saved to .env');
    }
}
exports.GenerateKeyCommand = GenerateKeyCommand;
exports.default = new GenerateKeyCommand();
