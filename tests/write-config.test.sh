#!/bin/bash
# Proves config.js is generated from GOOGLE_CLIENT_ID or GOOGLE_APP_ID.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
script="$root/scripts/write-config.sh"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

if [[ ! -x "$script" && ! -f "$script" ]]; then
  echo "missing $script"
  exit 1
fi

run() {
  env -u GOOGLE_CLIENT_ID -u GOOGLE_APP_ID "$@"
}

# Unset must fail and must not leave a placeholder config.
if run bash "$script" OUT="$tmp/missing.js"; then
  echo "expected failure when no Google id is set"
  exit 1
fi
if [[ -f "$tmp/missing.js" ]] && grep -q 'YOUR_CLIENT_ID_HERE' "$tmp/missing.js"; then
  echo "placeholder config was written"
  exit 1
fi

run env GOOGLE_APP_ID='app-id.apps.googleusercontent.com' \
  bash "$script" OUT="$tmp/from-app.js"
grep -q 'app-id.apps.googleusercontent.com' "$tmp/from-app.js"
if grep -q 'YOUR_CLIENT_ID_HERE' "$tmp/from-app.js"; then
  echo "placeholder survived APP_ID substitution"
  exit 1
fi

run env GOOGLE_CLIENT_ID='client-id.apps.googleusercontent.com' \
  GOOGLE_APP_ID='app-id.apps.googleusercontent.com' \
  bash "$script" OUT="$tmp/from-client.js"
grep -q 'client-id.apps.googleusercontent.com' "$tmp/from-client.js"
if grep -q 'app-id.apps.googleusercontent.com' "$tmp/from-client.js"; then
  echo "APP_ID overrode CLIENT_ID"
  exit 1
fi

echo "ok"
