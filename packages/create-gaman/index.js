#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import degit from 'degit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dependencies = ['common', 'core', 'cli'];

async function getPackageLatest(dep) {
	return await fetch(`https://registry.npmjs.org/@gaman/${dep}/latest`).then(
		(r) => r.json(),
	);
}

async function getSampleMap() {
	return await fetch(
		'https://raw.githubusercontent.com/7TogkID/gaman/refs/heads/master/sample/map.json',
	).then((r) => r.json());
}

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

	// 🔹 Step 1: pilih mode
	const { mode } = await inquirer.prompt([
		{
			type: 'list',
			name: 'mode',
			message: 'What do you want to do?',
			choices: ['Start Project', 'Explore Samples'],
			default: 'Start Project',
		},
	]);

	let projectType = 'template';
	let subfolder = 'typescript'; // default
	let projectName = './gaman-app';
	let packageManager = 'npm';
	let installPack = true;
	let gitInit = true;

	if (mode === 'Explore Samples') {
		const sampleMap = await getSampleMap();
		const { sampleKey } = await inquirer.prompt([
			{
				type: 'list',
				name: 'sampleKey',
				message: 'Choose a sample to use:',
				choices: Object.keys(sampleMap),
			},
		]);

		subfolder = sampleMap[sampleKey];
		projectType = 'sample';

		const ans = await inquirer.prompt([
			{
				type: 'input',
				name: 'projectName',
				message: 'What is your project name?',
				default: `./${sampleKey.replace(/\s+/g, '-').toLowerCase()}`,
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

		projectName = ans.projectName;
		packageManager = ans.packageManager;
		installPack = ans.installPack;
		gitInit = ans.gitInit;
	} else {
		// Start Project
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

		projectName = answers.projectName;
		subfolder = answers.language;
		packageManager = answers.packageManager;
		installPack = answers.installPack;
		gitInit = answers.gitInit;
	}
	
	const targetDir = path.resolve(process.cwd(), projectName);

	if (fs.existsSync(targetDir)) {
		console.error(`\n❌ Error: Directory "${projectName}" already exists.`);
		process.exit(1);
	}

	// 🔹 Bedain path template / sample
	const degitPath =
		projectType === 'template'
			? `7TogkID/gaman/template/${subfolder}`
			: `7TogkID/gaman/sample/${subfolder}`;

	console.log(`\n📁 Fetching ${projectType} "${subfolder}" from GitHub...`);
	try {
		await degit(degitPath).clone(targetDir);
		console.log(`✅ ${projectType} copied to ${projectName}`);
	} catch (err) {
		console.error('❌ Error cloning the project:', err);
		process.exit(1);
	}

	// Update package.json
	const packageJsonPath = path.join(targetDir, 'package.json');
	if (fs.existsSync(packageJsonPath)) {
		const packageJson = await fs.readJson(packageJsonPath);
		packageJson.name = path.basename(projectName);

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
	if (gitInit) {
		console.log('\n🔧 Initializing Git repository...');
		execSync('git init', { cwd: targetDir });
		await fs.writeFile(path.join(targetDir, '.gitignore'), 'node_modules\n');
		console.log('✅ Git repository initialized.');
	}

	// Install dependencies
	if (installPack) {
		process.chdir(targetDir);
		console.log(`\n📦 Installing dependencies with ${packageManager}...`);
		try {
			execSync(`${packageManager} install`, { stdio: 'inherit' });
			console.log('✅ Dependencies installed.');
		} catch (err) {
			console.error(
				`❌ Error during install with ${packageManager}. Please try manually.`,
			);
		}
	}

	// Done!
	console.log('\n🎉 Project created successfully!');
	console.log('\n🚀 Next steps:');
	console.log(`  cd ${projectName}`);
	console.log(`  ${packageManager} run dev`);
}

process.on('SIGINT', () => {
	console.log('\n🛑 Stopping the process...');
	process.exit(0);
});

main().catch((err) => {
	process.exit(1);
});
