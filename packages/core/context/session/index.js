var _GamanSession_cookies, _GamanSession_request, _GamanSession_secret, _GamanSession_app, _GamanSession_options, _GamanSession_store;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "tslib";
import { SESSION_OPTIONS_SYMBOL, SESSION_STORE_SYMBOL } from '../../symbol';
import { sign, verify } from '../../utils/signature';
export class GamanSession {
    constructor(app, cookies, request) {
        _GamanSession_cookies.set(this, void 0);
        _GamanSession_request.set(this, void 0);
        _GamanSession_secret.set(this, void 0);
        _GamanSession_app.set(this, void 0);
        _GamanSession_options.set(this, void 0);
        _GamanSession_store.set(this, void 0);
        __classPrivateFieldSet(this, _GamanSession_app, app, "f");
        __classPrivateFieldSet(this, _GamanSession_cookies, cookies, "f");
        __classPrivateFieldSet(this, _GamanSession_request, request, "f");
        __classPrivateFieldSet(this, _GamanSession_options, __classPrivateFieldGet(this, _GamanSession_app, "f")[SESSION_OPTIONS_SYMBOL] || {
            secret: process.env.GAMAN_KEY || '',
            driver: { type: 'cookies' },
            maxAge: 86400,
            secure: true,
            rolling: true,
        }, "f");
        __classPrivateFieldSet(this, _GamanSession_secret, __classPrivateFieldGet(this, _GamanSession_options, "f").secret || process.env.GAMAN_KEY || '', "f");
        // @ts-ignore
        __classPrivateFieldSet(this, _GamanSession_store, __classPrivateFieldGet(this, _GamanSession_options, "f").driver[SESSION_STORE_SYMBOL], "f");
    }
    async set(name, payload) {
        const sessionId = crypto.randomUUID();
        const cookieOpts = {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: __classPrivateFieldGet(this, _GamanSession_options, "f").secure ?? __classPrivateFieldGet(this, _GamanSession_request, "f").url.startsWith('https://'),
            maxAge: __classPrivateFieldGet(this, _GamanSession_options, "f").maxAge,
        };
        if (__classPrivateFieldGet(this, _GamanSession_options, "f").driver?.type === 'cookies') {
            const token = sign(payload, __classPrivateFieldGet(this, _GamanSession_secret, "f"));
            __classPrivateFieldGet(this, _GamanSession_cookies, "f").set(name, token, cookieOpts);
        }
        else {
            const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
            await __classPrivateFieldGet(this, _GamanSession_store, "f")?.set(sessionId, data, __classPrivateFieldGet(this, _GamanSession_options, "f").maxAge);
            __classPrivateFieldGet(this, _GamanSession_cookies, "f").set(name, sessionId, cookieOpts);
        }
    }
    async get(name) {
        const tokenOrId = __classPrivateFieldGet(this, _GamanSession_cookies, "f").get(name)?.value;
        if (!tokenOrId)
            return null;
        if (__classPrivateFieldGet(this, _GamanSession_options, "f").driver?.type === 'cookies') {
            const raw = verify(tokenOrId, __classPrivateFieldGet(this, _GamanSession_secret, "f"));
            if (!raw)
                return null;
            try {
                return JSON.parse(raw);
            }
            catch {
                return raw;
            }
        }
        else {
            const raw = await __classPrivateFieldGet(this, _GamanSession_store, "f")?.get(tokenOrId);
            if (!raw)
                return null;
            try {
                return JSON.parse(raw);
            }
            catch {
                return raw;
            }
        }
    }
    async has(name) {
        const tokenOrId = __classPrivateFieldGet(this, _GamanSession_cookies, "f").get(name)?.value;
        if (!tokenOrId)
            return false;
        if (__classPrivateFieldGet(this, _GamanSession_options, "f").driver?.type === 'cookies') {
            return Boolean(verify(tokenOrId, __classPrivateFieldGet(this, _GamanSession_secret, "f")));
        }
        if (!__classPrivateFieldGet(this, _GamanSession_store, "f")) {
            return false;
        }
        return await __classPrivateFieldGet(this, _GamanSession_store, "f")?.has(tokenOrId);
    }
    async delete(name) {
        const tokenOrId = __classPrivateFieldGet(this, _GamanSession_cookies, "f").get(name)?.value;
        __classPrivateFieldGet(this, _GamanSession_cookies, "f").delete(name);
        if (tokenOrId && __classPrivateFieldGet(this, _GamanSession_options, "f").driver?.type !== 'cookies') {
            await __classPrivateFieldGet(this, _GamanSession_store, "f")?.delete(tokenOrId);
        }
    }
}
_GamanSession_cookies = new WeakMap(), _GamanSession_request = new WeakMap(), _GamanSession_secret = new WeakMap(), _GamanSession_app = new WeakMap(), _GamanSession_options = new WeakMap(), _GamanSession_store = new WeakMap();
