'use strict';
var labelPrinterDevice = null;
var D520_SERVICE_UUID = '0000ff00-0000-1000-8000-00805f9b34fb';
var D520_WRITE_UUID = '0000ff02-0000-1000-8000-00805f9b34fb';
var D520_NOTIFY_UUID = '0000ff03-0000-1000-8000-00805f9b34fb';
var labelArtworkCache = Object.create(null);
var HOYA_LOGO_HEX = '01f003c001fe03e000f0380001f003e007ff83f001f07c0001f003e01fffe1f003f07e0001f003e03ffff0f807e07e0001f003e07f03f8fc07c0ff0001f003e07e01f87c0fc0ff0001f003e0f800fc3e0f81ff8001f003e0f8007c3f1f01ef8001f003e1f0007c1f3e03e78001f0ffe1f0003e0fbe03e7c001fffffff0003e0ffc03c7c01fffffffff003e07f807c3e03fffffffffc03e03f807c3e001f003e1f0003e03f00ffff001f003e1f0003e01f00ffff001f003e1f0007c01f00ffff801f003e0f8007c01f01ffff801f003e0f800fc01f01f00f801f003e07e01f801f03e007c01f003e07f07f801f03e007c01f003e03ffff001f03e007e01f003e01fffe001f07c003e01f003e007ff8001f07c003f01f003c001fe0001e078001f';
function labelCanvas(width, height) {
  var canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  var ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, width, height); ctx.fillStyle = '#000'; ctx.textBaseline = 'top';
  return { canvas: canvas, ctx: ctx };
}
function labelText(ctx, value, x, y, width, size, min, weight) {
  do { ctx.font = (weight || 'normal') + ' ' + size + 'px Arial, sans-serif';
    if (ctx.measureText(value).width <= width || size <= (min || size)) break;
    size--;
  } while (true);
  ctx.textAlign = 'left'; ctx.fillText(value, x, y);
}
function labelParagraph(ctx, text, x, y, width, size, lineHeight, weight) {
  ctx.font = (weight || 'normal') + ' ' + size + 'px Arial, sans-serif'; ctx.textAlign = 'left';
  var line = '';
  text.split(/\s+/).forEach(function (word) {
    var next = line ? line + ' ' + word : word;
    if (line && ctx.measureText(next).width > width) { ctx.fillText(line, x, y); y += lineHeight; line = word; }
    else line = next;
  });
  if (line) { ctx.fillText(line, x, y); y += lineHeight; }
  return y;
}
function drawHoyaLogo(ctx,x,y){
 for(var ly=0;ly<24;ly++)for(var lx=0;lx<96;lx++){
  var i=(ly*12+Math.floor(lx/8))*2;
  if(parseInt(HOYA_LOGO_HEX.slice(i,i+2),16)&(128>>(lx%8)))ctx.fillRect(x+lx,y+ly,1,1);
 }
}
function drawLabelHeader(ctx,landscape){
 var p=currentProduct();
 drawHoyaLogo(ctx,18,16);
 if(landscape){
  labelText(ctx,p.name,128,17,334,30,24,'bold');
  labelText(ctx,DATA.styles[state.style].name+' · 1.59',18,60,444,state.style==='chameleon'?22:18,17,'bold');
 }else{
  labelText(ctx,p.name,18,53,284,30,25,'bold');
  labelText(ctx,DATA.styles[state.style].name+' · 1.59',18,91,284,state.style==='chameleon'?22:17,17,'bold');
 }
 ctx.fillRect(18,landscape?91:121,landscape?444:284,2);
}
function quotationRows() {
  var rows = [{ label: 'Lens pair', amount: coatingPrice(), struck: false }];
  if (frameIncluded()) rows.push({ label: 'Frame', amount: state.frame, struck: state.frameComplimentary });
  if (state.followups.one) rows.push({ label: 'Follow-up 1', amount: 120, struck: state.complimentary });
  if (state.followups.two) rows.push({ label: 'Follow-up 2', amount: 120, struck: state.complimentary });
  return rows;
}
function drawQuotation(){
 var art=labelCanvas(320,480),ctx=art.ctx;
 drawLabelHeader(ctx,false);
 labelText(ctx,DATA.coatings[state.coating].shortName,18,141,284,23,20,'bold');
 labelText(ctx,state.coating==='spark'?'S.P.A.R.K. Coating':'Coating STX',18,170,284,16,16,'normal');
 quotationRows().forEach(function(row,n){
  var y=211+n*36;labelText(ctx,row.label,18,y,165,21,18,'bold');
  var amount=money(row.amount);ctx.textAlign='right';ctx.font='bold 21px Arial, sans-serif';ctx.fillText(amount,302,y);
  if(row.struck){var metrics=ctx.measureText(amount);var middle=y+((metrics.actualBoundingBoxDescent||16)-(metrics.actualBoundingBoxAscent||0))/2;ctx.fillRect(Math.floor(302-metrics.width)-1,Math.round(middle),Math.ceil(metrics.width)+2,2);}
 });
 ctx.fillRect(18,367,284,2);labelText(ctx,'TOTAL',18,392,96,22,22,'bold');
 var total=money(grandTotal()),size=31;
 do{ctx.font='bold '+size+'px Arial, sans-serif';if(ctx.measureText(total).width<=185||size<=22)break;size--;}while(true);
 ctx.textAlign='right';ctx.fillText(total,302,385);labelText(ctx,'MAXIVIEW OPTOMETRIST',18,445,284,14,14,'bold');
 return art.canvas;
}
function drawLandscape(kind){
 var art=labelCanvas(480,320),ctx=art.ctx,w=currentProduct().warranty;
 drawLabelHeader(ctx,true);
 if(kind==='warranty'){
  labelText(ctx,w.months===6?'6-Month Prescription':'1-Year Prescription',18,111,444,29,26,'bold');
  labelText(ctx,'Change Guarantee',18,149,444,29,26,'bold');
  labelParagraph(ctx,w.condition,18,199,444,22,29);
  labelText(ctx,'COMPLIMENTARY REPLACEMENT',18,270,444,22,19,'bold');
 }else{
  ctx.fillRect(232,108,1,160);
  [122,198].forEach(function(y,n){ctx.strokeStyle='#000';ctx.lineWidth=2;ctx.strokeRect(19,y,17,17);labelText(ctx,'Follow-up '+(n+1),45,y-2,172,22,20,'bold');});
  if(kind==='extension'){
   labelParagraph(ctx,'BIOMETRY FOLLOW-UP EXTENSION',252,129,208,24,31,'bold');
  }else{
   labelText(ctx,w.months===6?'6-MONTH':'1-YEAR',252,110,208,25,23,'bold');
   labelText(ctx,'RX GUARANTEE',252,143,208,22,20,'bold');
   labelText(ctx,'SPHERE POWER',252,175,208,16,16,'bold');
   labelText(ctx,'At least '+w.progressionD.toFixed(2)+' D',252,197,208,17,17,'normal');
   labelText(ctx,'more short-sighted',252,217,208,17,17,'normal');
   labelText(ctx,'Within '+w.period,252,238,208,17,17,'normal');
   labelText(ctx,'Complimentary replacement',252,260,208,14,13,'bold');
  }
  ctx.fillRect(18,276,444,1);labelText(ctx,'Further biometry follow-ups: RM120 per visit',18,290,444,18,17,'bold');
 }
 return art.canvas;
}
function quantizeCanvas(canvas) {
  var ctx = canvas.getContext('2d', { willReadFrequently: true }), image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < image.data.length; i += 4) {
    var value = image.data[i] < 160 ? 0 : 255;
    image.data[i] = image.data[i + 1] = image.data[i + 2] = value; image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0); return canvas;
}
function rasterToTSPL(canvas) {
  if (canvas.width !== 320 || canvas.height !== 480) throw new Error('Label raster must be 320 × 480 pixels.');
  var pixels = canvas.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, 320, 480).data;
  var commands = ['SIZE 40 mm,60 mm', 'GAP 2 mm,0 mm', 'DIRECTION 1', 'REFERENCE 0,0', 'CLS'];
  for (var band = 0; band < 480; band += 80) {
    var minX = 320, maxX = -1, minY = 480, maxY = -1;
    for (var y = band; y < band + 80; y++) for (var x = 0; x < 320; x++) {
      if (pixels[(y * 320 + x) * 4] === 0) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
    }
    if (maxX < 0) continue;
    var left = Math.floor(minX / 8) * 8, width = Math.ceil((maxX + 1 - left) / 8), binary = '';
    for (var yy = minY; yy <= maxY; yy++) for (var bx = 0; bx < width; bx++) {
      var bits = 0;
      for (var bit = 0; bit < 8; bit++) {
        var xx = left + bx * 8 + bit;
        if (xx < 320 && pixels[(yy * 320 + xx) * 4] === 0) bits |= 128 >> bit;
      }
      binary += String.fromCharCode(255 - bits);
    }
    commands.push('BITMAP ' + left + ',' + minY + ',' + width + ',' + (maxY - minY + 1) + ',0,' + binary);
  }
  commands.push('PRINT 1,1', ''); return commands.join('\r\n');
}
function labelArtwork(kind) {
  if (['quotation', 'warranty', 'booklet', 'extension'].indexOf(kind) < 0) throw new Error('Unknown label type');
  var key = kind === 'quotation' ? JSON.stringify([kind,state.product,state.style,state.coating,state.frame,state.frameComplimentary,state.followups,state.complimentary]) : JSON.stringify([kind,state.product,state.style]);
  if (labelArtworkCache[kind] && labelArtworkCache[kind].key === key) return labelArtworkCache[kind];
  var previewCanvas = quantizeCanvas(kind === 'quotation' ? drawQuotation() : drawLandscape(kind)), raster = previewCanvas;
  if (kind !== 'quotation') {
    raster = labelCanvas(320, 480).canvas; var ctx = raster.getContext('2d');
    ctx.translate(320, 0); ctx.rotate(Math.PI / 2); ctx.drawImage(previewCanvas, 0, 0);
    quantizeCanvas(raster);
  }
  return labelArtworkCache[kind] = { key: key, preview: previewCanvas.toDataURL('image/png'), tspl: rasterToTSPL(raster), width: previewCanvas.width, height: previewCanvas.height };
}
function buildLabelTSPL(kind) { return labelArtwork(kind).tspl; }
function updatePrintAreas() {
  [['quotation', 'labelPreview'], ['warranty', 'warrantyPreview'], ['booklet', 'bookletPreview'], ['extension', 'biometryExtensionPreview']].forEach(function (item) {
    var art = labelArtwork(item[0]);
    document.getElementById(item[1]).innerHTML = '<img class="print-art ' + (item[0] === 'quotation' ? 'portrait' : 'landscape') + '" src="' + art.preview + '" width="' + art.width + '" height="' + art.height + '" alt="HOYA ' + item[0] + ' label">';
  });
}
function setPrintStatus(message, stateName) {
  var status = document.getElementById('printStatus'); status.dataset.state = stateName || 'idle';
  status.querySelector('.print-status-text').textContent = message;
}
function setPrintButtonsDisabled(disabled) { document.querySelectorAll('#printOverlay .print-action-button').forEach(function (button) { button.disabled = disabled; }); }
function sleep(ms) { return new Promise(function (resolve) { window.setTimeout(resolve, ms); }); }
async function printerChannels() {
  if (!navigator.bluetooth) throw new Error('Open this catalogue in Bluefy/WebBLE on iPad to connect the printer.');
  if (!labelPrinterDevice) labelPrinterDevice = await navigator.bluetooth.requestDevice({
    filters: [{ namePrefix: 'D520' }, { namePrefix: 'D520BT' }, { namePrefix: 'D520BT-Z' }, { namePrefix: 'D' }], optionalServices: [D520_SERVICE_UUID]
  });
  var server = labelPrinterDevice.gatt.connected ? labelPrinterDevice.gatt : await labelPrinterDevice.gatt.connect();
  var service = await server.getPrimaryService(D520_SERVICE_UUID), characteristic = await service.getCharacteristic(D520_WRITE_UUID);
  try { var notify = await service.getCharacteristic(D520_NOTIFY_UUID); await notify.startNotifications(); } catch (ignore) {}
  return characteristic;
}
async function writeChunks(characteristic, text, labelName) {
  var bytes = new Uint8Array(text.length);
  for (var n = 0; n < text.length; n++) bytes[n] = text.charCodeAt(n) & 255;
  for (var i = 0; i < bytes.length; i += 20) {
    var chunk = bytes.slice(i, i + 20);
    if (characteristic.properties.writeWithoutResponse && characteristic.writeValueWithoutResponse) await characteristic.writeValueWithoutResponse(chunk);
    else await characteristic.writeValue(chunk);
    if (i % 400 < 20 || i + 20 >= bytes.length) setPrintStatus('Sending ' + labelName.toLowerCase() + '… ' + Math.min(100, Math.round((i + chunk.length) * 100 / bytes.length)) + '%', 'busy');
    await sleep(35);
  }
}
async function printToD520(kind) {
  var labelName = { quotation: 'Quotation', warranty: 'Guarantee', booklet: 'Booklet label', extension: 'Biometry follow-up extension' }[kind];
  if (!labelName) return;
  setPrintButtonsDisabled(true);
  try {
    var commands = buildLabelTSPL(kind);
    setPrintStatus('Connecting to D520BT-Z…', 'busy');
    var characteristic = await printerChannels(); await writeChunks(characteristic, commands, labelName);
    await sleep(1000); setPrintStatus(labelName + ' sent to D520BT-Z', 'success');
  } catch (error) { setPrintStatus('Print failed: ' + (error && error.message ? error.message : String(error)), 'error'); }
  finally {
    if (labelPrinterDevice && labelPrinterDevice.gatt && labelPrinterDevice.gatt.connected) labelPrinterDevice.gatt.disconnect();
    setPrintButtonsDisabled(false);
  }
}
var HoyaCataloguePrinter = { artwork: labelArtwork, quotationRows: quotationRows, rasterToTSPL: rasterToTSPL };
