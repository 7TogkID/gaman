import esbuild from 'esbuild';
import fg from 'fast-glob';
import { existsSync, rmSync } from 'fs';
import { Logger } from '@gaman/common/utils/logger.js';
import { Command } from './command.js';

export async function runBuild() {
	const start = Date.now();
	const distDir = 'dist';
	if (existsSync(distDir)) {
		Logger.log('Cleaning previous build...');
		rmSync(distDir, { recursive: true, force: true });
	}

	Logger.log('Searching entry points...');

	const entryPoints = await fg(['src/**/*.{ts,js}'], {
		ignore: ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.d.*'],
	});

	Logger.log(`Found ${entryPoints.length} entry files`);

	await esbuild.build({
		entryPoints,
		outdir: 'dist',
		bundle: true,
		format: 'esm',
		platform: 'node',
		target: 'node18',
		minify: true,
		sourcemap: true,
		legalComments: 'none',
		packages: 'external',
		outExtension: {'.js': '.js'},
		plugins: [
			{
				name: 'gaman-build-log',
				setup(build) {
					build.onLoad({ filter: /\.(ts|js)$/ }, async (args) => {
						Logger.log(`✔ Loaded: ${args.path}`);
						return null;
					});
					build.onStart(() => { 
						Logger.log('Build started...');
					});
					build.onEnd(() => {
						Logger.log('Build output done. Reading output files...');

						Logger.log('entry.mjs generated successfully.');
						Logger.log(`Build finished in ${Date.now() - start}ms`);
					});
				},
			},
		],
	});
}

export class BuildCommand extends Command {
	constructor() {
		super('build', 'Build the application', 'gaman build', []);
	}

	async execute(): Promise<void> {
		await runBuild();
	}
}

export default new BuildCommand();
