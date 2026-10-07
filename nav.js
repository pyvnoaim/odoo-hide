// Next tile index for an arrow key on a grid of n visible tiles, `cols` wide. i = -1 means nothing focused yet.
function step(i, key, n, cols) {
  if (i < 0) return 0;
  const next = { ArrowLeft: i - 1, ArrowRight: i + 1, ArrowUp: i - cols, ArrowDown: i + cols }[key];
  return next >= 0 && next < n ? next : i;
}

if (typeof module !== 'undefined') module.exports = step;
