'use strict';
// Compare the complete successful BLE sequence with and without the bridge.
// Native transport source retains the R1.15 baseline; artwork changes are
// separately authorized and normalized to the original complete source hash.
const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
const {loadNative}=require('./harness.cjs');
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function device(child,legacy=false,rejectNotifications=false){
  const trace=[];let connected=false;
  const channel={properties:{writeWithoutResponse:!legacy}};
  const method=legacy?'writeValue':'writeValueWithoutResponse';
  channel[method]=async function(bytes){assert.equal(this,channel,'call the actual native characteristic');trace.push([method,bytes.length,digest(Buffer.from(bytes))])};
  const notify={async startNotifications(){trace.push(['startNotifications']);if(rejectNotifications)throw new Error('Not supported')}};
  const service={async getCharacteristic(uuid){trace.push(['getCharacteristic',uuid]);return uuid===child.D520_NOTIFY_UUID?notify:channel}};
  const gatt={get connected(){return connected},async connect(){trace.push(['connect']);connected=true;return this},async getPrimaryService(uuid){trace.push(['getPrimaryService',uuid]);return service},disconnect(){trace.push(['disconnect']);connected=false}};
  child.navigator.bluetooth={async requestDevice(options){trace.push(['requestDevice',JSON.parse(JSON.stringify(options))]);return {name:'D520BT-Z',gatt}}};
  child.sleep=async function(ms){trace.push(['sleep',ms])};
  return trace;
}
async function main(){
  const report={status:'passed',brands:3,labelSequences:0,legacyWriteSequences:0,rejectedNotificationSequences:0,compares:'Native printer transport with explicitly authorized artwork; original manifests and complete source normalization retained',liveBrowser:false,physicalPrinter:false};
  for(const brand of ['stellest','hoya','zeiss']){
    for(const [legacy,reject]of [[false,false],[true,false],[false,true]]){
      const baseline=loadNative(brand,null,null,[],false),current=loadNative(brand,null,null,[],true);
      const original=device(baseline,legacy,reject),guarded=device(current,legacy,reject);
      for(const kind of ['quotation','warranty','booklet','extension']){
        const start=original.length;await baseline.printToD520(kind);await current.printToD520(kind);
        assert.deepEqual(guarded,original,brand+' '+kind+' entire API/byte/pacing/disconnect sequence');
        const run=guarded.slice(start),firstWrite=run.findIndex(x=>x[0].startsWith('writeValue')),activation=run.findIndex(x=>x[0]==='startNotifications');
        assert.ok(activation>=0&&firstWrite>activation,'notification activation precedes writing');
        assert.equal(current.timers.size,0);
        report.labelSequences++;if(legacy)report.legacyWriteSequences++;if(reject)report.rejectedNotificationSequences++;
      }
    }
  }
  fs.writeFileSync(path.join(__dirname,'r15-ble-sequence-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1});
