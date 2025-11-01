import { GamanConfig } from '@gaman/core';
import path from 'path';
import fs from 'fs/promises';
import fg from 'fast-glob';
import esbuild from 'esbuild';
import { Logger } from '@gaman/common';

/**
 * Plugin React Mount — auto import React, ReactDOM and mount to #root
 */
const pluginReactMount = () => ({
	name: 'gaman:react-mount',
	setup(build) {
		build.onLoad({ filter: /\.(t|j)sx$/ }, async (args) => {
			const source = await fs.readFile(args.path, 'utf8');
			const filename = path.basename(args.path);

			const injected = `
import * as React from "react";
import * as ReactDOM from "react-dom/client";

${source}

if (typeof document !== "undefined") {
  const root = document.getElementById("root");
  if (!root) throw new Error("No root element found for ${filename}");
  
	// ambil properti dari server gaman
	const props = window.__GAMAN_DATA__ || {};

  // ambil komponen default dari modul ini (ESM)
  import("${path.resolve(args.path)}").then((mod) => {
    const Component = mod.default || mod;
    ReactDOM.createRoot(root).render(React.createElement(Component, props));
  });
}
`;

			return {
				contents: injected,
				loader: 'tsx',
			};
		});
	},
});

/**
 * Builder utama untuk semua React views
 */
export const buildReactViews = async (
	config: GamanConfig,
	mode: 'development' | 'production',
) => {
	const viewsDir = config.build?.viewsdir || 'src/views';
	const outViewsDir = path.join(
		config.build?.outdir || 'dist',
		'client/_gaman/views',
	);

	await fs.mkdir(outViewsDir, { recursive: true });
	const files = await fg([`${viewsDir}/**/*.{tsx,jsx}`]);

	if (config.verbose)
		Logger.debug(`Found ${files.length} React views to build`);

	await Promise.all(
		files.map(async (file) => {
			const relPath = path.relative(viewsDir, file).replace(/\\/g, '/');
			const outFile = path
				.join(outViewsDir, relPath)
				.replace(/\.(tsx|jsx)$/, '.js');
			await fs.mkdir(path.dirname(outFile), { recursive: true });

			await esbuild.build({
				entryPoints: [file],
				bundle: true,
				platform: 'browser',
				target: 'esnext',
				format: 'esm',
				packages: 'bundle',
				sourcemap: mode === 'development',
				minify: mode === 'production',
				jsx: 'automatic',
				outfile: outFile,
				define: {
					'process.env.NODE_ENV': `"${mode}"`,
				},
				plugins: [pluginReactMount()],
				banner: {
					js: `
/*!
 * GamanJS View Build
 * ──────────────────────────────────────────────
 * File: ${path.basename(file)}
 * Built: ${new Date().toISOString()}
 * Mode: ${mode}
 * Framework: GamanJS
 * https://github.com/GamanJS/gaman
 */
`,
				},
			});
			if (config.verbose) Logger.debug(`Built view → ${outFile}`);
		}),
	);
};
