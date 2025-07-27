/**
 * @module
 * GamanJS integration for Nunjucks view rendering.
 */
import { join } from "path";
import { defineIntegration } from "..";
import { Response } from "../../response";
import { Log } from "../../utils/logger";
let njk;
async function loadNunjucks() {
    try {
        const njkModule = await import("nunjucks");
        njk = njkModule;
    }
    catch (err) {
        Log.error("Nunjucks is not installed.");
        Log.error("Please install it with: §l§fnpm install nunjucks§r");
        Log.error("(Optional) if you use typescript: §l§fnpm install --save-dev @types/nunjucks§r");
        process.exit(1);
    }
}
const defaultOps = {
    autoescape: true,
    watch: true,
    extension: ".njk",
};
export function nunjucks(ops = {}) {
    const { viewPath = "src/views", ...njkOps } = { ...defaultOps, ...ops };
    let env;
    return defineIntegration(() => ({
        name: "nunjucks",
        priority: ops.priority || "normal",
        async onLoad() {
            await loadNunjucks();
            // Init Nunjucks Environment
            env = njk.configure(join(process.cwd(), viewPath), njkOps);
            if (njkOps.env) {
                if (Array.isArray(njkOps.env)) {
                    for (const fn of njkOps.env) {
                        fn(env);
                    }
                }
                else {
                    njkOps.env(env);
                }
            }
        },
        async onResponse(_ctx, res) {
            const renderData = res.renderData;
            if (renderData == null)
                return res;
            const pathname = renderData.getName().includes(".")
                ? renderData.getName()
                : `${renderData.getName()}${njkOps.extension}`;
            return new Promise((resolve, reject) => {
                env.render(pathname, renderData.getData(), (err, html) => {
                    if (err)
                        return reject(err);
                    resolve(Response.html(html || "", { status: 200 }));
                });
            });
        },
    }));
}
