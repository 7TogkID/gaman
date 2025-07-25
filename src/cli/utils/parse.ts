import _path from "path"

export function parseArgs(argv = process.argv.slice(2)) {
  const args: Record<string, any> = {};
  let command = argv[0];

  for (let i = 1; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const [key, value] = arg.slice(2).split("=");
      args[key] = value ?? true;
    } else {
      args._ = args._ || [];
      args._.push(arg);
    }
  }

  return { command, args };
}

export function parsePath(pathName: string) {
  pathName = removeStart(pathName, "./");

  // Hilangkan ekstensi file (".ts", ".js", ".block.ts", dll)
  if (pathName.includes(".")) {
    pathName = pathName.split(".")[0];
  }

  const segments = pathName.split("/");
  const name = segments.pop()!; // ambil nama terakhir
  const dirPath = _path.normalize(segments.join("/")); // sisa direktori

  return {
    path: _path.normalize(pathName), // full path tanpa ekstensi, misal: "blocks/user/index"
    dirPath,        // misal: "blocks/user"
    name            // misal: "index"
  };
}

export function removeStart(str: string, prefix: string): string {
  return str.startsWith(prefix) ? str.slice(prefix.length) : str;
}

export function removeEnd(str: string, suffix: string): string {
  return str.endsWith(suffix) ? str.slice(0, -suffix.length) : str;
}
