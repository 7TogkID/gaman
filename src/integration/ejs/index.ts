/**
 * @module
 * GamanJS integration for EJS view rendering.
 */
import { type Options } from "ejs";
import { join } from "path";
import { Priority } from "../../types";
import { defineIntegration } from "..";
import { Response } from "../../response";
import { Log } from "../../utils/logger";

let _ejs: typeof import("ejs");

async function loadEJS() {
  try {
    const njkModule = await import("ejs");
    _ejs = njkModule.default || njkModule;
  } catch (err: any) {
    Log.error("ejs is not installed.");
    Log.error("Please install it with: §l§fnpm install ejs§r");
    Log.error(
      "(Optional) if you use typescript: §l§fnpm install --save-dev @types/ejs§r"
    );
    process.exit(1);
  }
}

/**
 * EJS rendering options.
 * These options are passed directly to the EJS renderer.
 * You can find the full list of supported options at:
 * @url https://github.com/mde/ejs?tab=readme-ov-file#options
 */
export interface GamanEJSOptions extends Options {
  /**
   * Directory path for views.
   * This specifies the root directory where your EJS templates are located.
   * Default: `src/views`.
   */
  viewPath?: string;

  /**
   * Priority Integrations
   * @default normal
   */
  priority?: Priority;
}

export function ejs(ops: GamanEJSOptions = {}) {
  const { viewPath, ...ejsOps } = ops;
  return defineIntegration(() => ({
    name: "ejs",
    priority: ops.priority || "normal",
    async onLoad() {
      await loadEJS();
    },
    async onResponse(_ctx, res) {
      const renderData = res.renderData;
      if (renderData == null) return res; // ! next() if renderData null

      const filePath = join(
        process.cwd(),
        viewPath || "src/views",
        `${renderData.getName()}.ejs`
      );
      const rendered = await _ejs.renderFile(
        filePath,
        renderData.getData(),
        ejsOps
      );
      return Response.html(rendered, { status: 200 });
    },
  }));
}
