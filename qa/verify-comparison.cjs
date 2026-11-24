'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const D=require(path.join(root,'catalogue-data.js'));
const H=require(path.join(root,'catalogues/hoya/catalogue-data.js'));
const Z=require(path.join(root,'catalogues/zeiss/catalogue-data.js'));
let checks=0,pairs=0,triples=0,financialCases=0;
function check(label,fn){try{fn();checks++;}catch(error){error.message=label+': '+error.message;throw error;}}
const stellestHtml=fs.readFileSync(path.join(root,'catalogues/stellest/index.html'),'utf8');
const P=JSON.parse(vm.runInNewContext('JSON.stringify('+stellestHtml.match(/var PRODUCTS = ([\s\S]*?);\s+var COATINGS/)[1]+')'));
const C=JSON.parse(vm.runInNewContext('JSON.stringify('+stellestHtml.match(/var COATINGS = ([\s\S]*?);\s+var state/)[1]+')'));

check('Exactly all 15 commercial choices, stable defaults and source versions',()=>{
  assert.equal(D.options.length,15);assert.equal(new Set(D.options.map(o=>o.id)).size,15);
  assert.deepEqual(D.brands.map(b=>b.id),['stellest','hoya','zeiss']);
  assert.deepEqual(D.brands.map(b=>b.name),['Essilor','HOYA','ZEISS']);
  assert.deepEqual(D.defaults,['essilor-stellest-rock','hoya-miyosmart-iq-clear-spark','zeiss-myoactive-platinum']);
  assert.deepEqual(D.sourceVersions,{stellest:'R1.33',hoya:'R1.6',zeiss:'R1.6'});
  assert.deepEqual(D.defaults.map(id=>D.total(id).grand),[1540,1940,2040]);
  assert.equal(D.options.filter(o=>o.brand==='stellest').length,4);
  assert.equal(D.options.filter(o=>o.brand==='hoya').length,9);
  assert.equal(D.options.filter(o=>o.brand==='zeiss').length,2);
});
check('Independent browser-global and Node loading produce the same catalogue',()=>{
  const context=vm.createContext({});
  for(const filename of ['catalogues/hoya/catalogue-data.js','catalogues/zeiss/catalogue-data.js','catalogue-data.js'])vm.runInContext(fs.readFileSync(path.join(root,filename),'utf8'),context);
  assert.deepEqual(JSON.parse(JSON.stringify(context.MyopiaHubData.options)),JSON.parse(JSON.stringify(D.options)));
  assert.deepEqual(JSON.parse(JSON.stringify(context.MyopiaHubData.rows)),JSON.parse(JSON.stringify(D.rows)));
});
check('Missing source libraries fail visibly instead of constructing partial comparisons',()=>{
  assert.throws(()=>vm.runInNewContext(fs.readFileSync(path.join(root,'catalogue-data.js'),'utf8'),{}),/Load the source/);
});
check('Matching row keys are unique and every registered option supplies every cell',()=>{
  assert.equal(new Set(D.rows.map(row=>row.key)).size,D.rows.length);
  for(const row of D.rows){assert.ok(['practical','design','evidence'].includes(row.section));assert.equal(typeof row.label,'string');}
  for(const o of D.options)for(const row of D.rows){assert.equal(typeof o.fields[row.key],'string');assert.ok(o.fields[row.key].length>0);}
  for(const o of D.options)for(const key of ['studyOutcome','reportedResult','studyDuration','studyComparator','studyAges','evidenceStatus'])assert.notEqual(o.fields[key],D.missingValue,o.id+' '+key);
  assert.equal(D.getOption('essilor-stellest-rock').fields.clearZone,'Not specified');
  assert.equal(D.getOption('zeiss-myoactive-platinum').fields.lenslets,'Not specified');
  assert.equal(D.getOption('hoya-miyosmart-iq-clear-spark').fields.rings,'Not specified');
});
check('Unknown values cannot resolve to inherited properties or unofficial prices',()=>{
  for(const id of [null,undefined,'','__proto__','constructor','toString',1,{}])assert.equal(D.getOption(id),null);
  for(const value of [null,undefined,'unknown',{}, {id:'__proto__',price:0}])assert.throws(()=>D.total(value),/Unknown lens option/);
  assert.equal(D.total({id:D.defaults[0],price:1}).lens,1300);
  assert.equal(D.selectionForOption('unknown'),null);assert.equal(D.optionForState('unknown',{}),null);
});
check('Stellest prices, product identity, clinical text and specifications match the exact bundled PRODUCTS source',()=>{
  for(const [productKey,p] of Object.entries(P))for(const [coatingKey,price] of Object.entries(p.prices)){
    const o=D.getOption('essilor-'+productKey+'-'+coatingKey);
    assert.equal(o.price,price);assert.equal(o.fields.lensDesign,p.name);assert.equal(o.fields.technology,p.tech);
    assert.equal(o.fields.lensletDesign,p.design);assert.equal(o.fields.reportedResult,p.efficacy);
    assert.ok(o.fields.studyContext.startsWith(p.studyContext));assert.ok(o.fields.lenslets.startsWith(p.lenslets));assert.ok(o.fields.rings.startsWith(p.rings));
    assert.equal(o.fields.coating,C[coatingKey].name);assert.equal(o.fields.coatingBenefit,C[coatingKey].copy);
    assert.equal(o.warranty.months,6);assert.equal(o.warranty.progressionD,.75);assert.equal(o.warranty.basis,'prescription');
    assert.ok(stellestHtml.includes(o.warranty.condition));
    assert.deepEqual(o.selection,{product:productKey,coating:coatingKey});
  }
  assert.ok(stellestHtml.includes('Sphere +2.00 D to −12.00 D; cylinder up to −4.00 D.'));
  assert.match(D.getOption('essilor-stellest2-rock').fields.lenslets,/1,190.*\+169/);
});
check('HOYA choices, styles, coating benefits, Rx ranges and warranty conditions match their native module',()=>{
  const native=H.allOptions();
  for(const n of native){
    const o=D.getOption(n.id),p=H.products[n.productKey],c=H.coatings[n.coatingId];
    assert.equal(o.name,n.fullName);assert.equal(o.price,n.price);assert.equal(o.fields.coating,c.name);assert.equal(o.fields.coatingBenefit,c.copy);
    assert.equal(o.fields.lensletDesign,p.design);assert.equal(o.fields.technology,p.technology);
    for(const key of ['clearZone','treatmentZone','defocusPower','sphereRange','cylinderRange','combinedRange'])assert.equal(o.fields[key],n.fields[key]);
    assert.equal(o.warranty.condition,p.warranty.condition);assert.equal(o.warranty.wording,p.warranty.wording);
    assert.equal(o.warranty.months,p.warranty.months);assert.equal(o.warranty.progressionD,p.warranty.progressionD);assert.equal(o.warranty.basis,'sphere');
    assert.equal(o.fields.studyComparator,p.clinical.comparator);assert.equal(o.fields.evidenceStatus,p.clinical.status);
    assert.deepEqual(o.selection,{product:n.productKey,style:n.styleId,coating:n.coatingId});
    if(n.productKey==='miyosmart')assert.match(o.fields.reportedResult,/calculated from the supplied trial chart/);
  }
  assert.equal(D.getOption('hoya-miyosmart-sunbird-fullcontrol'),null);
  assert.equal(D.getOption('hoya-miyosmart-iq-sunbird-spark'),null);
  assert.equal(D.getOption('hoya-miyosmart-chameleon-fullcontrol').price,1500);
});
check('ZEISS full coating identities, Rx limits, trial context and replacement condition match the native module',()=>{
  for(const n of Z.comparisonOptions()){
    const o=D.getOption(n.id),c=Z.coatings[n.coatingId],p=Z.product;
    assert.equal(o.price,c.price);assert.equal(o.fields.coating,c.name);assert.equal(o.fields.coatingBenefit,c.copy);
    assert.equal(o.warranty.condition,p.warranty.condition);assert.equal(o.warranty.months,p.warranty.months);assert.equal(o.warranty.progressionD,p.warranty.progressionD);assert.equal(o.warranty.basis,'prescription');
    for(const key of ['sphereRange','cylinderRange','combinedRange'])assert.equal(o.fields[key],n.fields[key]);
    assert.equal(o.fields.studyComparator,p.clinical.comparator);assert.equal(o.fields.studyAges,p.clinical.studyAges);assert.match(o.fields.studyContext,/NCT06563700/);
    assert.deepEqual(o.selection,{coating:n.coatingId});
  }
});
check('Different clinical comparators, periods and outcomes stay explicit without ranking fields',()=>{
  const a=D.getOption('essilor-stellest-rock'),b=D.getOption('essilor-stellest2-rock'),h=D.getOption('hoya-miyosmart-iq-clear-spark'),z=D.getOption('zeiss-myoactive-platinum');
  assert.equal(a.fields.studyDuration,'2 years');assert.equal(b.fields.studyDuration,'1 year');assert.equal(h.fields.studyDuration,'12 months');assert.equal(z.fields.studyDuration,'12 months');
  assert.match(a.fields.reportedResult,/67%.*two years.*single-vision.*12 hours/);
  assert.match(b.fields.reportedResult,/About 47%.*estimated.*eye-length.*original Stellest.*one-year/);
  assert.equal(b.fields.studyComparator,'Original STELLEST');assert.match(b.fields.studyContext,/50 children.*six months.*11 rings/);
  assert.notEqual(a.fields.studyOutcome,b.fields.studyOutcome);
  for(const o of D.options){assert.ok(!('rank' in o));assert.ok(!('efficacyScore' in o));}
});
check('All exact child selections round-trip through their original brand adapter',()=>{
  for(const o of D.options){
    const selection=D.selectionForOption(o.id);assert.deepEqual(selection,o.selection);
    assert.equal(D.optionForState(o.brand,selection).id,o.id);
    selection.coating='invalid';assert.equal(D.getOption(o.id).selection.coating,o.coatingId);
  }
  assert.equal(D.optionForState('stellest',{product:'__proto__',coating:'invalid'}).id,'essilor-stellest-rock');
  assert.equal(D.optionForState('hoya',{product:'__proto__',style:'invalid',coating:'invalid'}).id,'hoya-miyosmart-iq-clear-spark');
  assert.equal(D.optionForState('zeiss',{coating:'__proto__'}).id,'zeiss-myoactive-platinum');
});

const ids=D.options.map(o=>o.id);
for(const a of ids)for(const b of ids){
  const expected=[...new Set([a,b])];assert.deepEqual(D.normalizeComparison([a,b]),expected);pairs++;
  for(const row of D.rows)for(const id of expected)assert.equal(typeof D.getOption(id).fields[row.key],'string');
}
for(const a of ids)for(const b of ids)for(const c of ids){
  assert.deepEqual(D.normalizeComparison([a,b,c]),[...new Set([a,b,c])]);triples++;
}
check('Selection order, maximum columns, unknowns and duplicates are deterministic',()=>{
  assert.deepEqual(D.normalizeComparison(['unknown',ids[4],ids[4],'__proto__',ids[1],null,ids[14],ids[6]]),[ids[4],ids[1],ids[14]]);
  for(const input of [null,undefined,{},'bad'])assert.deepEqual(D.normalizeComparison(input),[]);
  const input=[ids[14],ids[2],ids[7],ids[0]],before=JSON.stringify(input);D.normalizeComparison(input);assert.equal(JSON.stringify(input),before);
});

for(const o of D.options)for(const frame of [null,0,250,99999,299.7,'299'])for(const frameComplimentary of [false,true])
for(const one of [false,true])for(const two of [false,true])for(const complimentary of [false,true]){
  const input={frame,frameComplimentary,followups:{one,two},complimentary};const before=JSON.stringify(input);
  const normalized=D.normalizeShared(input),actual=D.total(o.id,input);
  const amount=frame===null?null:Math.round(Number(frame));
  const expected={lens:o.price,frame:frameComplimentary?0:amount||0,followups:complimentary?0:(Number(one)+Number(two))*120,followupCount:Number(one)+Number(two)};
  expected.grand=expected.lens+expected.frame+expected.followups;assert.deepEqual(actual,expected);
  if(o.brand==='hoya')assert.deepEqual(actual,H.totals(Object.assign({},o.selection,input)));
  if(o.brand==='zeiss')assert.deepEqual(actual,Z.totals(Object.assign({},o.selection,input)));
  assert.equal(normalized.frame,amount);assert.equal(normalized.frameComplimentary,amount!==null&&frameComplimentary);
  assert.equal(JSON.stringify(input),before);financialCases++;
}
check('Shared totals reject invalid frame values and retain independent follow-up selections',()=>{
  for(const frame of [-1,-999,100000,Infinity,NaN,'invalid',{},[],true]){
    const s=D.normalizeShared({frame,frameComplimentary:true});assert.equal(s.frame,null);assert.equal(s.frameComplimentary,false);
  }
  assert.deepEqual(D.normalizeShared(),{frame:null,frameComplimentary:false,followups:{one:true,two:true},complimentary:false});
  assert.equal(D.total(ids[0],{followups:{one:false,two:true}}).followups,120);
  assert.equal(D.total(ids[0],{followups:{one:false,two:false},complimentary:true}).followupCount,0);
  const input={frame:250,followups:{one:false,two:true}},copy=D.normalizeShared(input);copy.followups.one=true;assert.equal(input.followups.one,false);
});
check('All brochure paths resolve and ZEISS has exactly its standard RRP PDF',()=>{
  for(const o of D.options){const data=fs.readFileSync(path.join(root,o.brochurePath));assert.equal(data.slice(0,5).toString(),'%PDF-');}
  assert.deepEqual(fs.readdirSync(path.join(root,'catalogues/zeiss/assets')).filter(name=>name.endsWith('.pdf')),['myoactive-brochure.pdf']);
});
check('Registry data is immutable and options cannot acquire state from shared-price calculations',()=>{
  assert.ok(Object.isFrozen(D.options));assert.ok(Object.isFrozen(D.options[0].fields));
  assert.throws(()=>{D.options[0].price=1;},TypeError);
  const before=JSON.stringify(D.options);for(const o of D.options)D.total(o,{frame:999,complimentary:true});assert.equal(JSON.stringify(D.options),before);
});
const result={status:'passed',checks,validOptions:D.options.length,comparisonRows:D.rows.length,orderedPairs:pairs,orderedTriples:triples,financialCases,sourceFidelity:'passed',browserGlobalLoading:'passed',liveBrowser:false,physicalPrinter:false};
fs.writeFileSync(path.join(__dirname,'comparison-verification.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
