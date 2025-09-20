import * as _path from 'path';
import * as fs from 'fs';
import { Command } from '../command.js';
import { parsePath } from '../../utils/parse.js';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { Log } from '@gaman/common/utils/logger.js';
import { SRC_DIR } from '@gaman/common/contants.js';

class MakeService extends Command {
  constructor() {
    super(
      'make:service',
      'Generate a service template',
      'gaman make:service <name>',
			['make:s']
    );
  }

  async execute(args: Record<string, any>): Promise<void> {
    let filePath = args._?.[0];
    if (!filePath) {
      Log.error(`usage: ${this.usage}`);
      return;
    }

    const { path, name } = parsePath(filePath);
    filePath = _path.join(
      process.cwd(),
      `src/module/${path}`,
      `${name}.service.ts`,
    );

    if (existsSync(filePath)) {
      Log.error(`Service "${name}" already exists.`);
      return;
    }

    const dir = _path.dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const template = `import { defineService } from "@gaman/core/service";

interface Deps {
  // place your dependencies or other services
}

export default defineService(({}: Deps) => ({
  getMessage: async () => '❤️ Welcome to GamanJS',
}));
`;

    writeFileSync(filePath, template, { encoding: 'utf-8' });

    placeToDataServiceBlock(path);

    Log.info(`Created service: ${filePath}`);
  }
}

function placeToDataServiceBlock(pathName: string) {
  const { path, name } = parsePath(pathName);
  try {
    let blockContent = fs.readFileSync(
      `${SRC_DIR}/module/${path}/${name}.block.ts`,
      'utf-8',
    );

    const importLine = `import ${name}Service from "./${name}.service.ts";`;

    // Tambahkan import jika belum ada
    if (!blockContent.includes(importLine)) {
      blockContent = importLine + '\n' + blockContent;
      Log.info(`Import for "${name}Service" added`);
    }

    const configRegex = /defineBlock\s*\(\s*\{\s*([\s\S]*?)\}\s*\)/m;
    const match = blockContent.match(configRegex);

    if (match) {
      const fullMatch = match[0];
      const innerContent = match[1];

      const servicesRegex = /bindings:\s*\{([\s\S]*?)\}/m;
      let updatedInner = innerContent;

      if (servicesRegex.test(innerContent)) {
        updatedInner = innerContent.replace(servicesRegex, (_m, items) => {
          const trimmed = items.trim();
          const newItems = trimmed
            ? `${trimmed}, ${name}Service: ${name}Service`
            : `${name}Service: ${name}Service`;
          return `bindings: { ${newItems} }`;
        });

        Log.info(`Added "${name}Service" to existing services object`);
      } else {
        // Inject properti baru
        updatedInner = `bindings: { ${name}Service: ${name}Service },\n  ${innerContent.trim()}\n`;
        Log.info(`Injected new bindings object with "${name}Service"`);
      }

      const updatedFull = fullMatch.replace(innerContent, updatedInner);
      blockContent = blockContent.replace(fullMatch, updatedFull);

      fs.writeFileSync(
        `${SRC_DIR}/module/${path}/${name}.block.ts`,
        blockContent,
      );
    } else {
      Log.warn(`Could not find defineBlock({ ... }) config`);
    }
  } catch (err) {
    Log.error(`Failed to inject service: ${err}`);
  }
}

export default new MakeService();
