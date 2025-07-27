#!/usr/bin/env bun
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dev_1 = require("./command/dev");
const build_1 = require("./command/build");
const start_1 = require("./command/start");
const generate_1 = require("./command/key/generate");
const parse_1 = require("./utils/parse");
const block_1 = require("./command/make/block");
const integration_1 = require("./command/make/integration");
const middleware_1 = require("./command/make/middleware");
const textformat_1 = require("@gaman/core/utils/textformat");
// Daftar perintah yang tersedia
const commands = [
    dev_1.default,
    build_1.default,
    start_1.default,
    generate_1.default,
    block_1.default,
    integration_1.default,
    middleware_1.default,
];
// Parsing argumen CLI
const { command, args } = (0, parse_1.parseArgs)();
// Fungsi menampilkan bantuan
function showHelp() {
    console.log(textformat_1.TextFormat.format(`§l§bGaman CLI§r\n`));
    console.log(textformat_1.TextFormat.format(`§eUsage:\n  §r§a$ gaman <command> [options]\n`));
    console.log(textformat_1.TextFormat.format(`§eCommands:`));
    for (const cmd of commands) {
        const aliases = cmd.alias.length > 0 ? ` (alias: ${cmd.alias.join(', ')})` : '';
        console.log(textformat_1.TextFormat.format(` §b gaman ${cmd.name.padEnd(16)}§r ${cmd.description}${aliases ? ` §8${aliases}` : ''}`));
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
