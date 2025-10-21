import { GamanApp } from '@gaman/core/gaman-app.js';
import { loadEnv } from '@gaman/common/utils/load-env.js';
import * as path from 'path';
import * as fs from 'fs';
import { pathToFileURL } from 'url';
import { getGamanConfig } from '@gaman/common';
import { GamanConfig } from './config/index.js';

const ROUTE_DIRS = ['routes', 'router'];
const MIDDLEWARE_DIRS = ['middlewares', 'middleware'];
const INTERCEPTOR_DIRS = ['interceptors', 'interceptor'];
const EXCEPTION_DIRS = ['exceptions', 'exception'];

function getProjectDir(config: GamanConfig, dirName: string) {
	const baseDir = path.join(config.build?.outdir || 'dist', 'server');
	return path.join(process.cwd(), baseDir, dirName);
}

async function importDirIfExists(config: GamanConfig, dirs: string[]) {
	for (const dirName of dirs) {
		const fullPath = getProjectDir(config, dirName);
		if (!fs.existsSync(fullPath)) continue;

		const files = fs.readdirSync(fullPath);
		for (const file of files) {
			if (
				file.endsWith('.ts') ||
				file.endsWith('.js') ||
				file.endsWith('.mjs')
			) {
				const modulePath = path.join(fullPath, file);
				// ? Konversi path Windows jadi URL valid
				await import(pathToFileURL(modulePath).href);
			}
		}
	}
}

export async function defineBootstrap(cb: (app: GamanApp) => any) {
	loadEnv();
	const app = new GamanApp();
	const config = await getGamanConfig();

	// *** ROUTES ***
	await importDirIfExists(config, ROUTE_DIRS);

	// *** MIDDLEWARES ***
	await importDirIfExists(config, MIDDLEWARE_DIRS);

	// *** INTERCEPTORS ***
	await importDirIfExists(config, INTERCEPTOR_DIRS);

	// *** EXCEPTIONS ***
	await importDirIfExists(config, EXCEPTION_DIRS);

	cb(app);
}
