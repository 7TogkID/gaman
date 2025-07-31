import fs from 'fs';
import path from 'path';

/**
 * Loads environment variables from a .env file into process.env
 */
let env_custom_data = {};

export function loadEnv(envPath = '.env') {
	const fullPath = path.resolve(envPath);
	if (!fs.existsSync(fullPath)) return;

	const content = fs.readFileSync(fullPath, 'utf-8');

	content.split(/\r?\n/).forEach((line) => {
		const trimmed = line.trim();

		// Ignore empty lines and comments
		if (!trimmed || trimmed.startsWith('#')) return;

		const [key, ...rest] = trimmed.split('=');
		const value = rest
			.join('=')
			.trim()
			.replace(/^["']|["']$/g, ''); // remove quotes if present

    // ! delete all env custom
    // ! its function is so that when you call loadEnv again it doesn't duplicate
		if (key && key in env_custom_data) {
			delete env_custom_data[key];
		}

		if (key && !(key in process.env)) {
			process.env[key] = value;
			env_custom_data[key] = value;
		}
	});
}
