import _path from 'path';
import fs from 'fs';
import { Command } from '../command';
import { parsePath } from '../../utils/parse';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { Log } from '@gaman/common/utils/logger';
import { MAIN_BLOCK_PATH, SRC_DIR } from '@gaman/common/contants';

class MakeBlock extends Command {
	constructor() {
		super(
			'make:block',
			'Generate a block template',
			'gaman make:block <name>',
			['make:b'],
		);
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
	const { path, dirPath, name } = parsePath(pathName);

	/**
	 * Berfungsi untuk naruh import ke module / block
	 * 
	 * @example
	 * ```ts
	 * import { userBlock } from "./module/user/user.block.ts"
	 * ```
	 */
	let importStatement: string;
	
	/**
	 * parent Block Content
	 * semisal dia "user/admin/role"
	 * berarti parent nya "admin.block.ts"
	 * 
	 * semisal dia "user" aja
	 * berarti parent nya "main.block.ts" (block utama)
	 */
	let parentBlockContent: string;

	/**
	 * parent block path
	 * ya lokasi file parent path nya itu dimana
	 * 
	 * semisal dia "user/admin/role"
	 * berarti parent path nya "src/module/user/admin/admin.block.ts"
	 * 
	 * semisal dia "user" aja
	 * berarti parent nya "src/main.block.ts"
	 */
	let parentBlockPath: string;
	try {
		parentBlockPath = `${SRC_DIR}/module/${dirPath}/${dirPath
			.split('/')
			.pop()}.block.ts`;
		parentBlockContent = fs.readFileSync(parentBlockPath, 'utf-8');
		importStatement = `import ${name}Block from "./${name}/${name}.block.ts";`;
	} catch (e) {
		parentBlockPath = MAIN_BLOCK_PATH;
		parentBlockContent = fs.readFileSync(MAIN_BLOCK_PATH, 'utf-8');
		importStatement = `import ${name}Block from "./module/${path}/${name}.block.ts";`;
	}

	// Tambahkan import kalau belum ada
	if (!parentBlockContent.includes(importStatement)) {
		parentBlockContent = importStatement + '\n' + parentBlockContent;
		Log.info(`Import for "${name}Block" added`);
	}

	// Temukan definisi defineBlock({ ... }) secara kasar
	const defineStart = parentBlockContent.indexOf('defineBlock({');
	const defineEnd = parentBlockContent.lastIndexOf('})');

	if (defineStart === -1 || defineEnd === -1) {
		Log.warn(`Could not find full defineBlock({ ... }) config`);
		return;
	}

	const before = parentBlockContent.slice(0, defineStart);
	const defineContent = parentBlockContent.slice(defineStart, defineEnd + 2); // +2 to include '})'
	const after = parentBlockContent.slice(defineEnd + 2);

	// Kumpulkan semua includes: [...] dari defineContent
	const includesRegex = /includes\s*:\s*\[([\s\S]*?)\],?/g;
	const existingItems = new Set<string>();

	let match;
	while ((match = includesRegex.exec(defineContent))) {
		const items = match[1]
			.split(',')
			.map((x) => x.trim())
			.filter(Boolean);
		for (const item of items) {
			existingItems.add(item);
		}
	}

	existingItems.add(`${name}Block`);

	// Hapus semua includes lama
	let cleanedContent = defineContent.replace(includesRegex, '').trim();

	// Sisipkan includes baru setelah `defineBlock({`
	const insertAt = cleanedContent.indexOf('{') + 1;
	const newIncludesLine = `\n  includes: [${[...existingItems].join(', ')}],`;

	const finalContent =
		'defineBlock({' + newIncludesLine + cleanedContent.slice(insertAt);

	// Gabungkan kembali
	const newFileContent = before + finalContent + after;

	fs.writeFileSync(parentBlockPath, newFileContent);
	Log.info(`Merged and rewrote includes in main block with "${name}Block"`);
}

export default new MakeBlock();
