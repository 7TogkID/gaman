import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { Logger } from '@gaman/common/utils/logger';
import { Command } from './command';

const entryFile = './dist/index.js';

// Versi sebagai Command
export class StartCommand extends Command {
	constructor() {
		super(
			'start',
			'Start the application in production mode',
			'gaman start',
			[],
		);
	}

	async execute(): Promise<void> {
		if (!existsSync(entryFile)) {
			Logger.error(
				'File dist/index.js not found. Please run the build process first.',
			);
			process.exit(1);
		}

		const child = spawn('npx', ['tsx', entryFile], {
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
