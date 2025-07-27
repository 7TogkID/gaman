import { randomBytes } from 'crypto';
import * as path from 'path';
import * as fs from 'fs/promises';
import { Command } from '../command';
import { Log } from '@gaman/core/utils/logger';
import { TextFormat } from '@gaman/core/utils/textformat';
import { existsSync } from 'fs';

export class GenerateKeyCommand extends Command {
	constructor() {
		super(
			'key:generate',
			'Generate a secure key for GAMAN_KEY',
			'gaman key:generate',
			[],
		);
	}

	async execute(args: Record<string, any>): Promise<void> {
		const envPath = path.join(process.cwd(), '.env');
		const gamanKey = randomBytes(32).toString('hex');

		if (existsSync(envPath) && !args['force']) {
			const read = await fs.readFile(envPath);
			if (read.toString('utf8').includes('GAMAN_KEY')) {
				Log.warn('GAMAN_KEY already exists, if you wan`t replace use command:');
				Log.warn(
					`   ${TextFormat.GRAY}npx gaman key:generate --force${TextFormat.RESET}`,
				);
				return;
			}
		}

		await fs.writeFile(envPath, `GAMAN_KEY=${gamanKey}\n`);
		Log.info('Generated GAMAN_KEY and saved to .env');
	}
}

export default new GenerateKeyCommand();
