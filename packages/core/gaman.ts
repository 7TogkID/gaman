import { GamanApp } from '@gaman/core/gaman-app';
import { loadEnv } from '@gaman/common/utils/load-env';
import * as path from 'path';
import * as fs from 'fs';

const ROUTE_DIRS = ['routes', 'router'];
const MIDDLEWARE_DIRS = ['middlewares', 'middleware'];

async function importDirIfExists(dirs: string[]) {
	for (const dirName of dirs) {
		const fullPath = path.join(process.cwd(), 'src', dirName);
		if (!fs.existsSync(fullPath)) continue;

		const files = fs.readdirSync(fullPath);
		for (const file of files) {
			if (file.endsWith('.ts') || file.endsWith('.js')) {
				const modulePath = path.join(fullPath, file);
				await import(modulePath);
			}
		}
	}
}

export async function defineBootstrap(cb: (app: GamanApp) => any) {
	loadEnv();
	let app = new GamanApp();

	// *** ROUTES ***
	await importDirIfExists(ROUTE_DIRS);
	// *** MIDDLEWARES ***
	await importDirIfExists(MIDDLEWARE_DIRS);

	cb(app);
}
