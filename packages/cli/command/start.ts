import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { Logger } from '@gaman/common/utils/logger.js';
import { getGamanConfig, TextFormat } from '@gaman/common/index.js';
import path from 'path';
import { isDevelopment } from '../builder/helper.js';

export async function run_start(): Promise<void> {
	const config = await getGamanConfig();
	const outdir = `${config.build?.outdir || 'dist'}/server`;
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

	const devIndex = process.argv.indexOf('start');
	const extraArgs = devIndex >= 0 ? process.argv.slice(devIndex + 1) : [];
	const child = spawn(process.execPath, [entryFile, ...extraArgs], {
		stdio: 'inherit',
		env: process.env,
	});

	child.on('exit', (code) => {
		Logger.error(`Process exited with code: ${code}`);
		process.exit(code ?? 0);
	});
}
