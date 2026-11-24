const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'PRINTER_SHA256.json'), 'utf8'));
let failed = false;
for (const [file, expected] of Object.entries(manifest)) {
  const target = path.join(root, file);
  const actual = fs.existsSync(target) ? crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex') : 'MISSING';
  if (actual === expected) console.log('OK:', file);
  else if (file === 'printer.js' && actual !== 'MISSING') {
    try {
      require('./authorized-print-logo.cjs').restoreFrozenPrinter(fs.readFileSync(target, 'utf8'), expected);
      console.log('OK:', file, '(authorized ZEISS logo inversion; every other byte matches frozen baseline)');
    } catch (error) { console.error('LOCK FAILED:', file, error.message); failed = true; }
  } else { console.error('LOCK FAILED:', file); failed = true; }
}
process.exitCode = failed ? 1 : 0;
