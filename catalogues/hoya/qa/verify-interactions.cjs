'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function harness(D,C,root){
 const nodes=new Map(),timers=new Map();let nextTimer=1,clock=0;
 const doc={body:{style:{}},activeElement:null,addEventListener(){},querySelector(){return null;},querySelectorAll(){return[];}};
 function element(id){
  if(nodes.has(id))return nodes.get(id);const classes=new Set();
  const n={id,innerHTML:'',textContent:'',dataset:{},isConnected:true,listeners:{},
   classList:{add(k){classes.add(k);},remove(k){classes.delete(k);},contains(k){return classes.has(k);},toggle(k,on){if(on===undefined)on=!classes.has(k);if(on)classes.add(k);else classes.delete(k);}},
   focus(){doc.activeElement=n;},addEventListener(type,fn){(n.listeners[type]||=[]).push(fn);},querySelector(selector){return selector==='.print-status-text'?element(id+'-text'):null;}};
  nodes.set(id,n);return n;
 }
 function canvas(){
  const c={width:0,height:0,trace:[]};
  const context={font:'16px Arial',textAlign:'left',fillStyle:'#000',
   fillRect(){},strokeRect(){},translate(x,y){c.trace.push(['translate',x,y]);},rotate(x){c.trace.push(['rotate',x]);},
   drawImage(source){c.trace.push(['image',source.trace]);},
   measureText(text){const size=Number((this.font.match(/(\d+)px/)||[])[1]||16);return{width:String(text).length*size*.5,actualBoundingBoxAscent:0,actualBoundingBoxDescent:size*.8};},
   fillText(text,x,y){c.trace.push(['text',String(text),x,y]);},getImageData(){return{data:new Uint8ClampedArray(c.width*c.height*4).fill(255)};},putImageData(){}};
  c.getContext=()=>context;c.toDataURL=()=> 'data:image/png;base64,'+Buffer.from(JSON.stringify(c.trace)).toString('base64');return c;
 }
 doc.getElementById=element;doc.createElement=type=>{assert.equal(type,'canvas');return canvas();};
 const window={scrollTo(){},setTimeout(fn,ms){const id=nextTimer++;timers.set(id,{fn,due:clock+ms});return id;},clearTimeout(id){timers.delete(id);}};
 const ctx=vm.createContext({HoyaCatalogueData:D,CatalogueComparison:C,document:doc,window,navigator:{},console});
 vm.runInContext(fs.readFileSync(path.join(fs.existsSync(path.join(root,'dist','index.html'))?path.join(root,'dist'):root,'app.js'),'utf8'),ctx);
 vm.runInContext(fs.readFileSync(path.join(fs.existsSync(path.join(root,'dist','index.html'))?path.join(root,'dist'):root,'printer.js'),'utf8'),ctx);
 function advance(ms){const target=clock+ms;while(true){let entry=null;for(const item of timers)if(item[1].due<=target&&(!entry||item[1].due<entry[1].due))entry=item;if(!entry)break;timers.delete(entry[0]);clock=entry[1].due;entry[1].fn();}clock=target;}
 function dispatch(node,type,event={}){for(const fn of node.listeners[type]||[])fn(event);}
 return{ctx,nodes,element,advance,dispatch};
}
function pixels(points,width=320,height=480){const data=new Uint8ClampedArray(width*height*4).fill(255);for(const[x,y]of points){let i=(y*width+x)*4;data[i]=data[i+1]=data[i+2]=0;}return{width,height,getContext(){return{getImageData(){return{data};}};}};}
function decode(tspl){
 const prefix='SIZE 40 mm,60 mm\r\nGAP 2 mm,0 mm\r\nDIRECTION 1\r\nREFERENCE 0,0\r\nCLS\r\n';assert.ok(tspl.startsWith(prefix));let offset=prefix.length;const black=new Set();
 while(tspl.startsWith('BITMAP ',offset)){
  const header=/^BITMAP (\d+),(\d+),(\d+),(\d+),0,/.exec(tspl.slice(offset));assert.ok(header);const[x,y,bw,h]=header.slice(1).map(Number);assert.ok(x>=0&&y>=0&&x+bw*8<=320&&y+h<=480);offset+=header[0].length;
  const data=tspl.slice(offset,offset+bw*h);assert.equal(data.length,bw*h);
  for(let yy=0;yy<h;yy++)for(let bx=0;bx<bw;bx++){const bits=255-data.charCodeAt(yy*bw+bx);for(let bit=0;bit<8;bit++)if(bits&(128>>bit))black.add(`${x+bx*8+bit},${y+yy}`);}
  offset+=bw*h;assert.equal(tspl.slice(offset,offset+2),'\r\n');offset+=2;
 }
 assert.equal(tspl.slice(offset),'PRINT 1,1\r\n');return black;
}
module.exports=async function({D,C,root,check,selections}){
 for(const initial of selections){
  const{ctx}=harness(D,C,root);ctx.applyBuild({product:initial[0],style:initial[1],coating:initial[2]});ctx.state.frame=299;ctx.state.followups={one:false,two:true};
  for(const target of selections)check('Apptransition '+initial.slice(0,3)+' to '+target.slice(0,3),()=>{
   ctx.selectLensStyle(target[0],target[1]);ctx.selectCoatingFor(target[0],target[2]);
   assert.equal(ctx.state.product,target[0]);assert.equal(ctx.state.style,target[1]);assert.equal(ctx.state.coating,target[2]);assert.equal(ctx.grandTotal(),target[3]+419);
   ctx.openSummary();assert.match(ctx.summaryHtml(),target[0]==='iq'?/1-Year Prescription/:/6-Month Prescription/);assert.match(ctx.summaryHtml(),/sphere power/);ctx.goHome();assert.equal(ctx.state.frame,299);assert.equal(ctx.state.followups.one,false);
  });
 }
 check('FamilybuildspersistandunsupportedSunbirdcoatingisignored',()=>{
  const{ctx}=harness(D,C,root);ctx.selectLensStyle('miyosmart','sunbird');ctx.selectCoatingFor('miyosmart','fullcontrol');assert.equal(ctx.state.coating,'stx');assert.equal(ctx.coatingPrice(),1600);
  ctx.selectLensStyle('iq','chameleon');ctx.selectCoatingFor('iq','fullcontrol');assert.equal(ctx.coatingPrice(),1900);
  assert.equal(ctx.familyBuilds.miyosmart.style,'sunbird');assert.equal(ctx.familyBuilds.miyosmart.coating,'stx');
  ctx.selectCoatingFor('miyosmart','stx');assert.equal(ctx.state.style,'sunbird');assert.equal(ctx.coatingPrice(),1600);
 });
 check('Frameandbiometrycomplimentaryrestoreoriginalprices',()=>{
  const{ctx}=harness(D,C,root);ctx.selectLensStyle('iq','clear');ctx.selectCoatingFor('iq','spark');ctx.openFramePad();for(const d of'299')ctx.frameKey(d);ctx.confirmFrame();assert.equal(ctx.grandTotal(),2239);
  ctx.toggleFrameComplimentary();assert.equal(ctx.grandTotal(),1940);assert.match(ctx.frameValueHtml(),/<s>RM299<\/s>/);
  ctx.toggleComplimentary();assert.equal(ctx.grandTotal(),1700);assert.match(ctx.followupRow('one','Follow-up 1'),/<s>RM120<\/s>/);
  ctx.toggleComplimentary();ctx.toggleFrameComplimentary();assert.equal(ctx.grandTotal(),2239);ctx.clearFrame();assert.equal(ctx.grandTotal(),1940);assert.equal(ctx.state.frameComplimentary,false);
 });
 check('Five-digitkeypadandclearingcomplimentaryframe',()=>{
  const{ctx}=harness(D,C,root);ctx.openFramePad();for(const d of'9999999')ctx.frameKey(d);assert.equal(ctx.state.frameDraft,'99999');ctx.frameKey('back');assert.equal(ctx.state.frameDraft,'9999');ctx.frameKey('clear');ctx.frameKey('<script>');assert.equal(ctx.state.frameDraft,'');ctx.frameKey('0');ctx.confirmFrame();assert.equal(ctx.frameIncluded(),false);
 });
 check('Longhold850msandcancellationevents',()=>{
  const h=harness(D,C,root),e=h.element('fixture-hold');let calls=0;h.ctx.bindHold(e,()=>calls++,false);
  h.dispatch(e,'pointerdown',{button:0});h.advance(849);assert.equal(calls,0);h.dispatch(e,'pointerleave');h.advance(1);assert.equal(calls,0);
  for(const type of['pointercancel','pointerup','blur']){h.dispatch(e,'pointerdown',{button:0});h.dispatch(e,type);h.advance(850);assert.equal(calls,0);}
  h.dispatch(e,'pointerdown',{button:1});h.advance(850);assert.equal(calls,0);
  h.dispatch(e,'pointerdown',{button:0});h.advance(850);assert.equal(calls,1);
 });
 check('Printquotationrowsmatchcomplimentaryandexclusionstate',()=>{
  const{ctx}=harness(D,C,root);ctx.applyBuild({product:'iq',style:'chameleon',coating:'fullcontrol'});ctx.state.frame=299;ctx.state.frameComplimentary=true;ctx.state.followups={one:false,two:true};ctx.state.complimentary=true;
  assert.deepEqual(JSON.parse(JSON.stringify(ctx.quotationRows())),[{label:'Lens',amount:1900,struck:false},{label:'Frame',amount:299,struck:true},{label:'Follow-up 2',amount:120,struck:true}]);assert.equal(ctx.grandTotal(),1900);
 });
 const printer=harness(D,C,root).ctx;
 for(const s of selections)for(const kind of['quotation','warranty','booklet','extension'])check('Labelidentityandcache '+s.slice(0,3)+' '+kind,()=>{
  printer.applyBuild({product:s[0],style:s[1],coating:s[2]});const art=printer.labelArtwork(kind);const trace=JSON.parse(Buffer.from(art.preview.split(',')[1],'base64').toString());const text=trace.filter(x=>x[0]==='text').map(x=>x[1]).join(' ');const iq=s[0]==='iq';
  assert.ok(text.includes(iq?'MiYOSMART iQ':'MiYOSMART'));if(!iq)assert.ok(!text.includes('MiYOSMART iQ'));assert.ok(text.includes(D.styles[s[1]].name));assert.equal(art.width,kind==='quotation'?320:480);assert.equal(art.height,kind==='quotation'?480:320);
  assert.ok(art.key.includes(s[0]));assert.ok(art.key.includes(s[1]));
  if(kind==='warranty'||kind==='booklet'){assert.match(text,/sphere/i);assert.ok(text.includes(iq?'0.50':'0.75'));assert.ok(!text.includes(iq?'0.75':'0.50'));assert.match(text,iq?/1.year/i:/6.month/i);}
  if(kind==='quotation')assert.ok(text.includes(D.coatings[s[2]].shortName));
 });
 check('PhysicalrasterTSPLroundtripandpolarity',()=>{
  const points=[[0,0],[7,79],[8,80],[319,159],[45,160],[301,239],[160,240],[0,319],[100,320],[88,399],[200,400],[319,479]];
  assert.deepEqual([...decode(printer.rasterToTSPL(pixels(points)))].sort(),points.map(([x,y])=>`${x},${y}`).sort());assert.equal(decode(printer.rasterToTSPL(pixels([]))).size,0);assert.throws(()=>printer.rasterToTSPL(pixels([],480,320)),/320.*480/);
 });
 check('Noobsoletebrandinapplicationsandlabels',()=>{
  for(const file of['catalogue-data.js','app.js','printer.js','index.html'])assert.doesNotMatch(fs.readFileSync(path.join(fs.existsSync(path.join(root,'dist','index.html'))?path.join(root,'dist'):root,file),'utf8'),/zeiss|myoactive|duravision|m\.o\.v\.e\.|stellest|essilor|crizal/i,file);
  assert.equal(printer.HOYA_LOGO_HEX.length,96*24/8*2);
 });
 const bytes=String.fromCharCode(...Array.from({length:57},(_,n)=>(n*17)&255)),sent=[],delays=[];
 printer.window.setTimeout=(callback,ms)=>{delays.push(ms);callback();return 1;};printer.setPrintStatus=()=>{};
 await printer.writeChunks({properties:{writeWithoutResponse:true},async writeValueWithoutResponse(chunk){sent.push([...chunk]);}},bytes,'Quotation');
 check('BLE20bytechunks35mspacingbinarysafe',()=>{assert.deepEqual(sent.map(x=>x.length),[20,20,17]);assert.deepEqual(sent.flat(),Array.from(bytes,x=>x.charCodeAt(0)));assert.deepEqual(delays,[35,35,35]);});
 sent.length=0;delays.length=0;await printer.writeChunks({properties:{},async writeValue(chunk){sent.push([...chunk]);}},bytes,'Quotation');
 check('BLEresponsewritefallback',()=>{assert.deepEqual(sent.map(x=>x.length),[20,20,17]);assert.deepEqual(sent.flat(),Array.from(bytes,x=>x.charCodeAt(0)));});
};
