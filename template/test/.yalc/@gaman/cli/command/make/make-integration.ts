import * as _path from 'path';
import fs from 'fs';
import { Command } from '../command';
import { parsePath } from '../../utils/parse';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { Log } from '@gaman/common/utils/logger';
import { INDEX_PATH } from '@gaman/common/contants';

class MakeIntegration extends Command {
	constructor() {
		super(
			'make:integration',
			'Generate a integration template',
			'gaman make:integration <name>',
			['make:i'],
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
			`src/integration/${path}.integration.ts`,
		);

		if (existsSync(filePath)) {
			Log.error(`Integration "${name}" already exists.`);
			return;
		}

		// ✅ Pastikan folder tujuan ada
		const dir = _path.dirname(filePath);
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}

		const template = `import { defineIntegration } from "@gaman/core/integration";

export default defineIntegration((app) => ({
	name: '${name}',
	priority: 'normal',
	onLoad: () => {
		Log.info('Integration loaded...');
	},
}));
`;

		writeFileSync(filePath, template, { encoding: 'utf-8' });

    placeIntegrationToMainFile(path)


		Log.info(`Created integration: ${filePath}`);
	}
}

function placeIntegrationToMainFile(pathName: string) {
	const mainContent = fs.readFileSync(INDEX_PATH, 'utf-8');
	const { path, name } = parsePath(pathName);

	const importLine = `import ${name}Integration from "./integration/${path}.integration";`;

	let updated = mainContent;

	// Tambahkan import jika belum ada
	if (!updated.includes(importLine)) {
		updated = importLine + '\n' + updated;
		Log.info(`Added import: ${name}Integration`);
	}

	// Sisipkan pemanggilan registerIntegration setelah defineBootstrap(..., async (app) => {
	const bootstrapRegex =
		/defineBootstrap\([^,]+,\s*async\s*\(\s*app\s*\)\s*=>\s*\{\s*/;
	const match = updated.match(bootstrapRegex);
	if (match) {
		const insertAt = match.index! + match[0].length;
		const registerLine = `app.registerIntegration(${name}Integration);\n  `;

		// Cek apakah sudah pernah didaftarkan
		if (!updated.includes(`app.registerIntegration(${name}Integration)`)) {
			updated =
				updated.slice(0, insertAt) + registerLine + updated.slice(insertAt);
			Log.info(`Registered integration: ${name}Integration`);

			fs.writeFileSync(INDEX_PATH, updated, 'utf-8');
		} else {
			Log.warn(`Integration ${name} already registered`);
		}
	} else {
		Log.warn('Could not find defineBootstrap(...) block');
	}
}

export default new MakeIntegration();
