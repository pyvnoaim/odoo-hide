// node nav.test.js
const assert = require('assert');
const step = require('./nav.js');

// 7 tiles, 3 per row:  0 1 2 / 3 4 5 / 6
assert.equal(step(-1, 'ArrowDown', 7, 3), 0);  // nothing focused -> first tile
assert.equal(step(0, 'ArrowRight', 7, 3), 1);
assert.equal(step(0, 'ArrowLeft', 7, 3), 0);   // clamp at start
assert.equal(step(6, 'ArrowRight', 7, 3), 6);  // clamp at end
assert.equal(step(1, 'ArrowDown', 7, 3), 4);
assert.equal(step(4, 'ArrowDown', 7, 3), 4);   // no tile below in the short last row
assert.equal(step(4, 'ArrowUp', 7, 3), 1);
assert.equal(step(2, 'ArrowRight', 7, 3), 3);  // wraps to next row like reading order
console.log('ok');
