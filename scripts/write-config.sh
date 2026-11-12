#!/bin/bash
# Generate config.js from config.example.js by substituting the Google OAuth client id.
#
# Id source (first match wins): GOOGLE_CLIENT_ID, then GOOGLE_APP_ID.
# Output path: OUT environment variable, or an OUT=<path> argument, default config.js.
# Exits non-zero (writing nothing) when no id is available.
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root_dir="$(cd "$script_dir/.." && pwd)"
template="$root_dir/config.example.js"

out=""
for arg in "$@"; do
    case "$arg" in
        OUT=*)
            out="${arg#OUT=}"
            ;;
    esac
done
if [ -z "$out" ] && [ -n "${OUT:-}" ]; then
    out="$OUT"
fi
if [ -z "$out" ]; then
    out="config.js"
fi
case "$out" in
    /*) ;;
    *) out="$(pwd)/$out" ;;
esac

client_id="${GOOGLE_CLIENT_ID:-}"
if [ -z "$client_id" ]; then
    client_id="${GOOGLE_APP_ID:-}"
fi
if [ -z "$client_id" ]; then
    echo "Error: neither GOOGLE_CLIENT_ID nor GOOGLE_APP_ID is set" >&2
    echo "Set one of them (see scripts/write-config.sh) and retry" >&2
    exit 1
fi

if [ ! -f "$template" ]; then
    echo "Error: template not found: $template" >&2
    exit 1
fi

out_dir="$(dirname "$out")"
mkdir -p "$out_dir"
tmp="$(mktemp "$out_dir/.write-config.XXXXXX")"
trap 'rm -f "$tmp"' EXIT

sed "s/YOUR_CLIENT_ID_HERE/$client_id/g" "$template" > "$tmp"

if ! grep -qF "$client_id" "$tmp"; then
    echo "Error: client id was not substituted into $out" >&2
    exit 1
fi
if grep -q 'YOUR_CLIENT_ID_HERE' "$tmp"; then
    echo "Error: placeholder YOUR_CLIENT_ID_HERE still present in $out" >&2
    exit 1
fi

mv -f "$tmp" "$out"
trap - EXIT
echo "config written to $out"
