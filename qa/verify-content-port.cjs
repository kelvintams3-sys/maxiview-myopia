'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadNative,root}=require('./harness.cjs');
const report={status:'passed',brands:[],runtimeErrors:0,liveBrowser:false,physicalPrinter:false};
for(const brand of ['stellest','hoya','zeiss']){
 const c=loadNative(brand,null,null,[],false);c.goHome();
 const source=c.document.getElementById('app').innerHTML;
 fs.writeFileSync(path.join(__dirname,'rendered-'+brand+'.html'),source);
 const all=c.document.getElementById('app').textContent;
 assert.doesNotMatch(source,/<svg\b/i,'Use the official source figures');
 assert.doesNotMatch(source,/wear-panel|review-panel|followup-panel|wear-grid|timeline|follow-up schedule/i);
 assert.ok(c.document.getElementById('infoOverlay').querySelector('a[href="assets/'+({stellest:'stellest',hoya:'hoya-original',zeiss:'myoactive'}[brand])+'-brochure.pdf"]'));
 if(brand==='zeiss')for(const expected of ['0.60 D','0.22 mm','98%','56 children','single-vision','12-month','3–4 letters'])assert.ok(all.includes(expected),expected);
 if(brand==='hoya'){
  assert.match(source,/hoya-lens-macro.jpg/);assert.match(source,/hoya-trial-charts.png/);assert.doesNotMatch(source,/hoya-classroom/);
  c.selectLensStyle('iq','chameleon');
  assert.equal(c.hasCompleteSelection(),false,'A lens style alone must not choose a coating');
  c.selectCoatingFor('iq','spark');assert.ok(c.catalogueHtml().includes('Chameleon (Photochromic)'));
 }
 if(brand==='stellest'){
  for(const expected of ['55%','67%','50%','60%','0.80 D','0.99 D','0.35 mm','0.41 mm','0.228 mm','0.121 mm','1,021','1,190'])assert.ok(all.includes(expected),expected);
  assert.match(source,/stellest-fig-central-focus.jpg/);assert.match(source,/stellest-fig-defocus-volume.jpg/);
 }
 c.state.frame=200;c.render();c.openSummary();
 const summary=c.document.getElementById('app').innerHTML;
 assert.match(summary,/aria-label="Remove frame"/);assert.match(summary,/✕/);assert.doesNotMatch(summary,/>Hold for complimentary</);
 // Exercise the original event handlers, including the retained long-press actions.
 c.toggleFrameComplimentary();assert.equal(c.state.frameComplimentary,true);assert.match(c.frameValueHtml(),/<s>RM200<\/s>/);
 c.toggleComplimentary();assert.equal(c.state.complimentary,true);assert.equal(c.state.followups.one,true);assert.equal(c.state.followups.two,true);
 c.openPrintPreview();assert.equal(c.document.getElementById('printOverlay').classList.contains('open'),true);
 assert.ok(c.document.getElementById('labelPreview').innerHTML.includes('<img'));
 report.brands.push(brand);
}
fs.writeFileSync(path.join(__dirname,'content-port-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
