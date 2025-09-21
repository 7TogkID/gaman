import WebSocket from 'ws';

export function decodeMessage(data: WebSocket.RawData): any {
	if (data instanceof Buffer) {
		const str = data.toString('utf-8');
		try {
			return JSON.parse(str);
		} catch {
			return str;
		}
	} else if (Array.isArray(data)) {
		const buf = Buffer.concat(data);
		const str = buf.toString('utf-8');
		try {
			return JSON.parse(str);
		} catch {
			return str;
		}
	} else if (data instanceof ArrayBuffer) {
		const buf = Buffer.from(data);
		const str = buf.toString('utf-8');
		try {
			return JSON.parse(str);
		} catch {
			return str;
		}
	}
	try {
		return JSON.parse(String(data));
	} catch {
		return String(data);
	}
}
