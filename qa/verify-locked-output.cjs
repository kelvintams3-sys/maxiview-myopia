'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {createHub}=require('./harness.cjs'),D=require('../catalogue-data.js');
const baseline=require('./locked-label-baseline.json'),h=createHub();h.flush();
const digest=text=>crypto.createHash('sha256').update(Buffer.from(text,'latin1')).digest('hex');
let labels=0,handoffs=0;
for(const item of baseline.cases){
 h.app.state.shared=JSON.parse(JSON.stringify(item.shared));
 h.app.useLens(item.option);h.flush();
 const option=D.getOption(item.option),child=h.children[option.brand];
 assert.equal(child.grandTotal(),item.total,item.option+' total');
 assert.equal(D.optionForState(option.brand,child.state).id,item.option);
 for(const [kind,expected] of Object.entries(item.labels)){
  assert.equal(digest(child.buildLabelTSPL(kind)),expected,item.option+' '+kind+' '+JSON.stringify(item.shared));labels++;
 }
 handoffs++;
}
for(const [brand,files] of Object.entries(baseline.protectedFiles))for(const [file,expected] of Object.entries(files)){
 const bytes=fs.readFileSync(path.join(__dirname,'..','catalogues',brand,file));
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),expected,brand+' '+file);
}
const report={status:'passed',baseline:baseline.capturedFrom,financialHandoffs:handoffs,labelByteMatches:labels,options:D.options.length,physicalPrinter:false,liveBrowser:false};
fs.writeFileSync(path.join(__dirname,'locked-output-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
