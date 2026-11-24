'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const { loadNative, root } = require('./harness.cjs');
const { restoreFrozenPrinter } = require('../catalogues/zeiss/qa/authorized-print-logo.cjs');
const { decodeRaster, verifyLogoOnlyDelta } = require('./print-raster.cjs');
const D = require('../catalogue-data.js');
const manifest = require('../catalogues/zeiss/PRINTER_SHA256.json');
const currentSource = fs.readFileSync(path.join(root, 'catalogues/zeiss/printer.js'), 'utf8');
const originalSource = restoreFrozenPrinter(currentSource, manifest['printer.js']);
assert.throws(() => restoreFrozenPrinter(currentSource.replace('await sleep(35)', 'await sleep(36)'), manifest['printer.js']));
const current = {}, original = {};
for (const brand of ['stellest', 'hoya', 'zeiss']) {
  current[brand] = loadNative(brand, null, null, [], false);
  original[brand] = loadNative(brand, null, null, [], false);
}
vm.runInContext(originalSource, original.zeiss, { filename: 'frozen-zeiss-printer.js' });
const directoryIndex = process.argv.indexOf('--raster-dir');
const directory = directoryIndex >= 0 ? process.argv[directoryIndex + 1] : null;
if (directory) fs.mkdirSync(directory, { recursive: true });
const report = { status: 'passed', labelCases: 0, zeissLogoOnlyCases: 0, unchangedEssilorHoyaCases: 0, printerTransportBytes: 'unchanged', physicalPrinter: false, liveBrowser: false };
for (const option of D.options) {
  const selection = D.selectionForOption(option.id), shared = { frame: 200, frameComplimentary: false, followups: { one: true, two: true }, complimentary: false };
  for (const c of [current[option.brand], original[option.brand]]) Object.assign(c.state, JSON.parse(JSON.stringify(shared)), selection);
  for (const kind of ['quotation', 'warranty', 'booklet', 'extension']) {
    const commands = current[option.brand].buildLabelTSPL(kind), before = original[option.brand].buildLabelTSPL(kind);
    if (option.brand === 'zeiss') { verifyLogoOnlyDelta(before, commands); report.zeissLogoOnlyCases++; }
    else { assert.equal(commands, before); report.unchangedEssilorHoyaCases++; }
    const pixels = decodeRaster(commands);
    if (directory) {
      const stem = path.join(directory, option.id + '-' + kind);
      fs.writeFileSync(stem + '.pgm', Buffer.concat([Buffer.from('P5\n320 480\n255\n'), Buffer.from(pixels)]));
      const c = current[option.brand];
      if (c.labelArtwork) fs.writeFileSync(stem + '-preview.png', Buffer.from(c.labelArtwork(kind).preview.split(',')[1], 'base64'));
    }
    report.labelCases++;
  }
}
fs.writeFileSync(path.join(__dirname, 'print-logo-verification.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
