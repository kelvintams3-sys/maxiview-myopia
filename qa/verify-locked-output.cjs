'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {createHub,loadNative}=require('./harness.cjs'),D=require('../catalogue-data.js'),vm=require('node:vm');
const {restoreFrozenPrinter}=require('../catalogues/zeiss/qa/authorized-print-logo.cjs');
const {verifyLogoOnlyDelta}=require('./print-raster.cjs');
const baseline=require('./locked-label-baseline.json'),h=createHub();h.flush();
const digest=text=>crypto.createHash('sha256').update(Buffer.from(text,'latin1')).digest('hex');
const zeissSource=fs.readFileSync(path.join(__dirname,'..','catalogues/zeiss/printer.js'),'utf8');
const frozenZeiss=restoreFrozenPrinter(zeissSource,baseline.protectedFiles.zeiss['printer.js']);
const originalZeiss=loadNative('zeiss',null,null,[],false);
vm.runInContext(frozenZeiss,originalZeiss,{filename:'frozen-zeiss-printer.js'});
let labels=0,handoffs=0,logoChanges=0;
for(const item of baseline.cases){
 h.app.state.shared=JSON.parse(JSON.stringify(item.shared));
 h.app.useLens(item.option);h.flush();
 const option=D.getOption(item.option),child=h.children[option.brand];
 assert.equal(child.grandTotal(),item.total,item.option+' total');
 assert.equal(D.optionForState(option.brand,child.state).id,item.option);
 for(const [kind,expected] of Object.entries(item.labels)){
  const commands=child.buildLabelTSPL(kind);
  if(option.brand==='zeiss'){
   Object.assign(originalZeiss.state,JSON.parse(JSON.stringify(item.shared)),D.selectionForOption(item.option));
   const oldCommands=originalZeiss.buildLabelTSPL(kind);
   assert.equal(digest(oldCommands),expected,'Frozen ZEISS output must still match the original captured baseline');
   verifyLogoOnlyDelta(oldCommands,commands);logoChanges++;
  }else{assert.equal(digest(commands),expected,item.option+' '+kind+' '+JSON.stringify(item.shared));labels++;}
 }
 handoffs++;
}
for(const [brand,files] of Object.entries(baseline.protectedFiles))for(const [file,expected] of Object.entries(files)){
 const bytes=fs.readFileSync(path.join(__dirname,'..','catalogues',brand,file));
 const frozen=brand==='zeiss'&&file==='printer.js'?Buffer.from(restoreFrozenPrinter(bytes.toString('utf8'),expected)):bytes;
 assert.equal(crypto.createHash('sha256').update(frozen).digest('hex'),expected,brand+' '+file);
}
const report={status:'passed',baseline:baseline.capturedFrom,originalBaselineUnchanged:true,financialHandoffs:handoffs,unchangedLabelByteMatches:labels,authorizedZeissLogoOnlyChanges:logoChanges,options:D.options.length,physicalPrinter:false,liveBrowser:false};
fs.writeFileSync(path.join(__dirname,'locked-output-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
