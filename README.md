# Odoo Hide Apps

Hide the Odoo apps you don't use from the home screen.

## Install (Firefox / Zen)

1. Open **[odoo-hide.xpi](https://github.com/pyvnoaim/odoo-hide/releases/latest/download/odoo-hide.xpi)**.
2. If it only downloads, click the file in the downloads list or drag it into the browser.
3. Click **Add**. It updates itself from then on.

## Use

1. Open the Odoo home screen once, so the extension can read your app list.
2. Click the extension's icon in the toolbar (in Zen it may sit under the puzzle icon; right-click it there → **Pin to Toolbar**).
3. Click an app to hide it; click it again to bring it back. Drag apps to reorder them. **Show all** and **Reset order** undo each.

Works on `datadiorama.digisoolut.co` and `servicedesk.datadiorama.com`. Your choice is saved per browser.

## Release (maintainer)

One-time: create API credentials at [addons.mozilla.org/developers/addon/api/key](https://addons.mozilla.org/developers/addon/api/key/) and put them in `.env` (git-ignored):

```sh
WEB_EXT_API_KEY='user:…'
WEB_EXT_API_SECRET='…'
```

`./release.sh ship 2.6` bumps the version, gets it signed by Mozilla, creates the GitHub release and updates `updates.json`. Installed copies update within a day.

Manual fallback: `./release.sh build`, upload the zip at addons.mozilla.org, then `./release.sh publish <signed .xpi>`.
