import { createBrotliCompress, createGzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';
import fs from 'fs';
import { glob } from 'glob';
import path from 'node:path';
import { GamanConfig } from '@gaman/core';

const compressFile = async (inputPath: string) => {
	const gzipPath = `${inputPath}.gz`;
	const brPath = `${inputPath}.br`;

	await Promise.all([
		pipeline(
			fs.createReadStream(inputPath),
			createGzip(),
			fs.createWriteStream(gzipPath),
		),
		pipeline(
			fs.createReadStream(inputPath),
			createBrotliCompress(),
			fs.createWriteStream(brPath),
		),
	]);
};

const exts = ['.js', '.mjs', '.css', '.html', '.json', '.svg', '.xml', '.txt'];

/**
 * @ID Compress semua file yang ada di folder dist/client seperti .js jadi .js.br atau .gzip
 * @param config
 */
export const compressDistFiles = async (config: GamanConfig) => {
	const files = glob.sync(`./${config.build?.outdir || 'dist'}/client/**/*.*`, {
		ignore: ['**/*.gz', '**/*.br'],
	});
	for (const file of files) {
		if (exts.includes(path.extname(file))) {
			await compressFile(file);
			console.log(`Compressed: ${file}`);
		}
	}
};
