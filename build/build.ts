import { type Plugin, type PluginBuild, type BuildOptions, build } from 'esbuild';
import path from 'node:path';
import fs from 'node:fs';
import { glob } from 'glob';
import { exec } from 'child_process';
import { promisify } from 'util';

const entryPoints = glob.sync('./src/**/*.ts', {
	ignore: [],
});

/*
  This plugin is inspired by the following.
  https://github.com/evanw/esbuild/issues/622#issuecomment-769462611
*/
const addExtension = (extension: string = '.js', fileExtension: string = '.ts'): Plugin => ({
	name: 'add-extension',
	setup(build: PluginBuild) {
		build.onResolve({ filter: /.*/ }, (args) => {
			if (args.importer) {
				const p = path.join(args.resolveDir, args.path);
				let tsPath = `${p}${fileExtension}`;

				let importPath = '';
				if (fs.existsSync(tsPath)) {
					importPath = args.path + extension;
				} else {
					tsPath = path.join(args.resolveDir, args.path, `index${fileExtension}`);
					if (fs.existsSync(tsPath)) {
						if (args.path.endsWith('/')) {
							importPath = `${args.path}index${extension}`;
						} else {
							importPath = `${args.path}/index${extension}`;
						}
					}
				}
				return { path: importPath, external: true };
			}
		});
	},
});

const commonOptions: BuildOptions = {
	entryPoints,
	logLevel: 'info',
	platform: 'node',
};

const cjsBuild = () =>
	build({
		...commonOptions,
		outbase: './src',
		outdir: './dist/cjs',
		format: 'cjs',
	});

const esmBuild = () =>
	build({
		...commonOptions,
		bundle: true,
		outdir: './dist',
		format: 'esm',
		plugins: [addExtension('.js')],
	});

Promise.all([esmBuild(), cjsBuild()]);

const execAsync = promisify(exec);

try {
	await execAsync('npx tsc --emitDeclarationOnly --declaration --project tsconfig.build.json');
	await execAsync('npx tsc-alias');
} catch (err) {
	console.error('[build:error]', err);
}
