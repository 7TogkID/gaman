import { GamanApp } from '@gaman/core/gaman-app.js';
import { loadEnv } from '@gaman/common/utils/load-env.js';
import * as path from 'path';
import * as fs from 'fs';
import { pathToFileURL } from 'url';
import { getGamanConfig } from '@gaman/common';

const ROUTE_DIRS = ['routes', 'router'];
const MIDDLEWARE_DIRS = ['middlewares', 'middleware'];
const INTERCEPTOR_DIRS = ['interceptors', 'interceptor'];
const EXCEPTION_DIRS = ['exceptions', 'exception'];

function getProjectDir(dirName: string) {
	const baseDir = fs.existsSync(path.join(process.cwd(), 'dist'))
		? 'dist'
		: 'src';
	return path.join(process.cwd(), baseDir, dirName);
}

async function importDirIfExists(dirs: string[]) {
	for (const dirName of dirs) {
		const fullPath = getProjectDir(dirName);
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
	await importDirIfExists(config.build?.autoComposeDirs?.routes ?? ROUTE_DIRS);

	// *** MIDDLEWARES ***
	await importDirIfExists(config.build?.autoComposeDirs?.middlewares ?? MIDDLEWARE_DIRS);

	// *** INTERCEPTORS ***
	await importDirIfExists(config.build?.autoComposeDirs?.interceptors ?? INTERCEPTOR_DIRS);

	// *** EXCEPTIONS ***
	await importDirIfExists(config.build?.autoComposeDirs?.exceptions ?? EXCEPTION_DIRS);

	cb(app);
}
