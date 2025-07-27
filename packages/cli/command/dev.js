"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevCommand = void 0;
const fs_1 = require("fs");
const child_process_1 = require("child_process");
const command_1 = require("./command");
function getEntryFile() {
    const candidates = ["src/main.ts", "src/main.js", "src/main.mjs"];
    return candidates.find((file) => (0, fs_1.existsSync)(file)) || "src/main.ts";
}
class DevCommand extends command_1.Command {
    constructor() {
        super("dev", "Run the application in development mode", "gaman dev", [
            "serve",
        ]);
    }
    async execute() {
        const entry = getEntryFile();
        (0, child_process_1.spawn)("npx", ["tsx", "watch", entry], {
            stdio: "inherit",
            shell: true,
        });
    }
}
exports.DevCommand = DevCommand;
exports.default = new DevCommand();
