import * as crypto from 'node:crypto';
import { base64UrlEncode, base64UrlDecode } from './encode';
/**
 * Sign a payload using HMAC SHA256 (HS256)
 */
export function sign(payload, secret) {
    const json = typeof payload === 'string' || Buffer.isBuffer(payload)
        ? payload.toString()
        : JSON.stringify(payload);
    const encodedPayload = base64UrlEncode(json);
    const signature = crypto.createHmac('sha256', secret).update(encodedPayload).digest('base64');
    const encodedSignature = base64UrlEncode(signature);
    return `${encodedPayload}.${encodedSignature}`;
}
/**
 * Verify the token and return payload if valid, or null if invalid
 */
export function verify(token, secret) {
    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature)
        return null;
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(encodedPayload)
        .digest('base64');
    const valid = base64UrlEncode(expectedSignature) === signature;
    if (!valid)
        return null;
    const payload = base64UrlDecode(encodedPayload);
    return payload;
}
