import esbuild from 'esbuild';
import fg from 'fast-glob';
import { writeFileSync, readdirSync, readFileSync, existsSync, rmSync } from 'fs';
import { Logger } from '../../utils';
import { join } from 'path';

export default async function build() {
	const distDir = 'dist';
	if (existsSync(distDir)) {
		Logger.log('Cleaning previous build...');
		rmSync(distDir, { recursive: true, force: true });
	}

	Logger.log('Searching entry points...');

	const entryPoints = await fg(['src/**/*.{ts,js}'], {
		ignore: ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.d.*'],
	});
	Logger.log(`Found ${entryPoints.length} entry files`);

	const start = Date.now();

	await esbuild.build({
		entryPoints,
		outdir: 'dist/output',
		bundle: true,
		format: 'esm',
		platform: 'node',
		target: 'node18',
		// tsconfig: "./tsconfig.json",
		minify: true,
		sourcemap: false,
		legalComments: 'none',
		packages: 'external',
		entryNames: '[hash]',
		plugins: [
			{
				name: 'gaman-build-log',
				setup(build) {
					build.onLoad({ filter: /\.(ts|js)$/ }, async (args) => {
						Logger.log(`✔ Loaded: ${args.path}`);
						return null; // biarkan esbuild lanjut
					});
					build.onStart(() => {
						Logger.log('Build started...');
					});
					build.onEnd(() => {
						Logger.log('Build output done. Reading output files...');

						const distOutputDir = 'dist/output';
						const files = readdirSync(distOutputDir).filter((f) => f.endsWith('.js'));

						const mainFile = files.find((file) => {
							const content = readFileSync(join(distOutputDir, file), 'utf8');
							return /\bserv\s*\(/.test(content) || /blocks\s*:\s*\[/.test(content);
						});

						if (!mainFile) {
							Logger.error('Failed to find bundled main file.');
							process.exit(1);
						}

						Logger.log(`Main file detected: ${mainFile}`);
						Logger.log('Generating entry.mjs...');

						const entryCode = `import "./output/${mainFile}";\n`;
						writeFileSync(join(distDir, 'entry.mjs'), entryCode);

						Logger.log('entry.mjs generated successfully.');

						Logger.log(`Build finished in ${Date.now() - start}ms`);
					});
				},
			},
		],
	});
}
