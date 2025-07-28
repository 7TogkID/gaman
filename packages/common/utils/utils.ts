/**
 * ! strict bisa di ganti true cuman saat register block aja
 * @param path 
 * @param strict 
 * @returns 
 */
export function formatPath(path: string, strict = false): string {
	let formattedPath = path
		// Pastikan tidak ada duplikasi slash
		.replace(/\/+/g, '/')
		// Hapus wildcard di tengah selain yang diawali atau diakhiri
		.replace(/\/\*(?!\/|$)/g, '/')
		.replace(/(?!^|\/)\*(?=\/)/g, '/');

	// hapus trailing slash (kecuali hanya "/")
	if (formattedPath !== '/') {
		formattedPath = formattedPath.replace(/\/$/, '');
	}

	// Tambahkan "/" di awal jika hilang
	if (!formattedPath.startsWith('/')) {
		formattedPath = `/${formattedPath}`;
	}

	// Jika kosong, tetap kembalikan "/"
	if (formattedPath === '') {
		formattedPath = '/';
	}

	// jika strict
	// dan buka root path
	if (strict && formattedPath !== '/' && !formattedPath.endsWith("/")) {
		formattedPath = formattedPath + '/';
	}else{

  }

	return formattedPath;
}


export function removeEndSlash(s: string): string {
  if (s.length > 1 && s.endsWith("/")) {
    return s.slice(0, -1);
  }
  return s;
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
export function sortArray<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
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

	throw new Error("Invalid expires format. Use a number or a string like '1h'.");
}
