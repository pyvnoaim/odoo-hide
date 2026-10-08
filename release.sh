#!/bin/sh
# ./release.sh ship [version]     -> bump (optional), sign at addons.mozilla.org, GitHub release + updates.json, push
#                                    needs WEB_EXT_API_KEY / WEB_EXT_API_SECRET (addons.mozilla.org/developers/addon/api/key/)
# ./release.sh build              -> ../odoo-hide-<version>.zip, for a manual upload to addons.mozilla.org (and Chrome)
# ./release.sh publish <signed>   -> GitHub release + updates.json entry for an .xpi signed by hand
set -e
cd "$(dirname "$0")"
version() { python3 -c "import json; print(json.load(open('src/manifest.json'))['version'])"; }
v=$(version)

publish() {
  tmp=$(mktemp -d); cp "$1" "$tmp/odoo-hide.xpi"
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
  git add src/manifest.json updates.json && git commit -qm "Release v$v" && git push -q
  echo "published v$v"
}

case "$1" in
  ship)
    [ -n "$WEB_EXT_API_KEY" ] && [ -n "$WEB_EXT_API_SECRET" ] || { echo "set WEB_EXT_API_KEY and WEB_EXT_API_SECRET"; exit 1; }
    [ -z "$(git status --porcelain)" ] || { echo "commit or stash your changes first"; exit 1; }
    if [ -n "$2" ]; then
      sed -i '' "s/\"version\": \"$v\"/\"version\": \"$2\"/" src/manifest.json
      v=$(version); [ "$v" = "$2" ] || { echo "version bump failed"; exit 1; }
    fi
    if git rev-parse -q --verify "refs/tags/v$v" >/dev/null || gh release view "v$v" >/dev/null 2>&1; then
      echo "v$v is already released; pass a new version"; git checkout -q src/manifest.json; exit 1
    fi
    out=$(mktemp -d)
    # unlisted = self-distributed: signed automatically, no review queue
    npx --yes web-ext@10.7.0 sign --source-dir src --artifacts-dir "$out" --ignore-files icon.svg --channel unlisted \
      || { git checkout -q src/manifest.json; exit 1; }
    publish "$(ls "$out"/*.xpi)" ;;
  build)
    rm -f "../odoo-hide-$v.zip"
    (cd src && zip -qr "../../odoo-hide-$v.zip" . -x '.*' icon.svg)
    echo "built ../odoo-hide-$v.zip" ;;
  publish)
    [ -f "$2" ] || { echo "usage: ./release.sh publish path/to/signed.xpi"; exit 1; }
    publish "$2" ;;
  *) sed -n '2,6p' "$0" ;;
esac
