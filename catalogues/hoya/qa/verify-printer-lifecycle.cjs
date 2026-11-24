#!/usr/bin/env node
'use strict';

// Exercise the real printer connection/send/status lifecycle using simulated BLE.
// Artwork and physical printing are covered separately; no printer is contacted.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const web = fs.existsSync(path.join(root, 'dist', 'printer.js'))
  ? path.join(root, 'dist') : root;
const statusText = { textContent: '' };
const status = {
  dataset: {},
  querySelector(selector) {
    assert.equal(selector, '.print-status-text');
    return statusText;
  }
};
const buttons = Array.from({ length: 4 }, () => ({ disabled: false }));
const delays = [];
const context = vm.createContext({
  console,
  Uint8Array,
  navigator: {},
  window: {
    setTimeout(callback, milliseconds) {
      delays.push(milliseconds);
      callback();
      return delays.length;
    }
  },
  document: {
    getElementById(id) {
      assert.equal(id, 'printStatus');
      return status;
    },
    querySelectorAll(selector) {
      assert.equal(selector, '#printOverlay .print-action-button');
      return buttons;
    }
  }
});
vm.runInContext(fs.readFileSync(path.join(web, 'printer.js'), 'utf8'), context,
  { filename: path.join(web, 'printer.js') });

// Isolate transport lifecycle from canvas rendering while retaining binary bytes.
const payloadBytes = Array.from({ length: 57 }, (_, index) => (index * 17) & 255);
const payload = String.fromCharCode(...payloadBytes);
context.buildLabelTSPL = () => payload;

let checks = 0;
function check(name, fn) {
  try { fn(); checks++; }
  catch (error) { error.message = name + ': ' + error.message; throw error; }
}
function assertReady(stateName) {
  assert.equal(status.dataset.state, stateName);
  assert.ok(buttons.every(button => button.disabled === false));
}

(async function main() {
  const writes = [];
  const requests = [];
  const serviceRequests = [];
  let connections = 0;
  let disconnects = 0;
  let notificationAttempts = 0;
  const characteristic = {
    properties: { writeWithoutResponse: true },
    async writeValueWithoutResponse(chunk) {
      assert.equal(status.dataset.state, 'busy');
      assert.ok(buttons.every(button => button.disabled === true));
      writes.push(Array.from(chunk));
    }
  };
  const service = {
    async getCharacteristic(uuid) {
      if (uuid === context.D520_WRITE_UUID) return characteristic;
      assert.equal(uuid, context.D520_NOTIFY_UUID);
      return {
        async startNotifications() {
          notificationAttempts++;
          throw new Error('Optional notifications unavailable');
        }
      };
    }
  };
  const gatt = {
    connected: false,
    async connect() { connections++; this.connected = true; return this; },
    async getPrimaryService(uuid) {
      serviceRequests.push(uuid);
      assert.equal(uuid, context.D520_SERVICE_UUID);
      return service;
    },
    disconnect() { disconnects++; this.connected = false; }
  };
  context.navigator.bluetooth = {
    async requestDevice(options) { requests.push(options); return { gatt }; }
  };

  await context.printToD520('quotation');
  check('Successful send tolerates unavailable optional notifications and cleans up', () => {
    assertReady('success');
    assert.equal(statusText.textContent, 'Quotation sent to D520BT-Z');
    assert.equal(disconnects, 1);
    assert.equal(gatt.connected, false);
    assert.equal(notificationAttempts, 1);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].optionalServices[0], context.D520_SERVICE_UUID);
    assert.equal(serviceRequests[0], context.D520_SERVICE_UUID);
  });
  check('Actual send preserves binary bytes, 20-byte chunks and 35 ms pacing', () => {
    assert.deepEqual(writes.map(chunk => chunk.length), [20, 20, 17]);
    assert.deepEqual(writes.flat(), payloadBytes);
    assert.deepEqual(delays, [35, 35, 35, 1000]);
  });

  await context.printToD520('booklet');
  check('Repeated print reconnects the cached device without reopening the chooser', () => {
    assertReady('success');
    assert.equal(statusText.textContent, 'Booklet label sent to D520BT-Z');
    assert.equal(requests.length, 1);
    assert.equal(connections, 2);
    assert.equal(disconnects, 2);
    assert.equal(notificationAttempts, 2);
    assert.deepEqual(writes.slice(3).flat(), payloadBytes);
  });

  characteristic.writeValueWithoutResponse = async () => {
    throw new Error('Disconnected mid-transfer');
  };
  await context.printToD520('warranty');
  check('Transfer failure shows an error, disconnects and restores print controls', () => {
    assertReady('error');
    assert.equal(statusText.textContent, 'Print failed: Disconnected mid-transfer');
    assert.equal(gatt.connected, false);
    assert.equal(connections, 3);
    assert.equal(disconnects, 3);
  });

  context.labelPrinterDevice = null;
  context.navigator.bluetooth.requestDevice = async () => {
    throw new Error('User cancelled');
  };
  await context.printToD520('quotation');
  check('Chooser cancellation shows an error and restores print controls', () => {
    assertReady('error');
    assert.equal(statusText.textContent, 'Print failed: User cancelled');
    assert.equal(disconnects, 3);
  });

  context.navigator.bluetooth = undefined;
  await context.printToD520('quotation');
  check('Unavailable Bluetooth shows the supported-browser guidance and restores controls', () => {
    assertReady('error');
    assert.match(statusText.textContent, /Open this catalogue in Bluefy\/WebBLE on iPad/);
    assert.equal(disconnects, 3);
  });

  console.log(JSON.stringify({
    passed: checks,
    failed: 0,
    simulatedBluetooth: true,
    physicalPrintTested: false,
    notes: 'Real printer lifecycle functions tested with simulated BLE; canvas artwork and physical printing are outside this test.'
  }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
