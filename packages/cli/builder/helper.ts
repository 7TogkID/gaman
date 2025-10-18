import fs, { existsSync } from 'fs';
import path from 'path';

export const isDevelopment = (outdir: string) => {
	return existsSync(path.join(outdir, '.development'));
};

/**
 * ini akan membuat file `.development` di folder /dist atau folder tujuan build jadinya
 * file ini menandakan bahwa build an tersebut itu di mode development
 */
export const createDevelopmentFile = (outdir: string) => {
	fs.mkdirSync(outdir, { recursive: true });
	const filePath = path.join(outdir, '.development');
	const content = `# GamanJS Development Mode\nCreated at: ${new Date().toISOString()}\n`;
	fs.writeFileSync(filePath, content, 'utf-8');
};

/**
 * Ini akan membuat file `.production` di folder /dist atau folder tujuan build jadi nya
 * file ini menandakan bahwa build an tersebut itu di mode production
 */
export const createProductionFile = (outdir: string) => {
	fs.mkdirSync(outdir, { recursive: true });
	const filePath = path.join(outdir, '.production');
	const content = `# GamanJS Production Mode\nCreated at: ${new Date().toISOString()}\n`;
	fs.writeFileSync(filePath, content, 'utf-8');
};
