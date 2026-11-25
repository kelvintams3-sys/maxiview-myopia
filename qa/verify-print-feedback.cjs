'use strict';
// Run actual native printing to a paused BLE characteristic and inspect the
// screen feedback while a real label transfer is partially complete.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createHub}=require('./harness.cjs');
const D=require('../catalogue-data.js');
const kinds={quotation:'printQuotationButton',warranty:'printWarrantyButton',booklet:'printBookletButton',extension:'printBiometryExtensionButton'};
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}};
async function until(test){for(let n=0;n<10000;n++){if(test())return;await Promise.resolve()}throw new Error('Print did not reach fixture checkpoint')}
function fixture(child,kind){
  const commands=Buffer.from(child.buildLabelTSPL(kind),'latin1'),sent=[],hold=deferred();
  const pauseAt=Math.floor(Math.ceil(commands.length/20)*.4);let writes=0,requested=0,connected=false;
  const characteristic={properties:{writeWithoutResponse:true},writeValueWithoutResponse(chunk){sent.push(Buffer.from(chunk));writes++;return writes===pauseAt?hold.promise:Promise.resolve()}};
  const service={async getCharacteristic(uuid){return uuid===child.D520_NOTIFY_UUID?{async startNotifications(){}}:characteristic}};
  const gatt={get connected(){return connected},async connect(){connected=true;return this},async getPrimaryService(){return service},disconnect(){connected=false}};
  child.labelPrinterDevice=null;child.sleep=async()=>{};
  child.navigator.bluetooth={async requestDevice(){requested++;return {gatt}}};
  return {commands,sent,hold,pauseAt,get writes(){return writes},get requested(){return requested}};
}
async function main(){
  const report={status:'passed',brands:3,activeButtonTransfers:0,duplicateTapCases:0,errorRecoveryCases:0,idleResetCases:0,liveBrowser:false,physicalPrinter:false};
  const h=createHub();h.flush();
  for(const brand of ['stellest','hoya','zeiss']){
    h.app.useLens(D.options.find(o=>o.brand===brand).id);h.flush();const child=h.children[brand],doc=child.document;
    const status=doc.getElementById('printStatus'),progress=doc.getElementById('printButtonProgress');
    assert.equal(doc.getElementById(kinds.quotation).textContent,'Print Label');assert.equal(status.hidden,true);
    for(const [kind,id]of Object.entries(kinds)){
      const f=fixture(child,kind),button=doc.getElementById(id),fill=button.querySelector('.print-button-fill');
      const pending=child.printToD520(kind);await until(()=>f.writes===f.pauseAt);h.flush();
      assert.equal(h.app.state.printing,brand);assert.equal(button.getAttribute('aria-busy'),'true');
      assert.equal(progress.hidden,false);assert.equal(progress.getAttribute('role'),'progressbar');assert.equal(button.getAttribute('aria-describedby'),progress.id);
      const value=Number(progress.getAttribute('aria-valuenow'));assert.ok(value>0&&value<100);assert.equal(fill.style.width,value+'%');
      assert.equal(button.textContent,'Printing label…');
      assert.equal(status.hidden,true);assert.equal(status.style.display,'none');assert.doesNotMatch(status.textContent,/Sending\s+quotation|\d+\s*%/i);
      for(const [other,otherId]of Object.entries(kinds))if(other!==kind)assert.equal(doc.getElementById(otherId).querySelector('.print-button-fill').style.width,'0%');
      await child.printToD520(kind);assert.equal(f.requested,1);assert.equal(f.writes,f.pauseAt);report.duplicateTapCases++;
      f.hold.resolve();await pending;h.flush();
      assert.deepEqual(Buffer.concat(f.sent),f.commands);assert.equal(fill.style.width,'100%');assert.equal(button.getAttribute('aria-busy'),'false');assert.equal(button.disabled,false);
      assert.equal(progress.hidden,true);assert.equal(status.hidden,false);assert.match(status.textContent,/Label sent to printer\./);assert.doesNotMatch(status.textContent,/quotation|%/i);
      assert.equal(h.app.state.printing,null);report.activeButtonTransfers++;
    }
    const failure=fixture(child,'quotation'),button=doc.getElementById(kinds.quotation);
    const failed=child.printToD520('quotation');await until(()=>failure.writes===failure.pauseAt);failure.hold.reject(new Error('Printer disconnected'));
    await failed;h.flush();assert.equal(status.hidden,false);assert.match(status.textContent,/Print failed: Printer disconnected/);assert.equal(button.querySelector('.print-button-fill').style.width,'0%');assert.equal(button.disabled,false);assert.equal(progress.hidden,true);report.errorRecoveryCases++;
    child.setPrintStatus('Ready to connect to D520BT-Z','idle');assert.equal(status.hidden,true);
    for(const id of Object.values(kinds))assert.equal(doc.getElementById(id).querySelector('.print-button-fill').style.width,'0%');report.idleResetCases++;
  }
  fs.writeFileSync(path.join(__dirname,'print-feedback-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1});
