'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createHub,loadNative}=require('./harness.cjs'),D=require('../catalogue-data.js');
const kinds={quotation:'printQuotationButton',warranty:'printWarrantyButton',booklet:'printBookletButton',extension:'printBiometryExtensionButton'};
const deferred=()=>{let resolve;const promise=new Promise(a=>{resolve=a});return {promise,resolve}};
async function drain(){for(let i=0;i<50;i++)await Promise.resolve()}
function button(child,kind='quotation'){return child.document.getElementById(kinds[kind])}
function makeProvider(child,holdStage){
 let connected=false,requests=0,activation=false,disconnects=0;const sent=[],trace=[],hold=deferred();
 const write={properties:{writeWithoutResponse:true},async writeValueWithoutResponse(bytes){assert.equal(this,write);assert.equal(activation,true);sent.push(Buffer.from(bytes));trace.push('write')}};
 const notify={startNotifications(){trace.push('notify');activation=true;return holdStage==='activation'?hold.promise:Promise.resolve()}};
 const service={getCharacteristic(uuid){trace.push(uuid);return Promise.resolve(uuid===child.D520_NOTIFY_UUID?notify:write)}};
 const gatt={get connected(){return connected},connect(){trace.push('connect');if(holdStage==='connect')return hold.promise;connected=true;return Promise.resolve(gatt)},
  getPrimaryService(uuid){trace.push(uuid);return holdStage==='service'?hold.promise:Promise.resolve(service)},disconnect(){disconnects++;connected=false}};
 const device={name:'D520BT-Z',gatt};
 const provider={requestDevice(options){assert.equal(this,provider);requests++;trace.push('choose');assert.equal(options.optionalServices[0],child.D520_SERVICE_UUID);return holdStage==='chooser'?hold.promise:Promise.resolve(device)}};
 return {provider,hold,device,gatt,service,trace,sent,get requests(){return requests},get disconnects(){return disconnects}};
}
async function main(){
 const report={status:'passed',topLevelBluefyLabels:0,desktopIpadCases:0,desktopLocalCases:0,standaloneBluefyCases:0,inaccessibleParentCases:0,visibleSetupStages:0,timeoutRecoveryCases:0,liveBrowser:false,physicalPrinter:false};
 const h=createHub();h.flush();
 for(const brand of ['stellest','hoya','zeiss']){
  h.app.useLens(D.options.find(o=>o.brand===brand).id);h.flush();const child=h.children[brand];child.sleep=async()=>{};
  child.navigator.userAgent='Mozilla/5.0 (iPad) Bluefy';
  child.navigator.bluetooth={requestDevice(){throw new Error('Child-frame Bluefy bridge must not be used')}};
  for(const kind of Object.keys(kinds)){
   child.labelPrinterDevice=null;const f=makeProvider(child);h.host.navigator.bluetooth=f.provider;
   const pending=child.printToD520(kind);assert.equal(f.requests,1,'Chooser remains in the original click stack');await pending;h.flush();
   assert.deepEqual(Buffer.concat(f.sent),Buffer.from(child.buildLabelTSPL(kind),'latin1'));
   assert.deepEqual(f.trace.slice(0,5),['choose','connect',child.D520_SERVICE_UUID,child.D520_WRITE_UUID,child.D520_NOTIFY_UUID]);
   assert.ok(f.trace.indexOf('notify')<f.trace.indexOf('write'));assert.equal(f.disconnects,1);assert.equal(h.app.state.printing,null);report.topLevelBluefyLabels++;
  }
  child.navigator.userAgent='Mozilla/5.0 (Macintosh)';child.navigator.platform='MacIntel';child.navigator.maxTouchPoints=5;
  child.labelPrinterDevice=null;const ipad=makeProvider(child);h.host.navigator.bluetooth=ipad.provider;
  await child.printToD520('quotation');h.flush();assert.equal(ipad.requests,1);report.desktopIpadCases++;
  child.navigator.maxTouchPoints=0;child.labelPrinterDevice=null;const desktop=makeProvider(child);child.navigator.bluetooth=desktop.provider;
  h.host.navigator.bluetooth={requestDevice(){throw new Error('Desktop printing must retain its existing provider')}};
  await child.printToD520('quotation');h.flush();assert.equal(desktop.requests,1);report.desktopLocalCases++;

  child.navigator.userAgent='Bluefy';child.labelPrinterDevice=null;
  const own=makeProvider(child);child.navigator.bluetooth=own.provider;const top=child.top;
  Object.defineProperty(child,'top',{configurable:true,get(){throw new Error('Cross-origin window access')}});
  await child.printToD520('quotation');h.flush();assert.equal(own.requests,1);report.inaccessibleParentCases++;
  Object.defineProperty(child,'top',{configurable:true,writable:true,value:top});

  for(const [stage,title,timeout]of [['chooser','Choose printer…',null],['connect','Connecting…',20000],['service','Preparing printer…',10000],['activation','Activating printer…',8000]]){
   child.labelPrinterDevice=null;const f=makeProvider(child,stage);h.host.navigator.bluetooth=f.provider;
   const pending=child.printToD520('quotation');await drain();h.flush();
   assert.equal(button(child).textContent,title);assert.equal(child.document.getElementById('printStatus').hidden,true);
   assert.equal(button(child).querySelector('.print-button-fill').style.width,'0%','No invented transfer progress during setup');
   assert.equal(child.document.getElementById('printButtonProgress').hasAttribute('aria-valuenow'),false);report.visibleSetupStages++;
   if(timeout){
    child.flushTimers(timeout);await pending;h.flush();assert.equal(h.app.state.printing,null);assert.equal(child.document.getElementById('printStatus').hidden,false);
    assert.equal(button(child).textContent,'Print Label');for(const id of Object.values(kinds))assert.equal(child.document.getElementById(id).disabled,false);
    assert.equal(f.sent.length,0);report.timeoutRecoveryCases++;
   }else{f.hold.resolve(f.device);await pending;h.flush();assert.equal(button(child).textContent,'Print Label')}
  }
  const standalone=loadNative(brand,null,null,[],true);standalone.navigator.userAgent='Bluefy';standalone.sleep=async()=>{};
  const single=makeProvider(standalone);standalone.navigator.bluetooth=single.provider;await standalone.printToD520('quotation');assert.equal(single.requests,1);report.standaloneBluefyCases++;
 }
 fs.writeFileSync(path.join(__dirname,'bluefy-handoff-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1});
