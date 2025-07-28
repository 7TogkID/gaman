import _path from 'path';
import fs from 'fs';
import { Command } from '../command';
import { parsePath } from '../../utils/parse';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { Log } from '@gaman/common/utils/logger';
import { MAIN_BLOCK_PATH } from '@gaman/common/contants';

class MakeBlock extends Command {
	constructor() {
		super('make:block', 'Generate a block template', 'gaman make:block <name>', ['make:b']);
	}

	async execute(args: Record<string, any>): Promise<void> {
		let filePath = args._?.[0];
		if (!filePath) {
			Log.error(`usage: ${this.usage}`);
			return;
		}

		const { path, name } = parsePath(filePath);
		filePath = _path.join(
			process.cwd(),
			`src/module/${path}`,
			`${name}.block.ts`,
		);

		if (existsSync(filePath)) {
			Log.error(`Block "${name}" already exists.`);
			return;
		}

		// ✅ Pastikan folder tujuan ada
		const dir = _path.dirname(filePath);
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}

		const template = `import { defineBlock } from "@gaman/core/block";

export default defineBlock({
  path: "/${name}",
  routes: []
});
`;

		writeFileSync(filePath, template, { encoding: 'utf-8' });

		placeToArrayBlocks(path);

		Log.info(`Created block: ${filePath}`);
	}
}

function placeToArrayBlocks(pathName: string) {
	let mainBlockContent = fs.readFileSync(MAIN_BLOCK_PATH, 'utf-8');
	const { path, name } = parsePath(pathName);

	// jadinya: import mainBlock from "main/main.block.ts"
	const pathImport = `import ${name}Block from "./module/${path}/${name}.block.ts";`;

	// Tambahkan import jika belum ada
	if (!mainBlockContent.includes(pathImport)) {
		mainBlockContent = pathImport + '\n' + mainBlockContent;
		Log.info(`Import for "${name}Block" added`);
	}

	// Regex cari objek dalam gaman.serv({ ... })
	const configRegex = /defineBlock\s*\(\s*\{\s*([\s\S]*?)\}\s*\)/m;
	const match = mainBlockContent.match(configRegex);

	if (match) {
		const fullMatch = match[0];
		const innerContent = match[1];

		const arrayRegex = new RegExp(`blocks:\\s*\\[([^\\]]*)\\]`);
		let updatedInner = innerContent;

		if (arrayRegex.test(innerContent)) {
			updatedInner = innerContent.replace(arrayRegex, (_m, items) => {
				const trimmed = items.trim();
				const newItems = trimmed
					? `${trimmed}, ${name}Block`
					: `${name}Block`;
				return `blocks: [${newItems}]`;
			});

			Log.info(`Added "${name}Block" to existing blocks array`);
		} else {
			// Tambahkan properti baru ke dalam objek config
			updatedInner = `blocks: [${name}Block],\n  ${innerContent.trim()}\n`;
			Log.info(`Injected new blocks array with "${name}Block"`);
		}

		const updatedFull = fullMatch.replace(innerContent, updatedInner);
		mainBlockContent = mainBlockContent.replace(fullMatch, updatedFull);
		writeFileSync(MAIN_BLOCK_PATH, mainBlockContent);
	} else {
		Log.warn(`Could not find defineBlock({ ... }) config`);
	}
}

export default new MakeBlock();
