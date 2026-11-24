const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'PRINTER_SHA256.json'), 'utf8'));
let failed = false;
for (const [file, expected] of Object.entries(manifest)) {
  const target = path.join(root, file);
  const actual = fs.existsSync(target) ? crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex') : 'MISSING';
  if (actual !== expected) { console.error('LOCK FAILED:', file); failed = true; }
  else console.log('OK:', file);
}
process.exitCode = failed ? 1 : 0;
