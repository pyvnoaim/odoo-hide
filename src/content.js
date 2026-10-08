const style = document.documentElement.appendChild(document.createElement('style'));
let active = false; // anything hidden or reordered

// The tile, or its wrapper when Odoo wraps each tile in a grid cell (only direct children of .o_apps get the wrapper rule)
const tile = id => {
  const t = `.o_app[data-menu-xmlid="${CSS.escape(id)}"]`;
  return `${t}, .o_apps > :has(> ${t})`;
};

function apply({ hidden = [], order = [] }) {
  active = !!(hidden.length || order.length);
  // Apps missing from `order` (installed since) keep CSS order 0, so they show first; the popup matches that.
  style.textContent = (hidden.length ? hidden.map(tile).join(',') + '{display:none!important}' : '') +
    order.map((id, i) => `:is(${tile(id)}){order:${i + 1}}`).join('');
}

const load = () => chrome.storage.local.get(['hidden', 'order'], apply);
load();
chrome.storage.onChanged.addListener(c => (c.hidden || c.order) && load());

// Remember the app list for the popup (hidden tiles stay in the DOM, so the list stays complete)
let last = '';
new MutationObserver(() => {
  const apps = [...document.querySelectorAll('.o_app[data-menu-xmlid]')]
    .map(a => [a.dataset.menuXmlid, a.textContent.trim(), a.querySelector('img')?.src]);
  const json = JSON.stringify(apps);
  if (apps.length && json !== last) chrome.storage.local.set({ apps }, () => (last = json));
}).observe(document.documentElement, { childList: true, subtree: true });

// Odoo's own arrow-key navigation walks over hidden tiles and follows DOM order, not the CSS order,
// so while anything is hidden or reordered we take over arrows + Enter and move focus between visible tiles.
// ponytail: replaces Odoo's arrow handling instead of patching it; Odoo's o_focused highlight is not used.
addEventListener('keydown', e => {
  if (!active || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.target.closest?.('input, textarea, [contenteditable]') && !e.target.closest('.o_home_menu')) return;
  const pos = [...document.querySelectorAll('.o_app')]
    .filter(t => t.offsetParent)
    .map(t => ({ t, r: t.getBoundingClientRect() }))
    .sort((a, b) => a.r.top - b.r.top || a.r.left - b.r.left); // screen order
  if (!pos.length) return;
  const tiles = pos.map(p => p.t);
  const focused = document.activeElement.closest?.('.o_app');
  if (e.key === 'Enter') {
    if (!tiles.includes(focused)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    return focused.click();
  }
  if (!e.key.startsWith('Arrow')) return;
  const cols = pos.filter(p => p.r.top === pos[0].r.top).length;
  const current = tiles.indexOf(focused ?? document.querySelector('.o_app.o_focused'));
  e.preventDefault();
  e.stopImmediatePropagation();
  tiles[step(current, e.key, tiles.length, cols)].focus();
}, true);
