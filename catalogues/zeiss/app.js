'use strict';
var DATA = MyoActiveData;
var state = Object.assign(DATA.normalizeState(), { screen: 'catalogue', frameDraft: '', compareOpen: false });
var toastTimer = null, holdTimer = null, holdCompleted = false;
var frameHoldTimer = null, frameHoldCompleted = false;
var overlayOpener = null;
function money(value) { return DATA.money(value); }
function coatingPrice() { return DATA.coatings[state.coating].price; }
function coatingName() { return DATA.coatings[state.coating].name; }
function frameIncluded() { return state.frame !== null; }
function grandTotal() { return DATA.totals(state).grand; }
function setScreen(name) {
  state.screen = name === 'summary' ? 'summary' : 'catalogue';
  render(); window.scrollTo({ top: 0, behavior: 'smooth' });
}
function goHome() { setScreen('catalogue'); }
function openSummary() { setScreen('summary'); }
function selectCoating(key) {
  if (!Object.prototype.hasOwnProperty.call(DATA.coatings, key)) return;
  state.coating = key; render();
}
function toggleCoatingComparison() { state.compareOpen = !state.compareOpen; render(); }
function render() {
  var activeId = document.activeElement && document.activeElement.id;
  document.getElementById('app').innerHTML = state.screen === 'summary' ? summaryHtml() : catalogueHtml();
  document.getElementById('homeButton').classList.toggle('invisible', state.screen !== 'summary');
  bindBiometryHold(); bindFrameHold();
  if (activeId && document.getElementById(activeId)) document.getElementById(activeId).focus({ preventScroll: true });
}
function catalogueHtml() {
  return '<section class="screen">' +
    '<div class="catalogue-hero"><div class="catalogue-hero-copy"><div class="eyebrow">ZEISS MyoActive</div>' +
    '<h1>Clear vision today.<br>Help slow myopia<br>as they grow.</h1>' +
    '<p>ZEISS MyoActive corrects your child’s vision while helping slow the progression of short-sightedness.</p></div>' +
    '<img class="catalogue-hero-photo" src="assets/myoactive-child.jpg" alt="Child wearing ZEISS MyoActive spectacles" fetchpriority="high"></div>' +
    whyHtml() + mechanismHtml() + clinicalHtml() +
    '<section class="coating-section" aria-labelledby="coating-title"><div class="section-heading"><div><div class="section-kicker">Your lens options</div>' +
    '<h2 id="coating-title">Choose your lens coating</h2><p>Both options use the same MyoActive lens design. Your choice changes the coating and price.</p></div></div>' +
    '<div class="option-grid" role="group" aria-label="Choose lens coating">' + coatingOption('platinum') + coatingOption('blueprotect') + '</div>' +
    '<section class="guarantee-panel" aria-label="Prescription replacement guarantee"><strong>' + DATA.product.warranty.period + ' · Complimentary replacement</strong>' +
    '<span>' + DATA.product.warranty.condition + '</span></section>' +
    '<button id="coatingCompareButton" type="button" class="coating-compare-button" aria-expanded="' + state.compareOpen + '" aria-controls="coatingComparison" onclick="toggleCoatingComparison()">' +
    (state.compareOpen ? 'Hide coating comparison' : 'Compare coating options') + '</button>' +
    '<div id="coatingComparison"' + (state.compareOpen ? '' : ' hidden') + '>' +
    (state.compareOpen ? CatalogueComparison.render(DATA.comparisonOptions(), DATA.comparisonRows) +
    '<p class="quiet-note">Both options share the same clinical design and guarantee. Study results are averages, not a promise of an individual result.</p>' : '') + '</div></section>' +
    '<details class="panel product-details"><summary>Prescription range and lens details</summary><div class="spec-grid">' +
    '<dl><dt>Lens material</dt><dd>1.59 polycarbonate · UVProtect</dd></dl>' +
    '<dl><dt>Sphere</dt><dd>0.00 D to −9.00 D</dd></dl><dl><dt>Cylinder</dt><dd>Up to −6.00 D</dd></dl>' +
    '<dl><dt>Combined prescription</dt><dd>Up to −9.00 D</dd></dl>' +
    '<dl><dt>Treatment element powers</dt><dd>+1.50 D to +5.50 D</dd></dl><dl><dt>Clear central zone</dt><dd>7 mm</dd></dl></div>' +
    '<p class="quiet-note">Element powers describe the lens microstructures, not your child’s prescription. Maximum diameter is subject to the combined prescription; availability is checked when ordering.</p></details>' +
    '<div class="sticky-total" role="region" aria-label="Selected lens coating"><div><div class="total-label">Lens · ' + DATA.coatings[state.coating].shortName + '</div>' +
    '<div class="total-value">' + money(coatingPrice()) + '</div></div><button class="primary-button" type="button" onclick="openSummary()">Review summary</button></div></section>';
}
function whyHtml() {
  var photos = [['sport','Child playing basketball'],['study','Child doing homework'],['explore','Child exploring outdoors with a magnifying glass'],['outdoor','Children playing outdoors']];
  return '<section class="panel why-panel" aria-labelledby="why-title"><div class="section-kicker">Why short-sightedness can keep progressing</div>' +
    '<h2 id="why-title">Children’s days have changed.</h2>' +
    '<div class="life-strip">' + photos.map(function (x) { return '<img src="assets/myoactive-life-' + x[0] + '.jpg" alt="' + x[1] + '" loading="lazy">'; }).join('') + '</div>' +
    '<p class="figure-caption">Illustrative images. Not trial participants.</p>' +
    '<div class="why-points"><div><strong>More time indoors, more near work</strong><p>Children now spend more time on screens and close work. Their eyes see less varied, more repetitive visual signals through the day, which may contribute to myopia progression.</p></div>' +
    '<div><strong>Visual signals influence eye growth</strong><p>Research suggests some signals may stimulate the eye to grow longer, while others, such as myopic defocus, may help slow it. MyoActive is designed around this idea.</p></div></div></section>';
}
function mechanismHtml() {
  return '<section class="panel mechanism-panel" aria-labelledby="mechanism-title"><div class="mechanism-copy">' +
    '<div class="section-kicker">ZEISS M.O.V.E. technology</div><h2 id="mechanism-title">Clear vision. Changing signals.</h2>' +
    '<div class="mechanism-points"><div><strong>Clear vision at the centre</strong><p>A 7 mm clear central zone corrects distance vision for everyday activities.</p></div>' +
    '<div><strong>Different powers. A deliberately non-repeating pattern.</strong><p>Tiny treatment elements use different positive powers in a non-repeating arrangement. As your child looks around, this creates changing myopia-control signals. The design aims to reduce repetition of the signal reaching the eye.</p></div>' +
    '<div><strong>ClearFocus back-surface design</strong><p>An optimized back surface supports the prescription correction and intended treatment signal as your child looks through different parts of the lens.</p></div></div></div>' +
    '<figure class="lens-anatomy"><img class="lens-annotated" src="assets/myoactive-lens-annotated.jpg" alt="ZEISS MyoActive lens: 7 mm clear central zone and treatment zone with element powers from +1.50 to +5.50 D">' +
    '<figcaption class="figure-caption">Official ZEISS illustration. Treatment-element powers describe the lens microstructures. They are not your child’s prescription.</figcaption></figure>' +
    '<details class="macro-details"><summary>See the lens up close</summary><div class="macro-grid">' +
    '<figure><img src="assets/myoactive-macro-elements.jpg" alt="Close-up of microstructure elements" loading="lazy"><figcaption>Microstructures with varying positive power</figcaption></figure>' +
    '<figure><img src="assets/myoactive-macro-layout.jpg" alt="Concentric, non-aligned layout of microstructures" loading="lazy"><figcaption>Non-aligned layout of elements</figcaption></figure>' +
    '<figure><img src="assets/myoactive-macro-rays.jpg" alt="Light rays passing through the lens" loading="lazy"><figcaption>Light passing through the lens</figcaption></figure></div>' +
    '<p class="figure-caption">Illustrations, not to scale.</p></details></section>';
}
function barPair(title, unit, a, b, max, dec) {
  function row(label, v, cls) {
    return '<div class="bar-row"><span class="bar-label">' + label + '</span><span class="bar-track"><span class="bar-fill ' + cls + '" style="width:' + (v / max * 100).toFixed(1) + '%"></span></span><span class="bar-value">−' + v.toFixed(dec) + ' ' + unit + '</span></div>';
  }
  return '<div class="bar-pair"><div class="bar-title">' + title + '</div>' + row('Single vision', b, 'sv') + row('MyoActive', a, 'myo') + '</div>';
}
function clinicalHtml() {
  return '<section class="panel clinical-panel" aria-labelledby="clinical-title"><div class="clinical-heading"><h2 id="clinical-title">Clinically studied myopia control</h2>' +
    '<button class="info-button" type="button" onclick="openInfo()" aria-label="Clinical evidence and product details">i</button></div>' +
    '<div class="clinical-results"><div class="clinical-stat"><strong>0.60 D</strong><span>less prescription progression</span></div>' +
    '<div class="clinical-stat"><strong>0.22 mm</strong><span>less eye-length growth</span></div></div>' +
    '<p class="clinical-context">On average over <strong>12 months</strong>, compared with ordinary single-vision lenses.</p>' +
    '<div class="bar-chart" role="img" aria-label="12-month group averages versus single vision. Prescription change: MyoActive minus 0.23 dioptres, single vision minus 0.83 dioptres. Eye-length growth: MyoActive 0.11 millimetres, single vision 0.33 millimetres.">' +
    '<div class="bar-chart-title">12-month group averages vs single vision</div>' +
    barPair('Prescription change', 'D', 0.23, 0.83, 0.83, 2) + barPair('Eye-length growth', 'mm', 0.11, 0.33, 0.33, 2).replace(/−/g, '+') + '</div>' +
    '<p class="clinical-footnote">Ongoing 2-year randomised, double-masked trial in China (NCT06563700). The 12-month result compares 56 children wearing MyoActive with 56 wearing single-vision lenses, ages 7–13. ZEISS data on file, July 2026. Two-year results are not yet available. Group averages; individual results vary.</p>' +
    '<div class="comfort-row"><div class="comfort-stat"><strong>98%</strong><span>of children in the study fully adapted within a week</span></div>' +
    '<div class="comfort-note"><strong>What to expect</strong><p>Central vision stays clear. Looking through the treatment zones, side vision was about 3–4 letters lower than with single-vision lenses.</p></div></div>' +
    '</section>';
}
function coatingOption(key) {
  var c = DATA.coatings[key], selected = key === state.coating;
  return '<button id="coating-' + key + '" type="button" class="option-card ' + (selected ? 'selected' : '') + '" aria-pressed="' + selected + '" onclick="selectCoating(\'' + key + '\')">' +
    '<span class="check" aria-hidden="true"></span><span class="option-family">' + c.family + '</span><h3 class="option-name">' + c.title + '</h3>' +
    '<span class="option-copy">' + c.copy + '</span><span class="option-price">' + money(c.price) + '<small>per pair · 1.59</small></span></button>';
}
function summaryHtml() {
  return '<section class="screen"><div class="summary-card"><div class="summary-hero"><div class="eyebrow">ZEISS M.O.V.E. technology</div>' +
    '<h1>MyoActive</h1><div>ZEISS MyoActive · 1.59 polycarbonate</div></div><div class="summary-body">' +
    summaryRow('Lens', coatingName(), money(coatingPrice())) + '</div></div>' + summaryControlsHtml() +
    '<div class="summary-grand summary-total" aria-live="polite"><span>Grand Total</span><strong>' + money(grandTotal()) + '</strong></div>' +
    '<p class="summary-guarantee"><strong>' + DATA.product.warranty.title + '</strong><br>' + DATA.product.warranty.wording + '</p>' +
    '<div class="summary-actions"><button class="secondary-button" type="button" onclick="goHome()">Edit recommendation</button>' +
    '<button class="primary-button" type="button" onclick="openPrintPreview()">Preview and print labels</button></div></section>';
}
function summaryRow(label, detail, value) {
  return '<div class="summary-row"><div><div class="summary-row-label">' + label + '</div><div class="row-sub">' + detail +
    '</div></div><div class="summary-row-value">' + value + '</div></div>';
}
function summaryControlsHtml() {
  return '<div class="summary-controls"><div class="panel"><button id="frameRow" class="row-action frame-hold" type="button" aria-label="Frame. Tap to enter amount; hold to toggle complimentary." onclick="frameRowClick()">' +
    '<span class="row-label">Frame</span><span class="row-value">' + frameValueHtml() + '</span></button>' +
    (frameIncluded() ? '<div class="frame-remove-wrap"><button class="frame-clear" type="button" aria-label="Remove frame" title="Remove frame" onclick="clearFrame()">✕</button></div>' : '') + '</div>' +
    '<div class="panel"><div class="bio-heading-wrap"><button id="bioTitle" class="bio-title" type="button" aria-label="Hold to toggle complimentary biometry follow-ups">Biometry follow-up</button>' +
    '</div><p class="row-sub">Includes refraction · RM120 per visit</p><div class="follow-list">' +
    followupRow('one', 'Follow-up 1') + followupRow('two', 'Follow-up 2') + '</div></div></div>';
}
function followupRow(key, label) {
  var selected = state.followups[key];
  var amount = selected ? (state.complimentary ? '<span class="complimentary-stack"><s>RM120</s><span class="complimentary-pill">COMPLIMENTARY</span></span>' : 'RM120') : 'Not included';
  return '<button id="followup-' + key + '" type="button" class="follow-row ' + (selected ? 'selected' : '') + '" aria-pressed="' + selected + '" onclick="toggleFollowup(\'' + key + '\')">' +
    '<span class="tick" aria-hidden="true">' + (selected ? '✓' : '') + '</span><span class="follow-name">' + label + '</span><span class="follow-status">' + amount + '</span></button>';
}
function frameValueHtml() {
  if (!state.frameComplimentary) return frameIncluded() ? money(state.frame) : 'Add frame';
  return '<span class="complimentary-stack"><s>' + money(state.frame) + '</s><span class="complimentary-pill">COMPLIMENTARY</span></span>';
}
function toggleFollowup(key) { if (key !== 'one' && key !== 'two') return; state.followups[key] = !state.followups[key]; render(); }
function toggleComplimentary() {
  state.complimentary = !state.complimentary; state.followups.one = state.followups.two = true;
  render(); showToast(state.complimentary ? 'Both follow-ups are complimentary' : 'Follow-up prices restored');
}
function bindHold(el, callback, isFrame) {
  if (!el) return;
  var timer;
  function cancel() { window.clearTimeout(timer); el.classList.remove('pressing'); }
  el.addEventListener('pointerdown', function (event) {
    if (event.button !== 0) return;
    if (isFrame) frameHoldCompleted = false;
    cancel(); el.classList.add('pressing');
    timer = window.setTimeout(function () {
      if (isFrame) frameHoldCompleted = true;
      callback(); if (navigator.vibrate) navigator.vibrate(35);
    }, 850);
  });
  ['pointerup', 'pointerleave', 'pointercancel', 'blur'].forEach(function (type) { el.addEventListener(type, cancel); });
  el.addEventListener('contextmenu', function (event) { event.preventDefault(); });
  if (!isFrame) el.addEventListener('keydown', function (event) {
    if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) { event.preventDefault(); callback(); }
  });
}
function bindBiometryHold() { bindHold(document.getElementById('bioTitle'), toggleComplimentary, false); }
function bindFrameHold() { bindHold(document.getElementById('frameRow'), toggleFrameComplimentary, true); }
function frameRowClick() { if (frameHoldCompleted) { frameHoldCompleted = false; return; } openFramePad(); }
function toggleFrameComplimentary() {
  if (!frameIncluded()) { showToast('Add a frame amount first'); return; }
  state.frameComplimentary = !state.frameComplimentary; render();
  showToast(state.frameComplimentary ? 'Frame is complimentary' : 'Frame price restored');
}
function openFramePad() { state.frameDraft = frameIncluded() ? String(state.frame) : ''; updateFrameDisplay(); openOverlay('frameOverlay'); }
function frameKey(key) {
  if (key === 'clear') state.frameDraft = '';
  else if (key === 'back') state.frameDraft = state.frameDraft.slice(0, -1);
  else if (/^\d$/.test(key) && state.frameDraft.length < 5) state.frameDraft += key;
  state.frameDraft = state.frameDraft.replace(/^0+(?=\d)/, ''); updateFrameDisplay();
}
function updateFrameDisplay() { document.getElementById('frameDisplay').textContent = money(Number(state.frameDraft) || 0).replace('RM', 'RM '); }
function confirmFrame() { var value = Number(state.frameDraft) || 0; state.frame = value > 0 ? value : null; state.frameComplimentary = false; closeOverlay('frameOverlay'); render(); }
function clearFrame() { state.frame = null; state.frameComplimentary = false; render(); }
function openInfo() { openOverlay('infoOverlay'); }
function openPrintPreview() {
  try { updatePrintAreas(); setPrintStatus('Ready to connect to D520BT-Z', 'idle'); openOverlay('printOverlay'); }
  catch (error) { showToast('Unable to prepare label: ' + error.message); }
}
function openOverlay(id) {
  overlayOpener = document.activeElement;
  var overlay = document.getElementById(id); overlay.classList.add('open'); document.body.style.overflow = 'hidden';
  var close = overlay.querySelector('.close-button'); if (close) close.focus();
}
function closeOverlay(id) {
  var overlay = document.getElementById(id);
  if (!overlay.classList.contains('open')) return;
  overlay.classList.remove('open'); document.body.style.overflow = '';
  if (overlayOpener && overlayOpener.isConnected) overlayOpener.focus({ preventScroll: true });
}
function overlayClick(event, id) { if (event.target.id === id) closeOverlay(id); }
function showToast(message) {
  var el = document.getElementById('toast'); el.textContent = message; el.classList.add('show');
  window.clearTimeout(toastTimer); toastTimer = window.setTimeout(function () { el.classList.remove('show'); }, 2400);
}
document.addEventListener('keydown', function (event) {
  var overlay = document.querySelector('.overlay.open');
  if (!overlay) return;
  if (event.key === 'Escape') { closeOverlay(overlay.id); return; }
  if (event.key === 'Tab') {
    var focusable = Array.from(overlay.querySelectorAll('button:not([disabled]),a[href],input,[tabindex="0"]'));
    var first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  if (overlay.id === 'frameOverlay') {
    if (/^\d$/.test(event.key)) { event.preventDefault(); frameKey(event.key); }
    if (event.key === 'Backspace') { event.preventDefault(); frameKey('back'); }
  }
});
render();
