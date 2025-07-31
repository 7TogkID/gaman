import { Log } from '@gaman/common/utils/logger';
import { Command } from '../command';
import makeBlock from './make-block';
import makeRoutes from './make-routes';
import makeService from './make-service';

class MakeModule extends Command {
	constructor() {
		super(
			'make:module',
			'Generate a block, routes, and service template',
			'gaman make:module <name>',
			['make:mo'],
		);
	}

	async execute(args: Record<string, any>): Promise<void> {
		let filePath = args._?.[0];
		if (!filePath) {
			Log.error(`usage: ${this.usage}`);
			return;
		}
		makeBlock.execute(args);
		makeRoutes.execute(args);
		makeService.execute(args);
	}
}

export default new MakeModule();
