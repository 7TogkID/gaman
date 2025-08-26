#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import degit from 'degit';
import { randomBytes } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dependencies = ['common', 'core', 'cli'];

async function getPackageLatest(dep) {
	return await fetch(`https://registry.npmjs.org/@gaman/${dep}/latest`).then(
		(r) => r.json(),
	);
}

// async function getTemplateMap() {
// 	return await fetch(
// 		'https://raw.githubusercontent.com/7TogkID/gaman/refs/heads/master/template/map.json',
// 	).then((r) => r.json());
// }

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
	// const templateMap = await getTemplateMap();

	const answers = await inquirer.prompt([
		{
			type: 'input',
			name: 'projectName',
			message: 'What is your project name?',
			default: './gaman-app',
		},
		{
			type: 'list',
			name: 'language',
			message: 'What language do you want to use?',
			choices: ['typescript', 'javascript'],
			default: 'typescript',
		},
		{
			type: 'list',
			name: 'packageManager',
			message: 'Choose a package manager',
			choices: ['npm', 'pnpm', 'bun', 'yarn'],
			default: 'npm',
		},
		{
			type: 'confirm',
			name: 'installPack',
			message: 'Install dependencies?',
			default: true,
		},
		{
			type: 'confirm',
			name: 'gitInit',
			message: 'Initialize a new git repository?',
			default: true,
		},
	]);

	const targetDir = path.resolve(process.cwd(), answers.projectName);

	if (fs.existsSync(targetDir)) {
		console.error(
			`\n❌ Error: Directory "${answers.projectName}" already exists.`,
		);
		process.exit(1);
	}

	const subfolder = answers.language;
	const degitPath = `7TogkID/gaman/template/${subfolder}`;

	console.log(`\n📁 Fetching template "${answers.language}" from GitHub...`);
	try {
		await degit(degitPath).clone(targetDir);
		console.log(`✅ Template copied to ${answers.projectName}`);
	} catch (err) {
		console.error('❌ Error cloning the template:', err);
		process.exit(1);
	}

	// Update package.json
	const packageJsonPath = path.join(targetDir, 'package.json');
	if (fs.existsSync(packageJsonPath)) {
		const packageJson = await fs.readJson(packageJsonPath);
		packageJson.name = path.basename(answers.projectName);

		if (packageJson.dependencies) {
			for (const dep of dependencies) {
				const latestGaman = (await getPackageLatest(dep)).version;
				packageJson.dependencies[`@gaman/${dep}`] = `^${latestGaman}`;
			}
		}

		await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
		console.log(`✅ Updated package.json`);
	}

	// Init Git
	if (answers.gitInit) {
		console.log('\n🔧 Initializing Git repository...');
		execSync('git init', { cwd: targetDir });
		await fs.writeFile(path.join(targetDir, '.gitignore'), 'node_modules\n');
		console.log('✅ Git repository initialized.');
	}

	// Install dependencies
	if (answers.installPack) {
		process.chdir(targetDir);
		console.log(
			`\n📦 Installing dependencies with ${answers.packageManager}...`,
		);
		try {
			execSync(`${answers.packageManager} install`, { stdio: 'inherit' });
			console.log('✅ Dependencies installed.');
		} catch (err) {
			console.error(
				`❌ Error during install with ${answers.packageManager}. Please try manually.`,
			);
		}
	}

	// Done!
	console.log('\n🎉 Project created successfully!');
	console.log('\n🚀 Next steps:');
	console.log(`  cd ${answers.projectName}`);
	console.log(`  ${answers.packageManager} run dev`);
}

process.on('SIGINT', () => {
	console.log('\n🛑 Stopping the process...');
	process.exit(0);
});

main().catch((err) => {
	console.error('\n🛑 An error occurred:', err.message);
	process.exit(1);
});
