import { copyFile, mkdir } from "fs/promises";
import { dirname } from "path";

const source = "package.cjs.json";
const target = "dist/package.json";

await mkdir(dirname(target), { recursive: true });
await copyFile(source, target);

console.log(`Copied ${source} -> ${target}`);
