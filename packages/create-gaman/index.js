#!/usr/bin/env node

import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import { execSync } from "child_process";
import degit from "degit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.clear();
  console.log(`
  ░██████╗░░█████╗░███╗░░░███╗░█████╗░███╗░░██╗
  ██╔════╝░██╔══██╗████╗░████║██╔══██╗████╗░██║
  ██║░░██╗░███████║██╔████╔██║███████║██╔██╗██║
  ██║░░╚██╗██╔══██║██║╚██╔╝██║██╔══██║██║╚████║
  ╚██████╔╝██║░░██║██║░╚═╝░██║██║░░██║██║░╚███║
  ░╚═════╝░╚═╝░░╚═╝╚═╝░░░░░╚═╝╚═╝░░╚═╝╚═╝░░╚══╝
`);

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "What is your project name?",
      default: "./gaman-project",
    },
    {
      type: "list",
      name: "language",
      message: "What language do you use?",
      choices: ["Typescript", "Javascript"],
      default: "Typescript",
    },
    {
      type: "confirm",
      name: "installPack",
      message: "Install dependencies?",
      default: true,
    },
    {
      type: "confirm",
      name: "gitInit",
      message: "Initialize a new git repository?",
      default: true,
    },
  ]);

  const targetDir = path.resolve(process.cwd(), answers.projectName);

  if (fs.existsSync(targetDir)) {
    console.error(`\n❌ Error: Directory "${answers.projectName}" already exists.`);
    process.exit(1);
  }

  const subfolder = answers.language === "Typescript" ? "ts" : "js";
  const degitPath = `7TogkID/gaman/template/${subfolder}`;

  console.log(`\n📁 Fetching ${answers.language} template from GitHub using degit...`);
  try {
    await degit(degitPath).clone(targetDir);
    console.log(`✅ Template "${subfolder}" copied successfully to ${answers.projectName}`);
  } catch (err) {
    console.error("❌ Error cloning the template with degit:", err);
    process.exit(1);
  }

  const packageJsonPath = path.join(targetDir, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = path.basename(answers.projectName);
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    console.log(`✅ Updated package.json with project name "${packageJson.name}".`);
  }

  if (answers.gitInit) {
    console.log("\n🔧 Initializing Git repository...");
    execSync("git init", { cwd: targetDir });
    await fs.writeFile(path.join(targetDir, ".gitignore"), "node_modules\n");
    console.log("✅ Git repository initialized.");
  }

  if (answers.installPack) {
    process.chdir(targetDir);
    console.log("\n📦 Installing dependencies...");
    try {
      execSync("npm install", { stdio: "inherit" });
      console.log("✅ Dependencies installed.");
    } catch (err) {
      console.error("❌ Error during npm install. Please try running it manually.");
    }
  }

  console.log("\n🎉 Project created successfully!");
  console.log(`\n🚀 Next steps:`);
  console.log(`  cd ${answers.projectName}`);
  console.log("  npm run dev");
}

process.on("SIGINT", () => {
  console.log("\n🛑 Stopping the process...");
  process.exit(0);
});

main().catch((err) => {
  console.error("\n🛑 An error occurred:", err.message);
  process.exit(1);
});
