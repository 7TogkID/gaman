import fs from "fs-extra";
import path from "path";

const SRC_DIR = "src";
const MAIN_FILE = path.join(SRC_DIR, "main.ts");

export default async function generateBlock(name: string): Promise<void> {
  const folderPath = path.join(SRC_DIR, name);
  const fileName = `${name}.block.ts`;
  const filePath = path.join(folderPath, fileName);

  // 1. Buat file block
  if (await fs.pathExists(filePath)) {
    console.log(`❌ Block "${name}" already exists.`);
    return;
  }

  const template = `import { defineBlock, Response } from "gaman";

export default defineBlock({
  path: "/${name}",
  routes: {
    "/": {
      GET: () => Response.text("${name} block works!"),
    },
  },
});
`;

  await fs.outputFile(filePath, template);
  console.log(`✅ Created block: ${filePath}`);

  // 2. Tambah import ke main.ts
  if (!await fs.pathExists(MAIN_FILE)) {
    console.warn(`⚠️ Could not find ${MAIN_FILE}. Skipping import.`);
    return;
  }

  const importLine = `import ${name}Block from "./${name}/${name}.block";`;
  let mainContent = await fs.readFile(MAIN_FILE, "utf-8");

  if (!mainContent.includes(importLine)) {
    mainContent = `${importLine}\n${mainContent}`;
    console.log(`✅ Injected import into main.ts`);
  } else {
    console.log(`ℹ️ Import already exists.`);
  }

  // 3. Tambahkan ke blocks array
  const blocksRegex = /blocks:\s*\[([^\]]*)\]/;

  if (blocksRegex.test(mainContent)) {
    mainContent = mainContent.replace(blocksRegex, (_match, inner) => {
      const trimmed = inner.trim();
      const newList = trimmed
        ? `${trimmed}, ${name}Block`
        : `${name}Block`;
      return `blocks: [${newList}]`;
    });

    await fs.writeFile(MAIN_FILE, mainContent);
    console.log(`✅ Added "${name}Block" to blocks array`);
  } else {
    console.warn(`⚠️ Could not find "blocks: []" in main.ts`);
  }
}
