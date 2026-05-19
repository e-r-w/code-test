#!/bin/sh
set -eu

if [ -d apps/mobile/ios ]; then
  (
    echo "Cleaning ios..."
    cd apps/mobile/ios
    pod cache clean --all
    rm -rf ~/Library/Developer/Xcode/DerivedData/* || true
  )
fi

echo "Expiring directories..."
cd apps/mobile
rm -rf ios android Pods .expo node_modules/.cache
