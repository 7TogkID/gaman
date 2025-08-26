import { GamanApp } from '@gaman/core/gaman-app';
import { loadEnv } from '@gaman/common/utils/load-env';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const ROUTE_DIRS = ['routes', 'router'];
const MIDDLEWARE_DIRS = ['middlewares', 'middleware'];

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
