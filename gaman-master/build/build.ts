import { type Plugin, type PluginBuild, type BuildOptions, build } from 'esbuild';
import path from 'node:path';
import fs from 'node:fs';
import { glob } from 'glob';

// Resolve all .ts files (except tests)
const entryPoints = glob.sync('./src/**/*.ts', { ignore: ['./src/**/*.test.*'] });

/**
 * Plugin to add file extensions (.js) in ESM builds.
 */
const addExtension = (
  extension: string = '.js',
  fileExtension: string = '.ts'
): Plugin => ({
  name: 'add-extension',
  setup(build: PluginBuild) {
    build.onResolve({ filter: /.*/ }, (args) => {
      if (!args.importer) return;

      const basePath = path.join(args.resolveDir, args.path);
      const directTsFile = `${basePath}${fileExtension}`;
      const indexTsFile = path.join(args.resolveDir, args.path, `index${fileExtension}`);

      if (fs.existsSync(directTsFile)) {
        return { path: `${args.path}${extension}`, external: true };
      }

      if (fs.existsSync(indexTsFile)) {
        const importPath = args.path.endsWith('/')
          ? `${args.path}index${extension}`
          : `${args.path}/index${extension}`;
        return { path: importPath, external: true };
      }
    });
  },
});

const createBuildOptions = (overrides: Partial<BuildOptions>): BuildOptions => ({
  entryPoints,
  logLevel: 'info',
  platform: 'node',
  ...overrides,
});

const buildCJS = () =>
  build(
    createBuildOptions({
      outbase: './src',
      outdir: './dist/cjs',
      format: 'cjs',
    })
  );

const buildESM = () =>
  build(
    createBuildOptions({
      bundle: true,
      outdir: './dist',
      format: 'esm',
      plugins: [addExtension('.js')],
    })
  );

async function runBuilds() {
  await Promise.all([buildESM(), buildCJS()]);
  console.log('Build complete v:');
}

runBuilds();
