import fs from 'node:fs';

type ExportEntry = {
  types: string;
  import: string;
  require: string;
};

// Map subpath → file
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

  // Utils
  utils: 'utils/index',

  file: 'context/formdata/file/index',
  formdata: 'context/formdata/index',
  cookies: 'context/cookies/index',

  exception: 'error/index',
  headers: 'headers/index',

  block: 'block/index',
  response: 'response',
  next: 'next',
  types: 'types',
  app: 'gaman-app',
};

// Base exports (root entry)
const exportsField: Record<string, ExportEntry> = {
  '.': {
    types: './dist/index.d.ts',
    import: './dist/index.js',
    require: './dist/cjs/index.js',
  },
};

const typesVersions: Record<string, Record<string, string[]>> = { '*': {} };

// Build exports & typesVersions
Object.entries(exportsMap).forEach(([subpath, file]) => {
  const typesPath = `./dist/${file}.d.ts`;
  const importPath = `./dist/${file}.js`;
  const requirePath = `./dist/cjs/${file}.js`;

  exportsField[`./${subpath}`] = { types: typesPath, import: importPath, require: requirePath };
  typesVersions['*'][subpath] = [typesPath.replace(/\.d\.ts$/, '')];
});

// Safely update package.json
const pkgPath = './package.json';
try {
  const pkgRaw = fs.readFileSync(pkgPath, 'utf8');
  const pkg = JSON.parse(pkgRaw);

  const updatedPkg = {
    ...pkg,
    exports: exportsField,
    typesVersions,
  };

  fs.writeFileSync(pkgPath, JSON.stringify(updatedPkg, null, 2));
  console.log('✓ Successfully updated package.json exports & typesVersions ^_____^');
} catch (err) {
  console.error('X Failed to update package.json:', err);
  process.exit(1);
}
