#!/usr/bin/env tsx
import dev from './command/dev';
import build from './command/build';
import start from './command/start';
import generateKey from './command/key/generate';
import { parseArgs } from './utils/parse';
import makeBlock from './command/make/make-block';
import makeIntegration from './command/make/make-integration';
import makeMiddleware from './command/make/make-middleware';
import makeRoutes from './command/make/make-routes';
import { TextFormat } from '@gaman/common/utils/textformat';
import makeService from './command/make/make-service';
// Daftar perintah yang tersedia
const commands = [
    dev,
    build,
    start,
    generateKey,
    makeBlock,
    makeRoutes,
    makeService,
    makeIntegration,
    makeMiddleware,
];
// Parsing argumen CLI
const { command, args } = parseArgs();
// Fungsi menampilkan bantuan
function showHelp() {
    console.log(TextFormat.format(`§l§bGaman CLI§r\n`));
    console.log(TextFormat.format(`§eUsage:\n  §r§a$ gaman <command> [options]\n`));
    console.log(TextFormat.format(`§eCommands:`));
    for (const cmd of commands) {
        const aliases = cmd.alias.length > 0 ? ` (alias: ${cmd.alias.join(', ')})` : '';
        console.log(TextFormat.format(` §b gaman ${cmd.name.padEnd(16)}§r ${cmd.description}${aliases ? ` §8${aliases}` : ''}`));
    }
    console.log();
}
(async () => {
    if (!command || command === 'help' || args.help || args.h) {
        showHelp();
        return;
    }
    const matched = commands.find((cmd) => [cmd.name, ...cmd.alias].includes(command));
    if (matched) {
        await matched.execute(args);
    }
    else {
        console.error(`Unknown command: ${command}`);
        showHelp();
    }
})();
