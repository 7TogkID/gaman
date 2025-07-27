"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _path = require("path");
const command_1 = require("../command");
const parse_1 = require("../../utils/parse");
const fs_1 = require("fs");
const place_1 = require("../../utils/place");
const logger_1 = require("@gaman/core/utils/logger");
class MakeBlock extends command_1.Command {
    constructor() {
        super("make:block", "Generate a block template", "gaman make:block <name>");
    }
    async execute(args) {
        let filePath = args._?.[0];
        if (!filePath) {
            logger_1.Log.error(`usage: ${this.usage}`);
            return;
        }
        const { path, name } = (0, parse_1.parsePath)(filePath);
        filePath = _path.join(process.cwd(), `src/module/${path}`, `${name}.block.ts`);
        if ((0, fs_1.existsSync)(filePath)) {
            logger_1.Log.error(`Block "${name}" already exists.`);
            return;
        }
        // ✅ Pastikan folder tujuan ada
        const dir = _path.dirname(filePath);
        if (!(0, fs_1.existsSync)(dir)) {
            (0, fs_1.mkdirSync)(dir, { recursive: true });
        }
        const template = `import { defineBlock } from "gaman/block";

export default defineBlock({
  path: "/${name}",
  routes: {
    "/": {
      GET: () => r.text("${name} block works!"),
    },
  },
});
`;
        (0, fs_1.writeFileSync)(filePath, template, { encoding: "utf-8" });
        (0, place_1.placeModuleToMainFile)(path, "Block");
        logger_1.Log.info(`Created block: ${filePath}`);
    }
}
exports.default = new MakeBlock();
