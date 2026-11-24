#!/usr/bin/env node
'use strict';

// Optional real-raster check. Run: node qa/verify-artwork.cjs
// Dependency: npm install --no-save @napi-rs/canvas
// Font overrides: HOYA_QA_FONT_REGULAR and HOYA_QA_FONT_BOLD (absolute font paths).
// Optional diagnostic images: node qa/verify-artwork.cjs --png-dir /absolute/path
// These checks do not establish browser, iPad, Bluetooth or physical-printer results.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');

function report(value) { process.stdout.write(JSON.stringify(value, null, 2) + '\n'); }
function skip(reason, instructions) {
  report({ status: 'skipped', labelCases: 0, reason, instructions });
  process.exitCode = 0;
}
function loadCanvas() {
  try { return require('@napi-rs/canvas'); }
  catch (error) {
    if (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) {
      try { return require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '@napi-rs/canvas')); }
      catch (_) { /* Report the optional dependency below. */ }
    }
    return null;
  }
}
function fontFile(weight) {
  const variable = weight === 'bold' ? 'HOYA_QA_FONT_BOLD' : 'HOYA_QA_FONT_REGULAR';
  if (process.env[variable]) {
    assert.ok(fs.existsSync(process.env[variable]), variable + ' does not identify an existing font');
    return process.env[variable];
  }
  const suffix = weight === 'bold' ? 'Bold' : 'Regular';
  const candidates = [
    '/usr/share/fonts/truetype/liberation/LiberationSans-' + suffix + '.ttf',
    '/usr/share/fonts/truetype/liberation2/LiberationSans-' + suffix + '.ttf',
    '/Library/Fonts/Arial' + (weight === 'bold' ? ' Bold' : '') + '.ttf',
    path.join(process.env.WINDIR || 'C:\\Windows', 'Fonts', weight === 'bold' ? 'arialbd.ttf' : 'arial.ttf')
  ];
  const found = candidates.find(candidate => fs.existsSync(candidate));
  if (found) return found;
  try {
    const matched = execFileSync('fc-match', ['-f', '%{file}', weight === 'bold' ? 'Arial:style=Bold' : 'Arial'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (matched && fs.existsSync(matched)) return matched;
  } catch (_) { /* Fontconfig is optional on non-Linux platforms. */ }
  return null;
}

function run() {
  const canvasLibrary = loadCanvas();
  if (!canvasLibrary) return skip('Optional @napi-rs/canvas dependency is unavailable.',
    'Install npm install --no-save @napi-rs/canvas, then rerun node qa/verify-artwork.cjs.');
  const regular = fontFile('regular'), bold = fontFile('bold');
  if (!regular || !bold) return skip('Arial-compatible regular and bold font files were not found.',
    'Set HOYA_QA_FONT_REGULAR and HOYA_QA_FONT_BOLD to Arial or Liberation Sans font files, then rerun.');
  const { createCanvas, GlobalFonts } = canvasLibrary;
  assert.ok(GlobalFonts.registerFromPath(regular, 'Arial'), 'Unable to register the regular font');
  assert.ok(GlobalFonts.registerFromPath(bold, 'Arial'), 'Unable to register the bold font');

  const root = path.resolve(__dirname, '..');
  const web = fs.existsSync(path.join(root, 'dist', 'index.html')) ? path.join(root, 'dist') : root;
  const D = require(path.join(web, 'catalogue-data.js'));
  let state = {}, canvases = [], textRecords = [];
  const badText = [];
  function makeCanvas() {
    const canvas = createCanvas(1, 1), originalGetContext = canvas.getContext.bind(canvas);
    let context;
    canvas.getContext = function (...args) {
      if (context) return context;
      context = originalGetContext(...args);
      const originalFillText = context.fillText.bind(context);
      context.fillText = function (value, x, y, ...rest) {
        const metrics = context.measureText(value);
        const size = Number((context.font.match(/(\d+)px/) || [])[1] || 16);
        const left = context.textAlign === 'right' ? x - metrics.width : x;
        textRecords.push({ text: String(value), left, right: left + metrics.width,
          top: y, bottom: y + size, width: canvas.width, height: canvas.height });
        return originalFillText(value, x, y, ...rest);
      };
      return context;
    };
    canvases.push(canvas);
    return canvas;
  }
  const context = vm.createContext({
    DATA: D, state, navigator: {}, window: {}, document: { createElement: makeCanvas },
    currentProduct: () => D.products[state.product], coatingPrice: () => D.price(state),
    frameIncluded: () => state.frame !== null, grandTotal: () => D.totals(state).grand, money: D.money
  });
  vm.runInContext(fs.readFileSync(path.join(web, 'printer.js'), 'utf8'), context, { filename: 'printer.js' });
  const pngIndex = process.argv.indexOf('--png-dir');
  const pngDirectory = pngIndex >= 0 ? process.argv[pngIndex + 1] : null;
  if (pngIndex >= 0) assert.ok(pngDirectory, '--png-dir requires a directory path');
  if (pngDirectory) fs.mkdirSync(pngDirectory, { recursive: true });
  let labelCases = 0, physicalRasters = 0, textRuns = 0;
  const kinds = ['quotation', 'warranty', 'booklet', 'extension'];
  const options = D.allOptions();
  for (const option of options) {
    Object.assign(state, { product: option.productKey, style: option.styleId, coating: option.coatingId,
      frame: 99999, frameComplimentary: true, followups: { one: true, two: true }, complimentary: true });
    for (const kind of kinds) {
      canvases = []; textRecords = [];
      context.labelArtworkCache = Object.create(null);
      const art = context.labelArtwork(kind);
      assert.equal(art.width, kind === 'quotation' ? 320 : 480);
      assert.equal(art.height, kind === 'quotation' ? 480 : 320);
      for (const record of textRecords) {
        if (record.left < 0 || record.right > record.width || record.top < 0 || record.bottom > record.height) {
          badText.push({ option: option.id, kind, ...record });
        }
      }
      textRuns += textRecords.length;
      const physical = canvases[canvases.length - 1];
      assert.equal(physical.width, 320);
      assert.equal(physical.height, 480);
      const data = physical.getContext('2d').getImageData(0, 0, 320, 480).data;
      let black = 0;
      for (let i = 0; i < data.length; i += 4) {
        assert.ok(data[i] === 0 || data[i] === 255, 'Raster contains non-monochrome pixels');
        assert.equal(data[i], data[i + 1]); assert.equal(data[i], data[i + 2]); assert.equal(data[i + 3], 255);
        if (data[i] === 0) black++;
      }
      assert.ok(black > 0 && black < 320 * 480, 'Raster must contain both black and white pixels');
      assert.ok(art.tspl.startsWith('SIZE 40 mm,60 mm\r\nGAP 2 mm,0 mm\r\n'));
      if (pngDirectory) fs.writeFileSync(path.join(pngDirectory, option.id + '-' + kind + '.png'),
        Buffer.from(art.preview.split(',')[1], 'base64'));
      labelCases++; physicalRasters++;
    }
  }
  const result = { status: badText.length ? 'failed' : 'passed', labelCases, validOptions: options.length,
    physicalRasters, textRuns, outOfBoundsText: badText.length, details: badText,
    fonts: { regular, bold },
    notes: 'Actual canvas artwork and monochrome physical rasters checked. Maximum frame amount and both complimentary follow-ups included. Text advance bounds checked; this does not replace visual review, browser geometry or physical-printer validation.' };
  report(result);
  if (badText.length) process.exitCode = 1;
}
try { run(); }
catch (error) { report({ status: 'failed', error: error && error.message ? error.message : String(error) }); process.exitCode = 1; }
