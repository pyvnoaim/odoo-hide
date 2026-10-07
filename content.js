const style = document.documentElement.appendChild(document.createElement('style'));
let hiddenCount = 0;

function apply(hidden = []) {
  hiddenCount = hidden.length;
  style.textContent = hidden.length
    ? hidden.map(id => `.o_app[data-menu-xmlid="${CSS.escape(id)}"]`).join(',') + '{display:none!important}'
    : '';
}

chrome.storage.local.get('hidden', r => apply(r.hidden));
chrome.storage.onChanged.addListener(c => c.hidden && apply(c.hidden.newValue));

// Remember the app list for the popup (hidden tiles stay in the DOM, so the list stays complete)
let last = '';
new MutationObserver(() => {
  const apps = [...document.querySelectorAll('.o_app[data-menu-xmlid]')]
    .map(a => [a.dataset.menuXmlid, a.textContent.trim(), a.querySelector('img')?.src]);
  const json = JSON.stringify(apps);
  if (apps.length && json !== last) chrome.storage.local.set({ apps }, () => (last = json));
}).observe(document.documentElement, { childList: true, subtree: true });

// Odoo's own arrow-key navigation still walks over hidden tiles, so while any are hidden
// we take over arrows + Enter and move real focus between the visible tiles.
// ponytail: replaces Odoo's arrow handling instead of patching it; Odoo's o_focused highlight is not used.
addEventListener('keydown', e => {
  if (!hiddenCount || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.target.closest?.('input, textarea, [contenteditable]') && !e.target.closest('.o_home_menu')) return;
  const tiles = [...document.querySelectorAll('.o_app')].filter(t => t.offsetParent);
  if (!tiles.length) return;
  const focused = document.activeElement.closest?.('.o_app');
  if (e.key === 'Enter') {
    if (!tiles.includes(focused)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    return focused.click();
  }
  if (!e.key.startsWith('Arrow')) return;
  const cols = tiles.filter(t => t.offsetTop === tiles[0].offsetTop).length;
  const current = tiles.indexOf(focused ?? document.querySelector('.o_app.o_focused'));
  e.preventDefault();
  e.stopImmediatePropagation();
  tiles[step(current, e.key, tiles.length, cols)].focus();
}, true);
