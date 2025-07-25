import _path from "path";
import { Command } from "../command";
import { parsePath } from "../../utils/parse";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { placeModuleToMainFile } from "../../utils/place";
import { Log } from "../../../utils/logger";

class MakeBlock extends Command {
  constructor() {
    super("make:block", "Generate a block template", "gaman make:block <name>");
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
      `${name}.block.ts`
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

    writeFileSync(filePath, template, { encoding: "utf-8" });

    placeModuleToMainFile(path, "Block");

    Log.info(`Created block: ${filePath}`);
  }
}

export default new MakeBlock();
