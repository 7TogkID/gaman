var _RenderResponse_viewName, _RenderResponse_viewData, _RenderResponse_init;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "tslib";
import { GamanHeaders } from './headers';
export class RenderResponse {
    constructor(viewName, viewData = {}, init = { status: 200 }) {
        _RenderResponse_viewName.set(this, void 0);
        _RenderResponse_viewData.set(this, void 0);
        _RenderResponse_init.set(this, void 0);
        __classPrivateFieldSet(this, _RenderResponse_viewName, viewName, "f");
        __classPrivateFieldSet(this, _RenderResponse_viewData, viewData, "f");
        __classPrivateFieldSet(this, _RenderResponse_init, init, "f");
    }
    getName() {
        return __classPrivateFieldGet(this, _RenderResponse_viewName, "f");
    }
    getData() {
        return __classPrivateFieldGet(this, _RenderResponse_viewData, "f");
    }
    getOptions() {
        return __classPrivateFieldGet(this, _RenderResponse_init, "f");
    }
}
_RenderResponse_viewName = new WeakMap(), _RenderResponse_viewData = new WeakMap(), _RenderResponse_init = new WeakMap();
const responseRenderSymbol = Symbol.for('gaman.responseRender');
export class Response {
    constructor(body, options = {}) {
        this.body = body;
        this[responseRenderSymbol] = null;
        this.body = body;
        this.headers = new GamanHeaders(options.headers || {});
        this.status = options.status || 200;
        this.statusText = options.statusText || '';
    }
    static json(data, init = {}) {
        return new Response(JSON.stringify(data, null, 2), {
            ...init,
            headers: {
                'Content-Type': 'application/json',
                ...(init.headers || {}),
            },
        });
    }
    static text(message, init = {}) {
        return new Response(message, {
            ...init,
            headers: {
                'Content-Type': 'text/plain',
                ...(init.headers || {}),
            },
        });
    }
    static html(body, init = {}) {
        return new Response(body, {
            ...init,
            headers: {
                'Content-Type': 'text/html',
                ...(init.headers || {}),
            },
        });
    }
    static render(viewName, viewData = {}, init = { status: 200 }) {
        const res = new Response(null, {
            ...init,
            headers: {
                'Content-Type': 'text/html',
                ...(init.headers || {}),
            },
        });
        res[responseRenderSymbol] = new RenderResponse(viewName, viewData, init);
        return res;
    }
    static stream(readableStream, init = {}) {
        return new Response(readableStream, {
            ...init,
            headers: {
                'Content-Type': 'application/octet-stream',
                ...(init.headers || {}),
            },
        });
    }
    static redirect(location, statusNumber = 302) {
        return new Response(null, {
            status: statusNumber,
            headers: {
                Location: location,
            },
        });
    }
    /**
     * Akses helper untuk render view
     */
    get renderData() {
        return this[responseRenderSymbol];
    }
}
