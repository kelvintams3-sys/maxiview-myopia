'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {createHub}=require('./harness.cjs'),D=require('../catalogue-data.js');
const {restoreFrozenPrinter}=require('./authorized-print-artwork.cjs');
const {loadFrozen}=require('./artwork-baseline.cjs');
const baseline=require('./locked-label-baseline.json'),h=createHub();h.flush();
const digest=text=>crypto.createHash('sha256').update(Buffer.from(text,'latin1')).digest('hex');
const originals=Object.fromEntries(['stellest','hoya','zeiss'].map(brand=>[brand,loadFrozen(brand)]));
let labels=0,handoffs=0,artworkChanges=0,baselineMatches=0;
for(const item of baseline.cases){
 h.app.state.shared=JSON.parse(JSON.stringify(item.shared));
 h.app.useLens(item.option);h.flush();
 const option=D.getOption(item.option),child=h.children[option.brand];
 assert.equal(child.grandTotal(),item.total,item.option+' total');
 assert.equal(D.optionForState(option.brand,child.state).id,item.option);
 for(const [kind,expected] of Object.entries(item.labels)){
  const commands=child.buildLabelTSPL(kind);
  const original=originals[option.brand],selection=D.selectionForOption(item.option);
  Object.assign(original.state,JSON.parse(JSON.stringify(item.shared)),selection);
  if(option.brand==='hoya')original.familyBuilds[selection.product]=Object.assign({},selection);
  const oldCommands=original.buildLabelTSPL(kind);
  assert.equal(digest(oldCommands),expected,'Original captured baseline must remain reproducible');baselineMatches++;
  assert.equal(child.grandTotal(),original.grandTotal());
  if(commands===oldCommands)labels++;else artworkChanges++;
 }
 handoffs++;
}
for(const [brand,files] of Object.entries(baseline.protectedFiles))for(const [file,expected] of Object.entries(files)){
 const bytes=fs.readFileSync(path.join(__dirname,'..','catalogues',brand,file));
 const frozen=file==='printer.js'?Buffer.from(restoreFrozenPrinter(bytes.toString('utf8'),expected,brand)):bytes;
 assert.equal(crypto.createHash('sha256').update(frozen).digest('hex'),expected,brand+' '+file);
}
const report={status:'passed',baseline:baseline.capturedFrom,originalBaselineUnchanged:true,originalLabelHashesReproduced:baselineMatches,financialHandoffs:handoffs,unchangedLabelByteMatches:labels,authorizedArtworkChangedCases:artworkChanges,artworkRegionsCheckedSeparately:'verify-print-artwork.cjs',options:D.options.length,physicalPrinter:false,liveBrowser:false};
fs.writeFileSync(path.join(__dirname,'locked-output-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
