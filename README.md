# Odoo Hide Apps

Hide the Odoo apps you don't use from the home screen.

## Install (Firefox / Zen)

1. Open **[odoo-hide.xpi](https://github.com/pyvnoaim/odoo-hide/releases/latest/download/odoo-hide.xpi)**.
2. If it only downloads, click the file in the downloads list or drag it into the browser.
3. Click **Add**. It updates itself from then on.

## Install (Chrome / Edge / Brave)

1. Download **[odoo-hide-chrome.zip](https://github.com/pyvnoaim/odoo-hide/releases/latest/download/odoo-hide-chrome.zip)** and unzip it somewhere it can stay.
2. Open `chrome://extensions`, turn on **Developer mode** (top right), click **Load unpacked** and pick the unzipped folder.

Chrome doesn't update it automatically: to update, unzip the new release over the same folder and click the reload arrow on the extension's card.

## Use

1. Open the Odoo home screen once, so the extension can read your app list.
2. Click the extension's icon in the toolbar (in Zen it may sit under the puzzle icon; right-click it there → **Pin to Toolbar**).
3. Click an app to hide it; click it again to bring it back. Drag apps to reorder them. **Show all** and **Reset order** undo each.

Works on `datadiorama.digisoolut.co` and `servicedesk.datadiorama.com`. In Firefox your choice syncs to your other computers when you are signed into a Firefox account; in Chrome it is saved per browser.

## Release (maintainer)

One-time: create API credentials at [addons.mozilla.org/developers/addon/api/key](https://addons.mozilla.org/developers/addon/api/key/) and put them in `.env` (git-ignored):

```sh
WEB_EXT_API_KEY='user:…'
WEB_EXT_API_SECRET='…'
```

`./release.sh ship 2.6` bumps the version, gets it signed by Mozilla, creates the GitHub release and updates `updates.json`. Installed copies update within a day.

Manual fallback: `./release.sh build`, upload the zip at addons.mozilla.org, then `./release.sh publish <signed .xpi>`.
