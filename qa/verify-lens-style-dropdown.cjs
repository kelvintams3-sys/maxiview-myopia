'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createHub,loadNative,root}=require('./harness.cjs');
const D=require('../catalogue-data.js');
const h=createHub();h.flush();h.app.showTab('hoya');h.flush();
const c=h.children.hoya,d=c.document;
const box=p=>d.querySelector('[data-style-product="'+p+'"]');
const trigger=p=>box(p).querySelector('.lens-style-trigger');
const menu=p=>box(p).querySelector('.lens-style-menu');
const choices=p=>Array.from(menu(p).querySelectorAll('[data-style-choice]'));
const ids=p=>choices(p).map(b=>b.getAttribute('data-style-choice'));
const open=p=>{trigger(p).focus();trigger(p).emit('click');assert.equal(menu(p).hidden,false);assert.equal(trigger(p).getAttribute('aria-expanded'),'true');assert.equal(box(p).querySelector('.lens-style-control').getAttribute('data-open'),'true');};
const dispatch=(type,target)=>{for(const fn of d.listeners[type]||[])fn({type,target});};
const tapStyle=(p,s)=>{open(p);const button=choices(p).find(b=>b.getAttribute('data-style-choice')===s);assert.ok(button);button.emit('click');h.flush();};
const tapCoating=(p,k)=>{const button=d.getElementById('coating-'+p+'-'+k);assert.ok(button);vm.runInContext(button.getAttribute('onclick'),c);h.flush();};
const pressed=p=>d.querySelector('[data-family="'+p+'"]').querySelectorAll('.bundle-option[aria-pressed="true"]');
const incomplete=()=>{
 assert.equal(c.hasCompleteSelection(),false);assert.equal(d.documentElement.getAttribute('data-hub-selected'),'false');
 assert.equal(h.app.state.byBrand.hoya,null);assert.equal(d.querySelector('.sticky-total'),null);
 c.openSummary();assert.equal(c.state.screen,'catalogue');
};
const plain=x=>JSON.parse(JSON.stringify(x));
let transitions=0,coatingCases=0,compareCases=0;

// Clear may be the displayed default, but no coating/recommendation is chosen.
const initial=plain(c.state);
for(const product of ['miyosmart','iq']){
 assert.equal(trigger(product).textContent,'Clear');
 assert.equal(trigger(product).getAttribute('aria-controls'),menu(product).id);
 assert.ok(d.getElementById(trigger(product).getAttribute('aria-describedby')));
 assert.deepEqual(ids(product),product==='iq'?['chameleon']:['chameleon','sunbird']);
 assert.deepEqual(box(product).querySelectorAll('.lens-style-name').map(el=>el.textContent),product==='iq'?['Clear','Chameleon']:['Clear','Chameleon','Sunbird']);
 assert.equal(d.querySelector('[data-family="'+product+'"]').querySelectorAll('.bundle-option').length,2);
 assert.equal(pressed(product).length,0);
 open(product);assert.equal(trigger(product).parentElement,menu(product).parentElement);
 trigger(product).emit('click');assert.equal(menu(product).hidden,true);assert.deepEqual(plain(c.state),initial);
 assert.equal(box(product).querySelectorAll('[aria-selected="true"],[aria-pressed="true"],.selected').length,0);
 incomplete();
}
open('miyosmart');open('iq');assert.equal(menu('miyosmart').hidden,true);
dispatch('click',d.body);assert.equal(menu('iq').hidden,true);
open('iq');dispatch('focusin',d.getElementById('coatingCompareButton'));assert.equal(menu('iq').hidden,true);
open('iq');trigger('iq').emit('keydown',{key:'Escape'});assert.equal(menu('iq').hidden,true);assert.equal(d.activeElement,trigger('iq'));

// Focus moves through all choices without establishing a selection.
trigger('miyosmart').focus();trigger('miyosmart').emit('keydown',{key:'ArrowDown'});
assert.equal(d.activeElement,choices('miyosmart')[0]);
d.activeElement.emit('keydown',{key:'ArrowDown'});assert.equal(d.activeElement,choices('miyosmart')[1]);
d.activeElement.emit('keydown',{key:'End'});assert.equal(d.activeElement,choices('miyosmart')[1]);
d.activeElement.emit('keydown',{key:'ArrowDown'});assert.equal(d.activeElement,choices('miyosmart')[0]);
d.activeElement.emit('keydown',{key:'Home'});assert.equal(d.activeElement,choices('miyosmart')[0]);
d.activeElement.emit('keydown',{key:'Escape'});assert.equal(d.activeElement,trigger('miyosmart'));
trigger('miyosmart').emit('keydown',{key:'ArrowUp'});assert.equal(d.activeElement,choices('miyosmart')[1]);
d.activeElement.emit('keydown',{key:'Escape'});incomplete();

// Default Clear can be retained by choosing a coating directly.
incomplete();assert.equal(pressed('iq').length,0);
assert.deepEqual(ids('iq'),['chameleon']);tapCoating('iq','spark');assert.equal(c.hasCompleteSelection(),true);

// Every supported style change resets the coating choice, including Sunbird's
// single coating. Only a subsequent coating tap can publish a recommendation.
for(const product of ['miyosmart','iq'])for(const from of Object.keys(c.DATA.products[product].prices)){
 for(const to of Object.keys(c.DATA.products[product].prices).filter(s=>s!==from)){
  c.applyBuild({product,style:from,coating:c.DATA.availableCoatings(product,from)[0]});h.flush();
  c.scrollTo({top:420});tapStyle(product,to);incomplete();
  assert.equal(c.state.product,product);assert.equal(c.state.style,to);assert.equal(pressed(product).length,0);
  assert.deepEqual(ids(product),Object.keys(c.DATA.products[product].prices).filter(s=>s!==to));
  assert.equal(menu(product).hidden,true);assert.equal(trigger(product).getAttribute('aria-expanded'),'false');
  assert.equal(d.activeElement.id,'style-'+product);assert.equal(c.scrollY,420);
  assert.equal(d.getElementById('style-description-'+product).textContent,c.DATA.styles[to].copy);
  if(to==='chameleon')assert.ok(trigger(product).textContent.includes('Photochromic'));
  if(to==='sunbird'){
   assert.equal(d.getElementById('coating-miyosmart-fullcontrol'),null);
   c.selectCoatingFor(product,'fullcontrol');h.flush();incomplete();assert.equal(pressed(product).length,0);
  }
  for(const coating of c.DATA.availableCoatings(product,to)){
   tapCoating(product,coating);assert.equal(c.hasCompleteSelection(),true);
   assert.equal(c.coatingPrice(),c.DATA.products[product].prices[to][coating]);assert.equal(pressed(product).length,1);
   assert.equal(pressed(product)[0].id,'coating-'+product+'-'+coating);
   assert.equal(d.documentElement.getAttribute('data-hub-selected'),'true');
   assert.equal(h.app.state.byBrand.hoya,c.DATA.optionForState(c.state).id);coatingCases++;
  }
  h.app.showTab('compare');h.flush();assert.equal(h.app.state.byBrand.hoya,c.DATA.optionForState(c.state).id);
  h.app.showTab('hoya');h.flush();c.openSummary();h.flush();assert.equal(c.state.screen,'summary');
  assert.match(d.querySelector('.model-choice-detail').textContent,new RegExp(c.DATA.styles[to].name));
  c.goHome();h.flush();assert.equal(pressed(product).length,1);transitions++;
 }
}
// Complete choices arriving from Compare establish the style and coating.
for(const option of D.options.filter(o=>o.brand==='hoya')){
 h.app.choose(1,option.id);h.flush();c.goHome();h.flush();
 assert.equal(c.hasCompleteSelection(),true);assert.equal(c.familyBuilds[option.productKey].style,option.styleId);
 assert.equal(c.familyChoices[option.productKey].coating,true);assert.equal(pressed(option.productKey).length,1);
 assert.ok(!ids(option.productKey).includes(option.styleId));compareCases++;
}
// Choosing in the second model and navigating must retain the first model's picks.
c.applyBuild({product:'miyosmart',style:'sunbird',coating:'stx'});h.flush();
c.selectLensStyle('iq','clear');h.flush();incomplete();
assert.equal(trigger('miyosmart').textContent,'Sunbird');assert.equal(pressed('miyosmart')[0].id,'coating-miyosmart-stx');
tapCoating('iq','spark');c.openSummary();c.goHome();h.flush();
assert.equal(trigger('miyosmart').textContent,'Sunbird');assert.equal(pressed('miyosmart').length,1);

// Standalone HOYA also requires a coating; Clear can be retained as default.
const standalone=loadNative('hoya',null,null,[],false);
standalone.openSummary();assert.equal(standalone.state.screen,'catalogue');
standalone.selectCoatingFor('iq','spark');assert.equal(standalone.hasCompleteSelection(),true);
assert.equal(standalone.state.style,'clear');
standalone.selectLensStyle('iq','chameleon');assert.equal(standalone.hasCompleteSelection(),false);
assert.equal(standalone.document.querySelectorAll('.bundle-option[aria-pressed="true"]').length,0);
standalone.selectCoatingFor('iq','spark');standalone.openSummary();assert.equal(standalone.state.screen,'summary');

const css=fs.readFileSync(path.join(root,'catalogues/hoya/design.css'),'utf8');
assert.match(css,/\.lens-style-menu\[hidden\]\{display:none\}/);
assert.match(css,/\.lens-style-control\[data-open="true"\]/);
assert.match(css,/\.lens-style-option[^}]*min-height:52px/);
const allIds=d.querySelectorAll('[id]').map(el=>el.id);assert.equal(new Set(allIds).size,allIds.length);
const report={status:'passed',transitions,coatingCases,compareCases,clearDefaultAllowed:true,dropdownRowsNeverPrehighlighted:true,initialCoatingsUnchosen:true,singleCoatingRequiresTap:true,currentChoiceNotDuplicated:true,oneGroupEnclosure:true,keyboardAndDismissal:true,independentModelMemory:true,standaloneRequiresCoatingTap:true,pricingAndSunbirdAvailability:true,liveBrowser:false,physicalPrinter:false};
fs.writeFileSync(path.join(root,'qa/lens-style-dropdown-verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
