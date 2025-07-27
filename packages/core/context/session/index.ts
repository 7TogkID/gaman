import { GamanApp } from '../../gaman-app';
import { IGamanSessionOptions } from '../../integration/session';
import { IGamanSessionStore } from '../../integration/session/store';
import { SESSION_OPTIONS_SYMBOL, SESSION_STORE_SYMBOL } from '../../symbol';
import { Request } from '../../types';
import { sign, verify } from '../../utils/signature';
import { GamanCookies, GamanCookieSetOptions } from '../cookies';

export interface IGamanSession {
	set(name: string, payload: string | object | Buffer): Promise<void>;
	get<T = any>(name: string): Promise<T | null>;
	has(name: string): Promise<boolean>;
	delete(name: string): Promise<void>;
}

export class GamanSession implements IGamanSession {
	#cookies: GamanCookies;
	#request: Request;
	#secret: string;
	#app: GamanApp;
	#options: IGamanSessionOptions;
	#store?: IGamanSessionStore;

	constructor(app: GamanApp, cookies: GamanCookies, request: Request) {
		this.#app = app;
		this.#cookies = cookies;
		this.#request = request;
		this.#options = (this.#app as any)[SESSION_OPTIONS_SYMBOL] || {
			secret: process.env.GAMAN_KEY || '',
			driver: { type: 'cookies' },
			maxAge: 86400,
			secure: true,
			rolling: true,
		};
		this.#secret = this.#options.secret || process.env.GAMAN_KEY || '';

		// @ts-ignore
		this.#store = this.#options.driver[SESSION_STORE_SYMBOL];
	}

	async set(name: string, payload: string | object | Buffer): Promise<void> {
		const sessionId = crypto.randomUUID();
		const cookieOpts: GamanCookieSetOptions = {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: this.#options.secure ?? this.#request.url.startsWith('https://'),
			maxAge: this.#options.maxAge,
		};

		if (this.#options.driver?.type === 'cookies') {
			const token = sign(payload, this.#secret);
			this.#cookies.set(name, token, cookieOpts);
		} else {
			const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
			await this.#store?.set(sessionId, data, this.#options.maxAge);
			this.#cookies.set(name, sessionId, cookieOpts);
		}
	}

	async get<T = any>(name: string): Promise<T | null> {
		const tokenOrId = this.#cookies.get(name)?.value;
		if (!tokenOrId) return null;

		if (this.#options.driver?.type === 'cookies') {
			const raw = verify(tokenOrId, this.#secret);
			if (!raw) return null;
			try {
				return JSON.parse(raw) as T;
			} catch {
				return raw as unknown as T;
			}
		} else {
			const raw = await this.#store?.get(tokenOrId);
			if (!raw) return null;
			try {
				return JSON.parse(raw) as T;
			} catch {
				return raw as unknown as T;
			}
		}
	}

	async has(name: string): Promise<boolean> {
		const tokenOrId = this.#cookies.get(name)?.value;
		if (!tokenOrId) return false;

		if (this.#options.driver?.type === 'cookies') {
			return Boolean(verify(tokenOrId, this.#secret));
		}
		if (!this.#store) {
			return false;
		}

		return await this.#store?.has(tokenOrId);
	}

	async delete(name: string): Promise<void> {
		const tokenOrId = this.#cookies.get(name)?.value;
		this.#cookies.delete(name);
		if (tokenOrId && this.#options.driver?.type !== 'cookies') {
			await this.#store?.delete(tokenOrId);
		}
	}
}
