import { parse, serialize, SerializeOptions } from 'cookie';
import { Request } from '../../types';
import { parseBoolean, parseExpires } from '@gaman/common/utils/utils';

export interface GamanCookieInterface {
	value: string;
	json(reviver?: (key: string, value: any) => any): Record<string, any>;
	number(radix?: number): number;
	boolean(): boolean;
}

const DELETED_EXPIRATION = /* @__PURE__ */ new Date(0);
const DELETED_VALUE = 'deleted';

const identity = (value: string) => value;

export interface GamanCookieSetOptions
	extends Pick<
		SerializeOptions,
		'domain' | 'path' | 'maxAge' | 'httpOnly' | 'sameSite' | 'secure' | 'encode'
	> {
	expires?: Date | string | number;
}

export interface GamanCookieGetOptions {
	decode?: (value: string) => string;
}

export type GamanCookieDeleteOptions = Omit<GamanCookieSetOptions, 'expires' | 'maxAge' | 'encode'>;

export interface GamanCookiesInterface {
	get(key: string): GamanCookie | undefined;
	has(key: string): boolean;
	set(
		key: string,
		value: string | number | boolean | Record<string, any>,
		options?: GamanCookieSetOptions,
	): void;
	delete(key: string, options?: GamanCookieDeleteOptions): void;
}

export class GamanCookie implements GamanCookieInterface {
	constructor(public value: string) {}
	json(reviver?: (key: string, value: any) => any): Record<string, any> {
		return JSON.parse(this.value, reviver);
	}
	number(radix: number = 10): number {
		return parseInt(this.value, radix);
	}
	boolean(): boolean {
		return parseBoolean(this.value);
	}
}

export class GamanCookies implements GamanCookiesInterface {
	#request: Request;
	#requestValues: Record<string, string | undefined> | null;
	#outgoing: Map<string, [string, string, boolean]> | null;
	#consumed: boolean;
	constructor(request: Request) {
		this.#request = request;
		this.#outgoing = null;
		this.#requestValues = null;
		this.#outgoing = null;
		this.#consumed = false;
	}

	get(
		key: string,
		options: GamanCookieGetOptions | undefined = undefined,
	): GamanCookie | undefined {
		if (this.#outgoing?.has(key)) {
			const [serializedValue, , isSetValue] = this.#outgoing.get(key)!;
			if (isSetValue) {
				return new GamanCookie(serializedValue);
			} else {
				return undefined;
			}
		}

		const decode = options?.decode ?? decodeURIComponent;

		const values = this.#ensureParsed();
		if (key in values) {
			const value = values[key];
			if (value) {
				return new GamanCookie(decode(value));
			}
		}
	}

	has(key: string): boolean {
		if (this.#outgoing?.has(key)) {
			const [, , isSetValue] = this.#outgoing.get(key)!;
			return isSetValue;
		}
		const values = this.#ensureParsed();
		return values[key] !== undefined;
	}

	set(
		key: string,
		value: string | number | boolean | Record<string, any>,
		options?: GamanCookieSetOptions,
	): void {
		if (this.#consumed) {
			const warning = new Error(
				'ctx.cookies.set() was called after the response was already sent. Make sure to call ctx.cookies.set() before sending the response.',
			);
			warning.name = 'Warning';
			console.warn(warning);
		}
		let serializedValue: string | undefined;
		if (typeof value === 'string') {
			serializedValue = value;
			const toStringValue = value.toString();
			if (toStringValue === Object.prototype.toString.call(value)) {
				serializedValue = JSON.stringify(value);
			} else {
				serializedValue = toStringValue;
			}
		}

		const serializeOptions: SerializeOptions = {};
		if (options) {
			let expires: Date | undefined;

			if (options?.expires) {
				expires =
					typeof options.expires === 'string' || typeof options.expires === 'number'
						? parseExpires(options.expires)
						: options.expires;
			}

			Object.assign(serializeOptions, { ...options, expires });
		}

		if (serializedValue) {
			this.#ensureOutgoingMap().set(key, [
				serializedValue,
				serialize(key, serializedValue, serializeOptions),
				true,
			]);
		}
	}

	delete(key: string, options?: GamanCookieDeleteOptions): void {
		const {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			maxAge: _ignoredMaxAge,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			expires: _ignoredExpires,
			...sanitizedOptions
		} = options || {};

		const serializeOptions: SerializeOptions = {
			expires: DELETED_EXPIRATION,
			...sanitizedOptions,
		};

		this.#ensureOutgoingMap().set(key, [
			DELETED_VALUE,
			serialize(key, DELETED_VALUE, serializeOptions),
			false,
		]);
	}

	merge(cookies: GamanCookies) {
		const outgoing = cookies.#outgoing;
		if (outgoing) {
			for (const [key, value] of outgoing) {
				this.#ensureOutgoingMap().set(key, value);
			}
		}
	}

	*headers(): Generator<string, void, unknown> {
		if (this.#outgoing == null) return;
		for (const [, value] of this.#outgoing) {
			yield value[1];
		}
	}

	static consume(cookies: GamanCookies): Generator<string, void, unknown> {
		cookies.#consumed = true;
		return cookies.headers();
	}

	#ensureParsed(): Record<string, string | undefined> {
		if (!this.#requestValues) {
			this.#parse();
		}
		if (!this.#requestValues) {
			this.#requestValues = {};
		}
		return this.#requestValues;
	}

	#ensureOutgoingMap(): Map<string, [string, string, boolean]> {
		if (!this.#outgoing) {
			this.#outgoing = new Map();
		}
		return this.#outgoing;
	}

	#parse() {
		const raw = this.#request.header('cookie');
		if (!raw) {
			return;
		}
		// Pass identity function for decoding so it doesn't use the default.
		// We'll do the actual decoding when we read the value.
		this.#requestValues = parse(raw, { decode: identity });
	}
}
