# Odoo Hide Apps

Hide the Odoo apps you don't use from the home screen.

## Install (Firefox / Zen)

1. Open **[odoo-hide.xpi](https://github.com/pyvnoaim/odoo-hide/releases/latest/download/odoo-hide.xpi)**.
2. If it only downloads, click the file in the downloads list or drag it into the browser.
3. Click **Add**. It updates itself from then on.

## Use

1. Open the Odoo home screen once, so the extension can read your app list.
2. Click the extension's icon in the toolbar (in Zen it may sit under the puzzle icon; right-click it there → **Pin to Toolbar**).
3. Click an app to hide it; click it again to bring it back. **Show all** restores everything.

Works on `datadiorama.digisoolut.co` and `servicedesk.datadiorama.com`. Your choice is saved per browser.

## Release (maintainer)

1. Bump `"version"` in `manifest.json`, run `./release.sh build`.
2. Upload the zip at addons.mozilla.org (Upload a New Version), install the signed build.
3. `./release.sh publish <signed .xpi>`
