 'use strict';
// R1.3 actual-script checks; geometry fixtures do not establish device layout.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createHub}=require('./harness.cjs'),D=require('../catalogue-data.js');
const report={status:'passed',cases:[],nativeChoiceCases:0,changeCases:0,geometryFixtures:true,liveBrowser:false};
const plain=value=>JSON.parse(JSON.stringify(value));
const brandIds=['stellest','hoya','zeiss'];
function passed(name){report.cases.push(name);}
function rect(left,top,width,height){return {left,top,width,height,right:left+width,bottom:top+height};}
function body(h){return h.host.document.getElementById('comparisonBody');}
function picker(h){return h.host.document.getElementById('lensChoices');}
function buttons(h){return picker(h).querySelectorAll('button[data-pick-id]');}
function button(h,id){return buttons(h).find(b=>b.getAttribute('data-pick-id')===id);}
function assertFixed(h){const expected=brandIds.map(b=>h.app.state.byBrand[b]).filter(Boolean);assert.deepEqual(plain(h.app.state.comparison),expected);}
function nativeChoice(child,o){if(o.brand==='stellest')child.selectBundle(o.productKey,o.coatingId);else if(o.brand==='hoya'){child.selectLensStyle(o.productKey,o.styleId);child.selectCoatingFor(o.productKey,o.coatingId);}else child.selectCoating(o.coatingId);}
function setNativeScroll(child,brand,value){if(brand==='stellest')child.document.getElementById('catalogueViewport').scrollTop=value;else child.scrollY=value;child.dispatch('scroll',{});}
function nativeScroll(child,brand){return brand==='stellest'?child.document.getElementById('catalogueViewport').scrollTop:child.scrollY;}
const h=createHub();assert.equal(h.app.state.active,'zeiss');assert.equal(h.app.frames.zeiss.frame.style.visibility,'hidden');h.flush();
const {app,host}=h,doc=host.document;
assert.equal(app.frames.zeiss.frame.style.visibility,'');assert.equal(doc.getElementById('activeBrandLogo').getAttribute('alt'),'ZEISS');assert.equal(doc.getElementById('tab-zeiss').hidden,true);
app.showTab('compare');h.flush();assertFixed(h);assert.deepEqual(plain(app.state.comparison),[]);
assert.equal(body(h).querySelectorAll('[data-use-id]').length,0);assert.doesNotMatch(body(h).textContent,/RM\d/);assert.equal(body(h).querySelectorAll('[data-remove-index]').length,0);
for(const brand of brandIds){const child=h.children[brand];assert.equal(child.document.documentElement.getAttribute('data-hub-selected'),'false');assert.equal(child.document.querySelector('.topbar').hidden,true);for(const el of child.document.querySelectorAll('.bundle-option,.option-card'))assert.notEqual(el.getAttribute('aria-pressed'),'true');for(const bar of child.document.querySelectorAll('.sticky-total'))assert.equal(bar.hidden,true);child.openSummary();assert.notEqual(child.state.screen,'summary');}
passed('ZEISS opens first; all three brands start neutral with no selected price bar, summary or default comparison price');
// Shared charges and pure catalogue scans cannot pick a lens.
app.state.shared=D.normalizeShared({frame:250});app.openFrame();doc.getElementById('saveFrame').emit('click');h.flush();app.showTab('compare');h.flush();assert.deepEqual(plain(app.state.comparison),[]);
passed('Shared-only updates and repeated scans leave every lens unselected');
for(const brand of brandIds){app.showTab(brand);h.flush();const c=h.children[brand],original=c.openInfo;let opened=0;c.openInfo=function(){opened++;return original.apply(this,arguments)};doc.getElementById('hubInfo').emit('click');h.flush();assert.equal(opened,1);assert.equal(c.document.documentElement.getAttribute('data-hub-selected'),'false');c.closeOverlay('infoOverlay');}
passed('The left information control opens the current native information panel without selecting a lens');

for(const brand of brandIds){app.showTab(brand);h.flush();assert.equal(app.state.lastBrand,brand);assert.equal(doc.getElementById('activeBrandLogo').getAttribute('alt'),D.brands.find(b=>b.id===brand).name);const visible=doc.querySelectorAll('[data-tab]').filter(b=>!b.hidden);assert.equal(visible.length,3);assert.equal(doc.getElementById('tab-'+brand).hidden,true);assert.ok(visible.some(b=>b.id==='tab-compare'));assert.ok(doc.getElementById('tab-'+brand).querySelector('img'));app.showTab('compare');h.flush();assert.equal(doc.getElementById('activeBrandLogo').getAttribute('alt'),D.brands.find(b=>b.id===brand).name);assert.equal(doc.getElementById('activeBrandTitle').hidden,true);assert.equal(doc.getElementById('compareBrandTitles').hidden,false);assert.equal(doc.getElementById('tab-compare').hidden,true);assert.equal(doc.querySelectorAll('[data-brand-tab]').length,3);doc.getElementById('compare-title-'+brand).emit('click');h.flush();assert.equal(app.state.active,brand);assert.equal(doc.getElementById('compareBrandTitles').hidden,true);}
passed('Brand mode shows one centred logo; Compare shows three clickable centred logos and hides the side navigation');
for(const o of D.options){app.showTab(o.brand);h.flush();nativeChoice(h.children[o.brand],o);h.flush();assert.equal(h.children[o.brand].document.documentElement.getAttribute('data-hub-selected'),'true');app.showTab('compare');h.flush();assertFixed(h);const index=brandIds.indexOf(o.brand);assert.equal(app.state.comparison.find(id=>D.getOption(id).brand===o.brand),o.id);const header=body(h).querySelector('table').querySelector('th[data-brand="'+o.brand+'"]');assert.equal(header.querySelector('.comparison-brand').textContent,D.brands[index].name);const model=header.querySelector('.comparison-product-name').textContent;assert.equal(model,o.name.replace(/^(?:Essilor|HOYA|ZEISS)\s+/i,''));assert.doesNotMatch(model,/^(?:Essilor|HOYA|ZEISS)\s+/i);assert.ok(header.textContent.includes(o.fields.coating));assert.ok(header.textContent.includes(o.fields.lensStyle));report.nativeChoiceCases++;}
passed('All15 deliberate native choices auto-populate the right brand column with a single brand label and complete option identity');
app.useLens(D.defaults[2]);h.flush();assert.equal(doc.getElementById('hubHome').hidden,false);doc.getElementById('hubHome').emit('click');h.flush();assert.notEqual(h.children.zeiss.state.screen,'summary');assert.equal(doc.getElementById('hubHome').hidden,true);
passed('The shared back control returns from a native summary to its lens options');

for(const o of D.options){const index=brandIds.indexOf(o.brand);app.showTab(o.brand);h.flush();const child=h.children[o.brand];child.goHome();h.flush();setNativeScroll(child,o.brand,360+index*20);const screen=child.state.screen;app.showTab('compare');h.flush();app.openChooser(index);assert.ok(buttons(h).every(b=>D.getOption(b.getAttribute('data-pick-id')).brand===o.brand));const old=plain(app.state.comparison);const wrong=D.options.find(v=>v.brand!==o.brand);app.selectOption(wrong.id);assert.deepEqual(plain(app.state.comparison),old);button(h,o.id).emit('click');h.flush();assert.equal(app.state.comparison.find(id=>D.getOption(id).brand===o.brand),o.id);assert.equal(D.optionForState(o.brand,child.state).id,o.id);assert.equal(child.state.screen,screen);app.showTab(o.brand);h.flush();assert.equal(nativeScroll(child,o.brand),360+index*20);app.showTab('compare');h.flush();assert.equal(app.state.comparison.find(id=>D.getOption(id).brand===o.brand),o.id);report.changeCases++;}
passed('All15 brand-restricted Change choices update the native catalogue, preserve its page and pan, and survive fresh scans');
app.openChooser(0);const old=plain(app.state.comparison);doc.getElementById('cancelLensChooser').emit('click');assert.deepEqual(plain(app.state.comparison),old);assert.equal(doc.activeElement.id,'change-'+old[0]);
passed('Cancelling Change keeps the current selections and restores its opener');
// A read-state request must see a changed selected native state even without rendering it.
const fresh=D.getOption('essilor-stellest-prevencia');Object.assign(h.children.stellest.state,D.selectionForOption(fresh.id));app.showTab('compare');h.flush();assert.equal(app.state.comparison[0],fresh.id);
const renders={};for(const brand of brandIds){const c=h.children[brand],render=c.render;renders[brand]=0;c.render=function(){renders[brand]++;return render.apply(this,arguments)};}
app.showTab('compare');h.flush();assert.deepEqual(renders,{stellest:0,hoya:0,zeiss:0});
passed('Fresh read-state snapshots detect actual selections without rendering or navigating native pages');
app.showTab('compare');const count=h.queue.length;for(let i=0;i<count;i++)h.queue.shift()();const late=h.queue.splice(0);app.choose(0,'essilor-stellest2-rock');h.flush();for(const reply of late)reply();h.flush();assert.equal(app.state.comparison[0],'essilor-stellest2-rock');
passed('Late scan replies cannot overwrite a newer deliberate Change');
const rapid=createHub();rapid.app.showTab('compare');rapid.app.choose(1,'hoya-miyosmart-clear-stx');rapid.flush();assert.equal(rapid.app.state.byBrand.hoya,'hoya-miyosmart-clear-stx');assert.equal(D.optionForState('hoya',rapid.children.hoya.state).id,'hoya-miyosmart-clear-stx');
passed('A deliberate choice before an unvisited catalogue is ready wins over its unselected initial snapshot');
app.state.shared=D.normalizeShared({frame:200});app.renderComparison();const prices=()=>body(h).querySelectorAll('tr[data-row-key="practical-price"],tr[data-row-key="practical-review"]').map(r=>r.textContent).join('|');const baseline=prices();
for(const one of [false,true])for(const two of [false,true])for(const complimentary of [false,true]){app.state.shared=D.normalizeShared({frame:200,followups:{one,two},complimentary});app.renderComparison();assert.equal(prices(),baseline);assert.doesNotMatch(body(h).textContent,/follow[- ]?ups?|biometry|RM240/i);}
passed('Comparison prices exclude follow-up charges for every visit and complimentary combination');

// Reading-context fixtures vary content height after an edit and table width
// after a removal, while keeping real DOM identity and actual capture/restore.
const reading=createHub();reading.flush();reading.app.showTab('compare');reading.flush();
const ra=reading.app,rd=reading.host.document,viewport=rd.getElementById('comparisonContent'),panel=rd.getElementById('panel-compare');
D.defaults.forEach((id,index)=>ra.choose(index,id));reading.flush();
const originalFirst=D.defaults[0];
function sectionOf(el){return el.getAttribute('data-scroll-section')||el.getAttribute('data-section-table')||(el.closest('[data-scroll-section]')&&el.closest('[data-scroll-section]').getAttribute('data-scroll-section'));}
function displayedIds(section){return Array.from(rd.querySelector('table[data-section-table="'+section+'"]').querySelectorAll('thead th[data-option-id]'),cell=>cell.getAttribute('data-option-id'));}
function tableWidth(section){const count=displayedIds(section||'practical').length;return count===1?350:count===2?680:990;}
function sectionVisible(section){return section==='practical'||!!rd.querySelector('details[data-section="'+section+'"]').open;}
function tableTop(section){return {practical:500,design:1900,evidence:3400}[section];}
function rowsIn(section){return Array.from(rd.querySelector('table[data-section-table="'+section+'"]').querySelectorAll('tbody tr[data-row-key]'));}
function rowHeight(row){return row.getAttribute('data-row-key')==='practical-design-summary'&&displayedIds('practical')[0]!==originalFirst?180:100;}
rd.metrics=el=>el.classList.contains('comparison-scroll')?{clientWidth:350,scrollWidth:tableWidth(sectionOf(el))}:el.id==='comparisonContent'?{clientWidth:375,clientHeight:716,scrollHeight:6000}:null;
rd.geometry=el=>{
  if(el.id==='comparisonContent'||el.id==='panel-compare')return rect(0,52,375,716);
  if(el.id==='comparisonSticky')return rect(14,52,350,Number.parseFloat(el.style.height)||0);
  const section=sectionOf(el);
  if(!section)return null;
  if(!sectionVisible(section))return rect(0,0,0,0);
  const wrapper=el.classList.contains('comparison-scroll')?el:el.closest('.comparison-scroll');
  const left=14-(wrapper.scrollLeft||0),wrapperTop=52+tableTop(section)-viewport.scrollTop,width=tableWidth(section);
  const top=wrapperTop+(wrapper.classList.contains('has-overflow')?24:0);
  if(el.classList.contains('comparison-scroll'))return rect(14,wrapperTop,350,1324);
  if(el.tagName==='TABLE')return rect(left,top,width,1300);
  if(el.tagName==='THEAD')return rect(left,top,width,100);
  if(el.tagName==='TH'&&el.hasAttribute('data-option-id')){
    const ids=displayedIds(section),index=ids.indexOf(el.getAttribute('data-option-id')),feature=width*.25,column=(width-feature)/ids.length;
    return rect(left+feature+index*column,top,column,100);
  }
  if(el.tagName==='TR'&&el.hasAttribute('data-row-key')){
    const rows=rowsIn(section),index=rows.indexOf(el);let y=top+100;
    for(let i=0;i<index;i++)y+=rowHeight(rows[i]);return rect(left,y,width,rowHeight(el));
  }
  return null;
};
for(const detail of rd.querySelectorAll('details[data-section]')){detail.open=true;detail.emit('toggle');}
const offsets={practical:245,design:170,evidence:310};
for(const [section,left] of Object.entries(offsets))rd.querySelector('[data-scroll-section="'+section+'"]').scrollLeft=left;
viewport.scrollTop=1050;viewport.emit('scroll');
const anchorKey='practical-replacement',anchorBefore=rd.querySelector('[data-row-key="'+anchorKey+'"]').getBoundingClientRect().top;
rd.getElementById('change-'+originalFirst).focus();ra.openChooser(0);ra.closeChooser();
assert.equal(viewport.scrollTop,1050);assert.equal(rd.activeElement.id,'change-'+originalFirst);
for(const [section,left] of Object.entries(offsets))assert.equal(rd.querySelector('[data-scroll-section="'+section+'"]').scrollLeft,left);
passed('Cancelling the lens chooser retains the reading position, all pans and its opener');
ra.choose(0,'essilor-stellest2-rock');reading.flush();
assert.equal(rd.querySelector('[data-row-key="'+anchorKey+'"]').getBoundingClientRect().top,anchorBefore);
assert.equal(viewport.scrollTop,1130,'The anchor compensates for 80px of newly wrapped text above it');
for(const [section,left] of Object.entries(offsets))assert.equal(rd.querySelector('[data-scroll-section="'+section+'"]').scrollLeft,left,section);
assert.ok(rd.querySelector('details[data-section="design"]').open);assert.ok(rd.querySelector('details[data-section="evidence"]').open);
passed('Changing a lens retains each horizontal offset, expanded details and the visible row despite text-height changes');
const rowTop=rd.querySelector('[data-row-key="'+anchorKey+'"]').getBoundingClientRect().top;
ra.showTab('stellest');reading.flush();ra.showTab('compare');reading.flush();
assert.equal(rd.querySelector('[data-row-key="'+anchorKey+'"]').getBoundingClientRect().top,rowTop);
for(const [section,left] of Object.entries(offsets))assert.equal(rd.querySelector('[data-scroll-section="'+section+'"]').scrollLeft,left,section);
rd.getElementById('openFrame').focus();ra.openFrame();rd.getElementById('frameAmount').value='275';rd.getElementById('saveFrame').emit('click');reading.flush();
assert.equal(rd.querySelector('[data-row-key="'+anchorKey+'"]').getBoundingClientRect().top,rowTop);
assert.equal(rd.activeElement.id,'openFrame');
passed('Returning from a brand and applying frame edits preserve reading position and focus');
// A fresh scan keeps the fixed three columns and each independent pan intact.
ra.showTab('compare');reading.flush();
assert.equal(ra.state.comparison.length,3);
for(const [section,left] of Object.entries(offsets))assert.equal(rd.querySelector('[data-scroll-section="'+section+'"]').scrollLeft,left);
assert.equal(rd.querySelectorAll('[data-remove-index]').length,0);assert.equal(rd.getElementById('addLens'),null);
passed('Fresh scans preserve selected-brand columns without introducing Add or Remove controls');
fs.writeFileSync(path.join(__dirname,'shortlist-verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
