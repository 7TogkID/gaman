import * as crypto from 'node:crypto';
import { base64UrlEncode, base64UrlDecode } from "@gaman/common/utils/encode.js";

export function sign(payload: object, secret: string, ttl: number): string {
	const exp = Math.floor(Date.now() / 1000) + ttl;
	const data = JSON.stringify({ ...payload, exp });
	const encoded = base64UrlEncode(data);

	const sig = crypto.createHmac("sha256", secret)
		.update(encoded)
		.digest("base64");
	const encodedSig = base64UrlEncode(sig);

	return `${encoded}.${encodedSig}`;
}

export function verify<T = any>(token: string, secret: string): T | null {
	const [encoded, sig] = token.split(".");
	if (!encoded || !sig) return null;

	const expected = crypto.createHmac("sha256", secret)
		.update(encoded)
		.digest("base64");
	if (base64UrlEncode(expected) !== sig) return null;

	const json = base64UrlDecode(encoded);
	const data = JSON.parse(json);

	// cek expired
	if (data.exp && Date.now() / 1000 > data.exp) return null;

	return data;
}