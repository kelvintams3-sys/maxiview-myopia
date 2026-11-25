'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createCanvas,loadImage}=require('@napi-rs/canvas');
const {loadNative,root}=require('./harness.cjs'),{loadFrozen}=require('./artwork-baseline.cjs');
const {restoreFrozenPrinter}=require('./authorized-print-artwork.cjs');
const {decodeRaster}=require('./print-raster.cjs');
const D=require('../catalogue-data.js');
function recorder(child){
 const calls=[],create=child.document.createElement;
 child.document.createElement=function(tag){
  const el=create(tag);if(tag!=='canvas')return el;
  const get=el.getContext.bind(el);el.getContext=function(){
   const ctx=get.apply(el,arguments);if(!ctx.__artworkTrace){
    ctx.__artworkTrace=true;const fill=ctx.fillText;
    ctx.fillText=function(text,x,y){calls.push({text:String(text),x,y,font:ctx.font,align:ctx.textAlign,width:ctx.measureText(String(text)).width});return fill.apply(ctx,arguments)};
   }return ctx;
  };return el;
 };return calls;
}
function preview(child,kind){return child.labelArtwork?child.labelArtwork(kind).preview:kind==='quotation'?child.quotationArtwork().preview:null}
async function pixels(url){const img=await loadImage(Buffer.from(url.split(',')[1],'base64')),canvas=createCanvas(img.width,img.height),ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);return {width:img.width,height:img.height,data:ctx.getImageData(0,0,img.width,img.height).data}}
function regions(brand,style,kind,coating){
 const allowed=[];
 if(brand==='zeiss')allowed.push({x:18,y:16,w:48,h:48,logo:true});
 if(kind==='quotation')allowed.push(brand==='stellest'?{x:18,y:205,w:286,h:155}:brand==='hoya'?{x:16,y:207,w:288,h:145}:{x:16,y:187,w:288,h:155});
 if(brand==='hoya'&&style==='chameleon')allowed.push(kind==='quotation'?{x:16,y:87,w:288,h:33}:{x:16,y:56,w:448,h:32});
 if(brand==='hoya'&&kind==='quotation'&&coating==='spark')allowed.push({x:18,y:166,w:284,h:26});
 return allowed;
}
function compare(before,after,allowed){
 assert.equal(before.width,after.width);assert.equal(before.height,after.height);let changed=0;
 for(let i=0;i<before.data.length;i+=4){
  const x=i/4%before.width,y=Math.floor(i/4/before.width);
  if(before.data[i]!==after.data[i]){assert.ok(allowed.some(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h),'Unexpected artwork difference at '+x+','+y);changed++}
 }
 for(const r of allowed.filter(r=>r.logo))for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){
  const i=(y*before.width+x)*4;assert.equal(after.data[i],255-before.data[i],'Only the existing ZEISS logo pixels invert');
 }
 return changed;
}
async function main(){
 const current={},original={},traces={};
 for(const brand of ['stellest','hoya','zeiss']){
  current[brand]=loadNative(brand,null,null,[],false);original[brand]=loadFrozen(brand);traces[brand]=recorder(current[brand]);
  const source=fs.readFileSync(path.join(root,'catalogues',brand,'printer.js'),'utf8'),sha=require('../catalogues/'+brand+'/PRINTER_SHA256.json')['printer.js'];
  assert.throws(()=>restoreFrozenPrinter(source.replace('sleep(35)','sleep(36)'),sha,brand),'Transport changes must fail the artwork exception');
 }
 const report={status:'passed',labelCases:0,previewPixelCases:0,unchangedLandscapeCommands:0,rowFitCases:0,chameleonFontCases:0,sparkSingleHeadingCases:0,unchangedStxSubtitleCases:0,allChangesInsideAuthorizedArtworkRegions:true,originalManifestsRetained:true,liveBrowser:false,physicalPrinter:false};
 const dirIndex=process.argv.indexOf('--preview-dir'),directory=dirIndex<0?null:process.argv[dirIndex+1];if(directory)fs.mkdirSync(directory,{recursive:true});
 for(const option of D.options)for(const frame of [200,99999]){
  const c=current[option.brand],old=original[option.brand],selection=D.selectionForOption(option.id),shared={frame,frameComplimentary:frame===99999,followups:{one:true,two:true},complimentary:frame===99999};
  for(const child of [c,old]){Object.assign(child.state,JSON.parse(JSON.stringify(shared)),selection);if(option.brand==='hoya')child.familyBuilds[selection.product]=Object.assign({},selection)}
  for(const kind of ['quotation','warranty','booklet','extension']){
   const trace=traces[option.brand];trace.length=0;
   const commands=c.buildLabelTSPL(kind),before=old.buildLabelTSPL(kind);decodeRaster(commands);
   const now=preview(c,kind),was=preview(old,kind),allowed=regions(option.brand,selection.style,kind,selection.coating);
   if(now&&was){
    const changed=compare(await pixels(was),await pixels(now),allowed);if(kind==='quotation')assert.ok(changed>0,'Larger quotation rows must alter the image');report.previewPixelCases++;
    if(directory&&frame===200)fs.writeFileSync(path.join(directory,option.id+'-'+kind+'.png'),Buffer.from(now.split(',')[1],'base64'));
   }else{assert.equal(commands,before,'Static Essilor landscape labels remain unchanged');report.unchangedLandscapeCommands++}
   if(kind==='quotation'){
    if(option.brand==='hoya'){
     if(selection.coating==='spark'){
      assert.equal(trace.filter(call=>call.text==='S.P.A.R.K.').length,1);assert.equal(trace.filter(call=>call.text==='S.P.A.R.K. Coating').length,0);report.sparkSingleHeadingCases++;
     }else{assert.equal(trace.filter(call=>call.text==='Coating STX').length,1);report.unchangedStxSubtitleCases++}
    }
    const names=[option.brand==='stellest'?c.coatingName():'Lens pair','Frame','Follow-up 1','Follow-up 2'];
    for(const name of names){
     const label=trace.find(call=>call.text===name);assert.ok(label,'Quotation row must be present');
     const amount=trace.find(call=>call.y===label.y&&call.align==='right');
     assert.ok(amount);assert.match(label.font,/\b21px\b/);assert.match(amount.font,/\b21px\b/);
     assert.ok(amount.x-amount.width-(label.x+label.width)>=4,'Item and price must stay separated');report.rowFitCases++;
    }
   }
   if(option.brand==='hoya'&&selection.style==='chameleon'&&trace.length){
    const line=trace.find(call=>call.text==='Chameleon · 1.59');assert.ok(line);assert.match(line.font,/\b22px\b/);report.chameleonFontCases++;
   }
   report.labelCases++;
  }
 }
 fs.writeFileSync(path.join(__dirname,'print-artwork-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1});
