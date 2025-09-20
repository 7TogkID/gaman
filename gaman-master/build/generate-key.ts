import { randomBytes } from 'crypto';
import path from 'path';
import fs from 'fs/promises';

const envPath = path.join(process.cwd(), '.env');
const gamanKey = randomBytes(32).toString('hex');

await fs.writeFile(envPath, `GAMAN_KEY=${gamanKey}\n`);
console.log('🔐 Generated GAMAN_KEY and saved to .env');
