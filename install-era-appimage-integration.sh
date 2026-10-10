#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
DIST="$ROOT/dist-appimage"

if [[ "$#" -gt 1 ]]; then
  echo "Uso: $0 [ruta/a/Era-Code.AppImage]" >&2
  exit 2
fi

APPIMAGE="${1:-}"
if [[ -z "$APPIMAGE" ]]; then
  if [[ ! -d "$DIST" ]]; then
    echo "No existe $DIST. Construí primero la AppImage con: npm run dist:appimage" >&2
    exit 2
  fi
  APPIMAGE="$(find "$DIST" -maxdepth 1 -type f -name '*.AppImage' -print -quit)"
fi
if [[ -z "$APPIMAGE" ]]; then
  echo "No encuentro ningún archivo .AppImage en $DIST" >&2
  exit 2
fi
if [[ ! -f "$APPIMAGE" ]]; then
  echo "No encuentro el archivo AppImage: $APPIMAGE" >&2
  exit 2
fi
if ! command -v xdg-mime >/dev/null 2>&1; then
  echo "No encuentro xdg-mime. Instalá las herramientas XDG de tu entorno de escritorio." >&2
  exit 2
fi
APPIMAGE="$(realpath -- "$APPIMAGE")"
chmod +x -- "$APPIMAGE"

APP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons"
mkdir -p "$APP_DIR" "$ICON_DIR"
DESKTOP="$APP_DIR/era-code-appimage.desktop"
ICON="$ICON_DIR/era-code.png"
if [[ -f "$ROOT/app/renderer/icon.png" ]]; then
  install -m 0644 "$ROOT/app/renderer/icon.png" "$ICON"
else
  ICON=""
fi

# Escape characters that have meaning inside a quoted Desktop Entry Exec argument.
ESCAPED_APPIMAGE="$(printf '%s' "$APPIMAGE" | sed \
  -e 's/\\/\\\\/g' \
  -e 's/"/\\"/g' \
  -e 's/`/\\`/g' \
  -e 's/\$/\\$/g' \
  -e 's/%/%%/g')"
if [[ -n "$ICON" ]]; then
  printf '[Desktop Entry]\nType=Application\nName=Era Code\nComment=Era Code launcher\nExec="%s" %%u\nTerminal=false\nIcon=%s\nCategories=Game;Utility;\nMimeType=x-scheme-handler/fluxapp;\nStartupWMClass=era-code-appimage\n' "$ESCAPED_APPIMAGE" "$ICON" > "$DESKTOP"
else
  printf '[Desktop Entry]\nType=Application\nName=Era Code\nComment=Era Code launcher\nExec="%s" %%u\nTerminal=false\nCategories=Game;Utility;\nMimeType=x-scheme-handler/fluxapp;\nStartupWMClass=era-code-appimage\n' "$ESCAPED_APPIMAGE" > "$DESKTOP"
fi
chmod 0644 "$DESKTOP"

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$APP_DIR" >/dev/null 2>&1 || true
fi
if command -v kbuildsycoca6 >/dev/null 2>&1; then
  kbuildsycoca6 --noincremental >/dev/null 2>&1 || true
fi
xdg-mime default era-code-appimage.desktop x-scheme-handler/fluxapp

echo "AppImage registrada: $APPIMAGE"
echo "Manejador fluxapp://: $(xdg-mime query default x-scheme-handler/fluxapp)"
echo "Archivo de escritorio: $DESKTOP"
echo "Para probar el protocolo, usá un enlace ficticio como fluxapp://test; no compartas enlaces OAuth reales."
