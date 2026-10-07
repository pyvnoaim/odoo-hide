const $ = id => document.getElementById(id);

chrome.storage.local.get(['apps', 'hidden'], ({ apps = [], hidden = [] }) => {
  if (!apps.length) return;
  $('empty').remove();

  const save = () => {
    chrome.storage.local.set({ hidden });
    $('count').textContent = hidden.length ? `${hidden.length} hidden` : '';
    $('all').hidden = !hidden.length;
  };

  for (const [id, name, icon] of apps) {
    const tile = $('grid').appendChild(document.createElement('div'));
    tile.className = 'app';
    tile.title = name;
    tile.classList.toggle('off', hidden.includes(id));
    if (icon) tile.appendChild(document.createElement('img')).src = icon;
    tile.appendChild(document.createElement('span')).textContent = name;
    tile.onclick = () => {
      hidden = tile.classList.toggle('off') ? [...hidden, id] : hidden.filter(h => h !== id);
      save();
    };
  }

  $('all').onclick = () => {
    hidden = [];
    document.querySelectorAll('.app.off').forEach(t => t.classList.remove('off'));
    save();
  };

  save();
});
