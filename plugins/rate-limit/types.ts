export interface RateLimitInfo {
	limit: number;
	used: number;
	remaining: number;
	key: string; // IP address, etc.
	reset: Date | undefined;
}

export interface ParseRateLimitOptions {
	reset?: 'date' | 'unix' | 'seconds' | 'milliseconds';
}
