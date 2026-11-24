'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createHub,root}=require('./harness.cjs'),D=require('../catalogue-data.js');
const report={status:'passed',selectionSubsets:0,brandReturnCases:0,wordingCases:0,liveBrowser:false};
for(let mask=0;mask<8;mask++){
  const h=createHub();h.flush();
  D.defaults.forEach((id,index)=>{if(mask&(1<<index))h.app.choose(index,id);});h.flush();h.app.showTab('compare');h.flush();
  const expected=D.defaults.filter((id,index)=>mask&(1<<index));
  assert.deepEqual(Array.from(h.app.state.comparison),expected);
  const doc=h.host.document,body=doc.getElementById('comparisonBody'),tables=body.querySelectorAll('table');
  assert.equal(doc.getElementById('compareBrandTitles').hidden,false);assert.equal(doc.getElementById('activeBrandTitle').hidden,true);
  assert.equal(doc.querySelector('.hub-tabs').hidden,true);assert.equal(doc.getElementById('tab-compare').hidden,true);
  assert.equal(doc.getElementById('compareBrandTitles').querySelectorAll('button[data-brand-tab]').length,3);
  const logos=doc.getElementById('compareBrandTitles').querySelectorAll('button[data-brand-tab]');
  const selectedBrands=expected.map(id=>D.getOption(id).brand);
  assert.deepEqual(logos.map(button=>button.getAttribute('data-brand-tab')),selectedBrands.concat(D.brands.filter(b=>!selectedBrands.includes(b.id)).map(b=>b.id)));
  logos.forEach(button=>{const selected=selectedBrands.includes(button.getAttribute('data-brand-tab'));assert.equal(button.getAttribute('data-selected'),String(selected));assert.equal(button.classList.contains('is-selected'),selected);assert.equal(button.classList.contains('is-unselected'),!selected);});

  if(!expected.length){assert.equal(tables.length,0);assert.equal(body.querySelectorAll('[data-use-id]').length,0);assert.doesNotMatch(body.textContent,/RM\d/);}
  else for(const table of tables){
    assert.equal(table.getAttribute('data-count'),String(expected.length));
    assert.deepEqual(table.querySelectorAll('th[data-option-id]').map(el=>el.getAttribute('data-option-id')),expected);
    for(const row of table.querySelectorAll('tr'))assert.equal(row.querySelectorAll('th,td').length,expected.length+1);
  }
  const changes=body.querySelectorAll('[data-change-index]');assert.equal(changes.length,expected.length);
  for(const change of changes){
    const index=Number(change.getAttribute('data-change-index')),brand=D.brands[index].id;
    change.emit('click');assert.ok(doc.getElementById('lensChoices').querySelectorAll('[data-pick-id]').every(el=>D.getOption(el.getAttribute('data-pick-id')).brand===brand));
    h.app.closeChooser();
  }
  if(expected.length){const cells=body.querySelector('tr[data-row-key="practical-replacement"]').querySelectorAll('td');cells.forEach((cell,i)=>{
    assert.match(cell.textContent,/Based onSphere power/);assert.doesNotMatch(cell.textContent,/Prescription power/i);
    const o=D.getOption(expected[i]);assert.ok(cell.textContent.includes(o.fields.warrantyDuration));assert.ok(cell.textContent.includes(o.warranty.progressionD.toFixed(2)));report.wordingCases++;
  });}
  for(const brand of D.brands){
    doc.getElementById('compare-title-'+brand.id).emit('click');h.flush();assert.equal(h.app.state.active,brand.id);
    assert.equal(doc.getElementById('activeBrandLogo').getAttribute('alt'),brand.name);assert.equal(doc.getElementById('compareBrandTitles').hidden,true);
    assert.equal(doc.querySelector('.hub-tabs').hidden,false);assert.equal(doc.getElementById('tab-compare').hidden,false);
    assert.equal(doc.querySelectorAll('[data-tab]').filter(button=>!button.hidden).length,3);assert.equal(doc.getElementById('tab-'+brand.id).hidden,true);
    h.app.showTab('compare');h.flush();report.brandReturnCases++;
  }
  report.selectionSubsets++;
}
assert.doesNotMatch(fs.readFileSync(path.join(root,'catalogues/zeiss/index.html'),'utf8'),/<nav class="brochure-links"/);
const override=JSON.parse(fs.readFileSync(path.join(root,'overrides.json'),'utf8'));
assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,override.files[0].path))).digest('hex'),override.files[0].sha256);
report.extraBrochureCard='removed';report.genuinePdf='unchanged';
fs.writeFileSync(path.join(__dirname,'r14-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
