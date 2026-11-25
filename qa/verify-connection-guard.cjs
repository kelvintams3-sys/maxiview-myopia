'use strict';
// Exercise actual printer/bridge code with deliberately unresolved native BLE
// promises. Fake timers advance deadlines; canvas-generated label bytes are real.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createHub,loadNative}=require('./harness.cjs');
const D=require('../catalogue-data.js');
const brands=['stellest','hoya','zeiss'];
const report={status:'passed',brands:3,successfulLabels:0,stalledSetupStages:0,retryCases:0,notificationRejectionCases:0,nativeCharacteristicCases:0,lateConnectCases:0,chooserCases:0,errorCases:0,standaloneCases:0,liveBrowser:false,physicalPrinter:false};
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}};
async function drain(){for(let n=0;n<40;n++)await Promise.resolve()}
function status(child){return child.document.querySelector('#printStatus .print-status-text').textContent}
function enabled(child){for(const button of child.document.querySelectorAll('#printOverlay .print-action-button'))assert.equal(button.disabled,false)}
function bytes(child,kind){return Buffer.from(child.buildLabelTSPL(kind),'latin1')}
function fixture(child,blocked,legacy=false){
  const wait=deferred(),sent=[];let connected=false,notify=0,chooser=0,connects=0,disconnects=0,writes=0,activated=false;
  const characteristic={properties:{writeWithoutResponse:!legacy}};
  const write=function(chunk){assert.ok(activated||blocked==='notifyReject','restore R1.15 activation before any write');writes++;sent.push(Buffer.from(chunk));return Promise.resolve()};
  characteristic[legacy?'writeValue':'writeValueWithoutResponse']=write;
  const notification={startNotifications(){notify++;if(blocked==='notification')return wait.promise;if(blocked==='notifyReject')return Promise.reject(new Error('Notifications unavailable'));activated=true;return Promise.resolve(notification)}};
  const service={getCharacteristic(uuid){
    if(uuid===child.D520_NOTIFY_UUID){notify++;return blocked==='notifyDiscovery'?wait.promise:Promise.resolve(notification)}
    assert.equal(uuid,child.D520_WRITE_UUID);
    return blocked==='channel'?wait.promise:Promise.resolve(characteristic);
  }};
  const gatt={get connected(){return connected},connect(){connects++;if(blocked==='connect')return wait.promise;connected=true;return Promise.resolve(gatt)},
    getPrimaryService(uuid){assert.equal(uuid,child.D520_SERVICE_UUID);return blocked==='service'?wait.promise:Promise.resolve(service)},
    disconnect(){disconnects++;connected=false}};
  const device={name:'D520BT-Z',gatt};
  child.navigator.bluetooth={requestDevice(options){
    chooser++;assert.deepEqual(JSON.parse(JSON.stringify(options)),{filters:[{namePrefix:'D520'},{namePrefix:'D520BT'},{namePrefix:'D520BT-Z'},{namePrefix:'D'}],optionalServices:[child.D520_SERVICE_UUID]});
    if(blocked==='chooser')return wait.promise;
    if(blocked==='cancel')return Promise.reject(new Error('User cancelled the requestDevice() chooser.'));
    return Promise.resolve(device);
  }};
  child.labelPrinterDevice=null;child.sleep=async()=>{};
  return {wait,sent,device,gatt,characteristic,service,notification,get notify(){return notify},get chooser(){return chooser},get connects(){return connects},get disconnects(){return disconnects},get writes(){return writes},
    lateConnect(){connected=true;wait.resolve(gatt)}};
}
async function main(){
  const h=createHub();h.flush();
  for(const brand of brands){
    h.app.useLens(D.options.find(o=>o.brand===brand).id);h.flush();const child=h.children[brand];
    // All four label kinds use the unchanged bytes, both write API variants,
    // cached devices and already-connected GATT. This fixture requires the
    // R1.15 notification setup before accepting the first write.
    const good=fixture(child,null);
    for(const kind of ['quotation','warranty','booklet','extension']){
      const start=good.sent.length;await child.printToD520(kind);h.flush();
      assert.deepEqual(Buffer.concat(good.sent.slice(start)),bytes(child,kind));
      assert.equal(good.notify,2*good.connects);assert.equal(good.chooser,1);assert.equal(child.timers.size,0);enabled(child);report.successfulLabels++;
    }
    const legacy=fixture(child,null,true);await child.printToD520('quotation');h.flush();assert.deepEqual(Buffer.concat(legacy.sent),bytes(child,'quotation'));report.successfulLabels++;
    const connected=fixture(child,null);await connected.gatt.connect();child.labelPrinterDevice=connected.device;
    await child.printToD520('quotation');h.flush();assert.equal(connected.connects,1);assert.equal(connected.chooser,0);report.successfulLabels++;

    const native=fixture(child,null);assert.equal(await child.printerChannels(),native.characteristic);native.gatt.disconnect();child.labelPrinterDevice=null;report.nativeCharacteristicCases++;
    const optional=fixture(child,'notifyReject');await child.printToD520('quotation');h.flush();assert.deepEqual(Buffer.concat(optional.sent),bytes(child,'quotation'));report.notificationRejectionCases++;

    for(const [stage,delay,expected]of [['connect',20000,/connection timed out/i],['service',10000,/did not finish preparing/i],['channel',8000,/printing channel did not respond/i],['notifyDiscovery',8000,/activation timed out/i],['notification',8000,/activation timed out/i]]){
      const f=fixture(child,stage);let settled=false;
      const pending=child.printToD520('quotation').then(()=>{settled=true});h.flush();
      assert.equal(h.app.state.printing,brand);await drain();assert.equal(settled,false);assert.ok(child.timers.size>0);
      child.flushTimers(delay);await drain();assert.equal(settled,true,brand+' '+stage+' releases print');await pending;h.flush();
      assert.match(status(child),expected);assert.equal(h.app.state.printing,null);assert.equal(child.labelPrinterDevice,null);enabled(child);assert.equal(child.timers.size,0);
      assert.equal(f.sent.length,0);const attemptedWrites=f.writes;
      if(stage==='connect')f.lateConnect();else f.wait.resolve(stage==='service'?f.service:stage==='channel'?f.characteristic:stage==='notifyDiscovery'?f.notification:undefined);
      await drain();assert.equal(f.writes,attemptedWrites,'late stage completion must not send more');assert.equal(f.sent.length,0);report.stalledSetupStages++;
      const retry=fixture(child,null);await child.printToD520('quotation');h.flush();assert.deepEqual(Buffer.concat(retry.sent),bytes(child,'quotation'));assert.equal(retry.chooser,1);report.retryCases++;
    }
    // User time in chooser is unbounded, while duplicate taps stay locked out.
    const choosing=fixture(child,'chooser');let chosenDone=false;
    const choice=child.printToD520('quotation').then(()=>{chosenDone=true});await drain();
    assert.equal(choosing.chooser,1,'chooser starts synchronously');assert.match(status(child),/Choose your/);
    for(const delay of [8000,10000,20000])child.flushTimers(delay);
    await child.printToD520('quotation');await drain();assert.equal(chosenDone,false);assert.equal(choosing.chooser,1);
    choosing.wait.resolve(choosing.device);await choice;h.flush();assert.deepEqual(Buffer.concat(choosing.sent),bytes(child,'quotation'));report.chooserCases++;
    fixture(child,'cancel');await child.printToD520('quotation');h.flush();assert.match(status(child),/cancelled/i);enabled(child);assert.equal(h.app.state.printing,null);report.errorCases++;
    child.navigator.bluetooth=null;await child.printToD520('quotation');h.flush();assert.match(status(child),/Bluefy/);enabled(child);report.errorCases++;
    const rejected=fixture(child,null);rejected.gatt.connect=()=>Promise.reject(new Error('GATT connection failed'));
    await child.printToD520('quotation');h.flush();assert.match(status(child),/GATT connection failed/);assert.equal(child.labelPrinterDevice,null);enabled(child);assert.equal(h.app.state.printing,null);report.errorCases++;

    // An old connect finishing while a retry owns the same device must neither
    // send its abandoned label nor disconnect the new operation.
    const old=fixture(child,'connect');const abandoned=child.printToD520('quotation');await drain();child.flushTimers(20000);await abandoned;h.flush();
    const held=deferred();let retryConnected=true,retryWrites=0,disconnected=0;
    old.gatt.connect=()=>Promise.resolve(old.gatt);
    Object.defineProperty(old.gatt,'connected',{get(){return retryConnected},configurable:true});
    old.gatt.getPrimaryService=()=>held.promise;old.gatt.disconnect=()=>{disconnected++;retryConnected=false};
    const retried=child.printToD520('quotation');await drain();old.wait.resolve(old.gatt);await drain();assert.equal(disconnected,0);
    held.resolve({getCharacteristic(uuid){return Promise.resolve(uuid===child.D520_NOTIFY_UUID?{startNotifications(){return Promise.resolve()}}:{properties:{writeWithoutResponse:true},writeValueWithoutResponse(){retryWrites++;return Promise.resolve()}})}});
    await retried;h.flush();assert.ok(retryWrites>0);assert.equal(disconnected,1);report.lateConnectCases++;

    // Each native page also works directly, outside the parent hub.
    const standalone=loadNative(brand,null,null,[],true);const single=fixture(standalone,null);
    await standalone.printToD520('quotation');assert.deepEqual(Buffer.concat(single.sent),bytes(standalone,'quotation'));report.standaloneCases++;
    const hang=fixture(standalone,'connect');const p=standalone.printToD520('quotation');await drain();standalone.flushTimers(20000);await p;
    assert.match(status(standalone),/connection timed out/i);enabled(standalone);assert.equal(hang.sent.length,0);report.standaloneCases++;
  }
  fs.writeFileSync(path.join(__dirname,'connection-guard-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1});
