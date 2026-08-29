#!/usr/bin/env bash
# ==========================================================
# Kavio Edu (KavAdmin) - Linux Standalone Launcher Script
# ==========================================================

# Include standard user & nvm/node paths in environment
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node 2>/dev/null | tail -n 1)/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 1. If standalone linux unpacked executable exists, execute it directly
if [ -f "$SCRIPT_DIR/release/linux-unpacked/kavio-edu" ]; then
    exec "$SCRIPT_DIR/release/linux-unpacked/kavio-edu" "$@"
fi

# 2. Ensure frontend production build exists
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    npm run build
fi

# 3. Launch via local electron binary
if [ -f "$SCRIPT_DIR/node_modules/.bin/electron" ]; then
    exec "$SCRIPT_DIR/node_modules/.bin/electron" . "$@"
fi

# 4. Fallback via npx
exec npx electron . "$@"
