'use strict';
// Capture independently from the original extracted PRINT_LOCKED archives.
// Usage: node qa/capture-locked-baseline.cjs /path/to/extracted-baseline-folders
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {loadNative}=require('./harness.cjs'),D=require('../catalogue-data.js');
const sourceRoot=path.resolve(process.argv[2]);
const folders={stellest:'STELLEST_R1_32_PRINT_LOCKED',hoya:'HOYA_R1_5_PRINT_LOCKED',zeiss:'MYOACTIVE_R1_4_PRINT_LOCKED'};
const digest=text=>crypto.createHash('sha256').update(Buffer.from(text,'latin1')).digest('hex');
const cases=[],protectedFiles={};
for(const [brand,name] of Object.entries(folders)){
 const dir=path.join(sourceRoot,name),base=loadNative(brand,null,null,[],false,dir);
 protectedFiles[brand]=JSON.parse(fs.readFileSync(path.join(dir,'PRINTER_SHA256.json')));
 for(const option of D.options.filter(o=>o.brand===brand)){
  const selection=D.selectionForOption(option.id);
  for(const frame of [null,200,99999])for(const frameComplimentary of frame===null?[false]:[false,true])for(const mask of [0,1,2,3])for(const complimentary of [false,true]){
   const shared={frame,frameComplimentary,followups:{one:!!(mask&1),two:!!(mask&2)},complimentary};
   Object.assign(base.state,JSON.parse(JSON.stringify(shared)),selection);
   assert.equal(base.coatingPrice(),option.price);
   const labels={quotation:digest(base.buildLabelTSPL('quotation'))};
   if(frame===null&&mask===0&&!complimentary)for(const kind of ['warranty','booklet','extension'])labels[kind]=digest(base.buildLabelTSPL(kind));
   cases.push({option:option.id,shared,total:base.grandTotal(),labels});
  }
 }
}
const result={capturedFrom:'Unmodified original PRINT_LOCKED archives',protectedFiles,cases};
fs.writeFileSync(path.join(__dirname,'locked-label-baseline.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({capturedCases:cases.length,labelHashes:cases.reduce((n,c)=>n+Object.keys(c.labels).length,0)}));
