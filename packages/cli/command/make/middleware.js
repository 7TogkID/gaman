"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _path = require("path");
const command_1 = require("../command");
const parse_1 = require("../../utils/parse");
const fs_1 = require("fs");
const logger_1 = require("@gaman/core/utils/logger");
class MakeBlock extends command_1.Command {
    constructor() {
        super("make:middleware", "Generate a middleware template", "gaman make:middleware <name>", ['make:midd']);
    }
    async execute(args) {
        let filePath = args._?.[0];
        if (!filePath) {
            logger_1.Log.error(`usage: ${this.usage}`);
            return;
        }
        const { path, name } = (0, parse_1.parsePath)(filePath);
        filePath = _path.join(process.cwd(), `src/middleware/${path}.middleware.ts`);
        if ((0, fs_1.existsSync)(filePath)) {
            logger_1.Log.error(`Middleware "${name}" already exists.`);
            return;
        }
        // ✅ Pastikan folder tujuan ada
        const dir = _path.dirname(filePath);
        if (!(0, fs_1.existsSync)(dir)) {
            (0, fs_1.mkdirSync)(dir, { recursive: true });
        }
        const template = `import { defineMiddleware } from "gaman/middleware";

export default defineMiddleware((ctx, next) => {
  return next();
});
`;
        (0, fs_1.writeFileSync)(filePath, template, { encoding: "utf-8" });
        logger_1.Log.info(`Created middleware: ${filePath}`);
    }
}
exports.default = new MakeBlock();
