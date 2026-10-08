const $ = id => document.getElementById(id);

// Firefox checks updates.json about once a day; opening the popup checks now and offers the update
$('version').textContent = 'v' + chrome.runtime.getManifest().version;
chrome.runtime.onUpdateAvailable.addListener(() => {}); // hold the update while the popup is open, the button applies it
(globalThis.browser ?? chrome).runtime.requestUpdateCheck().then(({ status, version }) => {
  if (status !== 'update_available') return;
  $('update').textContent = `Update to v${version}`;
  $('update').hidden = false;
}, () => {}); // e.g. a temporary install without update_url: just no button
$('update').onclick = () => chrome.runtime.reload();

chrome.storage.local.get(['apps', 'hidden', 'order'], ({ apps = [], hidden = [], order = [] }) => {
  if (!apps.length) return;
  $('empty').textContent = 'Click to hide or show. Drag to reorder.';
  const odooOrder = apps.map(a => a[0]);
  apps.sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0])); // like content.js: apps not in `order` (new ones) first

  const save = () => {
    chrome.storage.local.set({ hidden, order });
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

  $('all').onclick = () => tiles.forEach(t => t.classList.contains('off') && t.click());
  $('reset').onclick = () => {
    order = [];
    odooOrder.forEach(id => $('grid').append(tiles.get(id)));
    save();
  };

  save();
});
