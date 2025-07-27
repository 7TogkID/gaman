import { existsSync } from "fs";
import { spawn } from "child_process";
import { Command } from "./command";

function getEntryFile(): string {
  const candidates = ["src/index.ts", "src/index.js", "src/index.mjs"];
  return candidates.find((file) => existsSync(file)) || "src/index.ts";
}

export class DevCommand extends Command {
  constructor() {
    super("dev", "Run the application in development mode", "gaman dev", [
      "serve",
    ]);
  }

  async execute(): Promise<void> {
    const entry = getEntryFile();

    spawn("npx", ["tsx", "watch", entry], {
      stdio: "inherit",
      shell: true,
      
    });
  }
}

export default new DevCommand();
