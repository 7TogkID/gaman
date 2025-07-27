"use strict";
var _GamanSession_cookies, _GamanSession_request, _GamanSession_secret, _GamanSession_app, _GamanSession_options, _GamanSession_store;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamanSession = void 0;
const tslib_1 = require("tslib");
const symbol_1 = require("../../symbol");
const signature_1 = require("../../utils/signature");
class GamanSession {
    constructor(app, cookies, request) {
        _GamanSession_cookies.set(this, void 0);
        _GamanSession_request.set(this, void 0);
        _GamanSession_secret.set(this, void 0);
        _GamanSession_app.set(this, void 0);
        _GamanSession_options.set(this, void 0);
        _GamanSession_store.set(this, void 0);
        tslib_1.__classPrivateFieldSet(this, _GamanSession_app, app, "f");
        tslib_1.__classPrivateFieldSet(this, _GamanSession_cookies, cookies, "f");
        tslib_1.__classPrivateFieldSet(this, _GamanSession_request, request, "f");
        tslib_1.__classPrivateFieldSet(this, _GamanSession_options, tslib_1.__classPrivateFieldGet(this, _GamanSession_app, "f")[symbol_1.SESSION_OPTIONS_SYMBOL] || {
            secret: process.env.GAMAN_KEY || '',
            driver: { type: 'cookies' },
            maxAge: 86400,
            secure: true,
            rolling: true,
        }, "f");
        tslib_1.__classPrivateFieldSet(this, _GamanSession_secret, tslib_1.__classPrivateFieldGet(this, _GamanSession_options, "f").secret || process.env.GAMAN_KEY || '', "f");
        // @ts-ignore
        tslib_1.__classPrivateFieldSet(this, _GamanSession_store, tslib_1.__classPrivateFieldGet(this, _GamanSession_options, "f").driver[symbol_1.SESSION_STORE_SYMBOL], "f");
    }
    async set(name, payload) {
        const sessionId = crypto.randomUUID();
        const cookieOpts = {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: tslib_1.__classPrivateFieldGet(this, _GamanSession_options, "f").secure ?? tslib_1.__classPrivateFieldGet(this, _GamanSession_request, "f").url.startsWith('https://'),
            maxAge: tslib_1.__classPrivateFieldGet(this, _GamanSession_options, "f").maxAge,
        };
        if (tslib_1.__classPrivateFieldGet(this, _GamanSession_options, "f").driver?.type === 'cookies') {
            const token = (0, signature_1.sign)(payload, tslib_1.__classPrivateFieldGet(this, _GamanSession_secret, "f"));
            tslib_1.__classPrivateFieldGet(this, _GamanSession_cookies, "f").set(name, token, cookieOpts);
        }
        else {
            const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
            await tslib_1.__classPrivateFieldGet(this, _GamanSession_store, "f")?.set(sessionId, data, tslib_1.__classPrivateFieldGet(this, _GamanSession_options, "f").maxAge);
            tslib_1.__classPrivateFieldGet(this, _GamanSession_cookies, "f").set(name, sessionId, cookieOpts);
        }
    }
    async get(name) {
        const tokenOrId = tslib_1.__classPrivateFieldGet(this, _GamanSession_cookies, "f").get(name)?.value;
        if (!tokenOrId)
            return null;
        if (tslib_1.__classPrivateFieldGet(this, _GamanSession_options, "f").driver?.type === 'cookies') {
            const raw = (0, signature_1.verify)(tokenOrId, tslib_1.__classPrivateFieldGet(this, _GamanSession_secret, "f"));
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
            const raw = await tslib_1.__classPrivateFieldGet(this, _GamanSession_store, "f")?.get(tokenOrId);
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
        const tokenOrId = tslib_1.__classPrivateFieldGet(this, _GamanSession_cookies, "f").get(name)?.value;
        if (!tokenOrId)
            return false;
        if (tslib_1.__classPrivateFieldGet(this, _GamanSession_options, "f").driver?.type === 'cookies') {
            return Boolean((0, signature_1.verify)(tokenOrId, tslib_1.__classPrivateFieldGet(this, _GamanSession_secret, "f")));
        }
        if (!tslib_1.__classPrivateFieldGet(this, _GamanSession_store, "f")) {
            return false;
        }
        return await tslib_1.__classPrivateFieldGet(this, _GamanSession_store, "f")?.has(tokenOrId);
    }
    async delete(name) {
        const tokenOrId = tslib_1.__classPrivateFieldGet(this, _GamanSession_cookies, "f").get(name)?.value;
        tslib_1.__classPrivateFieldGet(this, _GamanSession_cookies, "f").delete(name);
        if (tokenOrId && tslib_1.__classPrivateFieldGet(this, _GamanSession_options, "f").driver?.type !== 'cookies') {
            await tslib_1.__classPrivateFieldGet(this, _GamanSession_store, "f")?.delete(tokenOrId);
        }
    }
}
exports.GamanSession = GamanSession;
_GamanSession_cookies = new WeakMap(), _GamanSession_request = new WeakMap(), _GamanSession_secret = new WeakMap(), _GamanSession_app = new WeakMap(), _GamanSession_options = new WeakMap(), _GamanSession_store = new WeakMap();
