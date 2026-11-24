#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const web = fs.existsSync(path.join(root, 'dist', 'index.html')) ? path.join(root, 'dist') : root;
const D = require(path.join(web, 'catalogue-data.js'));
const C = require(path.join(web, 'comparison.js'));
let checks = 0;
const check = (label, fn) => { fn(); checks++; };

check('Approved price and warranty data', () => {
  assert.deepEqual(Object.keys(D.coatings).sort(), ['blueprotect', 'platinum']);
  assert.equal(D.product.name, 'ZEISS MyoActive');
  assert.equal(D.coatings.platinum.price, 1800);
  assert.equal(D.coatings.blueprotect.price, 1900);
  assert.equal(D.product.index, '1.59');
  assert.equal(D.product.warranty.months, 12);
  assert.equal(D.product.warranty.progressionD, 0.5);
  assert.match(D.product.warranty.wording, /at least 0\.50 D more short-sighted within 1 year/);
  assert.equal(D.product.clinical.months, 12);
  assert.equal(D.product.clinical.refractionDifferenceD, 0.60);
  assert.equal(D.product.clinical.axialDifferenceMm, 0.22);
  assert.equal(D.product.clinical.trial, 'NCT06563700');
});

const followupCases = [[false, false, 0], [true, false, 120], [false, true, 120], [true, true, 240]];
const frameCases = [null, 0, 299, 99999];
for (const [coating, lens] of [['platinum', 1800], ['blueprotect', 1900]]) {
  for (const [one, two, chargedFollowups] of followupCases) {
    for (const complimentary of [false, true]) {
      for (const frame of frameCases) {
        for (const frameComplimentary of [false, true]) {
          check(`Totals ${JSON.stringify({ coating, one, two, complimentary, frame, frameComplimentary })}`, () => {
            const input = { coating, followups: { one, two }, complimentary, frame, frameComplimentary };
            const before = JSON.stringify(input);
            const got = D.totals(input);
            const expectedFrame = frameComplimentary || frame == null ? 0 : frame;
            const expectedFollowups = complimentary ? 0 : chargedFollowups;
            assert.equal(got.lens, lens);
            assert.equal(got.frame, expectedFrame);
            assert.equal(got.followups, expectedFollowups);
            assert.equal(got.followupCount, Number(one) + Number(two));
            assert.equal(got.grand, lens + expectedFrame + expectedFollowups);
            assert.equal(JSON.stringify(input), before, 'Calculation must not mutate consultation state');
          });
        }
      }
    }
  }
}

check('Default consultation includes both biometry visits and no frame', () => {
  assert.deepEqual(D.totals(), { lens: 1800, frame: 0, followups: 240, followupCount: 2, grand: 2040 });
});
check('Malformed frame values cannot produce negative, infinite or NaN totals', () => {
  for (const frame of [-1, -99999, Infinity, NaN, 'invalid', 100000, {}]) {
    const s = D.normalizeState({ frame, frameComplimentary: true });
    assert.equal(s.frame, null);
    assert.equal(s.frameComplimentary, false);
    assert.equal(D.totals({ frame, frameComplimentary: true }).grand, 2040);
  }
  assert.equal(D.normalizeState({ frame: '299' }).frame, 299);
  assert.equal(D.normalizeState({ frame: 299.7 }).frame, 300);
  assert.equal(D.normalizeState({ coating: '__proto__' }).coating, 'platinum');
});

check('Warranty duration, trigger and clinical context have separate comparison rows', () => {
  const keys = D.comparisonRows.map(r => r.key);
  assert.equal(new Set(keys).size, keys.length);
  for (const key of ['warrantyDuration', 'warrantyThreshold', 'studyDuration', 'studyComparator', 'sphereRange', 'cylinderRange', 'combinedRange', 'price']) {
    assert.ok(keys.includes(key), `${key} must be a distinct row`);
  }
  assert.notEqual(keys.indexOf('warrantyDuration'), keys.indexOf('warrantyThreshold'));
});
check('Both coatings share exactly the same myopia-control evidence and warranty', () => {
  const [a, b] = D.comparisonOptions();
  for (const key of D.comparisonRows.map(r => r.key)) {
    if (!['coating', 'price'].includes(key)) assert.equal(a.fields[key], b.fields[key], key);
  }
  assert.deepEqual(a.warranty, b.warranty);
  assert.equal(a.fields.studyDuration, '12 months');
  assert.match(a.fields.studyComparator, /single-vision/i);
  assert.equal(a.fields.warrantyDuration, '1 year');
  assert.match(a.fields.warrantyThreshold, /−0\.50 D or more/);
});

function assertRenderedRows(options, rows) {
  const unique = options.filter((x, n, all) => x && x.id && all.findIndex(y => y && y.id === x.id) === n);
  const html = C.render(options, rows);
  if (!unique.length) {
    assert.match(html, /Select an option to compare/);
    assert.doesNotMatch(html, /<table/);
    return;
  }
  assert.equal((html.match(/<table\b/g) || []).length, 1, 'Use one shared semantic table');
  assert.equal((html.match(/<tbody>/g) || []).length, 1);
  const rowMatches = [...html.matchAll(/<tr data-row-key="([^"]+)"[^>]*>([\s\S]*?)<\/tr>/g)];
  assert.deepEqual(rowMatches.map(m => m[1]), rows.map(r => C.escape(r.key)));
  assert.equal((html.match(/<th\b[^>]*scope="col"[^>]*data-option-id=/g) || []).length, unique.length);
  for (let i = 0; i < rows.length; i++) {
    const rowHtml = rowMatches[i][2];
    const cells = [...rowHtml.matchAll(/<td data-row-key="([^"]+)" data-option-id="([^"]+)">([\s\S]*?)<\/td>/g)];
    assert.equal(cells.length, unique.length, rows[i].key);
    for (let j = 0; j < unique.length; j++) {
      const value = unique[j].fields && unique[j].fields[rows[i].key];
      assert.equal(cells[j][1], C.escape(rows[i].key));
      assert.equal(cells[j][2], C.escape(unique[j].id), 'Column order must follow chosen options');
      assert.equal(cells[j][3], C.escape(value == null || value === '' ? 'Not specified' : value));
    }
  }
}

for (const keys of [[], ['platinum'], ['blueprotect'], ['platinum', 'blueprotect'], ['blueprotect', 'platinum'], ['platinum', 'blueprotect', 'platinum'], ['unknown', 'blueprotect'], ['__proto__', 'platinum']]) {
  check(`Coating comparison selection ${JSON.stringify(keys)}`, () => {
    const options = D.comparisonOptions(keys);
    assert.equal(new Set(options.map(o => o.id)).size, options.length);
    assertRenderedRows(options, D.comparisonRows);
  });
}
check('Repeated renderer columns collapse without dropping row values', () => {
  const options = D.comparisonOptions();
  assertRenderedRows([options[1], options[0], options[1], null], D.comparisonRows);
});
check('Longer independent fixture fields and arbitrary row order preserve alignment contract', () => {
  const original = D.comparisonOptions();
  const long = structuredClone(original[0]);
  long.id = 'long-copy-fixture';
  long.name = 'Synthetic long title to exercise wrapping of an option heading';
  long.fields.studyComparator = 'Synthetic comparator explanation. '.repeat(18);
  long.fields.warrantyThreshold = 'Synthetic long warranty explanation. '.repeat(12);
  delete long.fields.combinedRange;
  const rows = [...D.comparisonRows].reverse();
  for (const options of [[long], [long, original[1]], [original[1], long], [original[0], long, original[1]], [original[1], long, original[0]]]) {
    assertRenderedRows(options, rows);
  }
});
check('Comparison content and identifiers are escaped before rendering', () => {
  const html = C.render([{ id: 'x" onmouseover="x', name: '<script>x</script>', fields: { test: '<img src=x onerror=alert(1)> & "quote"' } }], [{ key: 'test', label: '<b>Title</b>' }]);
  assert.doesNotMatch(html, /<script>|<img|<b>/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /&lt;img/);
  assert.match(html, /data-option-id="x&quot; onmouseover=&quot;x"/);
});

const dataSource = fs.readFileSync(path.join(web, 'catalogue-data.js'), 'utf8');
check('MyoActive product data contains no copied competitor, obsolete guarantee or superiority claim', () => {
  assert.doesNotMatch(dataSource, /stellest|essilor|crizal|airwear|0\.75|6.month.*guarantee|highest.*efficacy|superior/i);
});

const vm = require('node:vm');
function appContext() {
  const nodes = new Map();
  const dom = { body: { style: {} }, activeElement: null, addEventListener() {}, querySelector() { return null; } };
  function node(id) {
    if (nodes.has(id)) return nodes.get(id);
    const classes = new Set();
    const n = { id, innerHTML: '', textContent: '', isConnected: true, listeners: {},
      classList: { add(x) { classes.add(x); }, remove(x) { classes.delete(x); }, contains(x) { return classes.has(x); },
        toggle(x, on) { if (on === undefined) on = !classes.has(x); if (on) classes.add(x); else classes.delete(x); } },
      focus() { dom.activeElement = n; }, addEventListener(type, fn) { (n.listeners[type] ||= []).push(fn); }, querySelector() { return null; }
    };
    nodes.set(id, n); return n;
  }
  dom.getElementById = node;
  const ctx = vm.createContext({ MyoActiveData: D, CatalogueComparison: C, document: dom, navigator: {},
    window: { scrollTo() {}, setTimeout() { return 1; }, clearTimeout() {} }, console });
  vm.runInContext(fs.readFileSync(path.join(web, 'app.js'), 'utf8'), ctx);
  return { ctx, dom, nodes };
}
check('Consultation sequence preserves selections when switching coatings and navigating', () => {
  const { ctx, nodes } = appContext();
  assert.equal(ctx.state.screen, 'catalogue');
  assert.equal(ctx.grandTotal(), 2040);
  ctx.selectCoating('blueprotect'); ctx.openSummary();
  assert.equal(ctx.grandTotal(), 2140);
  assert.match(nodes.get('app').innerHTML, /DuraVision Plus BlueProtect UV/);
  ctx.openFramePad();
  for (const digit of '299') ctx.frameKey(digit);
  ctx.confirmFrame();
  assert.equal(ctx.state.frame, 299);
  assert.equal(ctx.grandTotal(), 2439);
  ctx.toggleFollowup('two');
  assert.equal(ctx.grandTotal(), 2319);
  ctx.goHome(); ctx.selectCoating('platinum'); ctx.openSummary();
  assert.equal(ctx.state.frame, 299);
  assert.equal(ctx.state.followups.two, false);
  assert.equal(ctx.grandTotal(), 2219);
  ctx.selectCoating('invalid');
  assert.equal(ctx.state.coating, 'platinum');
});
check('Complimentary toggles retain original amount and restore correct prices', () => {
  const { ctx } = appContext();
  ctx.toggleFrameComplimentary();
  assert.equal(ctx.state.frameComplimentary, false, 'Blank frame cannot become a hidden free line item');
  ctx.openFramePad(); for (const d of '299') ctx.frameKey(d); ctx.confirmFrame();
  ctx.toggleFrameComplimentary();
  assert.equal(ctx.grandTotal(), 2040);
  assert.match(ctx.frameValueHtml(), /<s>RM299<\/s>/);
  ctx.toggleComplimentary();
  assert.equal(ctx.grandTotal(), 1800);
  assert.match(ctx.followupRow('one', 'Follow-up 1'), /<s>RM120<\/s>/);
  assert.match(ctx.followupRow('two', 'Follow-up 2'), /COMPLIMENTARY/);
  ctx.toggleFrameComplimentary();
  assert.equal(ctx.grandTotal(), 2099);
  ctx.toggleComplimentary();
  assert.equal(ctx.grandTotal(), 2339);
  ctx.clearFrame();
  assert.equal(ctx.state.frame, null);
  assert.equal(ctx.state.frameComplimentary, false);
  assert.equal(ctx.grandTotal(), 2040);
});
check('Frame keypad enforces five digits, supports deletion/clear and omits blank/zero frame', () => {
  const { ctx } = appContext();
  ctx.openFramePad();
  for (const d of '999999999') ctx.frameKey(d);
  assert.equal(ctx.state.frameDraft, '99999');
  ctx.frameKey('back'); assert.equal(ctx.state.frameDraft, '9999');
  ctx.frameKey('clear'); assert.equal(ctx.state.frameDraft, '');
  ctx.frameKey('<script>'); assert.equal(ctx.state.frameDraft, '');
  for (const d of '00029') ctx.frameKey(d);
  assert.equal(ctx.state.frameDraft, '29');
  ctx.confirmFrame(); assert.equal(ctx.state.frame, 29);
  ctx.openFramePad(); ctx.frameKey('clear'); ctx.frameKey('0'); ctx.confirmFrame();
  assert.equal(ctx.frameIncluded(), false);
});
check('Comparison toggle and repeat navigation do not alter consultation prices', () => {
  const { ctx, nodes } = appContext();
  ctx.selectCoating('blueprotect'); ctx.toggleCoatingComparison();
  assert.equal(ctx.state.compareOpen, true);
  assert.match(nodes.get('app').innerHTML, /<table class="comparison-table"[^>]*>/);
  ctx.openSummary(); ctx.goHome();
  assert.equal(ctx.state.compareOpen, true);
  assert.equal(ctx.state.coating, 'blueprotect');
  assert.equal(ctx.grandTotal(), 2140);
  ctx.toggleCoatingComparison();
  assert.equal(ctx.state.compareOpen, false);
  assert.doesNotMatch(nodes.get('app').innerHTML, /<table class="comparison-table"[^>]*>/);
  assert.equal(ctx.grandTotal(), 2140);
});

function printerContext() {
  const harness = appContext();
  vm.runInContext(fs.readFileSync(path.join(web, 'printer.js'), 'utf8'), harness.ctx);
  return harness;
}
function syntheticCanvas(blackCoordinates, width = 320, height = 480) {
  const pixels = new Uint8ClampedArray(width * height * 4).fill(255);
  for (const [x, y] of blackCoordinates) {
    const offset = (y * width + x) * 4;
    pixels[offset] = pixels[offset + 1] = pixels[offset + 2] = 0;
  }
  return { width, height, getContext() { return { getImageData() { return { data: pixels }; } }; } };
}
function decodeTSPL(tspl) {
  const prefix = 'SIZE 40 mm,60 mm\r\nGAP 2 mm,0 mm\r\nDIRECTION 1\r\nREFERENCE 0,0\r\nCLS\r\n';
  assert.ok(tspl.startsWith(prefix), 'Each packet uses the physical40×60mm stock');
  let offset = prefix.length;
  const black = new Set();
  while (tspl.startsWith('BITMAP ', offset)) {
    const header = /^BITMAP (\d+),(\d+),(\d+),(\d+),0,/.exec(tspl.slice(offset));
    assert.ok(header, 'Valid bitmap command header');
    const [x, y, byteWidth, height] = header.slice(1).map(Number);
    assert.ok(x >= 0 && y >= 0 && x + byteWidth * 8 <= 320 && y + height <= 480);
    offset += header[0].length;
    const data = tspl.slice(offset, offset + byteWidth * height);
    assert.equal(data.length, byteWidth * height);
    for (let yy = 0; yy < height; yy++) for (let bx = 0; bx < byteWidth; bx++) {
      const bits = 255 - data.charCodeAt(yy * byteWidth + bx);
      for (let bit = 0; bit < 8; bit++) if (bits & (128 >> bit)) black.add(`${x + bx * 8 + bit},${y + yy}`);
    }
    offset += data.length;
    assert.equal(tspl.slice(offset, offset + 2), '\r\n');
    offset += 2;
  }
  assert.equal(tspl.slice(offset), 'PRINT 1,1\r\n');
  return black;
}
check('Printer raster packets preserve every black pixel and white background across all bands', () => {
  const { ctx } = printerContext();
  const points = [[0, 0], [7, 79], [8, 80], [319, 159], [45, 160], [301, 239], [160, 240], [0, 319], [100, 320], [88, 399], [200, 400], [319, 479]];
  const tspl = ctx.rasterToTSPL(syntheticCanvas(points));
  assert.deepEqual([...decodeTSPL(tspl)].sort(), points.map(([x, y]) => `${x},${y}`).sort());
  assert.equal(decodeTSPL(ctx.rasterToTSPL(syntheticCanvas([]))).size, 0);
  assert.throws(() => ctx.rasterToTSPL(syntheticCanvas([], 480, 320)), /320.*480/);
  assert.throws(() => ctx.labelArtwork('invalid-label-type'), /Unknown label type/);
});
check('Quotation rows omit excluded items and retain original complimentary prices', () => {
  const { ctx } = printerContext();
  ctx.state.coating = 'blueprotect';
  ctx.state.frame = 299; ctx.state.frameComplimentary = true;
  ctx.state.followups = { one: false, two: true }; ctx.state.complimentary = true;
  const rows = JSON.parse(JSON.stringify(ctx.quotationRows()));
  assert.deepEqual(rows, [{ label: 'Lens pair', amount: 1900, struck: false }, { label: 'Frame', amount: 299, struck: true }, { label: 'Follow-up 2', amount: 120, struck: true }]);
  assert.equal(ctx.grandTotal(), 1900);
});
check('Printer logo dimensions and guarantee strings match the standalone MyoActive module', () => {
  const { ctx } = printerContext();
  assert.equal(ctx.ZEISS_LOGO_HEX.length, 48 * 6 * 2);
  const source = fs.readFileSync(path.join(web, 'printer.js'), 'utf8');
  assert.doesNotMatch(source, /stellest|essilor|crizal|airwear|0\.75|6.month|window\.print/i);
  assert.match(source, /labelParagraph\(ctx, w\.condition/);
  assert.match(ctx.DATA.product.warranty.wording, /Complimentary replacement if prescription power becomes at least 0\.50 D more short-sighted within 1 year/);
  assert.match(source, /ctx\.translate\(320, 0\); ctx\.rotate\(Math\.PI \/ 2\)/);
});

(async () => {
  const { ctx } = printerContext();
  const delays = [];
  ctx.window.setTimeout = (callback, delay) => { delays.push(delay); callback(); return 1; };
  ctx.setPrintStatus = () => {};
  const sent = [];
  const text = String.fromCharCode(...Array.from({ length: 57 }, (_, n) => (n * 17) & 255));
  await ctx.writeChunks({ properties: { writeWithoutResponse: true }, async writeValueWithoutResponse(bytes) { sent.push([...bytes]); } }, text, 'Quotation');
  check('BLE transport uses20-byte chunks,35ms pacing and preserves binary octets', () => {
    assert.deepEqual(sent.map(b => b.length), [20, 20, 17]);
    assert.deepEqual(sent.flat(), Array.from(text, ch => ch.charCodeAt(0)));
    assert.deepEqual(delays, [35, 35, 35]);
  });
  sent.length = 0; delays.length = 0;
  await ctx.writeChunks({ properties: {}, async writeValue(bytes) { sent.push([...bytes]); } }, text, 'Quotation');
  check('BLE transport supports response-writing fallback with identical bytes', () => {
    assert.deepEqual(sent.map(b => b.length), [20, 20, 17]);
    assert.deepEqual(sent.flat(), Array.from(text, ch => ch.charCodeAt(0)));
  });
  const result = { passed: checks, failed: 0, financialPermutations: 128, testedAt: new Date().toISOString(), notes: 'Browser geometry and physical Bluetooth printer require separate validation. BLE tested with a simulated characteristic only.' };
  fs.writeFileSync(path.join(__dirname, 'verification.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
