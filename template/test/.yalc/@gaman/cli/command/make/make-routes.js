import _path from 'path';
import fs from 'fs';
import { Command } from '../command';
import { parsePath } from '../../utils/parse';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { Log } from '@gaman/common/utils/logger';
import { SRC_DIR } from '@gaman/common/contants';
class MakeRoutes extends Command {
    constructor() {
        super('make:routes', 'Generate a routes template', 'gaman make:routes <name>', ['make:r']);
    }
    async execute(args) {
        let filePath = args._?.[0];
        if (!filePath) {
            Log.error(`usage: ${this.usage}`);
            return;
        }
        const { path, name } = parsePath(filePath);
        filePath = _path.join(process.cwd(), `src/module/${path}`, `${name}.routes.ts`);
        if (existsSync(filePath)) {
            Log.error(`Routes "${name}" already exists.`);
            return;
        }
        // ✅ Pastikan folder tujuan ada
        const dir = _path.dirname(filePath);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
        const template = `import { defineRoutes } from "@gaman/core/routes";

interface Deps {
	// place your dependencies or services
}

export default defineRoutes(({}: Deps) => ({
	'/': () => {
		return 'Hello, World!';
	},
}));
`;
        writeFileSync(filePath, template, { encoding: 'utf-8' });
        placeToArrayRoutesBlock(path);
        Log.info(`Created routes: ${filePath}`);
    }
}
function placeToArrayRoutesBlock(pathName) {
    const { path, name } = parsePath(pathName);
    try {
        let blockContent = fs.readFileSync(`${SRC_DIR}/module/${path}/${name}.block.ts`, 'utf-8');
        // jadinya: import mainBlock from "main/main.block.ts"
        const pathImport = `import ${name}Routes from "./${name}.routes.ts";`;
        // Tambahkan import jika belum ada
        if (!blockContent.includes(pathImport)) {
            blockContent = pathImport + '\n' + blockContent;
            Log.info(`Import for "${name}Routes" added`);
        }
        // Regex cari objek dalam gaman.serv({ ... })
        const configRegex = /defineBlock\s*\(\s*\{\s*([\s\S]*?)\}\s*\)/m;
        const match = blockContent.match(configRegex);
        if (match) {
            const fullMatch = match[0];
            const innerContent = match[1];
            const arrayRegex = new RegExp(`routes:\\s*\\[([^\\]]*)\\]`);
            let updatedInner = innerContent;
            if (arrayRegex.test(innerContent)) {
                updatedInner = innerContent.replace(arrayRegex, (_m, items) => {
                    const trimmed = items.trim();
                    const newItems = trimmed
                        ? `${trimmed}, ${name}Routes`
                        : `${name}Routes`;
                    return `routes: [${newItems}]`;
                });
                Log.info(`Added "${name}Routes" to existing blocks array`);
            }
            else {
                // Tambahkan properti baru ke dalam objek config
                updatedInner = `routes: [${name}Routes],\n  ${innerContent.trim()}\n`;
                Log.info(`Injected new routes array with "${name}Routes"`);
            }
            const updatedFull = fullMatch.replace(innerContent, updatedInner);
            blockContent = blockContent.replace(fullMatch, updatedFull);
            writeFileSync(`${SRC_DIR}/module/${path}/${name}.block.ts`, blockContent);
        }
        else {
            Log.warn(`Could not find defineBlock({ ... }) config`);
        }
    }
    catch (err) { }
}
export default new MakeRoutes();
