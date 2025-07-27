"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ejs = ejs;
const path_1 = require("path");
const __1 = require("..");
const response_1 = require("../../response");
const logger_1 = require("../../utils/logger");
let _ejs;
async function loadEJS() {
    try {
        const njkModule = await Promise.resolve().then(() => require('ejs'));
        _ejs = njkModule;
    }
    catch (err) {
        logger_1.Log.error('ejs is not installed.');
        logger_1.Log.error('Please install it with: §l§fnpm install ejs§r');
        logger_1.Log.error('(Optional) if you use typescript: §l§fnpm install --save-dev @types/ejs§r');
        process.exit(1);
    }
}
function ejs(ops = {}) {
    const { viewPath, ...ejsOps } = ops;
    return (0, __1.defineIntegration)(() => ({
        name: 'ejs',
        priority: ops.priority || 'normal',
        async onLoad() {
            await loadEJS();
        },
        async onResponse(_ctx, res) {
            const renderData = res.renderData;
            if (renderData == null)
                return res; // ! next() if renderData null
            const filePath = (0, path_1.join)(process.cwd(), viewPath || 'src/views', `${renderData.getName()}.ejs`);
            const rendered = await _ejs.renderFile(filePath, renderData.getData(), ejsOps);
            return response_1.Response.html(rendered, { status: 200 });
        },
    }));
}
