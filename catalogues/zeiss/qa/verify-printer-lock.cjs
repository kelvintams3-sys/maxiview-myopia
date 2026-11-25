'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const {restoreFrozenPrinter}=require('../../../qa/authorized-print-artwork.cjs');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'PRINTER_SHA256.json'),'utf8'));
let failed=false;
for(const [file,expected]of Object.entries(manifest)){
 const target=path.join(root,file),bytes=fs.existsSync(target)?fs.readFileSync(target):null;
 const actual=bytes?crypto.createHash('sha256').update(bytes).digest('hex'):'MISSING';
 if(actual===expected)console.log('OK:',file);
 else if(file==='printer.js'&&bytes){
  try{restoreFrozenPrinter(bytes.toString('utf8'),expected,'zeiss');console.log('OK:',file,'(explicit artwork exceptions only; original source hash restored)')}
  catch(error){console.error('LOCK FAILED:',file,error.message);failed=true}
 }else{console.error('LOCK FAILED:',file);failed=true}
}
process.exitCode=failed?1:0;
