'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createHub,loadNative}=require('./harness.cjs'),D=require('../catalogue-data.js');
const errorText='BluetoothRemoteGATTCharacteristic.writeValue(any) needs an ArrayBuffer or View';
function choose(h,brand){
 const option=brand==='hoya'?D.options.find(o=>o.brand===brand&&/chameleon/.test(o.id)&&/spark/.test(o.id)):D.options.find(o=>o.brand===brand);
 h.app.useLens(option.id);h.flush();return h.children[brand];
}
function strictProvider(child,owner,legacy){
 const packets=[],sleeps=[],types=[];let requests=0,connected=false,activated=false,disconnected=0,lastPromise;
 const characteristic={properties:{writeWithoutResponse:!legacy}};
 const method=legacy?'writeValue':'writeValueWithoutResponse';
 characteristic[method]=function(value){
  assert.equal(this,characteristic,'Call the original characteristic with its native receiver');
  // Model a native/polyfill gate bound to its own window's constructors. The
  // constructors here are genuinely different VM realms, unlike earlier QA.
  if(!(value instanceof owner.ArrayBuffer)&&!(value instanceof owner.Uint8Array))throw new TypeError(errorText);
  assert.equal(activated,true,'Keep notification activation before sending');
  const view=value instanceof owner.ArrayBuffer?new owner.Uint8Array(value):new owner.Uint8Array(value.buffer,value.byteOffset,value.byteLength);
  packets.push(Buffer.from(view));types.push(value instanceof owner.ArrayBuffer?'buffer':'view');
  lastPromise=Promise.resolve();return lastPromise;
 };
 const notify={async startNotifications(){activated=true}};
 const service={async getCharacteristic(uuid){return uuid===child.D520_NOTIFY_UUID?notify:characteristic}};
 const gatt={get connected(){return connected},async connect(){connected=true;return this},async getPrimaryService(){return service},disconnect(){connected=false;disconnected++}};
 const provider={async requestDevice(){requests++;return {name:'D520BT-Z',gatt}}};
 child.sleep=async ms=>{sleeps.push(ms)};
 return {provider,characteristic,packets,sleeps,types,get requests(){return requests},get disconnected(){return disconnected},get lastPromise(){return lastPromise}};
}
function status(child){return child.document.querySelector('#printStatus .print-status-text').textContent}
function enabled(child){for(const button of child.document.querySelectorAll('#printOverlay .print-action-button'))assert.equal(button.disabled,false)}
async function main(){
 const report={status:'passed',genuinelySeparateBufferRealms:true,r24ErrorReproduced:0,successfulCrossWindowLabels:0,legacyWriteLabels:0,withoutResponseLabels:0,offsetAndViewCases:0,unchangedDesktopCases:0,unchangedStandaloneCases:0,liveBrowser:false,physicalPrinter:false};
 const old=createHub({bridgeFile:path.join(__dirname,'fixtures/r24-bridge.js')});old.flush();
 for(const brand of ['stellest','hoya','zeiss']){
  const child=choose(old,brand);child.navigator.userAgent='Bluefy';
  assert.notEqual(child.Uint8Array,old.host.Uint8Array);assert.notEqual(child.ArrayBuffer,old.host.ArrayBuffer);
  assert.equal(new child.Uint8Array(1) instanceof old.host.Uint8Array,false);
  const f=strictProvider(child,old.host,true);old.host.navigator.bluetooth=f.provider;
  child.navigator.bluetooth={requestDevice(){throw new Error('Use the existing main-page picker path')}};
  await child.printToD520('quotation');old.flush();
  assert.equal(status(child),'Print failed: '+errorText);assert.equal(f.packets.length,0);assert.equal(f.disconnected,1);enabled(child);assert.equal(old.app.state.printing,null);report.r24ErrorReproduced++;
 }
 const h=createHub();h.flush();
 for(const brand of ['stellest','hoya','zeiss']){
  const child=choose(h,brand);child.navigator.userAgent='Bluefy';
  child.navigator.bluetooth={requestDevice(){throw new Error('Use the main-page Bluetooth provider')}};
  for(const legacy of [true,false]){
   child.labelPrinterDevice=null;const f=strictProvider(child,h.host,legacy);h.host.navigator.bluetooth=f.provider;
   for(const kind of ['quotation','warranty','booklet','extension']){
    const start=f.packets.length,delayStart=f.sleeps.length;
    await child.printToD520(kind);h.flush();
    const packets=f.packets.slice(start),expected=Buffer.from(child.buildLabelTSPL(kind),'latin1');
    assert.deepEqual(Buffer.concat(packets),expected,'Preserve the complete label bytes, including zero and high-bit bitmap bytes');
    assert.equal(packets.length,Math.ceil(expected.length/20));
    packets.forEach((packet,i)=>assert.equal(packet.length,Math.min(20,expected.length-i*20)));
    assert.ok(f.types.every(t=>t==='buffer'),'Only provider-owned ArrayBuffers cross the native write boundary');
    assert.deepEqual(f.sleeps.slice(delayStart),[...packets.map(()=>35),1000],'Original write pacing and final wait stay intact');
    assert.equal(f.requests,1,'Reuse the chosen device for subsequent labels');assert.equal(status(child),'Label sent to printer.');enabled(child);assert.equal(h.app.state.printing,null);
    report.successfulCrossWindowLabels++;if(legacy)report.legacyWriteLabels++;else report.withoutResponseLabels++;
   }
  }
  child.labelPrinterDevice=null;const vectors=strictProvider(child,h.host,true);h.host.navigator.bluetooth=vectors.provider;
  const channel=await child.printerChannels(),source=new child.Uint8Array([99,0,255,128,10,13,66]);
  const cases=[
   [source.subarray(1,6),[0,255,128,10,13]],
   [new child.DataView(source.buffer,2,3),[255,128,10]],
   [new child.Uint8Array([0,127,128,255]).buffer,[0,127,128,255]],
   [new child.Uint8Array(0),[]]
  ];
  for(const [view,expected]of cases){
   const promise=channel.writeValue(view);assert.equal(promise,vectors.lastPromise,'No extra await, delay or write promise');await promise;
   assert.deepEqual(vectors.packets.at(-1),Buffer.from(expected));report.offsetAndViewCases++;
  }
  child.labelPrinterDevice.gatt.disconnect();child.labelPrinterDevice=null;

  child.navigator.userAgent='Mozilla/5.0 (Macintosh) Chrome';child.navigator.maxTouchPoints=0;
  const desktop=strictProvider(child,child,true);child.navigator.bluetooth=desktop.provider;
  const direct=await child.printerChannels();assert.equal(direct,desktop.characteristic,'Same-window desktop characteristic remains native');
  await child.printToD520('quotation');h.flush();assert.ok(desktop.types.every(t=>t==='view'));enabled(child);report.unchangedDesktopCases++;

  const standalone=loadNative(brand,null,null,[],true);standalone.navigator.userAgent='Bluefy';
  const own=strictProvider(standalone,standalone,true);standalone.navigator.bluetooth=own.provider;
  await standalone.printToD520('quotation');assert.ok(own.types.every(t=>t==='view'));enabled(standalone);report.unchangedStandaloneCases++;
 }
 fs.writeFileSync(path.join(__dirname,'bluefy-buffer-owner-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1});
