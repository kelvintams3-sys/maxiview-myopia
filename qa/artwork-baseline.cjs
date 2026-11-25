'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {root,loadNative}=require('./harness.cjs');
const {restoreFrozenPrinter}=require('./authorized-print-artwork.cjs');
function loadFrozen(brand){
  const child=loadNative(brand,null,null,[],false);
  const file=path.join(root,'catalogues',brand,'printer.js');
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'catalogues',brand,'PRINTER_SHA256.json'),'utf8'));
  vm.runInContext(restoreFrozenPrinter(fs.readFileSync(file,'utf8'),manifest['printer.js'],brand),child,{filename:'original-'+brand+'-printer.js'});
  return child;
}
module.exports={loadFrozen};
