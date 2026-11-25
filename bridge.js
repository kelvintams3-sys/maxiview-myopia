(function (global) {
  'use strict';
  var script = document.currentScript, brand = script && script.getAttribute('data-brand');
  if (['stellest','hoya','zeiss'].indexOf(brand)<0) return;
  // R1.20: retain R1.15's complete Bluetooth setup, including notifications,
  // and use its native write methods. Bound setup waits only; cross-window
  // Bluefy writes copy each packet into the Bluetooth owner's buffer realm.
  var connection = installConnectionGuard();
  if (global.parent === global) {
    var standalonePrint = global.printToD520, standaloneBusy = false;
    global.printToD520 = async function () {
      if (standaloneBusy) return;
      standaloneBusy = true; connection.begin();
      try { return await standalonePrint.apply(this,arguments); }
      finally { connection.finish(); standaloneBusy = false; }
    };
    return;
  }
  function installConnectionGuard() {
    var active = null;
    function bluetoothProvider() {
      var navigator = global.navigator || {};
      var ipadBrowser = /Bluefy|iPad|iPhone|iPod/i.test(navigator.userAgent || '') ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      // Bluefy's native callbacks must return to the window that owns its BLE
      // objects. Embedded iPad catalogues use the main page's provider, while
      // retaining the original device/service/notification/write sequence.
      if (ipadBrowser && global.parent !== global) {
        try {
          var owner = global.top;
          if (owner && owner.navigator && owner.navigator.bluetooth) return {bluetooth:owner.navigator.bluetooth,owner:owner};
        } catch (ignore) {} // A local-file/foreign frame may not share its top window.
      }
      return {bluetooth:navigator.bluetooth,owner:global};
    }
    function ownerBufferWrites(characteristic,owner) {
      if (owner === global) return characteristic;
      var channel = {properties:characteristic.properties};
      ['writeValueWithoutResponse','writeValue'].forEach(function (method) {
        if (typeof characteristic[method] !== 'function') return;
        channel[method] = function (bytes) {
          // Bluefy may validate ArrayBuffer/View using its own window's
          // constructors. Preserve just this view's bytes (including offsets),
          // then pass an exact-sized ArrayBuffer created in that same window.
          var view = global.ArrayBuffer.isView(bytes) ?
            new global.Uint8Array(bytes.buffer,bytes.byteOffset,bytes.byteLength) : new global.Uint8Array(bytes);
          var packet = new owner.Uint8Array(view.byteLength);
          packet.set(view);
          return characteristic[method](packet.buffer);
        };
      });
      return channel;
    }
    function begin() { active = {device:null,cancelled:false}; }
    function finish() { active = null; }
    function status(message) { global.setPrintStatus(message,'busy'); }
    function disconnect(device) {
      try { if (device && device.gatt) device.gatt.disconnect(); } catch (ignore) {}
    }
    function fail(attempt) {
      if (attempt.cancelled) return;
      attempt.cancelled = true;
      if (active !== attempt) return;
      // Disconnect even if .connected is false: a connect may still be pending.
      disconnect(attempt.device);
      if (global.labelPrinterDevice === attempt.device) global.labelPrinterDevice = null;
    }
    function bounded(attempt,operation,delay,message,lateConnect) {
      return new Promise(function (resolve,reject) {
        var settled = false;
        var timer = global.setTimeout(function () {
          settled = true; fail(attempt);
          var error = new Error(message); error.maxiviewBluetoothTimeout = true;
          reject(error);
        },delay);
        var pending;
        try { pending = operation(); } catch (error) { pending = Promise.reject(error); }
        Promise.resolve(pending).then(function (value) {
          if (settled) {
            // A timed-out native connect can resolve later. Never send its label
            // or disconnect a newer retry that owns the same BluetoothDevice.
            if (lateConnect && (!active || active.device !== attempt.device)) disconnect(attempt.device);
            return;
          }
          settled = true; global.clearTimeout(timer); resolve(value);
        },function (error) {
          if (settled) return;
          settled = true; global.clearTimeout(timer); reject(error);
        });
      });
    }
    global.printerChannels = async function () {
      if (!active) begin();
      var attempt = active;
      try {
        var provider = bluetoothProvider(), bluetooth = provider.bluetooth;
        if (!bluetooth) throw new Error('Open this catalogue in Bluefy/WebBLE on iPad to connect the printer.');
        if (!global.labelPrinterDevice) {
          status('Choose your D520BT-Z printer…');
          // Keep the chooser in the original user-gesture call stack, and allow
          // the user as much time as they need to make their selection.
          global.labelPrinterDevice = await bluetooth.requestDevice({
            filters:[{namePrefix:'D520'},{namePrefix:'D520BT'},{namePrefix:'D520BT-Z'},{namePrefix:'D'}],
            optionalServices:[global.D520_SERVICE_UUID]
          });
        }
        attempt.device = global.labelPrinterDevice;
        if (!attempt.device || !attempt.device.gatt) throw new Error('The selected printer cannot connect. Choose D520BT-Z and try again.');
        var gatt = attempt.device.gatt;
        status('Connecting to ' + (attempt.device.name || 'D520BT-Z') + '…');
        var server = gatt.connected ? gatt : await bounded(attempt,function () { return gatt.connect(); },20000,
          'Printer connection timed out. Bring the printer closer, then tap Print to choose it again.',true);
        status('Printer connected. Preparing label printing…');
        var service = await bounded(attempt,function () { return server.getPrimaryService(global.D520_SERVICE_UUID); },10000,
          'Printer connected, but did not finish preparing. Restart the printer, then tap Print again.');
        var characteristic = await bounded(attempt,function () { return service.getCharacteristic(global.D520_WRITE_UUID); },8000,
          'Printer connected, but the printing channel did not respond. Restart the printer, then tap Print again.');
        // R1.15 awaits FF03 activation before any FF02 writes. R1.19 removed
        // it and the user reported 100% sent with no physical output. Restore
        // the baseline order even though no notification payload is consumed.
        status('Printer connected. Activating printing…');
        try {
          var notify = await bounded(attempt,function () { return service.getCharacteristic(global.D520_NOTIFY_UUID); },8000,
            'Printer activation timed out. No label was sent. Restart the printer, then tap Print again.');
          await bounded(attempt,function () { return notify.startNotifications(); },8000,
            'Printer activation timed out. No label was sent. Restart the printer, then tap Print again.');
        } catch (error) {
          // The baseline tolerates a rejected optional notification operation.
          // A timeout cancels this attempt, so it must never continue to write.
          if (error && error.maxiviewBluetoothTimeout) throw error;
        }
        status('Printer ready. Sending label…');
        return ownerBufferWrites(characteristic,provider.owner);
      } catch (error) { fail(attempt); throw error; }
    };
    return {begin:begin,finish:finish};
  }
  var channel = 'MAXIVIEW_MYOPIA_V1', applying = false, printing = false, visible = true, lastScroll = 0;
  var selected = false, selectionRevision = 0;
  var own = function (object,key) { return Object.prototype.hasOwnProperty.call(object,key); };
  function state() { return global.state; }
  function syncSelection() {
    if (brand==='hoya' && typeof global.hasCompleteSelection==='function') selected = global.hasCompleteSelection();
  }
  function snapshot() {
    syncSelection();
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
    syncSelection();
    document.documentElement.setAttribute('data-hub-selected',String(selected));
    var header = document.querySelector('.topbar');
    if (header) { header.hidden = true; header.style.display = 'none'; }
    if (brand==='stellest') document.body.style.setProperty('grid-template-rows','minmax(0,1fr) auto');
    if (!selected && !(brand==='hoya' && typeof global.hasCompleteSelection==='function')) {
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
    global[name] = function () { selected = true; var result = original.apply(this,arguments); syncSelection(); return result; };
  });
  var originalSummary = global.openSummary;
  global.openSummary = function () { if (selected) return originalSummary.apply(this,arguments); };
  var originalPrint = global.printToD520;
  global.printToD520 = async function () {
    if (printing || !selected) return;
    printing = true; connection.begin(); send('printing',{busy:true});
    try { return await originalPrint.apply(this,arguments); }
    finally { connection.finish(); printing = false; send('printing',{busy:false}); }
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
