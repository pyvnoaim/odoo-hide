#!/bin/sh
# ./release.sh build             -> ../odoo-hide-<version>.zip, upload it to addons.mozilla.org (and Chrome)
# ./release.sh publish <signed>  -> GitHub release + updates.json entry, Firefox/Zen users update within a day
set -e
cd "$(dirname "$0")"
v=$(python3 -c "import json; print(json.load(open('manifest.json'))['version'])")

case "$1" in
  build)
    rm -f "../odoo-hide-$v.zip"
    zip -q "../odoo-hide-$v.zip" manifest.json nav.js content.js popup.html popup.js icon.png
    echo "built ../odoo-hide-$v.zip" ;;
  publish)
    [ -f "$2" ] || { echo "usage: ./release.sh publish path/to/signed.xpi"; exit 1; }
    tmp=$(mktemp -d); cp "$2" "$tmp/odoo-hide.xpi"
    gh release create "v$v" "$tmp/odoo-hide.xpi" --title "v$v" --notes "Signed Firefox/Zen build"
    python3 - "$v" <<'PY'
import json, sys
v = sys.argv[1]
d = json.load(open('updates.json'))
d['addons']['odoo-hide@digisoolut.co']['updates'].append({
    'version': v,
    'update_link': f'https://github.com/pyvnoaim/odoo-hide/releases/download/v{v}/odoo-hide.xpi'})
json.dump(d, open('updates.json', 'w'), indent=2)
PY
    git add updates.json && git commit -qm "Release v$v" && git push -q
    echo "published v$v" ;;
  *) sed -n '2,3p' "$0" ;;
esac
