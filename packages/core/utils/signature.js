"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sign = sign;
exports.verify = verify;
const crypto = require("node:crypto");
const encode_1 = require("./encode");
/**
 * Sign a payload using HMAC SHA256 (HS256)
 */
function sign(payload, secret) {
    const json = typeof payload === 'string' || Buffer.isBuffer(payload)
        ? payload.toString()
        : JSON.stringify(payload);
    const encodedPayload = (0, encode_1.base64UrlEncode)(json);
    const signature = crypto.createHmac('sha256', secret).update(encodedPayload).digest('base64');
    const encodedSignature = (0, encode_1.base64UrlEncode)(signature);
    return `${encodedPayload}.${encodedSignature}`;
}
/**
 * Verify the token and return payload if valid, or null if invalid
 */
function verify(token, secret) {
    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature)
        return null;
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(encodedPayload)
        .digest('base64');
    const valid = (0, encode_1.base64UrlEncode)(expectedSignature) === signature;
    if (!valid)
        return null;
    const payload = (0, encode_1.base64UrlDecode)(encodedPayload);
    return payload;
}
