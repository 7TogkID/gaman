import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		exclude: ['**/node_modules/**', '**/dist/**', '**/.yalc/**'],
	},
	resolve: {
		alias: {
			'@gaman/core': path.resolve(__dirname, './packages/core'),
			'@gaman/common': path.resolve(__dirname, './packages/common'),
			'@gaman/cli': path.resolve(__dirname, './packages/cli'),
		},
	},
});
