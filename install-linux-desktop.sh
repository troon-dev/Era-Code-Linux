#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE="$ROOT/era-code.desktop.in"
DATA_HOME="${XDG_DATA_HOME:-${HOME}/.local/share}"
APPLICATIONS_DIR="$DATA_HOME/applications"
DESKTOP_FILE="$APPLICATIONS_DIR/era-code.desktop"

if [[ ! -f "$TEMPLATE" || ! -x "$ROOT/run-linux.sh" ]]; then
  echo "Required Era files were not found in: $ROOT" >&2
  exit 2
fi

mkdir -p "$APPLICATIONS_DIR"

# Escape the value for sed's replacement part so directories containing '&',
# '|', or backslashes produce a valid desktop entry.
ESCAPED_ROOT="$(printf '%s' "$ROOT" | sed 's/[\\&|]/\\&/g')"
sed "s|@ROOT@|$ESCAPED_ROOT|g" "$TEMPLATE" >"$DESKTOP_FILE"
chmod 644 "$DESKTOP_FILE"

if command -v desktop-file-validate >/dev/null 2>&1; then
  desktop-file-validate "$DESKTOP_FILE"
fi
if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$APPLICATIONS_DIR" >/dev/null 2>&1 || true
fi
if command -v xdg-mime >/dev/null 2>&1; then
  xdg-mime default era-code.desktop x-scheme-handler/fluxapp
fi

echo "Era desktop entry installed at: $DESKTOP_FILE"
echo "You can now open Era from the application menu."
