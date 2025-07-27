import * as crypto from 'node:crypto';
/**
 * Sign a payload using HMAC SHA256 (HS256)
 */
export declare function sign(payload: object | string | Buffer, secret: crypto.BinaryLike): string;
/**
 * Verify the token and return payload if valid, or null if invalid
 */
export declare function verify(token: string, secret: crypto.BinaryLike): string | null;
