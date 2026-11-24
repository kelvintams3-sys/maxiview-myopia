 'use strict';
var DATA=HoyaCatalogueData;
var state=Object.assign(DATA.normalizeState(),{screen:'catalogue',frameDraft:'',compareOpen:true});
var familyBuilds={miyosmart:{product:'miyosmart',style:'clear',coating:'stx'},iq:{product:'iq',style:'clear',coating:'spark'}};
var toastTimer=null,frameHoldCompleted=false,overlayOpener=null;
function money(value){return DATA.money(value);}
function currentProduct(){return DATA.products[state.product];}
function coatingPrice(){return DATA.price(state);}
function coatingName(){return DATA.coatings[state.coating].name;}
function frameIncluded(){return state.frame!==null;}
function grandTotal(){return DATA.totals(state).grand;}
function setScreen(name){state.screen=name==='summary'?'summary':'catalogue';render();window.scrollTo({top:0,behavior:'smooth'});}
function goHome(){setScreen('catalogue');}
function openSummary(){setScreen('summary');}
function applyBuild(build){var s=DATA.normalizeState(Object.assign({},state,build));state.product=s.product;state.style=s.style;state.coating=s.coating;familyBuilds[s.product]={product:s.product,style:s.style,coating:s.coating};render();}
function selectLensStyle(product,style){if(!DATA.products[product]||!DATA.products[product].prices[style])return;applyBuild(Object.assign({},familyBuilds[product],{product:product,style:style}));}
function selectCoatingFor(product,coating){if(!DATA.products[product])return;var build=familyBuilds[product];if(DATA.availableCoatings(product,build.style).indexOf(coating)<0)return;applyBuild(Object.assign({},build,{product:product,coating:coating}));}
function selectCoating(coating){selectCoatingFor(state.product,coating);}
function toggleCoatingComparison(){state.compareOpen=!state.compareOpen;render();}
function render(){
 var activeId=document.activeElement&&document.activeElement.id;
 document.getElementById('app').innerHTML=state.screen==='summary'?summaryHtml():catalogueHtml();
 document.getElementById('homeButton').classList.toggle('invisible',state.screen!=='summary');
 bindBiometryHold();bindFrameHold();
 if(activeId&&document.getElementById(activeId))document.getElementById(activeId).focus({preventScroll:true});
}
function catalogueHtml(){
 var p=currentProduct(),w=p.warranty,rx=DATA.prescription(state.product,state.style);
 var options=['miyosmart','iq'].map(function(key){return DATA.optionForState(familyBuilds[key]);});
 return '<section class="screen">'+
 '<div class="catalogue-hero"><div class="catalogue-hero-copy"><div class="eyebrow">HOYA MiYOSMART iQ</div><h1>Clear vision today.<br>Help slow myopia<br>as they grow.</h1><p>Choose a HOYA lens designed to correct your child’s vision while helping slow short-sightedness.</p></div><img class="catalogue-hero-photo" src="assets/hoya-hero.jpg" alt="Child wearing HOYA spectacles outdoors" fetchpriority="high"></div>'+
 '<section class="panel mechanism-panel ted-panel" aria-labelledby="mechanism-title"><div class="mechanism-copy"><div class="section-kicker">D.I.M.S. with Triple Enhanced Design</div><h2 id="mechanism-title">Three design updates in MiYOSMART iQ.</h2><div class="mechanism-points ted-points"><div><strong>Closer to the centre</strong><p>Treatment segments start closer to the lens centre, aiming the treatment signal at the nearby peripheral retina.</p></div><div><strong>Higher defocus power</strong><p>+4.5 D, compared with +3.5 D in MiYOSMART, creates a stronger myopic-defocus treatment signal.</p></div><div><strong>Wider treatment coverage</strong><p>A 41 mm zone, compared with 33 mm in MiYOSMART, extends treatment coverage and supports larger frames.</p></div></div><div class="everyday-benefits"><div><strong>Everyday vision and appearance</strong><p>MiYOSMART iQ also uses an optimized FreeForm back surface, designed to reduce optical distortions and give a flatter lens profile.</p></div><div><strong>A coating made for daily handling</strong><p>S.P.A.R.K. provides improved scratch resistance and lasting easy-clean performance compared with the previous MiYOSMART generation.</p></div></div></div><figure class="ted-figure"><img src="assets/hoya-lens-macro.jpg" alt="MiYOSMART iQ lens with its pattern of treatment segments" width="1600" height="900" loading="lazy" decoding="async"><figcaption class="figure-caption">HOYA image: the dots are the treatment segments. Treatment power is part of the lens design, not your child’s prescription.</figcaption></figure></section>'+
 '<section class="panel clinical-panel" aria-labelledby="clinical-title"><div class="clinical-heading"><div><div class="section-kicker">MiYOSMART iQ</div><h2 id="clinical-title">Reported mean results at 12 months</h2></div><button class="info-button" type="button" onclick="openInfo()" aria-label="Clinical evidence and product details">i</button></div><div class="clinical-results"><div class="clinical-stat"><strong>0.58 D</strong><span>less prescription progression</span></div><div class="clinical-stat"><strong>0.27 mm</strong><span>less eye-length growth</span></div></div><p class="clinical-context">On average over <strong>12 months</strong>, compared with ordinary single-vision spectacles.</p><p class="clinical-footnote">Study ages 4–12. ARVO 2026 presentation and HOYA data on file, April 2026. Individual results vary.</p>'+
 '<figure class="trial-figure"><img src="assets/hoya-trial-charts.png" alt="HOYA trial charts: average prescription change and axial elongation over 12 months for single vision, MiYOSMART and MiYOSMART iQ" loading="lazy"><figcaption class="figure-caption">Official HOYA trial figures, 12 months, ages 4–12. Group averages; individual results vary. Dioptres and millimetres are separate measures; +0.046 D is an average, not reversal of myopia. Same-brand comparison within one HOYA trial, not a comparison with any other brand’s lenses. MiYOSMART also slowed progression versus single vision. Evidence: ARVO 2026 presentation and HOYA data on file; no peer-reviewed paper yet.</figcaption></figure></section>'+
 '<section class="coating-section" aria-labelledby="coating-title"><div class="section-heading"><div><div class="section-kicker">Your HOYA lens options</div><h2 id="coating-title">Choose your lens and coating</h2><p>Select a lens option, then tap a coating price to include it in your quotation. All lens prices are per pair.</p></div></div><div class="family-build-grid">'+familyCard('miyosmart')+familyCard('iq')+'</div>'+
 '<button id="coatingCompareButton" type="button" class="coating-compare-button" aria-expanded="'+state.compareOpen+'" aria-controls="coatingComparison" onclick="toggleCoatingComparison()">'+(state.compareOpen?'Hide lens comparison':'Compare these lens choices')+'</button><div id="coatingComparison"'+(state.compareOpen?'':' hidden')+'>'+(state.compareOpen?CatalogueComparison.render(options,DATA.comparisonRows)+'<p class="quiet-note">Clinical outcomes are spherical-equivalent averages from the supplied 12-month trial chart. Replacement guarantees use sphere change. *Plus prescriptions for iQ are subject to maximum spherical equivalent +2.00 D.</p>':'')+'</div></section>'+
 '<section class="guarantee-panel" aria-label="Selected prescription replacement guarantee"><strong>'+p.name+' · '+w.title+'</strong><span>'+w.wording+'</span></section>'+
 '<details class="panel product-details more-design"><summary>How the design and coating work</summary>'+
 '<h3>Design idea</h3><figure class="fig-small"><img src="assets/hoya-eye-diagram.png" alt="HOYA schematic: light through the treatment segments reaches the near-peripheral retina" loading="lazy"><figcaption class="figure-caption">HOYA schematic of the design idea. Research suggests the near-peripheral retina responds to myopic defocus.</figcaption></figure>'+
 '<h3>Coating layers</h3><figure class="fig-small"><img src="assets/hoya-coating-layers.png" alt="HOYA coating architecture overview showing the layers of the lens coating" loading="lazy"><figcaption class="figure-caption">HOYA coating layers. Coating performance figures come from laboratory tests; the coating does not change the myopia-control design.</figcaption></figure></details>'+
 '<details class="panel product-details"><summary>Selected lens: prescription range and details</summary><div class="spec-grid"><dl><dt>Selected lens</dt><dd>'+p.name+' '+DATA.styles[state.style].name+'</dd></dl><dl><dt>Material</dt><dd>1.59 polycarbonate</dd></dl><dl><dt>Sphere</dt><dd>'+rx.sphereText+'</dd></dl><dl><dt>Cylinder</dt><dd>Up to −4.00 D</dd></dl><dl><dt>Combined prescription</dt><dd>'+rx.combinedText+'</dd></dl><dl><dt>Prism</dt><dd>Up to 3.00Δ per lens</dd></dl></div><p class="quiet-note">Diameter 60–75 mm, subject to prescription and frame availability. Defocus power is a treatment-design feature, not the patient’s prescription.</p></details>'+
 '<div class="sticky-total" role="region" aria-label="Selected lens"><div><div class="total-label">'+p.name+' · '+DATA.styleLabel(DATA.styles[state.style])+'</div><div class="total-value">'+money(coatingPrice())+'</div></div><button class="primary-button" type="button" onclick="openSummary()">Review summary</button></div></section>';
}
function familyCard(key){
 var p=DATA.products[key],b=familyBuilds[key],selected=state.product===key;
 var styles=Object.keys(p.prices).map(function(style){return '<option value="'+style+'"'+(style===b.style?' selected':'')+'>'+DATA.styleLabel(DATA.styles[style])+'</option>';}).join('');
 var controls=DATA.availableCoatings(key,b.style).map(function(coating){return coatingOption(key,coating);}).join('');
 return '<article class="family-build-card'+(selected?' selected':'')+'" data-family="'+key+'"><div class="family-card-head"><div class="eyebrow">'+p.technology+'</div><h3>'+p.name+'</h3><p>'+p.design+'</p></div><label class="style-label" for="style-'+key+'">Lens option</label><select id="style-'+key+'" class="lens-style-select" onchange="selectLensStyle(\''+key+'\',this.value)">'+styles+'</select><p class="style-description">'+DATA.styles[b.style].copy+'</p><div class="bundle-options">'+controls+'</div>'+(b.style==='sunbird'?'<p class="availability-note">Full Control is not available for Sunbird.</p>':'<p class="availability-note">The coating does not change the myopia-control design.</p>')+'<div class="family-guarantee"><strong>'+p.warranty.period+' · Complimentary replacement</strong><span>'+p.warranty.condition+'</span></div></article>';
}
function coatingOption(product,key){
 var b=familyBuilds[product],c=DATA.coatings[key],selected=state.product===product&&state.coating===key;
 return '<button id="coating-'+product+'-'+key+'" type="button" class="bundle-option '+(selected?'selected':'')+'" aria-pressed="'+selected+'" onclick="selectCoatingFor(\''+product+'\',\''+key+'\')"><span class="bundle-radio" aria-hidden="true"></span><span><span class="bundle-name">'+c.shortName+'</span><span class="bundle-copy">'+c.copy+'</span></span><span class="bundle-price">'+money(DATA.products[product].prices[b.style][key])+'</span></button>';
}
function summaryHtml(){
 var p=currentProduct(),w=p.warranty;
 return '<section class="screen"><div class="summary-card"><div class="summary-hero"><div class="eyebrow">HOYA · '+p.technology+'</div><h1>'+p.name+'</h1><div>'+DATA.styleLabel(DATA.styles[state.style])+' · 1.59 polycarbonate</div></div><div class="summary-body">'+summaryRow('Lens',coatingName(),money(coatingPrice()))+'</div></div>'+summaryControlsHtml()+'<div class="summary-grand summary-total" aria-live="polite"><span>Grand Total</span><strong>'+money(grandTotal())+'</strong></div><p class="summary-guarantee"><strong>'+w.title+'</strong><br>'+w.wording+'</p><div class="summary-actions"><button class="secondary-button" type="button" onclick="goHome()">Edit recommendation</button><button class="primary-button" type="button" onclick="openPrintPreview()">Preview and print labels</button></div></section>';
}
function summaryRow(label,detail,value){return '<div class="summary-row"><div><div class="summary-row-label">'+label+'</div><div class="row-sub">'+detail+'</div></div><div class="summary-row-value">'+value+'</div></div>';}
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
