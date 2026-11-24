(function (root, factory) {
  var data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.MyoActiveData = data;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  var product = {
    id: 'zeiss-myoactive', name: 'ZEISS MyoActive', technology: 'ZEISS M.O.V.E.',
    index: '1.59', material: 'Polycarbonate', clearZoneMm: 7,
    elementPower: '+1.50 D to +5.50 D',
    prescription: { sphereMin: -9, sphereMax: 0, cylinderMin: -6, combinedMin: -9, diameterMm: 75, prismMax: 3 },
    clinical: { months: 12, refractionDifferenceD: 0.60, axialDifferenceMm: 0.22,
      comparator: 'Ordinary single-vision lenses', status: 'ZEISS data on file, July 2026',
      trial: 'NCT06563700', studyAges: '7–13 years', country: 'China' },
    warranty: { months: 12, progressionD: 0.50, period: '1 year', title: '1-Year Prescription Change Guarantee',
      condition: 'If prescription power becomes at least 0.50 D more short-sighted within 1 year.',
      wording: 'Complimentary replacement if prescription power becomes at least 0.50 D more short-sighted within 1 year.' }
  };
  var coatings = {
    platinum: { id: 'platinum', name: 'DuraVision Plus Platinum UV', shortName: 'Platinum UV',
      family: 'ZEISS DuraVision Plus', title: 'Platinum UV', price: 1800,
      copy: 'Anti-reflective coating with UV protection.', coatingType: 'Anti-reflective coating with UV protection' },
    blueprotect: { id: 'blueprotect', name: 'DuraVision Plus BlueProtect UV', shortName: 'BlueProtect UV',
      family: 'ZEISS DuraVision Plus', title: 'BlueProtect UV', price: 1900,
      copy: 'Blue-light filtering coating with UV protection.', coatingType: 'Blue-light filtering coating with UV protection' }
  };
  var comparisonRows = [
    { key: 'lensDesign', label: 'Lens design' },
    { key: 'technology', label: 'Optical technology' },
    { key: 'coating', label: 'Coating' },
    { key: 'index', label: 'Lens index' },
    { key: 'sphereRange', label: 'Prescription · sphere' },
    { key: 'cylinderRange', label: 'Prescription · cylinder' },
    { key: 'combinedRange', label: 'Combined prescription limit' },
    { key: 'refractionEffect', label: 'Less prescription progression' },
    { key: 'axialEffect', label: 'Less eye-length growth' },
    { key: 'studyDuration', label: 'Study duration' },
    { key: 'studyComparator', label: 'Study comparator' },
    { key: 'warrantyDuration', label: 'Replacement warranty · period' },
    { key: 'warrantyThreshold', label: 'Replacement warranty · prescription change' },
    { key: 'price', label: 'Lens price · per pair' }
  ];
  function money(value) { return 'RM' + Number(value).toLocaleString('en-MY', { maximumFractionDigits: 0 }); }
  function normalizeState(input) {
    input = input || {};
    var amount = input.frame == null || input.frame === '' ? null : Number(input.frame);
    if (amount !== null && (!Number.isFinite(amount) || amount < 0 || amount > 99999)) amount = null;
    if (amount !== null) amount = Math.round(amount);
    return {
      coating: Object.prototype.hasOwnProperty.call(coatings, input.coating) ? input.coating : 'platinum',
      frame: amount, frameComplimentary: amount !== null && input.frameComplimentary === true,
      followups: { one: !input.followups || input.followups.one !== false, two: !input.followups || input.followups.two !== false },
      complimentary: input.complimentary === true
    };
  }
  function totals(input) {
    var s = normalizeState(input);
    var followupCount = Number(s.followups.one) + Number(s.followups.two);
    var lens = coatings[s.coating].price;
    var frame = s.frameComplimentary ? 0 : (s.frame || 0);
    var followups = s.complimentary ? 0 : followupCount * 120;
    return { lens: lens, frame: frame, followups: followups, followupCount: followupCount, grand: lens + frame + followups };
  }
  function comparisonOptions(keys) {
    var seen = Object.create(null);
    return (Array.isArray(keys) ? keys : Object.keys(coatings)).filter(function (key) {
      if (!Object.prototype.hasOwnProperty.call(coatings, key) || seen[key]) return false;
      seen[key] = true; return true;
    }).map(function (key) {
      var c = coatings[key];
      return { id: product.id + '-' + key, productId: product.id, coatingId: key,
        name: c.title, fullName: product.name + ' · ' + c.name, price: c.price, currency: 'MYR', priceBasis: 'pair',
        warranty: { months: 12, progressionD: 0.5 },
        fields: {
          lensDesign: product.name, technology: product.technology, coating: c.coatingType,
          index: '1.59 · Polycarbonate', sphereRange: '0.00 D to −9.00 D', cylinderRange: 'Up to −6.00 D',
          combinedRange: 'Up to −9.00 D', refractionEffect: '0.60 D on average', axialEffect: '0.22 mm on average',
          studyDuration: '12 months', studyComparator: product.clinical.comparator,
          warrantyDuration: '1 year', warrantyThreshold: 'Prescription power at least 0.50 D more short-sighted (additional −0.50 D or more)', price: money(c.price)
        }
      };
    });
  }
  return { schemaVersion: 1, product: product, coatings: coatings, comparisonRows: comparisonRows,
    money: money, normalizeState: normalizeState, totals: totals, comparisonOptions: comparisonOptions };
});
