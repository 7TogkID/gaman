#!/usr/bin/env tsx
import { cac } from 'cac';
import { run_dev } from './command/dev.js';
import { run_build } from './command/build.js';
import { run_start } from './command/start.js';

const cli = cac('gaman');

cli.command('dev', 'Start development server').action(run_dev);
cli.command('build', 'Build the application').action(run_build);
cli.command('start', 'Start the application in production mode').action(run_start);

cli.help();
cli.parse();
