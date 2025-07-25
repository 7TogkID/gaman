import _path from "path";
import { Command } from "../command";
import { parsePath } from "../../utils/parse";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { Log } from "../../../utils/logger";

class MakeBlock extends Command {
  constructor() {
    super("make:middleware", "Generate a middleware template", "gaman make:middleware <name>", ['make:midd']);
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
      `src/middleware/${path}.middleware.ts`
    );

    if (existsSync(filePath)) {
      Log.error(`Middleware "${name}" already exists.`);
      return;
    }

    // ✅ Pastikan folder tujuan ada
    const dir = _path.dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const template = `import { defineMiddleware } from "gaman/middleware";

export default defineMiddleware((ctx, next) => {
  return next();
});
`;

    writeFileSync(filePath, template, { encoding: "utf-8" });

    Log.info(`Created middleware: ${filePath}`);
  }
}

export default new MakeBlock();
