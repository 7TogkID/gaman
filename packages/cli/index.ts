#!/usr/bin/env bun

import dev from './command/dev';
import build from './command/build';
import start from './command/start';
import generateKey from './command/key/generate';
import { parseArgs } from './utils/parse';
import { Command } from './command/command';
import block from './command/make/block';
import integration from './command/make/integration';
import middleware from './command/make/middleware';
import { TextFormat } from '@gaman/core/utils/textformat';

// Daftar perintah yang tersedia
const commands: Command[] = [
	dev,
	build,
	start,
	generateKey,
	block,
	integration,
	middleware,
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
