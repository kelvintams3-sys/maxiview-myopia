'use strict';

// An in-memory DOM/message harness. It executes the actual source scripts and
// real canvas label renderers; it does not simulate browser layout or a device.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createCanvas,GlobalFonts}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..');
for(const weight of ['Regular','Bold']){
  const font=['/usr/share/fonts/truetype/liberation/LiberationSans-'+weight+'.ttf','/usr/share/fonts/truetype/liberation2/LiberationSans-'+weight+'.ttf'].find(p=>fs.existsSync(p));
  if(font)GlobalFonts.registerFromPath(font,'Arial');
}
const voidTags=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
function decode(text){return String(text).replace(/&(?:amp|lt|gt|quot|#39);/g,t=>({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#39;':"'"}[t]));}
class Element{
  constructor(tag,doc){this.tagName=tag.toUpperCase();this.doc=doc;this.attributes={};this.children=[];this.parentElement=null;this.listeners={};this.style={setProperty(k,v){this[k]=v}};this._text='';this._html='';this.value='';this.checked=false;this.disabled=false;this.scrollTop=0;this.scrollLeft=0;this.offsetWidth=1024;this.clientWidth=1024;this.clientHeight=768;this.scrollWidth=1600;this.scrollHeight=2400;this.clientLeft=0;this.clientTop=0;this.isConnected=true;this.validityMessage='';}
  metric(name,fallback){const fixture=this.doc.metrics&&this.doc.metrics(this);return fixture&&fixture[name]!==undefined?fixture[name]:fallback;}
  get clientWidth(){return this.metric('clientWidth',this._clientWidth)}set clientWidth(value){this._clientWidth=value}
  get clientHeight(){return this.metric('clientHeight',this._clientHeight)}set clientHeight(value){this._clientHeight=value}
  get scrollWidth(){return this.metric('scrollWidth',this._scrollWidth)}set scrollWidth(value){this._scrollWidth=value}
  get scrollHeight(){return this.metric('scrollHeight',this._scrollHeight)}set scrollHeight(value){this._scrollHeight=value}
  get id(){return this.attributes.id||''}set id(v){this.setAttribute('id',v)}
  get className(){return this.attributes.class||''}set className(v){this.attributes.class=String(v)}
  get hidden(){return this.hasAttribute('hidden')}set hidden(v){if(v)this.setAttribute('hidden','');else this.removeAttribute('hidden')}
  get open(){return this.hasAttribute('open')}set open(v){if(v)this.setAttribute('open','');else this.removeAttribute('open')}
  get dataset(){const out={};for(const [k,v] of Object.entries(this.attributes))if(k.startsWith('data-'))out[k.slice(5).replace(/-([a-z])/g,(_,x)=>x.toUpperCase())]=v;return out;}
  get classList(){const el=this;return {contains(x){return el.className.split(/\s+/).includes(x)},add(x){if(!this.contains(x))el.className=(el.className+' '+x).trim()},remove(x){el.className=el.className.split(/\s+/).filter(y=>y!==x).join(' ')},toggle(x,on){if(on===undefined)on=!this.contains(x);if(on)this.add(x);else this.remove(x);return on}};}
  setAttribute(k,v){this.attributes[k]=String(v);if(k==='value')this.value=String(v);if(k==='checked')this.checked=true;if(k==='disabled')this.disabled=true;}
  getAttribute(k){return Object.hasOwn(this.attributes,k)?this.attributes[k]:null}
  hasAttribute(k){return Object.hasOwn(this.attributes,k)}
  removeAttribute(k){delete this.attributes[k];if(k==='disabled')this.disabled=false;}
  appendChild(child){child.parentElement=this;this.children.push(child);if(child.tagName==='IFRAME'&&this.doc.onFrame)this.doc.onFrame(child);return child;}
  addEventListener(type,fn){(this.listeners[type]||(this.listeners[type]=[])).push(fn)}
  emit(type,props={}){const event=Object.assign({type,target:this,key:'',shiftKey:false,preventDefault(){this.defaultPrevented=true}},props);let el=this;while(el){for(const fn of el.listeners[type]||[])fn(event);el=el.parentElement;}return event;}
  focus(){this.doc.activeElement=this}
  setCustomValidity(message){this.validityMessage=message}
  reportValidity(){return !this.validityMessage}
  getBoundingClientRect(){const fixture=this.doc.geometry&&this.doc.geometry(this);if(fixture)return fixture;const height=Math.max(30,parseFloat(this.style.minHeight)||0);return {top:0,left:0,width:300,height,right:300,bottom:height}}
  scrollTo(input){if(input.top!==undefined)this.scrollTop=input.top;if(input.left!==undefined)this.scrollLeft=input.left}
  scrollIntoView(options){this.scrollIntoViewOptions=options;if(this.doc.onScrollIntoView)this.doc.onScrollIntoView(this,options)}
  get textContent(){return this._text+this.children.map(c=>c.textContent).join('')}
  set textContent(text){this._text=String(text);this.children=[];this._html=String(text)}
  get innerHTML(){return this._html}
  set innerHTML(text){this._html=String(text);this._text='';this.children=[];parse(String(text),this,this.doc)}
  matches(selector){
    let s=selector.trim();if(!s)return false;
    const notDisabled=s.includes(':not(:disabled)');s=s.replace(':not(:disabled)','');if(notDisabled&&this.disabled)return false;
    const attr=[...s.matchAll(/\[([^\]=]+)(?:="([^"]*)")?\]/g)];
    for(const a of attr)if(!this.hasAttribute(a[1])||(a[2]!==undefined&&this.getAttribute(a[1])!==a[2]))return false;
    s=s.replace(/\[[^\]]+\]/g,'');
    const id=/#([\w-]+)/.exec(s);if(id&&this.id!==id[1])return false;
    for(const c of s.matchAll(/\.([\w-]+)/g))if(!this.classList.contains(c[1]))return false;
    const tag=/^[a-z][\w-]*/i.exec(s);if(tag&&this.tagName!==tag[0].toUpperCase())return false;
    return true;
  }
  closest(selector){let n=this;while(n){if(n.matches(selector))return n;n=n.parentElement;}return null;}
  querySelectorAll(selector){return query(this,selector,false)}
  querySelector(selector){return this.querySelectorAll(selector)[0]||null}
}
function query(parent,selector,include){
  const selectors=selector.split(',').map(x=>x.trim()),result=[];
  function match(el,selector){const parts=selector.split(/\s+/);if(!el.matches(parts.pop()))return false;let p=el.parentElement;while(parts.length){const part=parts.pop();while(p&&!p.matches(part))p=p.parentElement;if(!p)return false;p=p.parentElement;}return true;}
  function visit(el){if(selectors.some(s=>match(el,s)))result.push(el);for(const child of el.children)visit(child)}
  if(include)visit(parent);else for(const child of parent.children)visit(child);return result;
}
function parse(markup,parent,doc){
  const clean=markup.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
  const stack=[parent];let last=0;
  for(const token of clean.matchAll(/<\/?[a-z][^>]*>/gi)){
    const text=clean.slice(last,token.index);if(text)stack[stack.length-1]._text+=decode(text);
    const tag=/^<\/?([\w-]+)/.exec(token[0])[1].toLowerCase();
    if(token[0].startsWith('</')){for(let i=stack.length-1;i>0;i--)if(stack[i].tagName===tag.toUpperCase()){stack.length=i;break;}}
    else{
      const node=new Element(tag,doc),attrs=token[0].slice(tag.length+1,-1);
      for(const a of attrs.matchAll(/([^\s=\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g))node.setAttribute(a[1],decode(a[2]??a[3]??a[4]??''));
      stack[stack.length-1].appendChild(node);
      if(!voidTags.has(tag)&&!token[0].endsWith('/>'))stack.push(node);
    }
    last=token.index+token[0].length;
  }
  if(last<clean.length)stack[stack.length-1]._text+=decode(clean.slice(last));
}
function makeWindow(markup){
  const document={activeElement:null,listeners:{},onFrame:null,currentScript:null};
  document.root=new Element('document',document);parse(markup,document.root,document);
  document.documentElement=document.root.querySelector('html')||document.root;
  document.body=document.root.querySelector('body')||document.root;
  document.createElement=tag=>tag==='canvas'?createCanvas(1,1):new Element(tag,document);
  document.querySelectorAll=selector=>document.root.querySelectorAll(selector);
  document.querySelector=selector=>document.root.querySelector(selector);
  document.getElementById=id=>document.querySelectorAll('[id]').find(el=>el.id===id)||null;
  document.addEventListener=(type,fn)=>(document.listeners[type]||(document.listeners[type]=[])).push(fn);
  const timers=new Map(),listeners={};let serial=0;
  const win={document,console,Uint8Array,Uint8ClampedArray,TextEncoder,innerHeight:768,scrollY:0,navigator:{},CSS:{supports(){return true}},
    addEventListener(type,fn){(listeners[type]||(listeners[type]=[])).push(fn)},
    dispatch(type,event){for(const fn of listeners[type]||[])fn(event)},
    setTimeout(fn,delay){const id=++serial;timers.set(id,{fn,delay});return id},clearTimeout(id){timers.delete(id)},
    requestAnimationFrame(fn){fn();return 1},scrollTo(input){this.scrollY=input.top;document.documentElement.scrollTop=input.top},
    timers,flushTimers(delay){for(const [id,t] of [...timers])if(t.delay===delay){timers.delete(id);t.fn()}}};
  win.window=win;win.parent=win;return vm.createContext(win);
}
function execute(context,file){vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file})}
function loadNative(brand,parent,frame,queue,bridge=true){
  const directory=path.join(root,'catalogues',brand),markup=fs.readFileSync(path.join(directory,'index.html'),'utf8');
  const context=makeWindow(markup);
  if(parent){
    const proxy={postMessage(data){const clone=JSON.parse(JSON.stringify(data));queue.push(()=>parent.dispatch('message',{source:context,data:clone}))}};
    context.parent=proxy;
    context.postMessage=function(data){const clone=JSON.parse(JSON.stringify(data));queue.push(()=>context.dispatch('message',{source:proxy,data:clone}))};
    if(frame)frame.contentWindow=context;
  }
  const scripts=[...markup.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  for(const match of scripts){
    const src=/src="([^"]+)"/.exec(match[1]);
    if(src){if(!src[1].includes('bridge.js'))execute(context,path.join(directory,src[1]));}
    else if(match[2].trim())vm.runInContext(match[2],context);
  }
  if(bridge){
    context.document.currentScript={getAttribute(name){return name==='data-brand'?brand:null}};
    execute(context,path.join(root,'bridge.js'));
  }
  return context;
}
function createHub(){
  const queue=[],children={};
  const host=makeWindow(fs.readFileSync(path.join(root,'index.html'),'utf8'));
  host.document.onFrame=frame=>{
    const brand=/catalogues\/([^/]+)\//.exec(frame.getAttribute('src'))[1];
    children[brand]=loadNative(brand,host,frame,queue,true);
  };
  for(const file of ['catalogues/hoya/catalogue-data.js','catalogues/zeiss/catalogue-data.js','catalogue-data.js','consultation-copy.js','hub.js'])execute(host,path.join(root,file));
  function flush(){let count=0;while(queue.length){if(++count>1000)throw new Error('Message loop did not settle');queue.shift()();}return count;}
  return {host,children,flush,queue,app:host.MaxiviewMyopiaHub};
}
module.exports={root,Element,makeWindow,loadNative,createHub};
