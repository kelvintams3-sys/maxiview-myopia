'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {createHub,root}=require('./harness.cjs');
const D=require('../catalogue-data.js');
const h=createHub();h.flush();h.app.showTab('hoya');h.flush();
const c=h.children.hoya,d=c.document;
const box=product=>d.querySelector('[data-style-product="'+product+'"]');
const trigger=product=>box(product).querySelector('.lens-style-trigger');
const menu=product=>box(product).querySelector('.lens-style-menu');
const choices=product=>Array.from(menu(product).querySelectorAll('[data-style-choice]'));
const ids=product=>choices(product).map(b=>b.getAttribute('data-style-choice'));
const open=product=>{trigger(product).focus();trigger(product).emit('click');assert.equal(menu(product).hidden,false);assert.equal(trigger(product).getAttribute('aria-expanded'),'true');};
const dispatch=(type,target)=>{for(const fn of d.listeners[type]||[])fn({type,target});};
const plain=x=>JSON.parse(JSON.stringify(x));
let transitions=0;

// Reading or opening a default style must never select a lens in the hub.
const initial=plain(c.state);
for(const product of ['miyosmart','iq']){
 assert.equal(trigger(product).getAttribute('aria-controls'),menu(product).id);
 assert.ok(d.getElementById(trigger(product).getAttribute('aria-describedby')));
 assert.equal(menu(product).hidden,true);
 assert.deepEqual(ids(product),product==='iq'?['chameleon']:['chameleon','sunbird']);
 open(product);trigger(product).emit('click');
 assert.equal(menu(product).hidden,true);
 assert.deepEqual(plain(c.state),initial);
 assert.equal(d.documentElement.getAttribute('data-hub-selected'),'false');
 assert.ok(d.querySelectorAll('.sticky-total').every(el=>el.hidden));
}
open('miyosmart');open('iq');assert.equal(menu('miyosmart').hidden,true);
dispatch('click',d.body);assert.equal(menu('iq').hidden,true);
open('iq');dispatch('focusin',d.getElementById('coating-iq-spark'));assert.equal(menu('iq').hidden,true);
open('iq');trigger('iq').emit('keydown',{key:'Escape'});assert.equal(menu('iq').hidden,true);assert.equal(d.activeElement,trigger('iq'));
assert.equal(d.documentElement.getAttribute('data-hub-selected'),'false');

// Arrow keys navigate alternatives without selecting; Escape restores the field.
trigger('miyosmart').focus();trigger('miyosmart').emit('keydown',{key:'ArrowDown'});
assert.equal(d.activeElement,choices('miyosmart')[0]);
d.activeElement.emit('keydown',{key:'ArrowDown'});assert.equal(d.activeElement,choices('miyosmart')[1]);
d.activeElement.emit('keydown',{key:'ArrowDown'});assert.equal(d.activeElement,choices('miyosmart')[0]);
d.activeElement.emit('keydown',{key:'End'});assert.equal(d.activeElement,choices('miyosmart')[1]);
d.activeElement.emit('keydown',{key:'Home'});assert.equal(d.activeElement,choices('miyosmart')[0]);
d.activeElement.emit('keydown',{key:'Escape'});assert.equal(d.activeElement,trigger('miyosmart'));
trigger('miyosmart').emit('keydown',{key:'ArrowUp'});assert.equal(d.activeElement,choices('miyosmart')[1]);
d.activeElement.emit('keydown',{key:'Escape'});
assert.equal(d.documentElement.getAttribute('data-hub-selected'),'false');

// Every supported change delegates to the real selection/pricing flow. The
// previous choice becomes available again, while the new current choice vanishes.
for(const product of ['miyosmart','iq'])for(const from of Object.keys(c.DATA.products[product].prices)){
 for(const to of Object.keys(c.DATA.products[product].prices).filter(s=>s!==from)){
  c.selectLensStyle(product,from);c.selectCoatingFor(product,'fullcontrol');h.flush();
  const expected=c.DATA.normalizeState(Object.assign({},c.state,{product,style:to}));
  c.scrollTo({top:420});open(product);
  assert.ok(!ids(product).includes(from));
  const option=choices(product).find(b=>b.getAttribute('data-style-choice')===to);
  // A touch click may arrive without focus moving onto the option in Safari.
  assert.equal(d.activeElement,trigger(product));option.emit('click');h.flush();
  assert.equal(c.state.product,product);assert.equal(c.state.style,to);
  assert.equal(c.state.coating,expected.coating);assert.equal(c.coatingPrice(),c.DATA.price(expected));
  assert.deepEqual(ids(product),Object.keys(c.DATA.products[product].prices).filter(s=>s!==to));
  assert.equal(menu(product).hidden,true);assert.equal(trigger(product).getAttribute('aria-expanded'),'false');
  assert.equal(d.activeElement.id,'style-'+product);assert.equal(c.scrollY,420);
  assert.equal(d.getElementById('style-description-'+product).textContent,c.DATA.styles[to].copy);
  assert.ok(trigger(product).textContent.includes(c.DATA.styles[to].name));
  if(to==='chameleon')assert.ok(trigger(product).textContent.includes('Photochromic'));
  assert.equal(d.documentElement.getAttribute('data-hub-selected'),'true');
  if(to==='sunbird')assert.equal(d.getElementById('coating-miyosmart-fullcontrol'),null);
  h.app.showTab('compare');h.flush();
  const selected=h.app.state.comparison.find(id=>D.getOption(id).brand==='hoya');
  assert.equal(selected,c.DATA.optionForState(c.state).id);
  h.app.showTab('hoya');h.flush();
  c.openSummary();h.flush();assert.match(d.querySelector('.model-choice-detail').textContent,new RegExp(c.DATA.styles[to].name));
  c.goHome();h.flush();transitions++;
 }
}
const css=fs.readFileSync(path.join(root,'catalogues/hoya/design.css'),'utf8');
assert.match(css,/\.lens-style-menu\[hidden\]\{display:none\}/);
assert.match(css,/\.lens-style-option[^}]*min-height:52px/);
assert.equal(d.querySelectorAll('select.lens-style-select').length,0);
const allIds=d.querySelectorAll('[id]').map(el=>el.id);assert.equal(new Set(allIds).size,allIds.length);
const report={status:'passed',transitions,currentChoiceHidden:true,defaultsRemainUnselected:true,keyboardAndDismissal:true,touchWithoutOptionFocus:true,pricingAndSunbirdAvailability:true,comparisonAndSummaryIdentity:true,liveBrowser:false,physicalPrinter:false};
fs.writeFileSync(path.join(root,'qa/lens-style-dropdown-verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
