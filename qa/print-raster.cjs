'use strict';
const assert = require('node:assert/strict');

// Decode the unchanged TSPL mode-0 polarity into a 320 x 480 monochrome label.
function decodeRaster(commands) {
  assert.ok(commands.startsWith('SIZE 40 mm,60 mm\r\nGAP 2 mm,0 mm\r\nDIRECTION 1\r\nREFERENCE 0,0\r\nCLS\r\n'));
  assert.ok(commands.endsWith('PRINT 1,1\r\n'));
  const pixels = new Uint8Array(320 * 480); pixels.fill(255);
  const pattern = /BITMAP (\d+),(\d+),(\d+),(\d+),0,/g;
  let match, segments = 0;
  while ((match = pattern.exec(commands))) {
    const [left, top, width, height] = match.slice(1).map(Number), offset = pattern.lastIndex;
    assert.ok(left >= 0 && top >= 0 && left + width * 8 <= 320 && top + height <= 480);
    assert.equal(commands.slice(offset + width * height, offset + width * height + 2), '\r\n');
    for (let y = 0; y < height; y++) for (let bx = 0; bx < width; bx++) {
      const value = commands.charCodeAt(offset + y * width + bx);
      for (let bit = 0; bit < 8; bit++) pixels[(top + y) * 320 + left + bx * 8 + bit] = value & (128 >> bit) ? 255 : 0;
    }
    pattern.lastIndex = offset + width * height; segments++;
  }
  assert.ok(segments > 0);
  return pixels;
}

function verifyLogoOnlyDelta(beforeCommands, afterCommands) {
  const before = decodeRaster(beforeCommands), after = decodeRaster(afterCommands);
  let minX = 320, minY = 480, maxX = -1, maxY = -1, changed = 0;
  for (let i = 0; i < before.length; i++) if (before[i] !== after[i]) {
    const x = i % 320, y = Math.floor(i / 320);
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y); changed++;
  }
  assert.equal(changed, 48 * 48, 'Exactly the ZEISS logo pixels must invert');
  assert.equal(maxX - minX + 1, 48); assert.equal(maxY - minY + 1, 48);
  let oldInk = 0, newInk = 0;
  for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
    const i = y * 320 + x;
    assert.equal(after[i], 255 - before[i]);
    oldInk += before[i] === 0; newInk += after[i] === 0;
  }
  assert.ok(oldInk > 48 * 48 / 2 && newInk < 48 * 48 / 2, 'New logo must have a white field and black lettering');
  assert.equal(after[minY * 320 + minX], 255);
  return { x: minX, y: minY, width: 48, height: 48, oldInk, newInk, changed };
}
module.exports = { decodeRaster, verifyLogoOnlyDelta };
