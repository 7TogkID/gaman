import { existsSync, unlinkSync } from 'fs';
import { spawn, ChildProcess } from 'child_process';
import { Logger } from '@gaman/common/utils/logger.js';
import chokidar from 'chokidar';
import path from 'path';
import { getGamanConfig } from '@gaman/common/index.js';
import { buildAll, buildFile } from '../builder/index.js';
import { buildReactViews } from '../builder/react-builder.js';

export async function run_dev(): Promise<void> {
	const config = await getGamanConfig();
	const outdir = `${config.build?.outdir}/server`;
	const verbose = config.verbose;
	const rootdir = config.build?.rootdir || 'src';
	const entryFile = path.join(outdir, 'index.js');

	// ? awal awal build semua file
	await buildAll(config, 'development');

	let child: ChildProcess | null = null;
	const restart = () => {
		if (child) {
			Logger.log('Restarting application...');
			child.kill();
		}

		const devIndex = process.argv.indexOf('dev');
		const extraArgs = devIndex >= 0 ? process.argv.slice(devIndex + 1) : [];
		child = spawn(process.execPath, [entryFile, ...extraArgs], {
			stdio: 'inherit',
			env: process.env,
		});
	};

	restart();

	let changeTimeout: NodeJS.Timeout | null = null;
	chokidar
		.watch([rootdir, 'gaman.config.mjs', '.env'], {
			ignored: config?.build?.excludes,
		})
		.on('add', async (file) => {
			if (/\.(ts|js|jsx|tsx)$/.test(file)) {
				if (verbose) Logger.debug(`New file: ${file}`);
				if (file.endsWith('.jsx') || file.endsWith('.tsx')) {
					try {
						await buildReactViews(config, 'development');
					} catch (err) {
						Logger.error(`Client View build failed: ${file}`);
						console.error(err);
					}
				} else {
					try {
						await buildFile(file, config, 'development');
					} catch (err) {
						Logger.error(`Build failed: ${file}`);
						console.error(err);
					}
				}
			}
		})
		.on('change', (file) => {
			if (/\.(ts|js|jsx|tsx)$/.test(file)) {
				if (changeTimeout) clearTimeout(changeTimeout);
				changeTimeout = setTimeout(async () => {
					if (verbose) Logger.debug(`Changed: ${file}`);
					if (file.endsWith('.jsx') || file.endsWith('.tsx')) {
						try {
							await buildReactViews(config, 'development');
							restart();
						} catch (err) {
							Logger.error(`Client View build failed: ${file}`);
							console.error(err);
						}
					} else {
						try {
							await buildFile(file, config, 'development');
							restart();
						} catch (err) {
							Logger.error(`Build failed: ${file}`);
							console.error(err);
						}
					}
				}, 100); // tunggu 100ms
			}
		})
		.on('unlink', async (file) => {
			const relPath = path.relative(rootdir, file);
			const outBase = path.join(outdir, relPath).replace(/\.(ts|js)$/, '');
			const filesToRemove = [
				outBase + '.js',
				outBase + '.js.map',
				outBase + '.d.ts',
			];

			filesToRemove.forEach((f) => {
				if (existsSync(f)) {
					unlinkSync(f);
					if (verbose) Logger.debug(`Removed: ${f}`);
				}
			});

			restart();
		});
}
