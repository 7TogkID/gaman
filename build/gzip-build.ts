import { createBrotliCompress, createGzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';
import fs from 'fs';
import { glob } from 'glob';
import path from 'node:path';

const compressFile = async (inputPath: string) => {
	const gzipPath = `${inputPath}.gz`;
	const brPath = `${inputPath}.br`;

	await Promise.all([
		pipeline(fs.createReadStream(inputPath), createGzip(), fs.createWriteStream(gzipPath)),
		pipeline(fs.createReadStream(inputPath), createBrotliCompress(), fs.createWriteStream(brPath)),
	]);
};

const compressDistFiles = async () => {
	const exts = ['.js', '.css', '.html', '.json'];
	const files = glob.sync('./dist/**/*.*', {
		ignore: ['**/*.gz', '**/*.br'],
	});
	for (const file of files) {
		if (exts.includes(path.extname(file))) {
			await compressFile(file);
			console.log(`Compressed: ${file}`);
		}
	}
};

await compressDistFiles();
