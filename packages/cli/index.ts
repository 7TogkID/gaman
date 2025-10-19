#!/usr/bin/env tsx
import { cac } from 'cac';
import { run_dev } from './command/dev.js';
import { run_build } from './command/build.js';

const cli = cac('gaman');

cli
	.command('dev', 'Start development server')
	.action(async () => {
		await run_dev();
	});

cli
	.command("build", "Build the application")
	.action(async () => {
		await run_build()
	})

cli.help();
cli.parse();
