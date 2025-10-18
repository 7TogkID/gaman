import { Plugin } from 'esbuild';
import path from 'path';
import fs from 'fs';

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
