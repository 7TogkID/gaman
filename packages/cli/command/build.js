"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildCommand = void 0;
exports.runBuild = runBuild;
const esbuild = require("esbuild");
const fg = require("fast-glob");
const fs_1 = require("fs");
const path_1 = require("path");
const logger_1 = require("@gaman/core/utils/logger");
const command_1 = require("./command");
async function runBuild() {
    const distDir = 'dist';
    if ((0, fs_1.existsSync)(distDir)) {
        logger_1.Logger.log('Cleaning previous build...');
        (0, fs_1.rmSync)(distDir, { recursive: true, force: true });
    }
    logger_1.Logger.log('Searching entry points...');
    const entryPoints = await fg(['src/**/*.{ts,js}'], {
        ignore: ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.d.*'],
    });
    logger_1.Logger.log(`Found ${entryPoints.length} entry files`);
    const start = Date.now();
    await esbuild.build({
        entryPoints,
        outdir: 'dist/output',
        bundle: true,
        format: 'esm',
        platform: 'node',
        target: 'node18',
        minify: true,
        sourcemap: false,
        legalComments: 'none',
        packages: 'external',
        entryNames: '[hash]',
        plugins: [
            {
                name: 'gaman-build-log',
                setup(build) {
                    build.onLoad({ filter: /\.(ts|js)$/ }, async (args) => {
                        logger_1.Logger.log(`✔ Loaded: ${args.path}`);
                        return null;
                    });
                    build.onStart(() => {
                        logger_1.Logger.log('Build started...');
                    });
                    build.onEnd(() => {
                        logger_1.Logger.log('Build output done. Reading output files...');
                        const distOutputDir = 'dist/output';
                        const files = (0, fs_1.readdirSync)(distOutputDir).filter((f) => f.endsWith('.js'));
                        const mainFile = files.find((file) => {
                            const content = (0, fs_1.readFileSync)((0, path_1.join)(distOutputDir, file), 'utf8');
                            return (/\bserv\s*\(/.test(content) || /blocks\s*:\s*\[/.test(content));
                        });
                        if (!mainFile) {
                            logger_1.Logger.error('Failed to find bundled main file.');
                            process.exit(1);
                        }
                        logger_1.Logger.log(`Main file detected: ${mainFile}`);
                        logger_1.Logger.log('Generating entry.mjs...');
                        const entryCode = `import "./output/${mainFile}";\n`;
                        (0, fs_1.writeFileSync)((0, path_1.join)('dist', 'entry.mjs'), entryCode);
                        logger_1.Logger.log('entry.mjs generated successfully.');
                        logger_1.Logger.log(`Build finished in ${Date.now() - start}ms`);
                    });
                },
            },
        ],
    });
}
class BuildCommand extends command_1.Command {
    constructor() {
        super('build', 'Build the application', 'gaman build', []);
    }
    async execute() {
        await runBuild();
    }
}
exports.BuildCommand = BuildCommand;
exports.default = new BuildCommand();
