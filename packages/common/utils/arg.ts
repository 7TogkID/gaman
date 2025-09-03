export interface Args {
	[key: string]: any;
	_: string[];
}

export function parseArgs(argv = process.argv.slice(2)): {
	command: string;
	args: Args;
} {
	const args: Args = { _: [] };
	const command = argv[0];

	const parseValue = (val: string): string | number => {
		if (!isNaN(Number(val))) {
			return Number(val);
		}
		return val;
	};

	for (let i = 1; i < argv.length; i++) {
		const arg = argv[i];

		if (arg.startsWith('--')) {
			const [rawKey, rawValue] = arg.slice(2).split('=');
			const key = rawKey;
			if (rawValue !== undefined) {
				args[key] = parseValue(rawValue);
			} else {
				const next = argv[i + 1];
				if (next && !next.startsWith('-')) {
					args[key] = parseValue(next);
					i++;
				} else {
					args[key] = true;
				}
			}
		} else if (arg.startsWith('-')) {
			const [rawKey, rawValue] = arg.slice(1).split('=');
			const key = rawKey;
			if (rawValue !== undefined) {
				args[key] = parseValue(rawValue);
			} else {
				const next = argv[i + 1];
				if (next && !next.startsWith('-')) {
					args[key] = parseValue(next);
					i++;
				} else {
					args[key] = true;
				}
			}
		} else {
			args._.push(arg);
		}
	}

	return { command, args };
}
