import { existsSync } from 'fs';
import { spawn } from 'child_process';

function getEntryFile(): string {
	const candidates = ['src/main.ts', 'src/main.js', 'src/main.mjs'];
	return candidates.find((file) => existsSync(file)) || 'src/main.ts';
}

export default function dev() {
	const entry = getEntryFile();

	spawn('npx', ['tsx', 'watch', entry], {
		stdio: 'inherit',
		shell: true,
	});
}
