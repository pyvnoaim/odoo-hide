const $ = id => document.getElementById(id);

// Firefox only checks updates.json about once a day and has no runtime.requestUpdateCheck, so the popup
// looks itself and links the newer release's page. Not the .xpi itself: an install started from the popup
// (moz-extension origin) is blocked outright, while clicking the .xpi on github.com gets the normal Allow prompt.
// In Chrome runtime.id is not the gecko id, so the lookup throws and no notice shows.
const current = chrome.runtime.getManifest().version;
$('version').textContent = 'v' + current;
fetch('https://raw.githubusercontent.com/pyvnoaim/odoo-hide/main/updates.json')
  .then(r => r.json())
  .then(d => {
    const latest = d.addons[chrome.runtime.id].updates.at(-1);
    if (latest.version.localeCompare(current, undefined, { numeric: true }) <= 0) return;
    $('update').textContent = `Update to v${latest.version}`;
    $('update').href = `https://github.com/pyvnoaim/odoo-hide/releases/tag/v${latest.version}`;
    $('update').hidden = false;
  })
  .catch(() => {}); // offline: no notice

// hidden/order: sync, or what older versions kept locally (moved to sync by the first change)
chrome.storage.local.get(['apps', 'hidden', 'order'], local => chrome.storage.sync.get(['hidden', 'order'], sync => {
  const { apps = [] } = local;
  let { hidden = [], order = [] } = sync.hidden ? sync : local;
  if (!apps.length) return;
  $('empty').textContent = 'Click to hide or show. Drag to reorder.';
  const odooOrder = apps.map(a => a[0]);
  apps.sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0])); // like content.js: apps not in `order` (new ones) first

  const save = (write = true) => {
    if (write) chrome.storage.sync.set({ hidden, order });
    $('count').textContent = hidden.length ? `${hidden.length} hidden` : '';
    $('all').hidden = !hidden.length;
    $('reset').hidden = !order.length;
  };

  const tiles = new Map();
  let dragged;
  for (const [id, name, icon] of apps) {
    // ponytail: div, not <button>: Firefox won't drag a <button>
    const tile = $('grid').appendChild(document.createElement('div'));
    tiles.set(id, tile);
    tile.className = 'app';
    tile.dataset.id = id;
    tile.title = name;
    tile.tabIndex = 0;
    tile.role = 'button';
    tile.draggable = true;
    const toggle = off => {
      tile.classList.toggle('off', off);
      tile.ariaPressed = String(!off); // pressed = shown
    };
    toggle(hidden.includes(id));
    if (icon) tile.appendChild(document.createElement('img')).src = icon;
    tile.appendChild(document.createElement('span')).textContent = name;
    tile.onclick = () => {
      toggle(!tile.classList.contains('off'));
      hidden = tile.classList.contains('off') ? [...hidden, id] : hidden.filter(h => h !== id);
      save();
    };
    tile.onkeydown = e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      tile.click();
    };

    // Drag to reorder: tiles move live while dragging, the order is saved on drop
    tile.ondragstart = e => {
      dragged = tile;
      e.dataTransfer.setData('text/plain', id); // Firefox won't start a drag without data
      tile.classList.add('dragging');
    };
    tile.ondragover = e => {
      e.preventDefault();
      if (!dragged || dragged === tile) return;
      tile.compareDocumentPosition(dragged) & Node.DOCUMENT_POSITION_PRECEDING ? tile.after(dragged) : tile.before(dragged);
    };
    tile.ondrop = e => e.preventDefault(); // else Firefox may open the dragged text
    tile.ondragend = () => {
      tile.classList.remove('dragging');
      dragged = null;
      order = [...$('grid').children].map(t => t.dataset.id);
      save();
    };
  }

  $('all').onclick = () => { // one sync write, not one per tile (sync has a write quota)
    tiles.forEach(t => { t.classList.remove('off'); t.ariaPressed = 'true'; });
    hidden = [];
    save();
  };
  $('reset').onclick = () => {
    order = [];
    odooOrder.forEach(id => $('grid').append(tiles.get(id)));
    save();
  };

  // Only show the counts on open: writing here could upload a new device's empty settings
  // over the real ones before its first sync has arrived.
  save(false);
}));
