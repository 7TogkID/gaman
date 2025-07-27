var _GamanCookies_instances, _GamanCookies_request, _GamanCookies_requestValues, _GamanCookies_outgoing, _GamanCookies_consumed, _GamanCookies_ensureParsed, _GamanCookies_ensureOutgoingMap, _GamanCookies_parse;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "tslib";
import { parse, serialize } from 'cookie';
import { parseBoolean, parseExpires } from '../../utils/utils';
const DELETED_EXPIRATION = /* @__PURE__ */ new Date(0);
const DELETED_VALUE = 'deleted';
const identity = (value) => value;
export class GamanCookie {
    constructor(value) {
        this.value = value;
    }
    json(reviver) {
        return JSON.parse(this.value, reviver);
    }
    number(radix = 10) {
        return parseInt(this.value, radix);
    }
    boolean() {
        return parseBoolean(this.value);
    }
}
export class GamanCookies {
    constructor(request) {
        _GamanCookies_instances.add(this);
        _GamanCookies_request.set(this, void 0);
        _GamanCookies_requestValues.set(this, void 0);
        _GamanCookies_outgoing.set(this, void 0);
        _GamanCookies_consumed.set(this, void 0);
        __classPrivateFieldSet(this, _GamanCookies_request, request, "f");
        __classPrivateFieldSet(this, _GamanCookies_outgoing, null, "f");
        __classPrivateFieldSet(this, _GamanCookies_requestValues, null, "f");
        __classPrivateFieldSet(this, _GamanCookies_outgoing, null, "f");
        __classPrivateFieldSet(this, _GamanCookies_consumed, false, "f");
    }
    get(key, options = undefined) {
        if (__classPrivateFieldGet(this, _GamanCookies_outgoing, "f")?.has(key)) {
            const [serializedValue, , isSetValue] = __classPrivateFieldGet(this, _GamanCookies_outgoing, "f").get(key);
            if (isSetValue) {
                return new GamanCookie(serializedValue);
            }
            else {
                return undefined;
            }
        }
        const decode = options?.decode ?? decodeURIComponent;
        const values = __classPrivateFieldGet(this, _GamanCookies_instances, "m", _GamanCookies_ensureParsed).call(this);
        if (key in values) {
            const value = values[key];
            if (value) {
                return new GamanCookie(decode(value));
            }
        }
    }
    has(key) {
        if (__classPrivateFieldGet(this, _GamanCookies_outgoing, "f")?.has(key)) {
            const [, , isSetValue] = __classPrivateFieldGet(this, _GamanCookies_outgoing, "f").get(key);
            return isSetValue;
        }
        const values = __classPrivateFieldGet(this, _GamanCookies_instances, "m", _GamanCookies_ensureParsed).call(this);
        return values[key] !== undefined;
    }
    set(key, value, options) {
        if (__classPrivateFieldGet(this, _GamanCookies_consumed, "f")) {
            const warning = new Error('ctx.cookies.set() was called after the response was already sent. Make sure to call ctx.cookies.set() before sending the response.');
            warning.name = 'Warning';
            console.warn(warning);
        }
        let serializedValue;
        if (typeof value === 'string') {
            serializedValue = value;
            const toStringValue = value.toString();
            if (toStringValue === Object.prototype.toString.call(value)) {
                serializedValue = JSON.stringify(value);
            }
            else {
                serializedValue = toStringValue;
            }
        }
        const serializeOptions = {};
        if (options) {
            let expires;
            if (options?.expires) {
                expires =
                    typeof options.expires === 'string' || typeof options.expires === 'number'
                        ? parseExpires(options.expires)
                        : options.expires;
            }
            Object.assign(serializeOptions, { ...options, expires });
        }
        if (serializedValue) {
            __classPrivateFieldGet(this, _GamanCookies_instances, "m", _GamanCookies_ensureOutgoingMap).call(this).set(key, [
                serializedValue,
                serialize(key, serializedValue, serializeOptions),
                true,
            ]);
        }
    }
    delete(key, options) {
        const { 
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        maxAge: _ignoredMaxAge, 
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expires: _ignoredExpires, ...sanitizedOptions } = options || {};
        const serializeOptions = {
            expires: DELETED_EXPIRATION,
            ...sanitizedOptions,
        };
        __classPrivateFieldGet(this, _GamanCookies_instances, "m", _GamanCookies_ensureOutgoingMap).call(this).set(key, [
            DELETED_VALUE,
            serialize(key, DELETED_VALUE, serializeOptions),
            false,
        ]);
    }
    merge(cookies) {
        const outgoing = __classPrivateFieldGet(cookies, _GamanCookies_outgoing, "f");
        if (outgoing) {
            for (const [key, value] of outgoing) {
                __classPrivateFieldGet(this, _GamanCookies_instances, "m", _GamanCookies_ensureOutgoingMap).call(this).set(key, value);
            }
        }
    }
    *headers() {
        if (__classPrivateFieldGet(this, _GamanCookies_outgoing, "f") == null)
            return;
        for (const [, value] of __classPrivateFieldGet(this, _GamanCookies_outgoing, "f")) {
            yield value[1];
        }
    }
    static consume(cookies) {
        __classPrivateFieldSet(cookies, _GamanCookies_consumed, true, "f");
        return cookies.headers();
    }
}
_GamanCookies_request = new WeakMap(), _GamanCookies_requestValues = new WeakMap(), _GamanCookies_outgoing = new WeakMap(), _GamanCookies_consumed = new WeakMap(), _GamanCookies_instances = new WeakSet(), _GamanCookies_ensureParsed = function _GamanCookies_ensureParsed() {
    if (!__classPrivateFieldGet(this, _GamanCookies_requestValues, "f")) {
        __classPrivateFieldGet(this, _GamanCookies_instances, "m", _GamanCookies_parse).call(this);
    }
    if (!__classPrivateFieldGet(this, _GamanCookies_requestValues, "f")) {
        __classPrivateFieldSet(this, _GamanCookies_requestValues, {}, "f");
    }
    return __classPrivateFieldGet(this, _GamanCookies_requestValues, "f");
}, _GamanCookies_ensureOutgoingMap = function _GamanCookies_ensureOutgoingMap() {
    if (!__classPrivateFieldGet(this, _GamanCookies_outgoing, "f")) {
        __classPrivateFieldSet(this, _GamanCookies_outgoing, new Map(), "f");
    }
    return __classPrivateFieldGet(this, _GamanCookies_outgoing, "f");
}, _GamanCookies_parse = function _GamanCookies_parse() {
    const raw = __classPrivateFieldGet(this, _GamanCookies_request, "f").header('cookie');
    if (!raw) {
        return;
    }
    // Pass identity function for decoding so it doesn't use the default.
    // We'll do the actual decoding when we read the value.
    __classPrivateFieldSet(this, _GamanCookies_requestValues, parse(raw, { decode: identity }), "f");
};
