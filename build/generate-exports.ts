import fs from 'node:fs';

const exportsMap: Record<string, string> = {
	// Integrations
	nunjucks: 'integration/nunjucks/index',
	ejs: 'integration/ejs/index',
	static: 'integration/static/index',
	session: 'integration/session/index',
	integration: 'integration/index',
	service: 'service/index',
	routes: 'routes/index',

	// Middlewares
	cors: 'middleware/cors/index',
	'basic-auth': 'middleware/basic-auth/index',
	middleware: 'middleware/index',

	// utils
	utils: 'utils/index',

	file: 'context/formdata/file/index',
	formdata: 'context/formdata/index',
	cookies: 'context/cookies/index',

	exception: 'error/index',
	headers: 'headers/index',

	tree: 'tree/index',
	block: 'block/index',
	response: 'response',
	next: 'next',
	types: 'types',
	base: 'gaman-base'
};

const exportsField: Record<string, any> = {
	'.': {
		types: './dist/index.d.ts',
		import: './dist/index.js',
		require: './dist/cjs/index.js',
	},
};

const typesVersions: Record<string, Record<string, string[]>> = {
	'*': {},
};

for (const [subpath, file] of Object.entries(exportsMap)) {
	const typesPath = `./dist/${file}.d.ts`;
	const importPath = `./dist/${file}.js`;
	const requirePath = `./dist/cjs/${file}.js`;

	// Tambahkan ke exports
	exportsField[`./${subpath}`] = {
		types: typesPath,
		import: importPath,
		require: requirePath,
	};

	// Tambahkan ke typesVersions
	typesVersions['*'][subpath] = [typesPath.replace('.d.ts', '')];
}

// Baca package.json
const pkgPath = './package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// Update fields
pkg.exports = exportsField;
pkg.typesVersions = typesVersions;

// Tulis ulang package.json
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
console.log('✅ Generated exports & typesVersions in package.json');
