import { defineConfig } from '@gaman/core';

export default defineConfig({
	build: {
		rootdir: 'src',
		outdir: 'dist',
		includes: ['src/**/*.{ts,js}'],
	},
});
