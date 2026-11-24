'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {createHub,loadNative}=require('./harness.cjs');
const D=require('../catalogue-data.js');
const hash=s=>crypto.createHash('sha256').update(Buffer.from(s,'latin1')).digest('hex');
function plain(value){return JSON.parse(JSON.stringify(value));}
function comparisonText(host){return host.document.getElementById('comparisonBody').textContent;}
async function main(){
  const h=createHub();h.flush();const {host,children,app}=h;
  const report={status:'passed',options:15,handoffs:0,labelByteCases:0,sharedStateCases:0,liveBrowser:false,physicalPrinter:false};
  assert.equal(app.state.active,'zeiss');assert.equal(Object.keys(children).length,1);
  app.showTab('compare');assert.equal(host.document.querySelectorAll('.choice-card').length,0);assert.equal(host.document.querySelectorAll('#comparisonBody select').length,0);app.showTab('stellest');
  app.showTab('hoya');h.flush();app.showTab('zeiss');h.flush();assert.equal(Object.keys(children).length,3);
  const originals={};for(const brand of ['stellest','hoya','zeiss'])originals[brand]=loadNative(brand,null,null,[],false);
  const shared=D.normalizeShared({frame:200,followups:{one:true,two:true},complimentary:false,frameComplimentary:false});
  app.state.shared=shared;
  for(const option of D.options){
    app.useLens(option.id);h.flush();const child=children[option.brand],expected=D.total(option,shared);
    assert.equal(child.state.screen,'summary');assert.equal(child.grandTotal(),expected.grand);
    assert.equal(D.optionForState(option.brand,child.state).id,option.id);
    assert.equal(child.state.frame,200);assert.equal(child.followupTotal?child.followupTotal():child.DATA.totals(child.state).followups,240);
    assert.ok(child.document.getElementById('app').innerHTML.includes(child.money(expected.grand)));
    assert.equal(app.state.byBrand[option.brand],option.id);
    assert.equal(app.state.comparison[D.brands.findIndex(b=>b.id===option.brand)],option.id);
    const base=originals[option.brand],selection=D.selectionForOption(option.id);
    Object.assign(base.state,plain(shared),selection);
    if(option.brand==='hoya')base.familyBuilds[selection.product]=Object.assign({},selection);
    for(const kind of ['quotation','warranty','booklet','extension']){
      assert.equal(hash(child.buildLabelTSPL(kind)),hash(base.buildLabelTSPL(kind)),option.id+' '+kind);report.labelByteCases++;
    }
    report.handoffs++;
  }
  const rock=D.getOption('essilor-stellest-rock');
  const hoyaOriginal=D.options.find(o=>o.brand==='hoya'&&o.productKey==='miyosmart'&&o.styleId==='clear'&&o.coatingId==='stx');
  app.state.shared=plain(shared);app.choose(0,rock.id);app.choose(1,hoyaOriginal.id);app.choose(2,D.defaults[2]);h.flush();app.showTab('compare');h.flush();
  const text=comparisonText(host);
  assert.ok(text.includes('RM1,500'),'Compare shows lens1300+frame200');
  assert.ok(!text.includes('RM1,740'),'Compare excludes the two RM120 follow-ups');
  assert.doesNotMatch(text,/follow[- ]?ups?|biometry|RM240/i);
  assert.match(text,/Sphere/i);assert.match(text,/0\.75 D/);
  assert.equal(host.document.querySelectorAll('.choice-card').length,0);
  app.useLens(rock.id);h.flush();assert.equal(children.stellest.grandTotal(),1740);
  assert.ok(children.stellest.document.getElementById('app').innerHTML.includes('0.75 D'));
  report.comparePricingExcludesFollowups='passed';
  const before=Object.fromEntries(Object.keys(children).map(brand=>[brand,D.optionForState(brand,children[brand].state).id]));
  const compared=app.state.comparison.slice(),source=children.stellest;
  source.state.frame=350;source.state.followups={one:false,two:true};source.state.complimentary=false;source.state.frameComplimentary=false;source.render();h.flush();
  for(const brand of Object.keys(children)){
    assert.equal(children[brand].state.frame,350);assert.equal(children[brand].state.followups.one,false);assert.equal(children[brand].state.followups.two,true);
    assert.equal(D.optionForState(brand,children[brand].state).id,before[brand]);report.sharedStateCases++;
  }
  assert.deepEqual(app.state.comparison,compared);
  source.document.getElementById('catalogueViewport').scrollTop=420;source.dispatch('scroll',{});
  app.showTab('hoya');h.flush();app.showTab('stellest');h.flush();assert.equal(source.document.getElementById('catalogueViewport').scrollTop,420);
  app.showTab('hoya');h.flush();children.hoya.scrollY=245;children.hoya.dispatch('scroll',{});
  app.showTab('zeiss');h.flush();app.showTab('hoya');h.flush();assert.equal(children.hoya.scrollY,245);
  report.nativeReadingPosition='passed';
  app.showTab('compare');
  const retainedFollowups=plain({followups:app.state.shared.followups,complimentary:app.state.shared.complimentary});
  app.openFrame();
  host.document.getElementById('frameAmount').value='-10';host.document.getElementById('saveFrame').emit('click');assert.equal(app.state.shared.frame,350);
  host.document.getElementById('frameAmount').value='200';host.document.getElementById('saveFrame').emit('click');h.flush();assert.equal(app.state.shared.frame,200);
  assert.deepEqual(plain({followups:app.state.shared.followups,complimentary:app.state.shared.complimentary}),retainedFollowups);
  app.openFrame();host.document.getElementById('frameComplimentary').emit('click');host.document.getElementById('saveFrame').emit('click');h.flush();
  assert.equal(app.state.shared.frameComplimentary,true);
  assert.deepEqual(plain({followups:app.state.shared.followups,complimentary:app.state.shared.complimentary}),retainedFollowups);
  const comparisonWithPaid=comparisonText(host);
  children.hoya.state.complimentary=true;children.hoya.state.followups={one:true,two:true};children.hoya.render();h.flush();
  for(const brand of Object.keys(children)){assert.equal(children[brand].state.complimentary,true);report.sharedStateCases++;}
  assert.equal(comparisonText(host),comparisonWithPaid,'Changing follow-up charges must not change Compare');
  assert.deepEqual(app.state.comparison,compared);
  report.frameOnlyEditingPreservesFollowups='passed';
  const copy=JSON.stringify(app.state.shared);
  app.receive({source:{},data:{channel:'MAXIVIEW_MYOPIA_V1',brand:'stellest',type:'state',reason:'user',state:{frame:99999}}});
  assert.equal(JSON.stringify(app.state.shared),copy);
  source.dispatch('message',{source:{},data:{channel:'MAXIVIEW_MYOPIA_V1',brand:'stellest',type:'apply',shared:{frame:99999}}});assert.equal(source.state.frame,200);
  const lazy=createHub();lazy.app.state.shared=plain(shared);
  lazy.app.useLens(D.defaults[1]);lazy.flush();assert.equal(lazy.children.hoya.state.screen,'summary');assert.equal(lazy.children.hoya.grandTotal(),2140);
  lazy.app.showTab('compare');lazy.flush();assert.ok(comparisonText(lazy.host).includes('RM1,900'));assert.ok(!comparisonText(lazy.host).includes('RM2,140'));
  report.lazyHandoff='passed';
  for(const brand of ['stellest','hoya','zeiss']){
    app.showTab(brand);h.flush();const child=children[brand];let connected=false;const sent=[];
    const gatt={get connected(){return connected},async connect(){connected=true;return this},async getPrimaryService(){return {async getCharacteristic(uuid){return uuid===child.D520_NOTIFY_UUID?{async startNotifications(){}}:{properties:{writeWithoutResponse:true},async writeValueWithoutResponse(bytes){sent.push(Buffer.from(bytes))}}}}},disconnect(){connected=false}};
    child.navigator.bluetooth={async requestDevice(){return {gatt}}};child.sleep=async()=>{};
    const printing=child.printToD520('quotation');h.flush();assert.equal(app.state.printing,brand);
    const active=app.state.active;app.showTab('compare');assert.equal(app.state.active,active);
    await printing;h.flush();assert.equal(app.state.printing,null);assert.equal(connected,false);
    assert.equal(hash(Buffer.concat(sent).toString('latin1')),hash(child.buildLabelTSPL('quotation')));
  }
  report.printLockCases=3;
  host.document.getElementById('tab-stellest').emit('keydown',{key:'End'});assert.equal(app.state.active,'compare');
  assert.equal(host.document.getElementById('tab-compare').hidden,true);host.document.getElementById('compare-title-stellest').emit('click');h.flush();assert.equal(app.state.active,'stellest');
  assert.equal(host.document.querySelectorAll('[aria-current="page"]').length,1);report.keyboardTabCases=2;
  app.state.shared=plain(shared);D.defaults.forEach((id,index)=>app.choose(index,id));h.flush();app.showTab('compare');h.flush();
  fs.writeFileSync(path.join(__dirname,'rendered-comparison.html'),host.document.getElementById('comparisonBody').innerHTML);
  fs.writeFileSync(path.join(__dirname,'integration-verification.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1});
