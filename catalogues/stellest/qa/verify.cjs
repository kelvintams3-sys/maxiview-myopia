'use strict';

// Regression checks use the real application script and an in-memory DOM/canvas.
// These checks do not replace a live-browser or physical-printer check.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {createCanvas} = require('@napi-rs/canvas');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const baselinePath = process.argv[2];
const baselineHtml = baselinePath ? fs.readFileSync(baselinePath, 'utf8') : null;
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const scriptOf = source => source.match(/<script>([\s\S]*?)<\/script>/)[1];

function load(source) {
  const nodes = new Map();
  const timers = new Map();
  let timerId = 0;
  const document = {activeElement:null, body:{style:{}}, addEventListener(){}};
  function node(id) {
    const classes = new Set();
    return {
      id, dataset:{}, style:{setProperty(name,value){this[name]=value}}, offsetWidth:1024, clientWidth:1024, disabled:false, textContent:'', listeners:{},
      classList:{add(c){classes.add(c)},remove(c){classes.delete(c)},contains(c){return classes.has(c)},toggle(c,force){if(force===true || (force===undefined && !classes.has(c)))classes.add(c);else classes.delete(c)}},
      addEventListener(name,callback){this.listeners[name]=callback},
      focus(){document.activeElement=this},
      querySelector(){return this.statusText || (this.statusText={textContent:''})},
      get innerHTML(){return this.markup || ''},
      set innerHTML(value){
        for(const child of this.childrenIds || [])nodes.delete(child);
        this.markup=value;
        this.childrenIds=[];
        for(const match of value.matchAll(/\bid="([^"]+)"/g)){
          nodes.set(match[1],node(match[1]));
          this.childrenIds.push(match[1]);
        }
      }
    };
  }
  for(const match of source.matchAll(/\bid="([^"]+)"/g))nodes.set(match[1],node(match[1]));
  document.getElementById=id=>nodes.get(id) || null;
  document.querySelectorAll=()=>['printQuotationButton','printWarrantyButton','printBookletButton','printBiometryExtensionButton'].map(id=>nodes.get(id)).filter(Boolean);
  document.createElement=tag=>{assert.equal(tag,'canvas');return createCanvas(320,480)};
  const window={document,CSS:{supports(){return true}},scrollTo(){},setTimeout(callback,delay){const id=++timerId;timers.set(id,{callback,delay});return id},clearTimeout(id){timers.delete(id)}};
  const context=vm.createContext({document,window,navigator:{},console,Uint8Array});
  new vm.Script(scriptOf(source)).runInContext(context);
  context.updatePrintAreas=()=>{};
  context.runHold=()=>{
    const hold=[...timers].find(([,value])=>value.delay===850);
    assert.ok(hold,'an 850 ms hold was scheduled');
    timers.delete(hold[0]);hold[1].callback();
  };
  return context;
}

async function main(){
  const current=load(html);
  const baseline=baselineHtml?load(baselineHtml):null;
  const report={release:'R1.33',financialCases:0,printByteCases:0,printerLifecycleCases:0,interactionChecks:[],liveBrowser:false,physicalPrinter:false};
  const prices={stellest:{rock:1300,prevencia:1400},stellest2:{rock:1700,prevencia:1800}};
  for(const product of Object.keys(prices))for(const coating of Object.keys(prices[product]))
  for(const frame of [null,0,250,9999])for(const frameComplimentary of [false,true])
  for(const one of [false,true])for(const two of [false,true])for(const complimentary of [false,true]){
    const values={product,coating,frame,frameComplimentary,followups:{one,two},complimentary,screen:'summary'};
    Object.assign(current.state,values);
    const expected=prices[product][coating]+(frameComplimentary?0:(frame || 0))+(complimentary?0:(Number(one)+Number(two))*120);
    assert.equal(current.grandTotal(),expected);
    const summary=current.summaryHtml();
    assert.ok(summary.includes(current.currentProduct().name));
    assert.ok(summary.includes(current.money(expected)));
    if(product==='stellest2'){
      assert.ok(summary.includes('1,190 lenslets'));
      assert.ok(!summary.includes('Lenslet count pending source confirmation'));
    }
    if(frame!==null && frameComplimentary)assert.ok(summary.includes('<s>'+current.money(frame)+'</s>'));
    if(complimentary && (one || two))assert.ok(summary.includes('<s>RM120</s>'));
    if(baseline){Object.assign(baseline.state,values);assert.equal(current.grandTotal(),baseline.grandTotal());}
    report.financialCases++;
  }

  current.goHome();
  for(const product of Object.keys(prices))for(const coating of Object.keys(prices[product])){
    current.selectBundle(product,coating);
    assert.equal(current.state.product,product);
    assert.equal(current.state.coating,coating);
    const catalogue=current.compareHtml();
    for(const p of Object.values(current.PRODUCTS)){
      for(const value of [p.name,p.lenslets,p.design,p.efficacy,p.studyContext,p.study])assert.ok(catalogue.includes(value),value);
    }
    assert.equal((catalogue.match(/aria-pressed="true"/g)||[]).length,1);
    assert.ok(catalogue.includes('+169 versus STELLEST'));
    assert.ok(catalogue.includes('Wider diameter supports broader frame choice.'));
    assert.ok(catalogue.includes('6 months · Complimentary replacement'));
    assert.ok(catalogue.includes('If prescription power becomes at least 0.75 D more short-sighted within 6 months.'));
    assert.ok(!catalogue.includes('spec-uncertainty'));
    assert.ok(!catalogue.includes('mechanism-number'));
    assert.ok(!catalogue.includes('Individual results vary'));
    assert.ok(!catalogue.includes('sticky-total'),'the summary dock is outside the scrollable content');
    assert.ok(!current.document.getElementById('consultationDock').hidden);
    assert.ok(current.document.getElementById('consultationDock').innerHTML.includes(current.currentProduct().name));
    current.document.activeElement=current.document.getElementById('coating-'+product+'-'+coating);
    current.selectBundle(product,coating);
    assert.equal(current.document.activeElement,current.document.getElementById('coating-'+product+'-'+coating));
    current.openSummary();
    assert.ok(current.document.getElementById('consultationDock').hidden);
    current.goHome();
    assert.ok(!current.document.getElementById('consultationDock').hidden);
    assert.equal(current.state.product,product);assert.equal(current.state.coating,coating);
    report.interactionChecks.push(product+'/'+coating+': selection, identity, terms, focus and edit return');

    if(baseline){
      const values={product,coating,frame:250,frameComplimentary:product==='stellest2',followups:{one:true,two:true},complimentary:coating==='prevencia'};
      Object.assign(current.state,values);Object.assign(baseline.state,values);
      for(const type of ['quotation','warranty','booklet','extension']){
        assert.equal(hash(current.buildLabelTSPL(type)),hash(baseline.buildLabelTSPL(type)));
        report.printByteCases++;
      }
    }
  }

  current.state.compareOpen=true;
  const saved=JSON.stringify([current.state.product,current.state.coating,current.grandTotal()]);
  current.toggleLensComparison();
  assert.ok(current.compareHtml().includes('id="lensComparison" hidden'));
  assert.ok(!current.compareHtml().includes('<table'));
  current.toggleLensComparison();
  assert.ok(current.compareHtml().includes('<table'));
  assert.equal(JSON.stringify([current.state.product,current.state.coating,current.grandTotal()]),saved);
  report.interactionChecks.push('Comparison show/hide preserves selection and total');

  for(const render of [current.homeHtml(),current.productCard(current.PRODUCTS.stellest2),current.configureHtml(),current.summaryHtml()]){
    assert.ok(!render.includes('spec-uncertainty'));
    assert.ok(!render.includes('mechanism-number'));
    assert.ok(!render.includes('Individual results vary'));
  }
  assert.ok(!html.includes('<p class="disclaimer">'));
  assert.ok(html.includes('Source status is recorded here for optometrist reference.'));
  report.interactionChecks.push('Customer warning badges, generic disclaimers and decorative numbering removed; source notes and product numbers retained');

  const viewport=current.document.getElementById('catalogueViewport');
  viewport.offsetWidth=1024;viewport.clientWidth=1009;
  current.syncCatalogueLayout();
  assert.equal(current.document.getElementById('consultationDock').style['--catalogue-gutter'],'15px');
  viewport.offsetWidth=768;viewport.clientWidth=768;
  current.syncCatalogueLayout();
  assert.equal(current.document.getElementById('consultationDock').style['--catalogue-gutter'],'0px');
  viewport.scrollTop=700;current.openSummary();assert.equal(viewport.scrollTop,0);
  viewport.scrollTop=250;current.goHome();assert.equal(viewport.scrollTop,0);
  report.interactionChecks.push('Dedicated footer visibility, measured scrollbar gutter and viewport reset on navigation');

  const originalQuery=current.document.querySelectorAll;
  let stacked=false;
  function row(key,height){return {dataset:{align:key},style:{},getBoundingClientRect(){return {height:Math.max(height,parseFloat(this.style.minHeight)||0)}}};}
  const alignedRows=[row('title',30),row('copy',70),row('title',50),row('copy',40)];
  const fakeGrid={querySelectorAll(){return alignedRows},children:[{getBoundingClientRect(){return {top:0}}},{getBoundingClientRect(){return {top:stacked?400:0}}}]};
  current.window.CSS.supports=()=>false;
  current.document.querySelectorAll=()=>[fakeGrid];
  current.syncCatalogueLayout();
  assert.equal(alignedRows[0].style.minHeight,'50px');assert.equal(alignedRows[2].style.minHeight,'50px');
  assert.equal(alignedRows[1].style.minHeight,'70px');assert.equal(alignedRows[3].style.minHeight,'70px');
  stacked=true;current.syncCatalogueLayout();assert.ok(alignedRows.every(row=>row.style.minHeight===''));
  current.window.CSS.supports=()=>true;
  current.document.querySelectorAll=originalQuery;
  report.interactionChecks.push('Alignment fallback measures corresponding rows and clears imposed heights when cards stack');

  current.openSummary();current.state.frame=250;current.state.frameComplimentary=false;current.render();
  current.document.getElementById('frameRow').listeners.pointerdown();current.runHold();
  assert.equal(current.state.frameComplimentary,true);
  current.document.getElementById('frameRow').listeners.pointerdown();current.runHold();
  assert.equal(current.state.frameComplimentary,false);assert.equal(current.state.frame,250);
  current.state.complimentary=false;
  current.document.getElementById('bioTitle').listeners.pointerdown({type:'pointerdown'});current.runHold();
  assert.equal(current.state.complimentary,true);assert.equal(current.followupTotal(),0);
  current.toggleComplimentary();assert.equal(current.followupTotal(),240);
  current.toggleFollowup('two');assert.equal(current.followupTotal(),120);
  current.clearFrame();assert.equal(current.state.frame,null);assert.equal(current.state.frameComplimentary,false);
  current.openFramePad();current.frameKey('3');current.frameKey('5');current.frameKey('0');current.confirmFrame();
  assert.equal(current.state.frame,350);
  current.openInfo();assert.ok(current.document.getElementById('infoOverlay').classList.contains('open'));
  current.closeOverlay('infoOverlay');assert.ok(!current.document.getElementById('infoOverlay').classList.contains('open'));
  report.interactionChecks.push('850 ms frame/follow-up holds restore original amounts; individual follow-up toggles; frame keypad/removal; info open/close');

  const sent=[];let connections=0,disconnections=0;
  const characteristic={properties:{writeWithoutResponse:true},async writeValueWithoutResponse(bytes){assert.ok(bytes.length<=20);sent.push(Buffer.from(bytes))}};
  const gatt={connected:false,async connect(){connections++;this.connected=true;return this},async getPrimaryService(){return {async getCharacteristic(uuid){return uuid===current.D520_NOTIFY_UUID?{async startNotifications(){}}:characteristic}}},disconnect(){this.connected=false;disconnections++}};
  current.navigator.bluetooth={async requestDevice(){return {gatt}}};
  current.sleep=async()=>{};
  for(const type of ['quotation','warranty','booklet','extension']){
    sent.length=0;
    await current.printToD520(type);
    assert.equal(current.document.getElementById('printStatus').dataset.state,'success');
    assert.equal(Buffer.concat(sent).toString('latin1'),current.buildLabelTSPL(type));
    assert.equal(gatt.connected,false);
    assert.ok(current.document.querySelectorAll().every(button=>button.disabled===false));
    report.printerLifecycleCases++;
  }
  assert.equal(connections,4);assert.equal(disconnections,4);
  characteristic.writeValueWithoutResponse=async()=>{throw new Error('simulated write failure')};
  await current.printToD520('quotation');
  assert.equal(current.document.getElementById('printStatus').dataset.state,'error');
  assert.equal(gatt.connected,false);
  assert.ok(current.document.querySelectorAll().every(button=>button.disabled===false));
  report.printerLifecycleCases++;
  delete current.navigator.bluetooth;
  await current.printToD520('quotation');
  assert.equal(current.document.getElementById('printStatus').dataset.state,'error');
  assert.ok(current.document.querySelectorAll().every(button=>button.disabled===false));
  report.printerLifecycleCases++;

  const printerSection=source=>source.slice(source.indexOf('    function quotationLabelHtml(){'));
  report.printerSourceSha256=hash(printerSection(html));
  if(baselineHtml){assert.equal(printerSection(html),printerSection(baselineHtml));assert.deepEqual(JSON.parse(JSON.stringify(current.PRODUCTS)),JSON.parse(JSON.stringify(baseline.PRODUCTS)));}
  const markup=current.compareHtml();
  fs.writeFileSync(path.join(__dirname,'rendered-catalogue.html'),markup);
  fs.writeFileSync(path.join(__dirname,'verification.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1});
