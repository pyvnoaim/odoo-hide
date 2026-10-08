# Odoo Hide Apps

Firefox/Zen extension (MV3, no build step, no dependencies) that hides and reorders Odoo home-screen app tiles.

- `src/` is the shipped extension; `release.sh build` zips it (minus `icon.svg`, the source art for `icon.png`).
- `content.js` injects one `<style>` (hide = `display:none`, reorder = CSS `order`), caches the app list into
  `chrome.storage.local.apps` for the popup, and takes over arrow/Enter navigation while anything is hidden or reordered.
- `popup.js` edits `hidden` and `order` (lists of `data-menu-xmlid`s) in `chrome.storage.local`.
- `nav.js` holds the pure arrow-key `step()`.
- Tests: `node test/nav.test.js`, and open `test/content.html` / `test/popup.html` in a browser (stubbed `chrome.storage`,
  fake Odoo DOM), expect `PASS`. Headless: `chrome --headless --allow-file-access-from-files --dump-dom file://$PWD/test/popup.html`.

Gotchas:
- `updates.json` must stay at the repo root on `main`: installed copies poll that exact URL (`update_url` in the manifest).
- The add-on id `odoo-hide@digisoolut.co` must never change, or installs stop updating.
- Firefox won't drag a `<button>`, and won't start a drag without `dataTransfer.setData`; popup tiles are `div role=button`.
- Only the two domains in `manifest.json` `matches` are supported; no other Odoo instances.
