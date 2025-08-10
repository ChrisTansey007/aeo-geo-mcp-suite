import fs from 'fs';
import path from 'path';

const src = path.resolve(__dirname, '../../data/app.db');
const dir = path.resolve(__dirname, '../../data/backups');
fs.mkdirSync(dir, { recursive: true });
const date = new Date().toISOString().slice(0,10).replace(/-/g,'');
const dest = path.join(dir, `app-${date}.db`);
fs.copyFileSync(src, dest);
