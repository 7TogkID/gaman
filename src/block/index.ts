import path from 'path';
import type { AppConfig, IBlock } from '../types';
import { globSync } from 'glob';
import { pathToFileURL } from 'url';

export async function defineBlock<A extends AppConfig>(block: IBlock<A>): Promise<IBlock<A>> {
	const err = new Error();
	const stack = err.stack;

	let callerPath: string | undefined;

	console.log('[defineBlock] Mencoba mencari caller path dari stack trace...');
	if (stack) {
		const lines = stack.split('\n');

		for (const line of lines) {
			console.log('[defineBlock] Cek stack line:', line.trim());

			if (line.includes('node_modules')) {
				console.log('[defineBlock] Abaikan karena dari node_modules');
				continue;
			}

			const match = line.match(/\s+at\s(?:.*\()?(.+?\.(?:ts|js)):\d+:\d+\)?/);
			if (match) {
				callerPath = match[1];
				console.log('[defineBlock] Ketemu callerPath:', callerPath);
				break;
			}
		}
	} else {
		console.warn('[defineBlock] Tidak ada stack trace!');
	}

	if (callerPath) {
		const blockDir = path.dirname(callerPath);
		const blockName = path.basename(callerPath).split('.')[0];

		console.log('[defineBlock] blockDir:', blockDir);
		console.log('[defineBlock] blockName:', blockName);

		const routeFile = globSync(`${blockName}.tree.{ts,js}`, {
			cwd: blockDir,
			absolute: true,
		})[0];

		console.log('[defineBlock] Hasil pencarian routeFile:', routeFile || 'Tidak ditemukan');

		if (routeFile) {
			const mod = await import(pathToFileURL(routeFile).href);
			const modRoutes = mod.default || mod.routes || [];

			console.log('[defineBlock] routes yang dimuat:', modRoutes);

			block.routes = {
				...modRoutes,
				...(block.routes || {}),
			};
		}
	} else {
		console.warn('[defineBlock] callerPath tidak ditemukan. Lewati pemuatan .tree.ts');
	}

	return block;
}
