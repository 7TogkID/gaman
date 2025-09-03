import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { Logger } from '@gaman/common/utils/logger.js';
import { Command } from './command.js';
import { getGamanConfig, TextFormat } from '@gaman/common/index.js';
import path from 'path';
import { isDevelopment } from '../utils/esbuild.js';

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
		const config = await getGamanConfig();
		const outdir = config.build?.outdir || 'dist';
		const entryFile = path.join(outdir, 'index.js');

		if (isDevelopment(outdir)) {
			Logger.error(
				`You are in Development mode, please${TextFormat.GREEN} npm run build${TextFormat.RED} first.${TextFormat.RESET}`,
			);
			process.exit(1);
		}

		if (!existsSync(entryFile)) {
			Logger.error(
				`File ${outdir}/index.js not found. Please run the build process first.`,
			);
			process.exit(1);
		}

		const child = spawn(
			process.execPath,
			[entryFile, ...process.argv.slice(3)],
			{
				stdio: 'inherit',
				env: process.env,
			},
		);

		child.on('exit', (code) => {
			Logger.error(`Process exited with code: ${code}`);
			process.exit(code ?? 0);
		});
	}
}

export default new StartCommand();
