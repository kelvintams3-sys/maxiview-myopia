'use strict';

// Real-canvas and decoded printer-byte checks, without a physical printer.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {createCanvas,GlobalFonts}=require('@napi-rs/canvas');
for(const weight of ['Regular','Bold']){
  const override=process.env[weight==='Bold'?'PRINT_QA_FONT_BOLD':'PRINT_QA_FONT_REGULAR'];
  const font=[override,'/usr/share/fonts/truetype/liberation/LiberationSans-'+weight+'.ttf','/usr/share/fonts/truetype/liberation2/LiberationSans-'+weight+'.ttf','/Library/Fonts/Arial'+(weight==='Bold'?' Bold':'')+'.ttf',path.join(process.env.WINDIR||'C:\\Windows','Fonts',weight==='Bold'?'arialbd.ttf':'arial.ttf')].find(file=>file&&fs.existsSync(file));
  assert.ok(font,'Set PRINT_QA_FONT_REGULAR / PRINT_QA_FONT_BOLD to Arial-compatible font files');
  assert.ok(GlobalFonts.registerFromPath(font,'Arial'));
}
const root=path.resolve(__dirname,'..');
const D=require(path.join(root,'catalogue-data.js'));
const hoya=!!D.products,brand=hoya?'HOYA':'ZEISS',width=hoya?96:48,height=hoya?24:48;
const baselineDirectory=process.argv[2]?path.resolve(process.argv[2]):null;
const pngIndex=process.argv.indexOf('--png-dir');
const pngDirectory=pngIndex>=0?path.resolve(process.argv[pngIndex+1]):null;
if(pngDirectory)fs.mkdirSync(pngDirectory,{recursive:true});
function load(directory){
  const state=D.normalizeState();let canvases=[];
  const context=vm.createContext({DATA:D,MyoActiveData:D,state,navigator:{},window:{},
    document:{createElement(tag){assert.equal(tag,'canvas');const canvas=createCanvas(1,1);canvases.push(canvas);return canvas}},
    currentProduct:()=>hoya?D.products[state.product]:D.product,
    coatingPrice:()=>D.totals(state).lens,frameIncluded:()=>state.frame!==null,
    grandTotal:()=>D.totals(state).grand,money:D.money});
  vm.runInContext(fs.readFileSync(path.join(directory,'printer.js'),'utf8'),context);
  return {state,context,render(kind){canvases=[];context.labelArtworkCache=Object.create(null);const art=context.labelArtwork(kind);return {art,preview:canvases[0],physical:canvases[canvases.length-1]}}};
}
function decode(text){
  const pixels=new Uint8Array(320*480).fill(255);let offset=0;
  while(offset<text.length){
    if(text.startsWith('BITMAP ',offset)){
      const m=/^BITMAP (\d+),(\d+),(\d+),(\d+),0,/.exec(text.slice(offset));assert.ok(m);
      const [x,y,w,h]=m.slice(1).map(Number);offset+=m[0].length;
      assert.ok(x>=0 && x+w*8<=320 && y>=0 && y+h<=480);
      for(let row=0;row<h;row++)for(let column=0;column<w;column++){
        const bits=255-(text.charCodeAt(offset+row*w+column)&255);
        for(let bit=0;bit<8;bit++)if(bits&(128>>bit))pixels[(y+row)*320+x+column*8+bit]=0;
      }
      offset+=w*h;assert.equal(text.slice(offset,offset+2),'\r\n');offset+=2;
    }else{const end=text.indexOf('\r\n',offset);if(end<0)break;offset=end+2;}
  }
  return pixels;
}
const updated=load(root),baseline=baselineDirectory?load(baselineDirectory):null;
const options=hoya?D.allOptions():D.comparisonOptions();
let labelCases=0,logoPixelChecks=0,unexpectedChanges=0;
for(const option of options){
  const values={product:option.productKey,style:option.styleId,coating:option.coatingId,frame:250,frameComplimentary:true,followups:{one:true,two:true},complimentary:true};
  Object.assign(updated.state,D.normalizeState(values));if(baseline)Object.assign(baseline.state,D.normalizeState(values));
  for(const kind of ['quotation','warranty','booklet','extension']){
    const result=updated.render(kind),preview=result.preview,physical=result.physical;
    assert.equal(preview.width,kind==='quotation'?320:480);assert.equal(preview.height,kind==='quotation'?480:320);
    assert.equal(physical.width,320);assert.equal(physical.height,480);
    const pixels=preview.getContext('2d').getImageData(0,0,preview.width,preview.height).data;
    const raster=physical.getContext('2d').getImageData(0,0,320,480).data;
    const decoded=decode(result.art.tspl);
    for(let i=0;i<decoded.length;i++)assert.equal(decoded[i],raster[i*4],'Printer bytes match the physical raster');
    let black=0,printedLogoBlack=0;
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      const value=pixels[((16+y)*preview.width+18+x)*4];
      if(value===0)black++;
      const physicalIndex=kind==='quotation'?(16+y)*320+18+x:(18+x)*320+319-16-y;
      if(decoded[physicalIndex]===0)printedLogoBlack++;
      const hex=updated.context[hoya?'HOYA_LOGO_HEX':'ZEISS_LOGO_HEX'];
      const byte=parseInt(hex.slice((y*(width/8)+Math.floor(x/8))*2,(y*(width/8)+Math.floor(x/8))*2+2),16);
      assert.equal(value,byte&(128>>(x%8))?0:255,'Logo is black foreground on a white background');
      logoPixelChecks++;
    }
    assert.ok(black>0 && black<width*height/2,'Logo uses dark lettering rather than a dark background block');
    assert.ok(printedLogoBlack>0 && printedLogoBlack<width*height/2,'Decoded physical logo has dark lettering on white after the existing rotation');
    if(baseline){
      const before=baseline.render(kind).preview.getContext('2d').getImageData(0,0,preview.width,preview.height).data;
      for(let y=0;y<preview.height;y++)for(let x=0;x<preview.width;x++){
        const i=(y*preview.width+x)*4;
        if(pixels[i]!==before[i] && (hoya || x<18 || x>=18+width || y<16 || y>=16+height))unexpectedChanges++;
      }
      if(hoya)assert.equal(result.art.tspl,baseline.context.labelArtwork(kind).tspl,'Existing positive HOYA output remains identical');
    }
    if(pngDirectory && option===options[0])fs.writeFileSync(path.join(pngDirectory,brand.toLowerCase()+'-'+kind+'.png'),Buffer.from(result.art.preview.split(',')[1],'base64'));
    labelCases++;
  }
}
assert.equal(unexpectedChanges,0,'No changes outside the ZEISS logo region or anywhere in already-positive HOYA labels');
for(const background of ['#000','#ff0000']){
  const canvas=createCanvas(width,height),ctx=canvas.getContext('2d');ctx.fillStyle=background;ctx.fillRect(0,0,width,height);
  updated.context[hoya?'drawHoyaLogo':'drawZeissLogo'](ctx,0,0);
  assert.equal(ctx.fillStyle,background,'Drawing the logo restores the caller fill colour');
  const p=ctx.getImageData(0,0,width,height).data;
  for(let i=0;i<p.length;i+=4)assert.ok((p[i]===0||p[i]===255)&&p[i]===p[i+1]&&p[i]===p[i+2]&&p[i+3]===255);
}
const result={status:'passed',brand,labelCases,logoPixelChecks,unexpectedChanges,printerBytesMatchRaster:true,previewAndPrinterLogosPositive:true,positiveBlackOnWhite:true,physicalPrinterTested:false};
fs.writeFileSync(path.join(__dirname,'print-logo-verification.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
