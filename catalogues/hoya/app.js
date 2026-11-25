 'use strict';
var DATA=HoyaCatalogueData;
var state=Object.assign(DATA.normalizeState(),{screen:'catalogue',frameDraft:'',compareOpen:true});
var familyBuilds={miyosmart:{product:'miyosmart',style:'clear',coating:'stx'},iq:{product:'iq',style:'clear',coating:'spark'}};
// Clear is the default style; a coating is never chosen until explicitly tapped.
var familyChoices={miyosmart:{coating:false},iq:{coating:false}};
var toastTimer=null,frameHoldCompleted=false,overlayOpener=null;
function money(value){return DATA.money(value);}
function currentProduct(){return DATA.products[state.product];}
function coatingPrice(){return DATA.price(state);}
function coatingName(){return DATA.coatings[state.coating].name;}
function frameIncluded(){return state.frame!==null;}
function grandTotal(){return DATA.totals(state).grand;}
function setScreen(name){state.screen=name==='summary'?'summary':'catalogue';render();window.scrollTo({top:0,behavior:'smooth'});}
function goHome(){setScreen('catalogue');}
function openSummary(){if(hasCompleteSelection())setScreen('summary');}
function hasCompleteSelection(){
 var choice=familyChoices[state.product],build=familyBuilds[state.product];
 return !!(choice&&choice.coating&&build.style===state.style&&build.coating===state.coating);
}
function updateBuild(build,choice){var s=DATA.normalizeState(Object.assign({},state,build));state.product=s.product;state.style=s.style;state.coating=s.coating;familyBuilds[s.product]={product:s.product,style:s.style,coating:s.coating};familyChoices[s.product]=choice;render();}
// A complete choice arriving from Compare explicitly includes style and coating.
function applyBuild(build){updateBuild(build,{coating:true});}
function selectLensStyle(product,style){if(!DATA.products[product]||!DATA.products[product].prices[style])return;updateBuild(Object.assign({},familyBuilds[product],{product:product,style:style}),{coating:false});}
function selectCoatingFor(product,coating){if(!DATA.products[product])return;var build=familyBuilds[product];if(DATA.availableCoatings(product,build.style).indexOf(coating)<0)return;applyBuild(Object.assign({},build,{product:product,coating:coating}));}
function selectCoating(coating){selectCoatingFor(state.product,coating);}
function toggleCoatingComparison(){state.compareOpen=!state.compareOpen;render();}
function render(){
 var activeId=document.activeElement&&document.activeElement.id;
 document.getElementById('app').innerHTML=state.screen==='summary'?summaryHtml():catalogueHtml();
 document.getElementById('homeButton').classList.toggle('invisible',state.screen!=='summary');
 bindBiometryHold();bindFrameHold();bindLensStyleDropdowns();
 if(activeId&&document.getElementById(activeId))document.getElementById(activeId).focus({preventScroll:true});
}
function catalogueHtml(){
 var p=currentProduct(),w=p.warranty,rx=DATA.prescription(state.product,state.style);
 var options=['miyosmart','iq'].filter(function(key){return familyChoices[key].coating;}).map(function(key){return DATA.optionForState(familyBuilds[key]);});
 return '<section class="screen">'+
 '<div class="catalogue-hero"><div class="catalogue-hero-copy"><div class="eyebrow">HOYA MiYOSMART iQ</div><h1>Clear vision today.<br>Help slow myopia<br>as they grow.</h1><p>Choose a HOYA lens designed to correct your child’s vision while helping slow short-sightedness.</p></div><img class="catalogue-hero-photo" src="assets/hoya-hero.jpg" alt="Child wearing HOYA spectacles outdoors" fetchpriority="high"></div>'+
 '<section class="panel mechanism-panel ted-panel" aria-labelledby="mechanism-title"><div class="mechanism-copy"><div class="section-kicker">D.I.M.S. with Triple Enhanced Design</div><h2 id="mechanism-title">Three design updates in MiYOSMART iQ.</h2><div class="mechanism-points ted-points"><div><strong>Closer to the centre</strong><p>Treatment segments start closer to the lens centre, aiming the treatment signal at the nearby peripheral retina.</p></div><div><strong>Higher defocus power</strong><p>+4.5 D, compared with +3.5 D in MiYOSMART, creates a stronger myopic-defocus treatment signal.</p></div><div><strong>Wider treatment coverage</strong><p>A 41 mm zone, compared with 33 mm in MiYOSMART, extends treatment coverage and supports larger frames.</p></div></div><div class="everyday-benefits"><div><strong>Everyday vision and appearance</strong><p>MiYOSMART iQ also uses an optimized FreeForm back surface, designed to reduce optical distortions and give a flatter lens profile.</p></div><div><strong>A coating made for daily handling</strong><p>S.P.A.R.K. provides improved scratch resistance and lasting easy-clean performance compared with the previous MiYOSMART generation.</p></div></div></div><figure class="ted-figure"><img src="assets/hoya-lens-macro.jpg" alt="MiYOSMART iQ lens with its pattern of treatment segments" width="1600" height="900" loading="lazy" decoding="async"><figcaption class="figure-caption">HOYA image: the dots are the treatment segments. Treatment power is part of the lens design, not your child’s prescription.</figcaption></figure></section>'+
 '<section class="panel clinical-panel" data-model-theme="iq" aria-labelledby="clinical-title"><div class="clinical-heading"><div><div class="section-kicker">MiYOSMART iQ</div><h2 id="clinical-title">Reported mean results at 12 months</h2></div><button class="info-button" type="button" onclick="openInfo()" aria-label="Clinical evidence and product details">i</button></div><div class="clinical-results"><div class="clinical-stat"><strong>0.58 D</strong><span>less prescription progression</span></div><div class="clinical-stat"><strong>0.27 mm</strong><span>less eye-length growth</span></div></div><p class="clinical-context">On average over <strong>12 months</strong>, compared with ordinary single-vision spectacles.</p><p class="clinical-footnote">Study ages 4–12. ARVO 2026 presentation and HOYA data on file, April 2026. Individual results vary.</p>'+
 '<figure class="trial-figure"><img src="assets/hoya-trial-charts.png" alt="HOYA trial charts: average prescription change and axial elongation over 12 months for single vision, MiYOSMART and MiYOSMART iQ" loading="lazy"><figcaption class="figure-caption">Official HOYA trial figures, 12 months, ages 4–12. Group averages; individual results vary. Dioptres and millimetres are separate measures; +0.046 D is an average, not reversal of myopia. Same-brand comparison within one HOYA trial, not a comparison with any other brand’s lenses. MiYOSMART also slowed progression versus single vision. Evidence: ARVO 2026 presentation and HOYA data on file; no peer-reviewed paper yet.</figcaption></figure></section>'+
 '<section class="coating-section" aria-labelledby="coating-title"><div class="section-heading"><div><div class="section-kicker">Your HOYA lens options</div><h2 id="coating-title">Choose your lens and coating</h2><p>Select a lens option, then tap a coating price to include it in your quotation. All lens prices are per pair.</p></div></div><div class="family-build-grid">'+familyCard('miyosmart')+familyCard('iq')+'</div>'+
 '<button id="coatingCompareButton" type="button" class="coating-compare-button" aria-expanded="'+state.compareOpen+'" aria-controls="coatingComparison" onclick="toggleCoatingComparison()">'+(state.compareOpen?'Hide lens comparison':'Compare these lens choices')+'</button><div id="coatingComparison"'+(state.compareOpen?'':' hidden')+'>'+(state.compareOpen?CatalogueComparison.render(options,DATA.comparisonRows)+'<p class="quiet-note">Clinical outcomes are spherical-equivalent averages from the supplied 12-month trial chart. Replacement guarantees use sphere change. *Plus prescriptions for iQ are subject to maximum spherical equivalent +2.00 D.</p>':'')+'</div></section>'+
 (hasCompleteSelection()?'<section class="guarantee-panel" aria-label="Selected prescription replacement guarantee"><strong>'+p.name+' · '+w.title+'</strong><span>'+emphasizeTerms(w.wording)+'</span></section>':'')+
 '<details class="panel product-details more-design"><summary>How the design and coating work</summary>'+
 '<h3>Design idea</h3><figure class="fig-small"><img src="assets/hoya-eye-diagram.png" alt="HOYA schematic: light through the treatment segments reaches the near-peripheral retina" loading="lazy"><figcaption class="figure-caption">HOYA schematic of the design idea. Research suggests the near-peripheral retina responds to myopic defocus.</figcaption></figure>'+
 '<h3>Coating layers</h3><figure class="fig-small"><img src="assets/hoya-coating-layers.png" alt="HOYA coating architecture overview showing the layers of the lens coating" loading="lazy"><figcaption class="figure-caption">HOYA coating layers. Coating performance figures come from laboratory tests; the coating does not change the myopia-control design.</figcaption></figure></details>'+
 '<details class="panel product-details"><summary>Current lens: prescription range and details</summary><div class="spec-grid"><dl><dt>Lens option</dt><dd>'+p.name+' '+DATA.styles[state.style].name+'</dd></dl><dl><dt>Material</dt><dd>1.59 polycarbonate</dd></dl><dl><dt>Sphere</dt><dd>'+rx.sphereText+'</dd></dl><dl><dt>Cylinder</dt><dd>Up to −4.00 D</dd></dl><dl><dt>Combined prescription</dt><dd>'+rx.combinedText+'</dd></dl><dl><dt>Prism</dt><dd>Up to 3.00Δ per lens</dd></dl></div><p class="quiet-note">Diameter 60–75 mm, subject to prescription and frame availability. Defocus power is a treatment-design feature, not the patient’s prescription.</p></details>'+
 (hasCompleteSelection()?'<div class="sticky-total" data-model-theme="'+state.product+'" role="region" aria-label="Selected lens"><div><div class="total-label">'+p.name+' · '+DATA.styleLabel(DATA.styles[state.style])+'</div><div class="total-value">'+money(coatingPrice())+'</div></div><button class="primary-button" type="button" onclick="openSummary()">Review summary</button></div>':'')+'</section>';
}
function emphasizeTerms(value){ return String(value).replace(/(\d+\.\d{2} D)/g,'<strong class="terms-threshold">$1</strong>'); }
function familyCard(key){
 var p=DATA.products[key],b=familyBuilds[key],choice=familyChoices[key],selected=state.product===key&&choice.coating;
 var controls=DATA.availableCoatings(key,b.style).map(function(coating){return coatingOption(key,coating);}).join('');
 return '<article class="family-build-card'+(selected?' selected':'')+'" data-family="'+key+'" data-model-theme="'+key+'"><div class="family-card-head model-identity-band"><div class="eyebrow">'+p.technology+'</div><h3>'+p.name+'</h3><p>'+p.design+'</p></div>'+lensStyleDropdown(key)+'<p id="style-description-'+key+'" class="style-description">'+DATA.styles[b.style].copy+'</p><div class="coating-choice-label">Choose coating</div><div class="bundle-options" role="group" aria-label="Coatings for '+p.name+'">'+controls+'</div><p class="coating-choice-hint"'+(choice.coating?' hidden':'')+'>Tap a coating to complete your choice.</p>'+(b.style==='sunbird'?'<p class="availability-note">Full Control is not available for Sunbird.</p>':'<p class="availability-note">The coating does not change the myopia-control design.</p>')+'<div class="family-guarantee"><strong>'+p.warranty.period+' · Complimentary replacement</strong><span>'+emphasizeTerms(p.warranty.condition)+'</span></div></article>';
}
function lensStyleText(style){
 var s=DATA.styles[style];
 return '<span class="lens-style-name">'+s.name+'</span>'+(s.badge?'<span class="lens-style-detail">'+s.badge+'</span>':'');
}
function lensStyleDropdown(product){
 var current=familyBuilds[product].style;
 // The current/default style is the field; alternatives share its neutral enclosure.
 var alternatives=Object.keys(DATA.products[product].prices).filter(function(style){return style!==current;}).map(function(style){
  return '<button type="button" class="lens-style-option" data-style-choice="'+style+'">'+lensStyleText(style)+'</button>';
 }).join('');
 return '<div class="lens-style-dropdown" data-style-product="'+product+'"><label id="style-label-'+product+'" class="style-label" for="style-'+product+'">Lens option</label><div class="lens-style-control" data-open="false"><button id="style-'+product+'" class="lens-style-trigger" type="button" aria-expanded="false" aria-controls="style-menu-'+product+'" aria-labelledby="style-label-'+product+' style-current-'+product+'" aria-describedby="style-description-'+product+'"><span id="style-current-'+product+'" class="lens-style-current">'+lensStyleText(current)+'</span><span class="lens-style-chevron" aria-hidden="true"></span></button><div id="style-menu-'+product+'" class="lens-style-menu" role="group" aria-label="Other lens options for '+DATA.products[product].name+'" hidden>'+alternatives+'</div></div></div>';
}
function closeLensStyleDropdowns(except){
 document.querySelectorAll('.lens-style-dropdown').forEach(function(dropdown){
  if(dropdown===except)return;
  dropdown.querySelector('.lens-style-trigger').setAttribute('aria-expanded','false');
  dropdown.querySelector('.lens-style-control').setAttribute('data-open','false');
  dropdown.querySelector('.lens-style-menu').hidden=true;
 });
}
function bindLensStyleDropdowns(){
 document.querySelectorAll('.lens-style-dropdown').forEach(function(dropdown){
  var product=dropdown.getAttribute('data-style-product'),control=dropdown.querySelector('.lens-style-control'),trigger=dropdown.querySelector('.lens-style-trigger'),menu=dropdown.querySelector('.lens-style-menu');
  var options=Array.prototype.slice.call(menu.querySelectorAll('.lens-style-option'));
  function open(){closeLensStyleDropdowns(dropdown);trigger.setAttribute('aria-expanded','true');control.setAttribute('data-open','true');menu.hidden=false;}
  function close(restoreFocus){trigger.setAttribute('aria-expanded','false');control.setAttribute('data-open','false');menu.hidden=true;if(restoreFocus)trigger.focus({preventScroll:true});}
  trigger.addEventListener('click',function(){if(menu.hidden)open();else close(false);});
  options.forEach(function(option){option.addEventListener('click',function(){
   var style=option.getAttribute('data-style-choice');
   close(true);
   if(style!==familyBuilds[product].style)selectLensStyle(product,style);
  });});
  dropdown.addEventListener('keydown',function(event){
   if(event.key==='Escape'&&!menu.hidden){event.preventDefault();close(true);return;}
   if(['ArrowDown','ArrowUp','Home','End'].indexOf(event.key)<0)return;
   event.preventDefault();
   var index=options.indexOf(document.activeElement),wasClosed=menu.hidden;
   open();
   if(!options.length)return;
   if(event.key==='Home')index=0;
   else if(event.key==='End')index=options.length-1;
   else if(wasClosed||index<0)index=event.key==='ArrowUp'?options.length-1:0;
   else index=(index+(event.key==='ArrowDown'?1:-1)+options.length)%options.length;
   options[index].focus({preventScroll:true});
  });
 });
}
function dismissLensStyleDropdowns(event){
 var dropdown=event.target&&event.target.closest?event.target.closest('.lens-style-dropdown'):null;
 closeLensStyleDropdowns(dropdown);
}
document.addEventListener('click',dismissLensStyleDropdowns);
document.addEventListener('focusin',dismissLensStyleDropdowns);
function coatingOption(product,key){
 var b=familyBuilds[product],c=DATA.coatings[key],selected=familyChoices[product].coating&&b.coating===key;
 return '<button id="coating-'+product+'-'+key+'" type="button" class="bundle-option '+(selected?'selected':'')+'" aria-pressed="'+selected+'" onclick="selectCoatingFor(\''+product+'\',\''+key+'\')"><span class="bundle-radio" aria-hidden="true"></span><span><span class="bundle-name">'+c.shortName+'</span><span class="bundle-copy">'+c.copy+'</span></span><span class="bundle-price">'+money(DATA.products[product].prices[b.style][key])+'</span></button>';
}
function summaryHtml(){
 var p=currentProduct(),w=p.warranty;
 return '<section class="screen"><div class="summary-card"><div class="summary-hero model-identity-band" data-model-theme="'+state.product+'"><div class="eyebrow">HOYA · '+p.technology+'</div><h1>'+p.name+'</h1><div class="model-choice-detail">'+DATA.styleLabel(DATA.styles[state.style])+' · '+coatingName()+'</div><div class="model-index-detail">1.59 · Polycarbonate</div></div><div class="summary-body">'+summaryRow('Lens',coatingName(),money(coatingPrice()))+'</div></div>'+summaryControlsHtml()+'<div class="summary-grand summary-total" aria-live="polite"><span>Grand Total</span><strong>'+money(grandTotal())+'</strong></div><p class="summary-guarantee"><strong>'+w.title+'</strong><br>'+emphasizeTerms(w.wording)+'</p><div class="summary-actions"><button class="secondary-button" type="button" onclick="goHome()">Edit recommendation</button><button class="primary-button" type="button" onclick="openPrintPreview()">Preview and print labels</button></div></section>';
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
