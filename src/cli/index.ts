#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import dev from './commands/dev';
import build from './commands/build';
import start from './commands/start';
import generateBlock from './commands/make/block';
import generateKey from './commands/key/generate.js';

yargs(hideBin(process.argv))
	.scriptName('gaman')
	.usage('$0 <cmd> [args]')
	.command(
		'dev',
		'Run the application in development mode.',
		() => {},
		async () => {
			dev()
		},
	)
	.command(
		'build',
		'Build the application.',
		() => {},
		async () => {
			await build()
		},
	)
	.command(
		'start',
		'Start the application in production mode.',
		() => {},
		async () => {
			start()
		},
	)
	.command(
		'make:block <name>',
		'Generate a new Gaman block',
		(yargs) => {
			return yargs.positional('name', {
				type: 'string',
				describe: 'Name of the block to create',
			});
		},
		async (argv) => {
			await generateBlock(argv.name as string);
		},
	)
	.command(
		'key:generate',
		'Generate a new GAMAN_KEY and update .env file',
		() => {},
		async () => {
			await generateKey();
		},
	)

	.demandCommand(1, 'You need at least one command before moving on')
	.help().argv;
