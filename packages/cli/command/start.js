"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartCommand = void 0;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const logger_1 = require("@gaman/core/utils/logger");
const command_1 = require("./command");
const entryFile = './dist/entry.mjs';
// Versi sebagai Command
class StartCommand extends command_1.Command {
    constructor() {
        super('start', 'Start the application in production mode', 'gaman start', []);
    }
    async execute() {
        if (!(0, fs_1.existsSync)(entryFile)) {
            logger_1.Logger.error('File dist/entry.mjs not found. Please run the build process first.');
            process.exit(1);
        }
        logger_1.Logger.log('Starting the application...');
        const child = (0, child_process_1.spawn)('node', [entryFile], {
            stdio: 'inherit',
            env: process.env,
        });
        child.on('exit', (code) => {
            logger_1.Logger.log(`Process exited with code: ${code}`);
            process.exit(code ?? 0);
        });
    }
}
exports.StartCommand = StartCommand;
exports.default = new StartCommand();
