(function (global) {
  'use strict';
  // Screen feedback only. The confirmed R1.20 bridge and native printer code
  // retain ownership of every Bluetooth operation and every label byte.
  var originalPrint = global.printToD520, originalStatus = global.setPrintStatus;
  var overlay = document.getElementById('printOverlay');
  if (!overlay || typeof originalPrint !== 'function' || typeof originalStatus !== 'function') return;
  var ids = {quotation:'printQuotationButton',warranty:'printWarrantyButton',booklet:'printBookletButton',extension:'printBiometryExtensionButton'};
  var buttons = {}, active = null, busy = false, percent = 0, outcome = '';
  var progress = document.createElement('span');
  progress.id = 'printButtonProgress'; progress.className = 'print-feedback-progress';
  progress.setAttribute('role','progressbar'); progress.setAttribute('aria-label','Label transfer');
  progress.setAttribute('aria-valuemin','0'); progress.setAttribute('aria-valuemax','100'); progress.hidden = true;
  overlay.appendChild(progress);
  Object.keys(ids).forEach(function (kind) {
    var button = document.getElementById(ids[kind]); if (!button) return;
    var label = kind === 'quotation' ? 'Print Label' : button.textContent.trim();
    button.textContent = ''; button.classList.add('print-feedback-button');
    var fill = document.createElement('span'); fill.className = 'print-button-fill'; fill.setAttribute('aria-hidden','true'); fill.style.width = '0%';
    var text = document.createElement('span'); text.className = 'print-button-label'; text.textContent = label;
    button.appendChild(fill); button.appendChild(text);
    buttons[kind] = {button:button,fill:fill};
  });
  function clearButtons() {
    Object.keys(buttons).forEach(function (kind) {
      var item = buttons[kind]; item.fill.style.width = '0%';
      item.button.classList.remove('is-printing'); item.button.classList.remove('is-print-complete');
      item.button.setAttribute('aria-busy','false'); item.button.removeAttribute('aria-describedby');
    });
  }
  function visibility(state) {
    var status = document.getElementById('printStatus');
    if (status) { status.hidden = state !== 'error' && state !== 'success'; status.style.display = status.hidden ? 'none' : ''; }
  }
  global.setPrintStatus = function (message,state) {
    state = state || 'idle';
    var match = /\b(\d{1,3})\s*%/.exec(String(message));
    if (active && state === 'busy') {
      if (match) {
        percent = Math.max(percent,Math.min(100,Number(match[1])));
        active.fill.style.width = percent + '%';
        progress.setAttribute('aria-valuenow',String(percent));
        progress.setAttribute('aria-valuetext',percent + ' percent sent');
      } else progress.setAttribute('aria-valuetext',String(message).replace(/Sending\s+quotation/ig,'Printing label'));
    }
    // Never display the old transfer sentence or a numeric percentage above
    // the preview. Errors and a concise completion message remain visible.
    var visibleMessage = state === 'success' ? 'Label sent to printer.' :
      state === 'busy' && (/sending/i.test(String(message)) || match) ? 'Printing label…' : message;
    var result = originalStatus.call(this,visibleMessage,state);
    visibility(state);
    if (state === 'idle' && !busy) { clearButtons(); progress.hidden = true; }
    if (active && (state === 'success' || state === 'error')) {
      outcome = state;
      active.fill.style.width = state === 'success' ? '100%' : '0%';
    }
    return result;
  };
  global.printToD520 = async function (kind) {
    if (busy) return;
    if (!buttons[kind]) return originalPrint.apply(this,arguments);
    clearButtons(); active = buttons[kind]; percent = 0; outcome = ''; busy = true;
    active.button.classList.add('is-printing'); active.button.setAttribute('aria-busy','true');
    active.button.setAttribute('aria-describedby',progress.id);
    progress.removeAttribute('aria-valuenow'); progress.setAttribute('aria-valuetext','Preparing label printing'); progress.hidden = false;
    try { return await originalPrint.apply(this,arguments); }
    finally {
      active.button.classList.remove('is-printing'); active.button.setAttribute('aria-busy','false'); active.button.removeAttribute('aria-describedby');
      if (outcome === 'success') active.button.classList.add('is-print-complete');
      else active.fill.style.width = '0%';
      progress.hidden = true; active = null; busy = false;
    }
  };
  visibility('idle');
})(window);
