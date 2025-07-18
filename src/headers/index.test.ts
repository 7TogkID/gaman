import { describe, it, expect } from 'vitest';
import { GamanHeaders } from '.';

describe('GamanHeaders', () => {
	it('should get a header value correctly', () => {
		const headers = new GamanHeaders({
			'Content-Type': 'application/json',
		});

		expect(headers.get('Content-Type')).toBe('application/json');
	});

	it('should return undefined when header is missing', () => {
		const headers = new GamanHeaders({});
		expect(headers.get('Authorization')).toBeUndefined();
	});

	it('should return combined string for array header value (Set-Cookie)', () => {
		const headers = new GamanHeaders({
			'Set-Cookie': ['session=abc123', 'theme=dark'],
		});

		expect(headers.get('Set-Cookie')).toBe('session=abc123, theme=dark');
	});

	it('should return true if header exists', () => {
		const headers = new GamanHeaders({
			'Set-Cookie': ['session=abc123', 'theme=dark'],
		});

		expect(headers.has('Set-Cookie')).toBe(true);
	});

	it('should set a header value', () => {
		const headers = new GamanHeaders();
		headers.set('Authorization', 'Bearer asdmiu1u92812');

		expect(headers.has('Authorization')).toBe(true);
	});

	it('should convert headers to Map', () => {
		const headers = new GamanHeaders({
			'Set-Cookie': ['session=abc123', 'theme=dark'],
			Authorization: 'Bearer token',
		});

		expect(headers.toMap()).toEqual(
			new Map()
				.set('set-cookie', ['session=abc123', 'theme=dark'])
				.set('authorization', 'Bearer token'),
		);
	});

	it('should convert headers to plain record', () => {
		const headers = new GamanHeaders({
			'Set-Cookie': ['session=abc123', 'theme=dark'],
			Authorization: 'Bearer token',
		});

		expect(headers.toRecord()).toEqual({
			'set-cookie': 'session=abc123, theme=dark',
			authorization: 'Bearer token',
		});
	});
});
