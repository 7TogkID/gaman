import { join } from 'path';
import { defineIntegration } from '..';
import { Response } from '../../response';
import { Log } from '@gaman/common/utils/logger';
let _ejs;
async function loadEJS() {
    try {
        const njkModule = await import('ejs');
        _ejs = njkModule;
    }
    catch (err) {
        Log.error('ejs is not installed.');
        Log.error('Please install it with: §l§fnpm install ejs§r');
        Log.error('(Optional) if you use typescript: §l§fnpm install --save-dev @types/ejs§r');
        process.exit(1);
    }
}
export function ejs(ops = {}) {
    const { viewPath, ...ejsOps } = ops;
    return defineIntegration(() => ({
        name: 'ejs',
        priority: ops.priority || 'normal',
        async onLoad() {
            await loadEJS();
        },
        async onResponse(_ctx, res) {
            const renderData = res.renderData;
            if (renderData == null)
                return res; // ! next() if renderData null
            const filePath = join(process.cwd(), viewPath || 'src/views', `${renderData.getName()}.ejs`);
            const rendered = await _ejs.renderFile(filePath, renderData.getData(), ejsOps);
            return Response.html(rendered, { status: 200 });
        },
    }));
}
