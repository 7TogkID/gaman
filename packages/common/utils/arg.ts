type ArgValue = string | number | boolean | undefined;

interface GetArgOptions {
  default?: ArgValue;
  parseNumber?: boolean;
}

export function getArg(
  long: string,
  short?: string,
  options?: GetArgOptions
): ArgValue {
  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    // match long or short flag
    if (arg === long || (short && arg === short)) {
      const next = argv[i + 1];

      // boolean flag (tidak ada value berikutnya atau value berikutnya juga flag)
      if (!next || next.startsWith('-')) return true;

      // ambil value berikutnya
      if (options?.parseNumber && !isNaN(Number(next))) {
        return Number(next);
      }
      return next;
    }

    // match long=val atau short=val
    if (arg.startsWith(`${long}=`) || (short && arg.startsWith(`${short}=`))) {
      const value = arg.split('=')[1];
      if (options?.parseNumber && !isNaN(Number(value))) return Number(value);
      return value;
    }
  }

  return options?.default;
}
