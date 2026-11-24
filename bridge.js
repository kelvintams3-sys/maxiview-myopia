(function (global) {
  'use strict';
  if (global.parent === global) return;
  var script = document.currentScript, brand = script && script.getAttribute('data-brand');
  if (['stellest','hoya','zeiss'].indexOf(brand)<0) return;
  var channel = 'MAXIVIEW_MYOPIA_V1', applying = false, printing = false, visible = true, lastScroll = 0;
  var selected = false, selectionRevision = 0;
  var own = function (object,key) { return Object.prototype.hasOwnProperty.call(object,key); };
  function state() { return global.state; }
  function snapshot() {
    var s = state();
    return {selected:selected,product:s.product,style:s.style,coating:s.coating,frame:s.frame,
      frameComplimentary:s.frameComplimentary===true,followups:{one:s.followups.one===true,two:s.followups.two===true},
      complimentary:s.complimentary===true,screen:s.screen};
  }
  function send(type,extra) {
    global.parent.postMessage(Object.assign({channel:channel,brand:brand,type:type,selectionRevision:selectionRevision},extra || {}),'*');
  }
  function readScroll() {
    var viewport = brand==='stellest' && document.getElementById('catalogueViewport');
    return viewport ? viewport.scrollTop : (global.scrollY || document.documentElement.scrollTop || 0);
  }
  function restoreScroll() {
    var viewport = brand==='stellest' && document.getElementById('catalogueViewport');
    if (viewport) viewport.scrollTop = lastScroll;
    else global.scrollTo({top:lastScroll,behavior:'auto'});
  }
  function rememberScroll() { if (visible && document.documentElement.clientHeight>0) lastScroll = readScroll(); }
  function presentation() {
    document.documentElement.setAttribute('data-hub-selected',String(selected));
    var header = document.querySelector('.topbar');
    if (header) { header.hidden = true; header.style.display = 'none'; }
    if (brand==='stellest') document.body.style.setProperty('grid-template-rows','minmax(0,1fr) auto');
    if (!selected) {
      document.querySelectorAll('.family-build-card,.bundle-option,.option-card,.compare-card').forEach(function (el) {
        el.classList.remove('selected');
        if (el.hasAttribute('aria-pressed')) el.setAttribute('aria-pressed','false');
      });
    }
    document.querySelectorAll('.sticky-total').forEach(function (el) { el.hidden = !selected; el.style.display = selected?'':'none'; });
    var dock = document.getElementById('consultationDock');
    if (dock) { dock.style.display = selected?'':'none'; if (!selected) dock.hidden = true; }
  }
  global.addEventListener('scroll',rememberScroll,true);
  var originalRender = global.render;
  global.render = function () {
    var result = originalRender.apply(this,arguments); presentation();
    if (!applying) send('state',{state:snapshot(),reason:'user'});
    return result;
  };
  var selectionFunctions = brand==='stellest'?['selectBundle','selectCoating','openConfig','switchProduct']:brand==='hoya'?['selectCoatingFor','selectLensStyle']:['selectCoating'];
  selectionFunctions.forEach(function (name) {
    var original = global[name]; if (typeof original!=='function') return;
    global[name] = function () { selected = true; return original.apply(this,arguments); };
  });
  var originalSummary = global.openSummary;
  global.openSummary = function () { if (selected) return originalSummary.apply(this,arguments); };
  var originalPrint = global.printToD520;
  global.printToD520 = async function () {
    if (printing || !selected) return;
    printing = true; send('printing',{busy:true});
    try { return await originalPrint.apply(this,arguments); }
    finally { printing = false; send('printing',{busy:false}); }
  };
  function applyShared(input) {
    if (!input || typeof input!=='object') return;
    var amount = input.frame===null?null:Number(input.frame);
    if (amount!==null && (!Number.isFinite(amount) || amount<0 || amount>99999)) return;
    var s = state(); s.frame = amount===null?null:Math.round(amount);
    s.frameComplimentary = s.frame!==null && input.frameComplimentary===true;
    s.followups = {one:!input.followups || input.followups.one!==false,two:!input.followups || input.followups.two!==false};
    s.complimentary = input.complimentary===true;
  }
  function applySelection(selection) {
    if (!selection) return;
    if (brand==='stellest') {
      if (!own(global.PRODUCTS,selection.product) || !own(global.COATINGS,selection.coating)) throw new Error('Unknown Essilor lens choice');
      selected = true; global.selectBundle(selection.product,selection.coating);
    } else if (brand==='hoya') {
      var data = global.HoyaCatalogueData;
      if (!own(data.products,selection.product) || !own(data.products[selection.product].prices,selection.style) || data.availableCoatings(selection.product,selection.style).indexOf(selection.coating)<0) throw new Error('Unknown HOYA lens choice');
      selected = true; global.applyBuild(selection);
    } else {
      if (!own(global.MyoActiveData.coatings,selection.coating)) throw new Error('Unknown ZEISS lens choice');
      selected = true; global.selectCoating(selection.coating);
    }
  }
  global.addEventListener('message',function (event) {
    var m = event.data;
    if (event.source!==global.parent || !m || m.channel!==channel || m.brand!==brand) return;
    if (m.type==='read-state') { send('state',{state:snapshot(),reason:'snapshot',requestId:m.requestId}); return; }
    if (m.type==='open-info') { global.openInfo(); return; }
    if (m.type==='go-home') { global.goHome(); return; }
    if (m.type==='visibility') {
      visible = m.visible===true;
      if (visible) { restoreScroll(); if (global.requestAnimationFrame) global.requestAnimationFrame(restoreScroll); }
      return;
    }
    if (m.type!=='apply' || printing) return;
    var revision = Number.isInteger(m.selectionRevision)?m.selectionRevision:0;
    if (revision<selectionRevision) return;
    var savedScroll = lastScroll, previousSelected = selected;
    applying = true;
    try {
      applyShared(m.shared); applySelection(m.selection); selectionRevision = revision;
      if (m.summary) { global.openSummary(); lastScroll = 0; }
      else { global.render(); lastScroll = savedScroll; if (visible) restoreScroll(); }
      send('state',{state:snapshot(),reason:'host',requestId:m.requestId});
    } catch (error) {
      selected = previousSelected; presentation(); send('error',{message:error.message,requestId:m.requestId});
    } finally { applying = false; }
  });
  presentation();
  send('ready',{state:snapshot()});
})(window);
