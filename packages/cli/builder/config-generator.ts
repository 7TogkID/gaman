import { readFileSync } from "fs";

function extractStaticServePath(filePath: string): string {
	const content = readFileSync(filePath, "utf8");

	// Cari pattern: staticServe({ path: "..." })
	const match = content.match(/staticServe\s*\(\s*\{\s*path\s*:\s*["'`](.*?)["'`]/);

	if (match && match[1]) {
		return match[1]; // nilai path ditemukan
	}

	// Kalau gak ketemu, return default
	return "/public";
}