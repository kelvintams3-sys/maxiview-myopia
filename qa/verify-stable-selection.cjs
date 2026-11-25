'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createHub,loadNative,Element,root}=require('./harness.cjs');
const D=require('../catalogue-data.js');
const h=createHub();h.flush();h.app.showTab('hoya');h.flush();
const c=h.children.hoya,d=c.document,app=d.getElementById('app');
const screen=app.querySelector('.screen'),hero=app.querySelector('.catalogue-hero');
const images=app.querySelectorAll('img'),cards=app.querySelectorAll('.family-build-card');
const details=app.querySelector('.more-design'),rx=d.getElementById('selectedPrescription');
details.open=true;rx.open=true;c.scrollTo({top:530});
const descriptor=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
let fullScreenWrites=0;
Object.defineProperty(app,'innerHTML',{get(){return descriptor.get.call(this)},set(value){fullScreenWrites++;descriptor.set.call(this,value)}});
let logoSrcWrites=0;
const logo=h.host.document.getElementById('activeBrandLogo'),setAttribute=logo.setAttribute;
logo.setAttribute=function(name,value){if(name==='src')logoSrcWrites++;return setAttribute.call(this,name,value)};
function unchangedPage(){
 assert.equal(fullScreenWrites,0,'An option change must not replace app.innerHTML');
 assert.equal(app.querySelector('.screen'),screen);assert.equal(app.querySelector('.catalogue-hero'),hero);
 assert.deepEqual(app.querySelectorAll('img'),images,'Preserve the original image elements');
 assert.deepEqual(app.querySelectorAll('.family-build-card'),cards,'Preserve model containers/headers');
 assert.equal(app.querySelector('.more-design'),details);assert.equal(details.open,true);
 assert.equal(d.getElementById('selectedPrescription'),rx);assert.equal(rx.open,true);
 assert.equal(c.scrollY,530);
 const expected=d.createElement('div');expected.innerHTML=c.catalogueHtml();
 assert.equal(app.textContent,expected.textContent,'Incremental output must match current canonical content');
}
let options=0;
for(const option of D.options.filter(o=>o.brand==='hoya')){
 const other=option.productKey==='iq'?'miyosmart':'iq';
 const otherControls=d.getElementById('family-controls-'+other).querySelector('.lens-style-trigger');
 c.selectLensStyle(option.productKey,option.styleId);h.flush();unchangedPage();
 assert.equal(c.hasCompleteSelection(),false,'A changed style must leave its coating unchosen');
 const coating=d.getElementById('coating-'+option.productKey+'-'+option.coatingId);coating.focus();
 c.selectCoatingFor(option.productKey,option.coatingId);h.flush();unchangedPage();
 assert.equal(d.activeElement.id,coating.id);assert.equal(c.coatingPrice(),option.price);
 assert.equal(h.app.state.byBrand.hoya,option.id);
 assert.equal(d.getElementById('family-controls-'+other).querySelector('.lens-style-trigger'),otherControls,'The other model controls must stay intact');
 options++;
}
assert.equal(logoSrcWrites,0,'Selection updates must not reset the unchanged brand-logo src');
const pan=d.getElementById('coatingComparison').querySelector('.comparison-scroll');pan.scrollLeft=126;
c.selectCoatingFor('iq','spark');h.flush();unchangedPage();
assert.equal(d.getElementById('coatingComparison').querySelector('.comparison-scroll').scrollLeft,126);

// Repeat scans/renders: retaining live controls must never attach handlers twice.
const trigger=d.getElementById('style-iq');
for(let i=0;i<12;i++){c.render();h.flush();}
assert.equal(d.getElementById('style-iq'),trigger);assert.equal(trigger.listeners.click.length,1);
assert.equal(trigger.getAttribute('aria-expanded'),'false');trigger.emit('click');assert.equal(trigger.getAttribute('aria-expanded'),'true');
trigger.emit('click');assert.equal(trigger.getAttribute('aria-expanded'),'false');unchangedPage();
c.toggleCoatingComparison();h.flush();unchangedPage();assert.equal(d.getElementById('coatingComparison').hidden,true);
c.toggleCoatingComparison();h.flush();unchangedPage();assert.equal(d.getElementById('coatingComparison').hidden,false);
c.state.frame=200;c.render();h.flush();unchangedPage();

// Only actual navigation replaces the screen. Financial summary remains current.
c.openSummary();h.flush();assert.equal(fullScreenWrites,1);assert.equal(c.state.screen,'summary');
assert.ok(app.textContent.includes(c.money(c.grandTotal())));
c.toggleFollowup('one');h.flush();assert.ok(app.textContent.includes(c.money(c.grandTotal())));
c.goHome();h.flush();assert.equal(c.familyChoices.iq.coating,true);
const standalone=loadNative('hoya',null,null,[],false),standaloneScreen=standalone.document.querySelector('.screen');
standalone.selectCoatingFor('iq','spark');assert.equal(standalone.document.querySelector('.screen'),standaloneScreen);

const theme=fs.readFileSync(path.join(root,'model-themes.css'),'utf8');assert.match(theme,/\.screen\{animation:none\}/);
for(const brand of ['hoya','stellest','zeiss']){
 const html=fs.readFileSync(path.join(root,'catalogues',brand,'index.html'),'utf8');
 assert.ok(html.includes('href="../../model-themes.css"'));
 assert.ok(html.indexOf('href="design.css"')<html.indexOf('href="../../model-themes.css"'));
}
const report={status:'passed',hoyaOptions:options,fullScreenWritesDuringSelection:0,heroAndAllImagesRetained:true,modelHeadersRetained:true,focusScrollAndExpandedDetailsRetained:true,comparisonPanRetained:true,noDuplicateDropdownHandlers:true,noRepeatedBrandLogoSrcWrites:true,canonicalContentMatched:true,screenFadeRemovedForAllBrands:true,standaloneRetainsScreen:true,liveBrowser:false,physicalPrinter:false};
fs.writeFileSync(path.join(root,'qa/stable-selection-verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
