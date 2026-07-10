#!/usr/bin/env bash
# Build production Tailwind CSS (no Node required).
# Uses the official Tailwind standalone CLI.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
VERSION="v3.4.17"
CLI_URL="https://github.com/tailwindlabs/tailwindcss/releases/download/${VERSION}/tailwindcss-linux-x64"
CLI_BIN="${TMPDIR:-/tmp}/tailwindcss-${VERSION}"

if [[ ! -x "$CLI_BIN" ]]; then
  echo "Downloading Tailwind CSS standalone CLI ${VERSION}..."
  curl -sL "$CLI_URL" -o "$CLI_BIN"
  chmod +x "$CLI_BIN"
fi

mkdir -p "$ROOT/public_html/css"
"$CLI_BIN" \
  -i "$ROOT/css-src/input.css" \
  -o "$ROOT/public_html/css/tailwind.min.css" \
  -c "$ROOT/tailwind.config.js" \
  --minify

echo "Built $ROOT/public_html/css/tailwind.min.css ($(wc -c < "$ROOT/public_html/css/tailwind.min.css") bytes)"
