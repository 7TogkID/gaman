import * as path from 'path';
import { writeFileSync } from 'fs';
import * as fs from 'fs';
import { parsePath } from './parse';
import { Log } from '@gaman/core/utils/logger';
const SRC_DIR = 'src';
const MAIN_FILE = path.join(SRC_DIR, 'main.ts');
export function placeModuleToMainFile(pathName, type) {
    let mainContent = fs.readFileSync(MAIN_FILE, 'utf-8');
    const { path, name } = parsePath(pathName);
    const types = type.toLowerCase() + 's';
    // jadinya: import mainBlock from "main/main.block.ts"
    const pathImport = type == 'Block'
        ? `import ${name}${type} from "./module/${path}/${name}.block.ts";`
        : `import ${name}${type} from "./integration/${path}.integration.ts";`;
    // Tambahkan import jika belum ada
    if (!mainContent.includes(pathImport)) {
        mainContent = pathImport + '\n' + mainContent;
        Log.info(`Import for "${name}${type}" added`);
    }
    // Regex cari objek dalam gaman.serv({ ... })
    const configRegex = /gaman\.serv\s*\(\s*\{\s*([\s\S]*?)\}\s*\)/m;
    const match = mainContent.match(configRegex);
    if (match) {
        const fullMatch = match[0];
        const innerContent = match[1];
        const arrayRegex = new RegExp(`${types}:\\s*\\[([^\\]]*)\\]`);
        let updatedInner = innerContent;
        if (arrayRegex.test(innerContent)) {
            updatedInner = innerContent.replace(arrayRegex, (_m, items) => {
                const trimmed = items.trim();
                const newItems = trimmed
                    ? `${trimmed}, ${name}${type}`
                    : `${name}${type}`;
                return `${types}: [${newItems}]`;
            });
            Log.info(`Added "${name}${type}" to existing ${types} array`);
        }
        else {
            // Tambahkan properti baru ke dalam objek config
            updatedInner = `${types}: [${name}${type}],\n  ${innerContent.trim()}\n`;
            Log.info(`Injected new ${types} array with "${name}${type}"`);
        }
        const updatedFull = fullMatch.replace(innerContent, updatedInner);
        mainContent = mainContent.replace(fullMatch, updatedFull);
        writeFileSync(MAIN_FILE, mainContent);
    }
    else {
        Log.warn(`Could not find gaman.serv({ ... }) config`);
    }
}
