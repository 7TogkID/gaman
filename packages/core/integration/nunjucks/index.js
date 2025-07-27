"use strict";
/**
 * @module
 * GamanJS integration for Nunjucks view rendering.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.nunjucks = nunjucks;
const path_1 = require("path");
const __1 = require("..");
const response_1 = require("../../response");
const logger_1 = require("../../utils/logger");
let njk;
async function loadNunjucks() {
    try {
        const njkModule = await Promise.resolve().then(() => require("nunjucks"));
        njk = njkModule;
    }
    catch (err) {
        logger_1.Log.error("Nunjucks is not installed.");
        logger_1.Log.error("Please install it with: §l§fnpm install nunjucks§r");
        logger_1.Log.error("(Optional) if you use typescript: §l§fnpm install --save-dev @types/nunjucks§r");
        process.exit(1);
    }
}
const defaultOps = {
    autoescape: true,
    watch: true,
    extension: ".njk",
};
function nunjucks(ops = {}) {
    const { viewPath = "src/views", ...njkOps } = { ...defaultOps, ...ops };
    let env;
    return (0, __1.defineIntegration)(() => ({
        name: "nunjucks",
        priority: ops.priority || "normal",
        async onLoad() {
            await loadNunjucks();
            // Init Nunjucks Environment
            env = njk.configure((0, path_1.join)(process.cwd(), viewPath), njkOps);
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
                    resolve(response_1.Response.html(html || "", { status: 200 }));
                });
            });
        },
    }));
}
