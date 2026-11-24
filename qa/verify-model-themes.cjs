'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { createHub, root } = require('./harness.cjs');
const D = require('../catalogue-data.js');
const H = require('../catalogues/hoya/catalogue-data.js');
const themeFor = option => option.brand === 'zeiss' ? 'myoactive' : option.productKey;
const modelFor = option => option.fields.lensDesign.replace(/^(?:Essilor|HOYA|ZEISS)\s+/i, '');
const styleFor = option => option.brand === 'hoya' ? H.styleLabel(H.styles[option.styleId]) : option.fields.lensStyle;
const h = createHub(); h.flush();
const report = { status: 'passed', selectedRoutes: 0, comparisonIdentities: 0, chooserIdentities: 0, contrastPairs: 0, liveBrowser: false, computedLayout: false, physicalPrinter: false };

// All model bands may be coloured, but none may imply an initial lens choice.
for (let index = 0; index < D.brands.length; index++) {
  const brand = D.brands[index].id;
  h.app.showTab(brand); h.flush();
  assert.equal(h.app.state.byBrand[brand], null);
  assert.equal(h.children[brand].document.documentElement.getAttribute('data-hub-selected'), 'false');
  assert.equal(h.children[brand].document.querySelectorAll('.family-build-card.selected').length, 0);
  h.app.showTab('compare'); h.flush(); h.app.openChooser(index);
  for (const button of h.host.document.getElementById('lensChoices').querySelectorAll('[data-pick-id]')) {
    const option = D.getOption(button.getAttribute('data-pick-id'));
    assert.equal(button.getAttribute('data-model-theme'), themeFor(option));
    assert.equal(button.getAttribute('aria-pressed'), 'false'); report.chooserIdentities++;
  }
  h.app.closeChooser();
}
assert.equal(h.app.state.comparison.length, 0);

for (const option of D.options) {
  const index = D.brands.findIndex(brand => brand.id === option.brand);
  h.app.choose(index, option.id); h.flush(); h.app.showTab('compare'); h.flush();
  for (const table of h.host.document.getElementById('comparisonBody').querySelectorAll('table[data-section-table]')) {
    const header = table.querySelector('th[data-option-id="' + option.id + '"]');
    assert.equal(header.getAttribute('data-model-theme'), themeFor(option));
    assert.equal(header.querySelector('.comparison-product-name').textContent, modelFor(option));
    assert.equal(header.querySelector('.comparison-technology').textContent, option.fields.technology);
    assert.equal(header.querySelector('.comparison-style').textContent, styleFor(option) + ' · ' + option.fields.coating);
    assert.equal(header.querySelector('.comparison-index').textContent, option.fields.index); report.comparisonIdentities++;
  }
  const pinned = h.host.document.getElementById('comparisonSticky').querySelector('th[data-option-id="' + option.id + '"]');
  assert.equal(pinned.getAttribute('data-model-theme'), themeFor(option));
  assert.equal(pinned.querySelector('.comparison-style').textContent, styleFor(option) + ' · ' + option.fields.coating);
  h.app.useLens(option.id); h.flush();
  const child = h.children[option.brand], summary = child.document.querySelector('.summary-hero');
  assert.equal(summary.getAttribute('data-model-theme'), themeFor(option));
  assert.equal(summary.querySelector('h1').textContent, modelFor(option));
  assert.equal(summary.querySelector('.model-choice-detail').textContent, styleFor(option) + ' · ' + option.fields.coating);
  const guarantee = child.document.querySelector('.summary-guarantee');
  assert.ok(guarantee.textContent.includes(option.warranty.progressionD.toFixed(2) + ' D'));
  assert.ok(guarantee.querySelector('.terms-threshold'));
  assert.equal(child.document.getElementById('printOverlay').querySelectorAll('[data-model-theme]').length, 0);
  child.goHome(); h.flush();
  if (option.brand !== 'zeiss') {
    const family = child.document.querySelector('.family-build-card[data-model-theme="' + themeFor(option) + '"]');
    assert.ok(family.querySelector('.family-card-head.model-identity-band'));
  } else assert.ok(child.document.querySelector('.model-heading[data-model-theme="myoactive"]'));
  if (option.brand === 'hoya') assert.equal(child.document.querySelector('.clinical-panel').getAttribute('data-model-theme'), 'iq');
  report.selectedRoutes++;
}

const css = fs.readFileSync(path.join(root, 'model-themes.css'), 'utf8');
const palettes = [...css.matchAll(/\[data-model-theme="([^"]+)"\]\{([^}]+)\}/g)];
assert.deepEqual(palettes.map(match => match[1]).sort(), ['iq', 'miyosmart', 'myoactive', 'stellest', 'stellest2']);
function luminance(hex) {
  if (hex === '#fff') hex = '#ffffff';
  const rgb = hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
}
for (const [, theme, declarations] of palettes) {
  const values = Object.fromEntries(declarations.split(';').filter(Boolean).map(item => item.split(':')));
  for (const background of ['--model-start', '--model-end']) for (const text of ['--model-ink', '--model-muted']) {
    const a = luminance(values[background]), b = luminance(values[text]);
    const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    assert.ok(ratio >= 4.5, theme + ' small-label contrast: ' + ratio); report.contrastPairs++;
  }
}
for (const brand of ['stellest', 'hoya', 'zeiss']) {
  const html = fs.readFileSync(path.join(root, 'catalogues', brand, 'index.html'), 'utf8');
  assert.ok(html.includes('href="../../model-themes.css"'));
  const styles = fs.readFileSync(path.join(root, 'catalogues', brand, 'design.css'), 'utf8');
  assert.ok(styles.includes('background:#eef3f7;border:1px solid #cbd7e1;color:#173a56'));
  assert.ok(styles.includes('.summary-guarantee .terms-threshold{display:inline'));
}
fs.writeFileSync(path.join(__dirname, 'model-theme-verification.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
