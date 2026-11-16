#!/bin/sh
# Package this directory into talk2pc-bridge.kwinscript (a zip with
# metadata.json at the root, contents/code/main.js underneath, plus LICENSE).
set -eu
cd "$(dirname "$0")"
rm -f talk2pc-bridge.kwinscript
zip -q -X talk2pc-bridge.kwinscript metadata.json contents/code/main.js LICENSE
echo "wrote talk2pc-bridge.kwinscript ($(wc -c < talk2pc-bridge.kwinscript) bytes)"
