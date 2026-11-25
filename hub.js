(function (global) {
  'use strict';
  var D = global.MyopiaHubData, C = global.HubCopy;
  var channel = 'MAXIVIEW_MYOPIA_V1';
  var tabs = ['stellest','hoya','zeiss','compare'];
  var state = {active:'zeiss',lastBrand:'zeiss',comparison:[],shared:D.normalizeShared(),byBrand:{},printing:null};
  var frames = {}, requests = {}, serial = 0, toastTimer, frameDraft, frameOpener, chooser;
  var detailsOpen = {design:false,evidence:false}, headingUpdatePending = false;
  D.brands.forEach(function (brand) { state.byBrand[brand.id] = null; });
  function node(id) { return document.getElementById(id); }
  function esc(value) { return String(value == null ? '' : value).replace(/[&<>"']/g,function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function brandInfo(id) { return D.brands.find(function (brand) { return brand.id === id; }); }
  function toast(message) {
    var el = node('hubToast'); el.textContent = message; el.classList.add('show');
    global.clearTimeout(toastTimer); toastTimer = global.setTimeout(function () { el.classList.remove('show'); },2800);
  }
  function post(brand,message) {
    var entry = frames[brand];
    if (entry && entry.frame.contentWindow) entry.frame.contentWindow.postMessage(Object.assign({channel:channel,brand:brand},message),'*');
  }
  function ensureFrame(brand) {
    if (frames[brand]) return frames[brand];
    var frame = document.createElement('iframe');
    frame.className = 'catalogue-frame'; frame.title = brandInfo(brand).name + ' consultation catalogue';
    // Local file frames can have distinct origins: the implicit 'src' allowlist
    // does not reliably match them. Delegate only Bluetooth for these fixed pages.
    var bluetoothPermission = global.location && global.location.protocol === 'file:' ? 'bluetooth *' : 'bluetooth';
    frame.style.visibility = 'hidden'; frame.setAttribute('allow',bluetoothPermission); frame.setAttribute('src','catalogues/'+brand+'/index.html');
    var entry = frames[brand] = {frame:frame,ready:false,pending:null,revision:0,screen:null};
    node('panel-'+brand).appendChild(frame);
    return entry;
  }
  function deliverApply(brand,message) {
    message.shared = D.normalizeShared(state.shared);
    if (message.summary) {
      node('hubStatus').textContent = 'Opening '+D.getOption(state.byBrand[brand]).name+' summary';
      requests[message.requestId] = global.setTimeout(function () {
        delete requests[message.requestId]; toast('The catalogue is still loading. Try this lens again.');
      },8000);
    }
    post(brand,message);
  }
  function sendApply(brand,selection,summary) {
    var entry = ensureFrame(brand);
    if (selection) entry.revision++;
    var message = {type:'apply',selection:selection || null,summary:summary === true,selectionRevision:entry.revision,requestId:'r'+(++serial)};
    if (!entry.ready) {
      if (entry.pending && !selection) return;
      entry.pending = message; return;
    }
    deliverApply(brand,message);
  }
  function syncComparison() {
    state.comparison = D.brands.map(function (brand) { return state.byBrand[brand.id]; }).filter(function (id) { return !!D.getOption(id); });
  }
  function scanCatalogues() {
    D.brands.forEach(function (brand) {
      var entry = ensureFrame(brand.id);
      if (entry.ready) post(brand.id,{type:'read-state',requestId:'scan'+(++serial)});
    });
    syncComparison();
  }
  function modelName(option) { return option.name.replace(/^(?:Essilor|HOYA|ZEISS)\s+/i,''); }
  function modelTheme(option) { return option.brand === 'zeiss' ? 'myoactive' : option.productKey; }
  function lensStyleName(option) {
    var hoya = global.HoyaCatalogueData;
    return option.brand === 'hoya' && hoya && hoya.styles[option.styleId] ? hoya.styleLabel(hoya.styles[option.styleId]) : option.fields.lensStyle;
  }
  var brandLogos = {stellest:'catalogues/stellest/assets/essilor-logo.png',hoya:'catalogues/hoya/assets/hoya-logo.png',zeiss:'catalogues/zeiss/assets/zeiss-logo.png'};
  function updateHeader() {
    var isCompare = state.active === 'compare', brand = state.lastBrand;
    node('hubInfo').hidden = isCompare;
    node('hubHome').hidden = isCompare || !frames[brand] || frames[brand].screen !== 'summary';
    node('activeBrandTitle').hidden = isCompare;
    node('compareBrandTitles').hidden = !isCompare;
    var group = node('compareBrandTitles');
    var ordered = D.brands.filter(function (item) { return !!state.byBrand[item.id]; }).concat(D.brands.filter(function (item) { return !state.byBrand[item.id]; }));
    var order = ordered.map(function (item) { return item.id; }).join(',');
    if (group.getAttribute('data-order')!==order) {
      var focused = document.activeElement && document.activeElement.closest && document.activeElement.closest('#compareBrandTitles') && document.activeElement.id;
      group.innerHTML = ordered.map(function (item) {
        return '<button id="compare-title-'+item.id+'" class="compare-brand-title" type="button" data-brand-tab="'+item.id+'" aria-label="Open '+esc(item.name)+' catalogue"><img class="active-brand-logo" src="'+brandLogos[item.id]+'" alt="'+esc(item.name)+'"></button>';
      }).join('');
      group.setAttribute('data-order',order);
      if (focused && node(focused)) node(focused).focus({preventScroll:true});
    }
    group.querySelectorAll('button').forEach(function (button) {
      var chosen = !!state.byBrand[button.getAttribute('data-brand-tab')];
      button.classList.toggle('is-selected',chosen);
      button.classList.toggle('is-unselected',!chosen);
      button.setAttribute('data-selected',String(chosen));
      button.disabled = state.printing!==null;
    });
    document.querySelector('.hub-header').classList.toggle('is-comparing',isCompare);
    document.querySelector('.hub-tabs').hidden = isCompare;
    if (node('activeBrandLogo').getAttribute('src')!==brandLogos[brand]) node('activeBrandLogo').setAttribute('src',brandLogos[brand]);
    node('activeBrandLogo').setAttribute('alt',brandInfo(brand).name);
    tabs.forEach(function (tab) {
      var button = node('tab-'+tab);
      button.hidden = isCompare || tab===brand;
      button.setAttribute('aria-current','false');
      button.tabIndex = button.hidden ? -1 : 0;
    });
    node('activeBrandTitle').setAttribute('aria-label',brandInfo(brand).name);
    node('activeBrandTitle').setAttribute('aria-current',isCompare?'false':'page');
  }
  function syncShared(except) {
    Object.keys(frames).forEach(function (brand) {
      if (brand !== except && frames[brand].ready) sendApply(brand,null,false);
    });
  }
  function setPrinting(brand,busy) {
    if (busy) state.printing = brand;
    else if (state.printing === brand) state.printing = null;
    document.querySelectorAll('.hub-tab,.compare-brand-title,#activeBrandTitle').forEach(function (button) { button.disabled = state.printing !== null; });
    node('hubStatus').textContent = state.printing ? C.printBusyMessage : '';
  }
  function receive(event) {
    var m = event.data;
    if (!m || m.channel !== channel || !brandInfo(m.brand)) return;
    var entry = frames[m.brand];
    if (!entry || event.source !== entry.frame.contentWindow) return;
    if (m.type === 'printing') { setPrinting(m.brand,m.busy === true); return; }
    if (m.type === 'error') {
      if (requests[m.requestId]) { global.clearTimeout(requests[m.requestId]); delete requests[m.requestId]; }
      toast('Please choose this lens in its catalogue and review the summary.'); return;
    }
    if (m.type !== 'ready' && m.type !== 'state') return;
    if (requests[m.requestId]) { global.clearTimeout(requests[m.requestId]); delete requests[m.requestId]; }
    var revision = Number.isInteger(m.selectionRevision) ? m.selectionRevision : 0;
    var valid = m.state && typeof m.state === 'object' && revision >= entry.revision;
    var changed = false;
    if (valid) {
      var option = m.state.selected === true ? D.optionForState(m.brand,m.state) : null;
      var id = option ? option.id : null;
      changed = state.byBrand[m.brand] !== id;
      state.byBrand[m.brand] = id;
      entry.screen = m.state.screen;
      if (m.reason === 'user') {
        var shared = D.normalizeShared(m.state);
        if (JSON.stringify(shared) !== JSON.stringify(state.shared)) { state.shared = shared; syncShared(m.brand); changed = true; }
      }
      syncComparison();
    }
    if (m.type === 'ready') {
      entry.ready = true; entry.frame.style.visibility = '';
      if (entry.pending) { var pending = entry.pending; entry.pending = null; deliverApply(m.brand,pending); }
      else sendApply(m.brand,null,false);
      post(m.brand,{type:'visibility',visible:state.active === m.brand});
      changed = true;
    }
    updateHeader();
    if (changed && state.active === 'compare') renderComparison();
    if (chooser && valid) renderChooser();
  }
  function showTab(id,focusTab) {
    if (tabs.indexOf(id)<0) return;
    if (state.printing) { toast(C.printBusyMessage); return; }
    if (state.active !== 'compare' && frames[state.active]) post(state.active,{type:'visibility',visible:false});
    state.active = id; if (id!=='compare') state.lastBrand = id; node('comparisonSticky').hidden = true;
    tabs.forEach(function (tab) { node('panel-'+tab).hidden = tab!==id; });
    if (id === 'compare') { scanCatalogues(); renderComparison(); }
    else { var entry = ensureFrame(id); if (entry.ready) post(id,{type:'visibility',visible:true}); }
    updateHeader();
    if (focusTab) (id==='compare' ? node('compare-title-'+state.lastBrand) : node('activeBrandTitle')).focus({preventScroll:true});
  }
  function frameValue(shared) {
    if (shared.frame === null) return 'Not added';
    return shared.frameComplimentary ? '<span class="complimentary-stack"><s>'+D.money(shared.frame)+'</s><span>RM0</span></span>' : D.money(shared.frame);
  }
  function comparisonSubtotal(option) {
    // Monitoring is discussed after lens selection. Never hide it in this price.
    return option.price + (state.shared.frameComplimentary ? 0 : state.shared.frame || 0);
  }
  function designExplanation(option) {
    if (option.brand === 'zeiss') return C.explanations.myoactive;
    if (option.brand === 'hoya') return C.explanations[option.productKey === 'miyosmart' ? 'miyosmart' : 'iq'];
    return C.explanations[option.productKey];
  }
  function rowHtml(section,key,label,values,extraClass) {
    return '<tr data-row-key="'+section+'-'+key+'"'+(extraClass?' class="'+extraClass+'"':'')+'><th scope="row">'+label+'</th>'+values.map(function (value) { return '<td>'+value+'</td>'; }).join('')+'</tr>';
  }
  function tableHeaderHtml(options) {
    return '<thead><tr><th scope="col" class="row-heading">Lens</th>'+options.map(function (option,index) {
      var brand = brandInfo(option.brand), f = option.fields;
      return '<th scope="col" class="model-identity-band" data-model-theme="'+esc(modelTheme(option))+'" data-brand="'+brand.id+'" data-option-id="'+esc(option.id)+'"><span class="comparison-brand">'+esc(brand.name)+'</span><span class="comparison-technology">'+esc(f.technology)+'</span><span class="comparison-product-name">'+esc(f.lensDesign.replace(/^(?:Essilor|HOYA|ZEISS)\s+/i,''))+'</span><span class="comparison-style">'+esc(lensStyleName(option))+' · '+esc(f.coating)+'</span><span class="comparison-index">'+esc(f.index)+'</span></th>';
    }).join('')+'</tr></thead>';
  }
  function replacementHtml(option) {
    var f = option.fields;
    var condition = f.warrantyThreshold.replace(/prescription power/gi,'sphere power');
    return '<dl class="replacement-terms"><dt>Period</dt><dd>'+esc(f.warrantyDuration)+'</dd><dt>Based on</dt><dd>Sphere power<small>Sphere is the main lens power, separate from astigmatism.</small></dd><dt>Change</dt><dd>'+esc(condition)+'</dd></dl>';
  }
  function tableHtml(section,caption) {
    var options = state.comparison.map(D.getOption), rows = '';
    if (section === 'practical') {
      rows += rowHtml(section,'tools','<span class="visually-hidden">Lens choices</span>',options.map(function (option,index) {
        return '<div class="option-tools"><button id="change-'+esc(option.id)+'" class="choice-tool" type="button" data-change-index="'+D.brands.findIndex(function (brand) { return brand.id===option.brand; })+'" aria-label="Change '+esc(option.name)+'">Change lens</button></div>';
      }),'comparison-tools-row');
      rows += rowHtml(section,'design-summary','Lens design',options.map(function (option) { return option ? esc(designExplanation(option)) : '—'; }));
      ['coatingBenefit','index'].forEach(function (key) {
        var definition = D.rows.find(function (row) { return row.key === key; });
        rows += rowHtml(section,key,esc(definition.label),options.map(function (option) { return option ? esc(option.fields[key]) : '—'; }));
      });
      rows += rowHtml(section,'replacement','Complimentary lens replacement',options.map(function (option) { return option ? replacementHtml(option) : '—'; }));
      rows += rowHtml(section,'price','Lens',options.map(function (option) { return option ? '<strong>'+D.money(option.price)+'</strong>' : '—'; }),'lens-price-row');
      rows += rowHtml(section,'review',state.shared.frame===null?'Review':'Lens + frame',options.map(function (option) {
        if (!option) return '—'; return (state.shared.frame===null?'':'<div class="comparison-price"><strong>'+D.money(comparisonSubtotal(option))+'</strong><small>Lens + frame</small></div>')+'<button id="review-'+esc(option.id)+'" class="use-lens-button" type="button" data-use-id="'+esc(option.id)+'">'+esc(C.useLensLabel)+'</button>';
      }),'review-row');
    } else {
      D.rows.filter(function (row) { return row.section === section; }).forEach(function (row) {
        rows += rowHtml(section,row.key,esc(row.label),options.map(function (option) { return option ? esc(option.fields[row.key] || D.missingValue) : '—'; }));
      });
    }
    return '<div class="comparison-scroll" data-scroll-section="'+section+'" role="region" tabindex="0" aria-label="'+esc(caption)+'"><span class="scroll-cue" aria-hidden="true">Swipe to compare</span><table class="comparison-table" data-count="'+options.length+'" data-section-table="'+section+'"><caption class="visually-hidden">'+esc(caption)+'</caption>'+tableHeaderHtml(options)+'<tbody>'+rows+'</tbody></table></div>';
  }
  function captureView() {
    var viewport = node('comparisonContent'), sticky = node('comparisonSticky');
    var view = {top:viewport.scrollTop || 0,sections:{},anchor:null};
    var vr = viewport.getBoundingClientRect();
    var top = vr.top + (sticky.hidden ? 0 : sticky.getBoundingClientRect().height);
    node('comparisonBody').querySelectorAll('.comparison-scroll').forEach(function (wrapper) {
      var section = wrapper.getAttribute('data-scroll-section'), wr = wrapper.getBoundingClientRect();
      var saved = {left:wrapper.scrollLeft || 0,ids:[],option:null};
      wrapper.querySelectorAll('th[data-option-id]').forEach(function (cell) {
        var cr = cell.getBoundingClientRect(); saved.ids.push(cell.getAttribute('data-option-id'));
        if (!saved.option && cr.width>0 && cr.right>wr.left+(wrapper.clientLeft||0) && cr.left<wr.left+wrapper.clientWidth) saved.option = {id:cell.getAttribute('data-option-id'),offset:cr.left-wr.left-(wrapper.clientLeft||0)};
      });
      view.sections[section] = saved;
    });
    node('comparisonBody').querySelectorAll('tr[data-row-key]').forEach(function (row) {
      var r = row.getBoundingClientRect();
      if (!view.anchor && r.height>0 && r.bottom>top && r.top<vr.bottom) view.anchor = {key:row.getAttribute('data-row-key'),offset:r.top-vr.top};
    });
    return view;
  }
  function clampScroll(wrapper,value) {
    if (Number.isFinite(wrapper.scrollWidth)) value = Math.min(value,Math.max(0,wrapper.scrollWidth-wrapper.clientWidth));
    return Math.max(0,value);
  }
  function restoreView(view) {
    var viewport = node('comparisonContent');
    viewport.scrollTop = view.top;
    if (view.anchor) {
      var anchor = node('comparisonBody').querySelector('[data-row-key="'+view.anchor.key+'"]');
      if (anchor) {
        var rect = anchor.getBoundingClientRect();
        if (rect.height>0) viewport.scrollTop += rect.top-viewport.getBoundingClientRect().top-view.anchor.offset;
      }
    }
    node('comparisonBody').querySelectorAll('.comparison-scroll').forEach(function (wrapper) {
      var saved = view.sections[wrapper.getAttribute('data-scroll-section')]; if (!saved) return;
      wrapper.scrollLeft = clampScroll(wrapper,saved.left);
      var ids = Array.from(wrapper.querySelectorAll('th[data-option-id]'),function (cell) { return cell.getAttribute('data-option-id'); });
      if (saved.option && JSON.stringify(saved.ids)!==JSON.stringify(ids)) {
        var cell = wrapper.querySelector('th[data-option-id="'+saved.option.id+'"]');
        if (cell) {
          var cr = cell.getBoundingClientRect(), wr = wrapper.getBoundingClientRect();
          if (cr.width>0) wrapper.scrollLeft = clampScroll(wrapper,wrapper.scrollLeft+cr.left-wr.left-(wrapper.clientLeft||0)-saved.option.offset);
        }
      }
    });
  }
  function updateOverflow() {
    node('comparisonBody').querySelectorAll('.comparison-scroll').forEach(function (wrapper) {
      wrapper.classList.toggle('has-overflow',wrapper.scrollWidth>wrapper.clientWidth+1);
    });
  }
  function updateComparisonHeading() {
    var sticky = node('comparisonSticky'), viewport = node('comparisonContent');
    if (state.active !== 'compare' || !state.comparison.length) { sticky.hidden = true; return; }
    var viewRect = viewport.getBoundingClientRect(), active;
    updateOverflow();
    node('comparisonBody').querySelectorAll('table[data-section-table]').forEach(function (table) {
      var head = table.querySelector('thead').getBoundingClientRect(), rect = table.getBoundingClientRect();
      if (head.height>0 && head.top<=viewRect.top && rect.bottom>viewRect.top && rect.width>0) active = {table:table,head:head,rect:rect};
    });
    if (!active) { sticky.hidden = true; return; }
    var wrapper = active.table.closest('.comparison-scroll');
    var wrapRect = wrapper.getBoundingClientRect(), panelRect = node('panel-compare').getBoundingClientRect();
    var wrapLeft = wrapRect.left+(wrapper.clientLeft||0), viewLeft = viewRect.left+(viewport.clientLeft||0);
    var left = Math.max(wrapLeft,viewLeft), right = Math.min(wrapLeft+wrapper.clientWidth,viewLeft+viewport.clientWidth);
    if (right<=left) { sticky.hidden = true; return; }
    sticky.style.left = (left-panelRect.left)+'px'; sticky.style.top = (viewRect.top-panelRect.top)+'px';
    sticky.style.width = (right-left)+'px'; sticky.style.height = Math.min(active.head.height,active.rect.bottom-viewRect.top)+'px';
    var copy = sticky.querySelector('table');
    copy.style.width = active.rect.width+'px';
    copy.style.transform = 'translate('+(active.rect.left-left)+'px,'+Math.min(0,active.rect.bottom-viewRect.top-active.head.height)+'px)';
    sticky.hidden = false;
  }
  function scheduleComparisonHeading() {
    if (headingUpdatePending) return;
    headingUpdatePending = true;
    global.requestAnimationFrame(function () { headingUpdatePending = false; updateComparisonHeading(); });
  }
  function renderComparison(focusId) {
    var view = captureView(), focused = focusId || (document.activeElement && document.activeElement.id);
    node('comparisonBody').querySelectorAll('details[data-section]').forEach(function (detail) { detailsOpen[detail.getAttribute('data-section')] = detail.open; });
    var body = '<div class="comparison-heading"><h2>'+esc(C.compareTitle)+'</h2><p>'+esc(C.compareIntro)+'</p></div>';
    if (state.comparison.length) body += '<div class="comparison-controls"><div class="frame-summary"><span>Frame</span><span>'+frameValue(state.shared)+'</span><button id="openFrame" type="button">'+(state.shared.frame===null?'Add frame':'Edit frame')+'</button></div></div>';
    if (state.comparison.length) {
      body += tableHtml('practical',C.practicalTitle)+
        '<details class="evidence-details" data-section="design"'+(detailsOpen.design?' open':'')+'><summary>'+esc(C.designTitle)+'</summary><div>'+tableHtml('design',C.designTitle)+'</div></details>'+
        '<details class="evidence-details" data-section="evidence"'+(detailsOpen.evidence?' open':'')+'><summary>'+esc(C.evidenceTitle)+'</summary><div>'+tableHtml('evidence',C.evidenceTitle)+'</div></details>';
    } else body += '<div class="comparison-heading"><p>'+esc(C.emptyComparison)+'</p></div>';
    node('comparisonBody').innerHTML = body;
    var sticky = node('comparisonSticky'); sticky.hidden = true;
    sticky.innerHTML = state.comparison.length ? '<table class="comparison-table comparison-sticky-table" data-count="'+state.comparison.length+'">'+tableHeaderHtml(state.comparison.map(D.getOption))+'</table>' : '';
    // The overflow hint occupies space; settle it before restoring the row anchor.
    updateOverflow(); restoreView(view);
    if (focused && node(focused)) node(focused).focus({preventScroll:true});
    scheduleComparisonHeading();
  }
  function choose(index,id) {
    var option = D.getOption(id);
    if (state.printing || !option || !Number.isInteger(index) || !D.brands[index] || D.brands[index].id!==option.brand) return;
    state.byBrand[option.brand] = id; syncComparison(); updateHeader();
    sendApply(option.brand,D.selectionForOption(id),false);
    renderComparison('change-'+id);
  }
  function renderChooser() {
    if (!chooser) return;
    var focusedPick = document.activeElement && document.activeElement.getAttribute && document.activeElement.getAttribute('data-pick-id');
    var brand = D.brands[chooser.index], current = state.byBrand[brand.id];
    node('lensChooserTitle').textContent = brand.name+' · '+(current?'Change lens':'Choose a lens');
    node('lensChooserHelp').textContent = C.chooserHelp;
    node('lensChoices').innerHTML = '<section class="lens-group">'+D.options.filter(function (option) { return option.brand===brand.id; }).map(function (option) {
      return '<button class="lens-option" type="button" data-model-theme="'+esc(modelTheme(option))+'" data-pick-id="'+esc(option.id)+'" aria-pressed="'+String(option.id===current)+'"><span class="lens-option-copy"><strong>'+esc(modelName(option))+'</strong></span><span class="lens-option-price">'+D.money(option.price)+'<small>Lens</small></span></button>';
    }).join('')+'</section>';
    if (focusedPick) {
      var focusedButton = node('lensChoices').querySelector('[data-pick-id="'+focusedPick+'"]');
      if (focusedButton) focusedButton.focus({preventScroll:true});
    }
  }
  function openChooser(index) {
    if (state.printing || !Number.isInteger(index) || !D.brands[index]) return;
    var current = state.byBrand[D.brands[index].id], opener = node('change-'+(current || D.brands[index].id));
    chooser = {index:index,opener:opener && opener.id};
    renderChooser(); node('lensDialog').hidden = false;
    var buttons = Array.from(node('lensChoices').querySelectorAll('button'));
    var target = buttons.find(function (button) { return button.getAttribute('aria-pressed')==='true'; }) || node('lensChooserTitle');
    target.focus({preventScroll:true});
    if (target.scrollIntoView) target.scrollIntoView({block:'nearest'});
  }
  function closeChooser(restoreFocus) {
    var opener = chooser && chooser.opener; chooser = null; node('lensDialog').hidden = true;
    if (restoreFocus!==false && opener && node(opener)) node(opener).focus({preventScroll:true});
  }
  function selectOption(id) {
    if (!chooser || state.printing) return;
    var option = D.getOption(id), index = chooser.index;
    if (!option || option.brand!==D.brands[index].id) return;
    closeChooser(false); choose(index,id);
    node('hubStatus').textContent = option.name+' in comparison';
  }
  function useLens(id) {
    var option = D.getOption(id); if (!option || state.printing) return;
    state.byBrand[option.brand] = id; syncComparison(); showTab(option.brand,false);
    sendApply(option.brand,D.selectionForOption(id),true);
  }
  function frameValues() {
    var raw = node('frameAmount').value, amount = raw==='' || Number(raw)===0 ? null : Number(raw);
    if (amount!==null && (!Number.isFinite(amount) || amount<0 || amount>99999 || !Number.isInteger(amount))) {
      node('frameAmount').setCustomValidity('Enter a whole amount from RM0 to RM99,999.'); return null;
    }
    node('frameAmount').setCustomValidity('');
    return D.normalizeShared(Object.assign({},state.shared,{frame:amount,frameComplimentary:frameDraft.frameComplimentary}));
  }
  function renderFrame() {
    node('frameAmount').value = frameDraft.frame===null ? '' : String(frameDraft.frame);
    node('frameComplimentary').setAttribute('aria-pressed',String(frameDraft.frameComplimentary));
    node('frameComplimentary').textContent = frameDraft.frameComplimentary ? 'Restore frame price' : 'Make frame complimentary';
    node('frameTotal').innerHTML = frameValue(frameDraft);
  }
  function openFrame() {
    frameOpener = node('openFrame') ? 'openFrame' : document.activeElement && document.activeElement.id; frameDraft = D.normalizeShared(state.shared);
    node('frameTitle').textContent = C.frameTitle; node('frameIntro').textContent = C.frameIntro;
    renderFrame(); node('frameDialog').hidden = false; node('frameAmount').focus();
  }
  function closeFrame() {
    node('frameDialog').hidden = true;
    if (frameOpener && node(frameOpener)) node(frameOpener).focus({preventScroll:true});
  }
  function updateFrameDraft() { var value = frameValues(); if (value) { frameDraft = value; renderFrame(); } }
  function toggleFrameComplimentary() {
    var value = frameValues();
    if (!value || value.frame===null) { toast('Enter the frame amount first.'); return; }
    frameDraft = value; frameDraft.frameComplimentary = !frameDraft.frameComplimentary; renderFrame();
  }
  document.querySelector('.hub-tabs').addEventListener('click',function (event) {
    var button = event.target.closest('[data-tab]'); if (button) showTab(button.getAttribute('data-tab'),false);
  });
  document.querySelector('.hub-tabs').addEventListener('keydown',function (event) {
    var current = event.target.closest('[data-tab]'); if (!current || current.hidden) return;
    var visible = tabs.filter(function (id) { return !node('tab-'+id).hidden; });
    var index = visible.indexOf(current.getAttribute('data-tab')), next;
    if (event.key==='ArrowRight') next = (index+1)%visible.length;
    else if (event.key==='ArrowLeft') next = (index+visible.length-1)%visible.length;
    else if (event.key==='Home') next = 0;
    else if (event.key==='End') next = visible.length-1;
    else return;
    event.preventDefault(); showTab(visible[next],true);
  });
  node('compareBrandTitles').addEventListener('click',function (event) {
    var button = event.target.closest('[data-brand-tab]');
    if (button) showTab(button.getAttribute('data-brand-tab'),true);
  });
  node('compareBrandTitles').addEventListener('keydown',function (event) {
    var current = event.target.closest('[data-brand-tab]'); if (!current) return;
    var buttons = Array.from(node('compareBrandTitles').querySelectorAll('button'));
    var index = buttons.indexOf(current), next;
    if (event.key==='ArrowRight') next = (index+1)%buttons.length;
    else if (event.key==='ArrowLeft') next = (index+buttons.length-1)%buttons.length;
    else if (event.key==='Home') next = 0;
    else if (event.key==='End') next = buttons.length-1;
    else return;
    event.preventDefault(); buttons[next].focus({preventScroll:true});
  });
  node('activeBrandTitle').addEventListener('click',function () { showTab(state.lastBrand,false); });
  node('hubInfo').addEventListener('click',function () { if (state.active!=='compare') post(state.active,{type:'open-info'}); });
  node('hubHome').addEventListener('click',function () { if (state.active!=='compare') post(state.active,{type:'go-home'}); });
  node('comparisonBody').addEventListener('click',function (event) {
    var use = event.target.closest('[data-use-id]'), change = event.target.closest('[data-change-index]');
    if (use) useLens(use.getAttribute('data-use-id'));
    else if (change) openChooser(Number(change.getAttribute('data-change-index')));
    else if (event.target.closest('#openFrame')) openFrame();
  });
  node('lensChoices').addEventListener('click',function (event) {
    var pick = event.target.closest('[data-pick-id]'); if (pick && !pick.disabled) selectOption(pick.getAttribute('data-pick-id'));
  });
  node('closeLensChooser').addEventListener('click',closeChooser);
  node('cancelLensChooser').addEventListener('click',closeChooser);
  node('lensDialog').addEventListener('click',function (event) { if (event.target===node('lensDialog')) closeChooser(); });
  node('comparisonContent').addEventListener('scroll',scheduleComparisonHeading,{passive:true,capture:true});
  node('comparisonBody').addEventListener('toggle',scheduleComparisonHeading,true);
  global.addEventListener('resize',scheduleComparisonHeading);
  if (global.visualViewport) global.visualViewport.addEventListener('resize',scheduleComparisonHeading);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleComparisonHeading);
  node('frameAmount').addEventListener('change',updateFrameDraft);
  node('frameAmount').addEventListener('input',function () { node('frameAmount').setCustomValidity(''); });
  node('frameComplimentary').addEventListener('click',toggleFrameComplimentary);
  node('removeFrame').addEventListener('click',function () { frameDraft.frame = null; frameDraft.frameComplimentary = false; renderFrame(); });
  ['closeFrame','cancelFrame'].forEach(function (id) { node(id).addEventListener('click',closeFrame); });
  node('saveFrame').addEventListener('click',function () {
    var value = frameValues(); if (!value) { node('frameAmount').reportValidity(); return; }
    state.shared = value; syncShared(); renderComparison(); closeFrame();
  });
  node('frameDialog').addEventListener('click',function (event) { if (event.target===node('frameDialog')) closeFrame(); });
  document.addEventListener('keydown',function (event) {
    var dialog = !node('lensDialog').hidden ? node('lensDialog') : !node('frameDialog').hidden ? node('frameDialog') : null;
    if (!dialog) return;
    if (event.key==='Escape') { event.preventDefault(); if (chooser) closeChooser(); else closeFrame(); }
    if (event.key==='Tab') {
      var controls = Array.from(dialog.querySelectorAll('button:not(:disabled),input:not(:disabled)'));
      var first = controls[0], last = controls[controls.length-1];
      if (event.shiftKey && document.activeElement===first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement===last) { event.preventDefault(); first.focus(); }
    }
  });
  global.addEventListener('message',receive);
  node('hubTitle').textContent = C.title;
  showTab('zeiss',false);
  global.MaxiviewMyopiaHub = {state:state,showTab:showTab,choose:choose,scanCatalogues:scanCatalogues,useLens:useLens,renderComparison:renderComparison,receive:receive,frames:frames,openFrame:openFrame,openChooser:openChooser,closeChooser:closeChooser,selectOption:selectOption};
})(window);
