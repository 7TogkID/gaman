import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { Logger } from '../../utils';

const entryFile = './dist/entry.mjs';

export default function start() {
	if (!existsSync(entryFile)) {
		Logger.error('File dist/entry.mjs not found. Please run the build process first.');
		process.exit(1);
	}

	Logger.log('Starting the application...');

	const child = spawn('node', [entryFile], {
		stdio: 'inherit', // display stdout and stderr directly
		env: process.env,
	});

	child.on('exit', (code) => {
		Logger.log(`Process exited with code: ${code}`);
		process.exit(code ?? 0);
	});
}
