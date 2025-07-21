#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
	.scriptName('gaman')
	.usage('$0 <cmd> [args]')
	.command(
		'dev',
		'Run the application in development mode.',
		() => {},
		async (argv) => {
			await import('./commands/dev.js');
		},
	)
	.command(
		'build',
		'Build the application.',
		() => {},
		async (argv) => {
			await import('./commands/build.js');
		},
	)
	.command(
		'start',
		'Start the application in production mode.',
		() => {},
		async (argv) => {
			await import('./commands/start.js');
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
			const { default: generateBlock } = await import('./commands/make/block.js');
			await generateBlock(argv.name as string);
		},
	)
	.command(
		'key:generate',
		'Generate a new GAMAN_KEY and update .env file',
		() => {},
		async () => {
			const { default: generateKey } = await import('./commands/key/generate.js');
			await generateKey();
		},
	)

	.demandCommand(1, 'You need at least one command before moving on')
	.help().argv;
