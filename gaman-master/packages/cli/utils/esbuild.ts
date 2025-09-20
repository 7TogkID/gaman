import { GamanConfig } from '@gaman/core/config/index.js';
import type { Plugin } from 'esbuild';
import fs, { existsSync, rmSync } from 'fs';
import path from 'path';
import esbuild from 'esbuild';
import { Logger } from '@gaman/common/index.js';
import fg from 'fast-glob';

export const addJsExtensionPlugin: Plugin = {
	name: 'add-js-extension',
	setup(build) {
		build.onLoad({ filter: /\.[jt]s$/ }, async (args) => {
			const fsp = await import('fs/promises');
			let contents = await fsp.readFile(args.path, 'utf8');

			contents = contents.replace(/from\s+['"](\..*?)['"]/g, (match, p1) => {
				const absImportPath = path.resolve(path.dirname(args.path), p1);
				if (p1.endsWith('.js')) return match;

				let newPath = p1;
				if (fs.existsSync(absImportPath + '.ts')) {
					newPath = p1 + '.js';
				} else {
					const indexTs = path.join(absImportPath, 'index.ts');
					if (fs.existsSync(indexTs)) {
						newPath = p1.endsWith('/') ? p1 + 'index.js' : p1 + '/index.js';
					}
				}
				return `from "${newPath}"`;
			});

			return { contents, loader: args.path.endsWith('.ts') ? 'ts' : 'js' };
		});
	},
};

export const isDevelopment = (outdir: string) => {
	return existsSync(path.join(outdir, '.development'));
};

export const createDevelopmentFile = (outdir: string) => {
	fs.mkdirSync(outdir, { recursive: true });
	const filePath = path.join(outdir, '.development');
	const content = `# GamanJS Development Mode\nCreated at: ${new Date().toISOString()}\n`;
	fs.writeFileSync(filePath, content, 'utf-8');
};

export const createProductionFile = (outdir: string) => {
	fs.mkdirSync(outdir, { recursive: true });
	const filePath = path.join(outdir, '.production');
	const content = `# GamanJS Production Mode\nCreated at: ${new Date().toISOString()}\n`;
	fs.writeFileSync(filePath, content, 'utf-8');
};

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
	const entryPoints = await fg(config.build?.includes || ['src/**/*.{ts,js}'], {
		ignore: config.build?.excludes || [
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
	const outdir = config.build?.outdir || 'dist';
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
