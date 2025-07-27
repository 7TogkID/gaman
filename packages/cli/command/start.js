import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { Logger } from '@gaman/core/utils/logger';
import { Command } from './command';
const entryFile = './dist/entry.mjs';
// Versi sebagai Command
export class StartCommand extends Command {
    constructor() {
        super('start', 'Start the application in production mode', 'gaman start', []);
    }
    async execute() {
        if (!existsSync(entryFile)) {
            Logger.error('File dist/entry.mjs not found. Please run the build process first.');
            process.exit(1);
        }
        Logger.log('Starting the application...');
        const child = spawn('node', [entryFile], {
            stdio: 'inherit',
            env: process.env,
        });
        child.on('exit', (code) => {
            Logger.log(`Process exited with code: ${code}`);
            process.exit(code ?? 0);
        });
    }
}
export default new StartCommand();
