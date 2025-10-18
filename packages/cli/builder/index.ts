import { GamanConfig } from '@gaman/core/config/index.js';
import fs, { existsSync, rmSync } from 'fs';
import path from 'path';
import esbuild from 'esbuild';
import { Logger } from '@gaman/common/index.js';
import fg from 'fast-glob';
import { addJsExtensionPlugin } from './plugins/addJsExtensionPlugin.js';
import {
	createDevelopmentFile,
	createProductionFile,
} from './helper.js';

export const buildAll = async (
	config: GamanConfig,
	mode: 'development' | 'production',
) => {
	const outdir = config.build?.outdir || 'dist';
	const verbose = config.verbose;
	if (existsSync(outdir)) {
		if (verbose) Logger.debug('Cleaning previous build...');
		rmSync(outdir, { recursive: true, force: true });
	}
	if (mode === 'development') {
		createDevelopmentFile(outdir);
		if (verbose) Logger.debug('Development file created.');
	} else {
		createProductionFile(outdir);
		if (verbose) Logger.debug('Production file created.');
	}

	if (verbose) Logger.debug('Searching entry points...');
	const entryPoints = await fg(config.build?.includes ?? ['src/**/*.{ts,js}'], {
		ignore: config.build?.excludes ?? [
			'**/node_modules/**',
			`**/${outdir}/**`,
			'**/*.test.*',
			'**/*.d.*',
		],
	});
	if (verbose) Logger.debug(`Found ${entryPoints.length} entry files`);

	// start build
	for (const file of entryPoints) {
		await buildFile(file, config, mode);
	}
};

export const buildFile = async (
	file: string,
	config: GamanConfig,
	mode: 'development' | 'production',
) => {
	const outdir = `${config.build?.outdir || 'dist'}/server`;
	const rootdir = config.build?.rootdir || 'src';
	const relPath = path.relative(rootdir, file);
	const outFile = path.join(outdir, relPath).replace(/\.(ts|js)$/, '.js');

	await esbuild.build({
		entryPoints: [file],
		outfile: outFile,
		bundle: false,
		format: 'esm',
		platform: 'node',
		target: 'node18',	
		allowOverwrite: true,
		minify: mode === 'production',
		sourcemap: true,
		legalComments: 'none',
		packages: 'external',
		alias: config?.build?.alias,
		define: {
			'process.env.NODE_ENV': `"${mode}"`,
		},
		plugins: [addJsExtensionPlugin, ...(config?.build?.esbuildPlugins || [])],
	});
	if (config.verbose) Logger.debug(`Built: ${relPath}`);
};
