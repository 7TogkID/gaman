export function normalizePath(path: string): string {
	// Handle empty atau undefined path
	if (!path || path === '') return '/';

	// Trim whitespace, tambah leading slash, hapus trailing slash
	let normalized = path.trim();
	if (!normalized.startsWith('/')) normalized = '/' + normalized;
	normalized = normalized.replace(/\/+$/, ''); // Hapus semua trailing slash

	// Ganti multiple slash jadi single slash
	normalized = normalized.replace(/\/+/g, '/');

	// Kembalikan '/' kalau path cuma slash
	return normalized === '' ? '/' : normalized;
}

export function pathMatch(pattern: string, value: string): boolean {
	pattern = normalizePath(pattern);
	value = normalizePath(value);

	const escapeRegex = (s: string) => s.replace(/[-\\^$+?.()|[\]{}]/g, '\\$&');

	const segments = pattern.split('/').filter(Boolean);

	const regexSegments = segments.map((seg) => {
		if (seg === '*') return '[^/]+';
		if (seg === '**') return '(?:/.*)?'; // bisa 0 segment (ikut segment sendiri juga)
		return escapeRegex(seg);
	});

	const regexStr = '^/' + regexSegments.join('') + '$'; // gabung langsung tanpa slash tambahan
	const regex = new RegExp(regexStr);
	return regex.test(value);
}


/**
 * Validates if a string contains valid HTML.
 * @param str - The string to validate.
 * @returns True if the string is HTML, otherwise false.
 */
export function isHtmlString(str: string): boolean {
	if (typeof str !== 'string') return false;

	// Regular expression to match basic HTML tags
	const htmlRegex = /<\/?[a-z][\s\S]*>/i;

	return htmlRegex.test(str.trim());
}

/**
 * Sorts an array of objects based on a specified key.
 *
 * @param array - The array to sort.
 * @param key - The key to sort by.
 * @param order - Sorting order: 'asc' (ascending) or 'desc' (descending). Default is 'asc'.
 * @returns A sorted array.
 */
export function sortArray<T>(
	array: T[],
	key: keyof T,
	order: 'asc' | 'desc' = 'asc',
): T[] {
	return [...array].sort((a, b) => {
		const aValue = a[key];
		const bValue = b[key];

		if (aValue === bValue) return 0;

		const comparison = aValue > bValue ? 1 : -1;

		return order === 'asc' ? comparison : -comparison;
	});
}

export function parseBoolean(value: string) {
	if (typeof value === 'boolean') return value;

	if (typeof value === 'string') {
		const lowered = value.toLowerCase().trim();
		if (['true', '1', 'yes', 'on'].includes(lowered)) return true;
		if (['false', '0', 'no', 'off'].includes(lowered)) return false;
	}

	if (typeof value === 'number') {
		return value !== 0;
	}

	return Boolean(value); // fallback (misalnya: null, undefined, dll)
}

export function parseExpires(expires: string | number): Date {
	if (typeof expires === 'number') {
		return new Date(Date.now() + expires);
	}

	if (typeof expires === 'string') {
		const match = expires.match(/^(\d+)([smhdw])$/i);
		if (!match) {
			throw new Error("Invalid expires format. Use '1h', '2d', or a number.");
		}

		const value = parseInt(match[1]!, 10);
		const unit = match[2]!.toLowerCase();

		const multiplier: Record<string, number> = {
			s: 1000,
			m: 1000 * 60,
			h: 1000 * 60 * 60,
			d: 1000 * 60 * 60 * 24,
			w: 1000 * 60 * 60 * 24 * 7,
		};

		return new Date(Date.now() + value * (multiplier[unit] || 0));
	}

	throw new Error(
		"Invalid expires format. Use a number or a string like '1h'.",
	);
}
