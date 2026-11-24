'use strict';

// Deterministic geometry fixtures test scrolling logic, not browser rendering.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createHub}=require('./harness.cjs');
const D=require('../catalogue-data.js');
const h=createHub(),{app,host}=h,doc=host.document;
D.defaults.forEach((id,index)=>app.choose(index,id));h.flush();app.showTab('compare');h.flush();
const viewport=doc.getElementById('comparisonContent'),panel=doc.getElementById('panel-compare');
const sticky=doc.getElementById('comparisonSticky');
const report={status:'passed',geometryFixtures:true,liveBrowser:false,cases:[]};
function rect(left,top,width,height){return {left,top,width,height,right:left+width,bottom:top+height};}
let screen={left:0,top:52,width:1024,height:716};
viewport.getBoundingClientRect=()=>rect(screen.left,screen.top,screen.width,screen.height);
panel.getBoundingClientRect=viewport.getBoundingClientRect;
function layout(){
  const sections={};
  for(const table of doc.getElementById('comparisonBody').querySelectorAll('table[data-section-table]')){
    const config={visible:false,left:63,headTop:300,width:900,viewWidth:900,headHeight:100,bottom:2500,shift:0};
    const wrapper=table.closest('.comparison-scroll');
    Object.defineProperty(wrapper,'clientWidth',{get:()=>config.viewWidth,configurable:true});
    wrapper.clientLeft=1;
    wrapper.getBoundingClientRect=()=>rect(config.left-1,config.headTop-49,config.viewWidth+2,config.bottom-config.headTop+50);
    table.getBoundingClientRect=()=>config.visible?rect(config.left-config.shift,config.headTop-48,config.width,config.bottom-config.headTop+48):rect(0,0,0,0);
    table.querySelector('thead').getBoundingClientRect=()=>config.visible?rect(config.left-config.shift,config.headTop,config.width,config.headHeight):rect(0,0,0,0);
    sections[table.getAttribute('data-section-table')]={config,wrapper};
  }
  return sections;
}
function update(){viewport.emit('scroll');}
function passed(name){report.cases.push(name);}
let sections=layout(),p=sections.practical.config;p.visible=true;
update();assert.equal(sticky.hidden,true);passed('No duplicate heading before the original scrolls out');
p.headTop=52;update();assert.equal(sticky.hidden,false);assert.equal(sticky.style.top,'0px');
assert.equal(sticky.style.left,'63px');assert.equal(sticky.style.width,'900px');
assert.equal(sticky.querySelector('table').style.width,'900px');passed('Heading pins exactly when reaching the top');
p.headTop=-350;update();assert.equal(sticky.hidden,false);passed('Brand and full option remain visible deep in the table');
p.shift=220;sections.practical.wrapper.emit('scroll');
assert.equal(sticky.querySelector('table').style.transform,'translate(-220px,0px)');passed('Sideways scrolling preserves column alignment');
screen={left:0,top:52,width:375,height:716};viewport.clientWidth=375;
Object.assign(p,{left:15,width:680,viewWidth:345,shift:260});host.dispatch('resize',{});
assert.equal(sticky.style.left,'15px');assert.equal(sticky.style.width,'345px');assert.equal(sticky.querySelector('table').style.width,'680px');
assert.equal(sticky.querySelector('table').style.transform,'translate(-260px,0px)');passed('Narrow viewport clips the same horizontally shifted columns');
p.bottom=82;update();assert.equal(sticky.style.height,'30px');
assert.equal(sticky.querySelector('table').style.transform,'translate(-260px,-70px)');
p.bottom=52;update();assert.equal(sticky.hidden,true);passed('Heading leaves with its table instead of covering the next section');
screen={left:0,top:52,width:1024,height:716};viewport.clientWidth=1024;
for(const name of ['design','evidence']){
  for(const section of Object.values(sections))section.config.visible=false;
  const item=sections[name];Object.assign(item.config,{visible:true,left:83,width:860,viewWidth:860,headTop:-80});
  const detail=doc.querySelector('details[data-section="'+name+'"]');detail.open=true;detail.emit('toggle');
  assert.equal(sticky.hidden,false);assert.equal(sticky.style.left,'83px');assert.equal(sticky.style.width,'860px');
  detail.open=false;item.config.visible=false;detail.emit('toggle');assert.equal(sticky.hidden,true);
  passed('Expanded '+name+' table uses its own inset and hides when collapsed');
}
for(const ids of [[D.defaults[0],D.defaults[1]],[D.options[1].id],[D.defaults[0],D.defaults[1],D.defaults[2]]]){
  app.state.comparison=ids.slice();app.renderComparison();sections=layout();
  Object.assign(sections.practical.config,{visible:true,headTop:-100,headHeight:144});update();
  assert.equal(sticky.hidden,false);assert.equal(sticky.style.height,'144px');
  assert.equal(sticky.querySelectorAll('th').length,ids.length+1);
  assert.equal(sticky.querySelector('table').getAttribute('data-count'),String(ids.length));
  assert.equal(sticky.querySelectorAll('button, a, input, select').length,0,'Pinned copy contains identity only, not duplicate controls');
  assert.deepEqual(Array.from(sticky.querySelectorAll('.comparison-product-name'),el=>el.textContent),ids.map(id=>D.getOption(id).name.replace(/^(?:Essilor|HOYA|ZEISS)\s+/i,'')));
}
passed('One, two and three choices retain exact identities and no cloned actions');
app.choose(0,D.options.find(o=>o.brand==='stellest'&&o.id!==D.defaults[0]).id);sections=layout();
Object.assign(sections.practical.config,{visible:true,headTop:-100});update();
assert.equal(sticky.querySelectorAll('.comparison-product-name')[0].textContent,D.getOption(app.state.comparison[0]).name.replace(/^(?:Essilor|HOYA|ZEISS)\s+/i,''));
passed('Changing the recommendation refreshes the pinned identity');
app.showTab('hoya');assert.equal(sticky.hidden,true);passed('Pinned headings disappear when leaving Compare');
app.state.comparison=[];app.renderComparison();sections=layout();update();assert.equal(sticky.hidden,true);assert.equal(sticky.innerHTML,'');
passed('Empty comparison clears stale identities');
assert.equal(sticky.getAttribute('aria-hidden'),'true');
assert.equal(doc.getElementById('compareCount'),null);
assert.ok(doc.querySelector('nav').getAttribute('aria-label'));passed('Original semantic table headings and keyboard tabs remain available');
fs.writeFileSync(path.join(__dirname,'pinned-headings-verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
