import { GamanConfig } from '@gaman/core/config/index.js';
import fs, { existsSync, rmSync } from 'fs';
import path from 'path';
import esbuild from 'esbuild';
import { Logger } from '@gaman/common/index.js';
import fg from 'fast-glob';
import { addJsExtensionPlugin } from './plugins/addJsExtensionPlugin.js';
import { createDevelopmentFile, createProductionFile } from './helper.js';
import { promisify } from 'util';
import { compressDistFiles } from './gzip-build.js';

const mkdir = promisify(fs.mkdir);
const copyFile = promisify(fs.copyFile);
const readdir = promisify(fs.readdir);

/**
 * ? Rekursif copy folder dan file
 */
async function copyRecursive(src: string, dest: string, verbose?: boolean) {
	const entries = await readdir(src, { withFileTypes: true });
	await mkdir(dest, { recursive: true });

	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);

		if (entry.isDirectory()) {
			await copyRecursive(srcPath, destPath, verbose);
		} else {
			await copyFile(srcPath, destPath);
			if (verbose) Logger.debug(`Copied: ${srcPath} → ${destPath}`);
		}
	}
}

/**
 * ? Copy folder public → dist/client
 */
async function copyPublicToClient(config: GamanConfig) {
	const staticDir = config.build?.staticdir || 'public';
	const srcDir = path.resolve(staticDir);
	const outDir = path.resolve(`${config.build?.outdir || 'dist'}/client/${staticDir}`);

	if (!existsSync(srcDir)) {
		Logger.warn('Folder "public" not found!, skip copy.');
		return;
	}

	await copyRecursive(srcDir, outDir, config.verbose);
	Logger.log(`Copied ${staticDir} → ${outDir}`);
}

/**
 * @ID
 * Ini untuk membuild semua file saat pertama kali `npm run dev` atau `npm run build`
 */
export const buildAll = async (
	config: GamanConfig,
	mode: 'development' | 'production',
) => {
	const outdir = config.build?.outdir || 'dist';
	const verbose = config.verbose;

	// ! Bersihkan folder sebelumnya
	if (existsSync(outdir)) {
		if (verbose) Logger.debug('Cleaning previous build...');
		rmSync(outdir, { recursive: true, force: true });
	}

	// ! Generate mode file .development or .production
	if (mode === 'development') {
		createDevelopmentFile(outdir);
		if (verbose) Logger.debug('Development file created.');
	} else {
		createProductionFile(outdir);
		if (verbose) Logger.debug('Production file created.');

		// ? Copy folder public → dist/client
		await copyPublicToClient(config);
		// ? compress file .js .html yang di dalam dist/client
		await compressDistFiles(config);
	}

	// ? Cari entry file
	if (verbose) Logger.debug('Searching entry points...');
	const entryPoints = await fg(config.build?.includes ?? ['src/**/*.{ts,js}'], {
		ignore: config.build?.excludes,
	});
	if (verbose) Logger.debug(`Found ${entryPoints.length} entry files`);

	// ? Build semua file secara paralel
	await Promise.all(
		entryPoints.map(async (file) => {
			try {
				await buildFile(file, config, mode);
			} catch (err) {
				Logger.error(`Build failed: ${file}`);
				if (verbose) console.error(err);
			}
		}),
	);
};

/**
 * @ID
 * Build satu file (dipakai di watcher dev)
 */
export const buildFile = async (
	file: string,
	config: GamanConfig,
	mode: 'development' | 'production',
) => {
	const outdir = `${config.build?.outdir}/server`;
	const rootdir = config.build?.rootdir || 'src';
	const relPath = path.relative(rootdir, file).replaceAll('\\', '/');
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
		sourcemap: mode === 'development',
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
