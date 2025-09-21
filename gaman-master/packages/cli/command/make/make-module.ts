import { Log } from '@gaman/common/utils/logger.js';
import { Command } from '../command.js';
import makeBlock from './make-block.js';
import makeRoutes from './make-routes.js';
import makeService from './make-service.js';

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
