'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const digest = value => crypto.createHash('sha256').update(value).digest('hex');

// Verify the explicit logo-only authorization without replacing the frozen manifest.
function restoreFrozenPrinter(source, frozenSha256) {
  const authorization = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'PRINTER_LOGO_AUTHORIZATION.json'), 'utf8'));
  assert.equal(authorization.file, 'printer.js');
  assert.equal(authorization.width, 48); assert.equal(authorization.height, 48);
  assert.equal(authorization.originalPrinterSha256, frozenSha256);
  assert.equal(digest(source), authorization.approvedPrinterSha256, 'Unexpected printer edit');
  const original = Buffer.from(authorization.originalLogoHex, 'hex');
  const approved = Buffer.from(authorization.approvedLogoHex, 'hex');
  assert.equal(original.length, 288); assert.equal(approved.length, 288);
  for (let i = 0; i < original.length; i++) assert.equal(approved[i], 255 - original[i], 'Only logo polarity inversion is authorized');
  const newLine = "var ZEISS_LOGO_HEX = '" + authorization.approvedLogoHex + "';";
  const oldLine = "var ZEISS_LOGO_HEX = '" + authorization.originalLogoHex + "';";
  const pieces = source.split(newLine);
  assert.equal(pieces.length, 2, 'Expected exactly one authorized logo constant');
  const frozen = pieces.join(oldLine);
  assert.equal(digest(frozen), frozenSha256, 'Non-logo printer bytes changed');
  return frozen;
}
module.exports = { restoreFrozenPrinter };
