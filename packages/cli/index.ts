#!/usr/bin/env tsx

import dev from './command/dev.js';
import build from './command/build.js';
import start from './command/start.js';
import { parseArgs } from './utils/parse.js';
import { Command } from './command/command.js';
import makeBlock from './command/make/make-block.js';
import makeIntegration from './command/make/make-integration.js';
import makeMiddleware from './command/make/make-middleware.js';
import makeRoutes from './command/make/make-routes.js';
import { TextFormat } from '@gaman/common/utils/textformat.js';
import makeService from './command/make/make-service.js';
import makeModule from './command/make/make-module.js';

// Daftar perintah yang tersedia
const commands: Command[] = [
	dev,
	build,
	start,
	makeModule,
	makeBlock,
	makeRoutes,
	makeService,
	makeIntegration,
	makeMiddleware,
];

// Parsing argumen CLI
const { command, args } = parseArgs();

// Fungsi menampilkan bantuan
function showHelp() {
	console.log(TextFormat.format(`§l§bGaman CLI§r\n`));

	console.log(
		TextFormat.format(`§eUsage:\n  §r§a$ gaman <command> [options]\n`),
	);
	console.log(TextFormat.format(`§eCommands:`));

	for (const cmd of commands) {
		const aliases =
			cmd.alias.length > 0 ? ` (alias: ${cmd.alias.join(', ')})` : '';

		console.log(
			TextFormat.format(
				` §b gaman ${cmd.name.padEnd(16)}§r ${cmd.description}${
					aliases ? ` §8${aliases}` : ''
				}`,
			),
		);
	}

	console.log();
}

(async () => {
	if (!command || command === 'help' || args.help || args.h) {
		showHelp();
		return;
	}

	const matched = commands.find((cmd) =>
		[cmd.name, ...cmd.alias].includes(command),
	);

	if (matched) {
		await matched.execute(args);
	} else {
		console.error(`Unknown command: ${command}`);
		showHelp();
	}
})();
