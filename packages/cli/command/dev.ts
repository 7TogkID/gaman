import { existsSync } from 'fs';
import { spawn } from 'child_process';
import { Command } from './command.js';

function getEntryFile(): string {
	const candidates = ['src/index.ts', 'src/index.js', 'src/index.mjs'];
	return candidates.find((file) => existsSync(file)) || 'src/index.ts';
}

export class DevCommand extends Command {
	constructor() {
		super('dev', 'Run the application in development mode', 'gaman dev', [
			'serve',
		]);
	}

	async execute(): Promise<void> {
		const entry = getEntryFile();
		const userArgs = process.argv.slice(2); // ['--port=3000', '--debug']
		spawn('npx', ['tsx', 'watch', entry, ...userArgs], {
			stdio: 'inherit',
			shell: true,
		});
	}
}

export default new DevCommand();
