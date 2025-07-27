"use strict";
var _GamanHeaders_data;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamanHeaders = void 0;
const tslib_1 = require("tslib");
class GamanHeaders {
    constructor(headers = {}) {
        _GamanHeaders_data.set(this, new Map());
        for (const [key, value] of Object.entries(headers)) {
            if (value) {
                tslib_1.__classPrivateFieldGet(this, _GamanHeaders_data, "f").set(key.toLowerCase(), value);
            }
        }
    }
    /**
     * Retrieves the value of a specific header by key.
     * If the header value is an array (e.g., from multi-value headers), it will be joined into a single comma-separated string.
     * Header keys are case-insensitive.
     *
     * @param key - The name of the header to retrieve.
     * @returns The header value as a string, or undefined if not found.
     */
    get(key) {
        const k = key.toLowerCase();
        const r = tslib_1.__classPrivateFieldGet(this, _GamanHeaders_data, "f").get(k);
        return Array.isArray(r) ? r.join(', ') : r;
    }
    set(key, value) {
        tslib_1.__classPrivateFieldGet(this, _GamanHeaders_data, "f").set(key.toLowerCase(), value);
        return this;
    }
    has(key) {
        const k = key.toLowerCase();
        return tslib_1.__classPrivateFieldGet(this, _GamanHeaders_data, "f").has(k);
    }
    delete(key) {
        const k = key.toLowerCase();
        if (!tslib_1.__classPrivateFieldGet(this, _GamanHeaders_data, "f").has(k))
            return false;
        tslib_1.__classPrivateFieldGet(this, _GamanHeaders_data, "f").delete(k);
        return true;
    }
    keys() {
        return tslib_1.__classPrivateFieldGet(this, _GamanHeaders_data, "f").keys();
    }
    entries() {
        return tslib_1.__classPrivateFieldGet(this, _GamanHeaders_data, "f").entries();
    }
    toRecord() {
        const result = {};
        for (const [key, value] of this.entries()) {
            result[key] = Array.isArray(value) ? value.join(', ') : value;
        }
        return result;
    }
    toMap() {
        return tslib_1.__classPrivateFieldGet(this, _GamanHeaders_data, "f");
    }
}
exports.GamanHeaders = GamanHeaders;
_GamanHeaders_data = new WeakMap();
