#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const web=fs.existsSync(path.join(root,'dist','index.html'))?path.join(root,'dist'):root;
const D=require(path.join(web,'catalogue-data.js')),C=require(path.join(web,'comparison.js'));
let checks=0;
function check(name,fn){try{fn();checks++;}catch(e){e.message=name+': '+e.message;throw e;}}
const selections=[
 ['miyosmart','clear','stx',1300],['miyosmart','clear','fullcontrol',1400],
 ['miyosmart','chameleon','stx',1500],['miyosmart','chameleon','fullcontrol',1500],
 ['miyosmart','sunbird','stx',1600],['iq','clear','spark',1700],
 ['iq','clear','fullcontrol',1800],['iq','chameleon','spark',1800],['iq','chameleon','fullcontrol',1900]];
const inputFor=(s,extra={})=>({product:s[0],style:s[1],coating:s[2],...extra});
function rowsCorrect(options,rows){
 const valid=options.filter((o,n,a)=>o&&o.id&&a.findIndex(x=>x&&x.id===o.id)===n),html=C.render(options,rows);
 if(!valid.length){assert.match(html,/Select an option to compare/);assert.doesNotMatch(html,/<table/);return;}
 assert.equal((html.match(/<table\b/g)||[]).length,1);
 assert.equal((html.match(/<th\b[^>]*scope="col"[^>]*data-option-id=/g)||[]).length,valid.length);
 const rr=[...html.matchAll(/<tr data-row-key="([^"]+)"[^>]*>([\s\S]*?)<\/tr>/g)];
 assert.deepEqual(rr.map(m=>m[1]),rows.map(r=>C.escape(r.key)));
 rows.forEach((r,n)=>{
  const cells=[...rr[n][2].matchAll(/<td data-row-key="([^"]+)" data-option-id="([^"]+)">([\s\S]*?)<\/td>/g)];
  assert.equal(cells.length,valid.length);
  valid.forEach((o,j)=>{const v=o.fields&&o.fields[r.key];assert.equal(cells[j][1],C.escape(r.key));assert.equal(cells[j][2],C.escape(o.id));assert.equal(cells[j][3],C.escape(v==null||v===''?'Not specified':v));});
 });
}
check('All9retailoptions',()=>{
 const all=D.allOptions();assert.equal(all.length,9);assert.equal(new Set(all.map(o=>o.id)).size,9);
 selections.forEach(s=>{const o=D.optionForState(inputFor(s));assert.equal(o.productKey,s[0]);assert.equal(o.styleId,s[1]);assert.equal(o.coatingId,s[2]);assert.equal(o.price,s[3]);assert.equal(o.priceBasis,'pair');assert.equal(o.currency,'MYR');assert.ok(all.some(x=>x.id===o.id));});
 assert.deepEqual(D.availableCoatings('miyosmart','sunbird'),['stx']);assert.deepEqual(D.availableCoatings('iq','sunbird'),[]);
});
for(const s of selections)for(const [one,two,charge]of[[false,false,0],[true,false,120],[false,true,120],[true,true,240]])for(const complimentary of[false,true])for(const frame of[null,0,299,99999])for(const frameComplimentary of[false,true]){
 check('Totals '+[...s.slice(0,3),one,two,complimentary,frame,frameComplimentary],()=>{
 const input=inputFor(s,{followups:{one,two},complimentary,frame,frameComplimentary}),snapshot=JSON.stringify(input),t=D.totals(input);
 const ef=frame==null||frameComplimentary?0:frame,eb=complimentary?0:charge;
 assert.equal(t.lens,s[3]);assert.equal(t.frame,ef);assert.equal(t.followups,eb);assert.equal(t.followupCount,Number(one)+Number(two));assert.equal(t.grand,s[3]+ef+eb);assert.equal(JSON.stringify(input),snapshot);
 });
}
check('Unsupported combinations never producefreeprice',()=>{
 for(const product of['miyosmart','iq'])for(const style of['clear','chameleon','sunbird'])for(const coating of['stx','spark','fullcontrol','invalid']){
 const s=D.normalizeState({product,style,coating,frame:299,frameComplimentary:true,followups:{one:false,two:true},complimentary:true});
 assert.ok(D.availableCoatings(s.product,s.style).includes(s.coating));assert.ok(D.price(s)>=1300);assert.equal(s.frame,299);assert.equal(s.frameComplimentary,true);assert.equal(s.followups.one,false);
 }
 const bad={product:'miyosmart',style:'sunbird',coating:'fullcontrol'};assert.equal(D.normalizeState(bad).coating,'stx');assert.equal(D.price(bad),1600);
 assert.equal(D.normalizeState({product:'iq',style:'sunbird',coating:'fullcontrol'}).style,'clear');
 const safe=D.normalizeState({product:'__proto__',style:'__proto__',coating:'__proto__'});assert.ok(D.price(safe)>0);
});
check('Invalidframevalues',()=>{for(const frame of[-1,NaN,Infinity,'invalid',100000,{}]){const s=D.normalizeState({frame,frameComplimentary:true});assert.equal(s.frame,null);assert.equal(s.frameComplimentary,false);}assert.equal(D.normalizeState({frame:'299'}).frame,299);});
check('Prescriptionsanddesignp11',()=>{
 assert.equal(D.products.miyosmart.clearZoneMm,9.4);assert.equal(D.products.iq.clearZoneMm,6.9);assert.equal(D.products.miyosmart.treatmentZoneMm,33);assert.equal(D.products.iq.treatmentZoneMm,41);assert.equal(D.products.miyosmart.defocusPowerD,3.5);assert.equal(D.products.iq.defocusPowerD,4.5);
 selections.forEach(s=>{const iq=s[0]==='iq',rx=D.optionForState(inputFor(s)).prescription;assert.equal(rx.sphereMin,iq||s[1]==='clear'?-13:-10);assert.equal(rx.cylinderMin,-4);assert.equal(rx.sphereMax,iq?4:0);assert.equal(rx.positiveMaxSE,iq?2:null);});
});
check('Spherewarrantyallstyles',()=>selections.forEach(s=>{
 const o=D.optionForState(inputFor(s)),iq=s[0]==='iq';assert.deepEqual(o.warranty,{months:iq?12:6,progressionD:iq?0.5:0.75,basis:'sphere'});assert.equal(o.fields.warrantyDuration,iq?'1 year':'6 months');assert.match(o.fields.warrantyThreshold,/Sphere/);assert.ok(o.fields.warrantyThreshold.includes(iq?'0.50':'0.75'));assert.doesNotMatch(o.fields.warrantyThreshold,/equivalent/i);
}));
check('Clinicalcontext',()=>selections.forEach(s=>{
 const o=D.optionForState(inputFor(s)),iq=s[0]==='iq';assert.equal(o.fields.studyDuration,'12 months');assert.match(o.fields.studyComparator,/single-vision/);assert.match(o.fields.refractionEffect,iq?/0\.58 D/:/0\.28 D/);assert.match(o.fields.axialEffect,iq?/0\.27 mm/:/0\.14 mm/);assert.ok(o.fields.evidenceStatus);if(!iq)assert.match(o.fields.refractionEffect,/calculated from trial chart/);
}));
const options=D.allOptions(),ids=options.map(o=>o.id);
check('Stablecomparisonschema',()=>{const keys=D.comparisonRows.map(r=>r.key);assert.equal(new Set(keys).size,keys.length);for(const k of['lensDesign','technology','coating','index','sphereRange','cylinderRange','combinedRange','refractionEffect','axialEffect','studyDuration','studyComparator','warrantyDuration','warrantyThreshold','price'])assert.ok(keys.includes(k));});
for(const a of ids)for(const b of ids)check('Comparisonpair '+a+'/'+b,()=>{
 const selected=D.comparisonOptions([a,b]);assert.equal(selected.length,a===b?1:2);assert.equal(selected[0].id,a);if(a!==b)assert.equal(selected[1].id,b);rowsCorrect(selected,D.comparisonRows);
});
check('Addremoveandduplicates',()=>{
 for(const sel of[[],[ids[0]],[ids[0],ids[8]],[ids[8],ids[0]],[ids[0],ids[8],ids[0]],[ids[8]],[ids[8],ids[0]],['invalid',ids[4],'__proto__']]){const picked=D.comparisonOptions(sel);assert.deepEqual(picked.map(o=>o.id),[...new Set(sel.filter(id=>ids.includes(id)))]);rowsCorrect(picked,D.comparisonRows);}
 assert.equal(D.comparisonOptions(['hoya-miyosmart-sunbird-fullcontrol']).length,0);
});
check('Longcopyandmissingdata',()=>{
 const long=structuredClone(options[8]);long.id='synthetic-long-fixture';long.name='Synthetic long product family style coating description';long.fields.studyComparator='Long independent comparator explanation. '.repeat(20);long.fields.warrantyThreshold='Long independent sphere trigger explanation. '.repeat(10);delete long.fields.sphereRange;
 for(const sel of[[long],[options[0],long],[long,options[0]],[long,options[4],options[8]],[options[8],long,options[4]]])rowsCorrect(sel,[...D.comparisonRows].reverse());
});
check('Escapedcomparisoncontent',()=>{const html=C.render([{id:'x" onmouseover="x',name:'<script>x</script>',fields:{x:'<img src=x onerror=alert(1)>'}}],[{key:'x',label:'<b>Title</b>'}]);assert.doesNotMatch(html,/<script>|<img|<b>/);assert.match(html,/&lt;script&gt;/);assert.match(html,/&lt;img/);});
check('Nobaselinebranddata',()=>{assert.doesNotMatch(fs.readFileSync(path.join(web,'catalogue-data.js'),'utf8'),/zeiss|myoactive|duravision|m\.o\.v\.e\.|stellest|essilor|crizal/i);});
(async()=>{
 await require('./verify-interactions.cjs')({D,C,root,web,check,selections});
 const result={passed:checks,failed:0,validOptions:9,financialPermutations:576,comparisonPairs:81,appTransitions:81,labelCases:36,testedAt:new Date().toISOString(),notes:'App interactions, gesture handlers, label text/cache, TSPL and simulated BLE validated. Browser geometry and physical Bluetooth printing require separate validation.'};
 fs.writeFileSync(path.join(__dirname,'verification.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
