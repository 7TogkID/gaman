import { Command } from './command.js';
import { getGamanConfig, Logger, TextFormat } from '@gaman/common/index.js';
import { buildAll } from '../builder/index.js';

export async function run_build(): Promise<void> {
	const start = Date.now();
	Logger.debug('Build Started...');
	const config = await getGamanConfig();
	await buildAll({ ...config, verbose: true }, 'production');

	Logger.debug(
		`Build finished in${TextFormat.GREEN} ${Date.now() - start}ms${
			TextFormat.RESET
		}`,
	);
}
