import _path from "path";
import { Command } from "../command";
import { parsePath } from "../../utils/parse";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { placeModuleToMainFile } from "../../utils/place";
import { Log } from "../../../utils/logger";

class MakeIntegration extends Command {
  constructor() {
    super("make:integration", "Generate a integration template", "gaman make:integration <name>", ['make:int']);
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
      `src/integration/${path}.integration.ts`
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

    const template = `import { defineIntegration } from "gaman/integration";

export default defineIntegration({
  name: "${name}",
  priority: "normal",
  onLoad: (app) => {},
  onDisabled: (app) => {},
  onRequest: (app, ctx) => ({}),
  onResponse: (app, ctx, res) => res 
});
`;

    writeFileSync(filePath, template, { encoding: "utf-8" });

    placeModuleToMainFile(path, "Integration");

    Log.info(`Created integration: ${filePath}`);
  }
}

export default new MakeIntegration();
