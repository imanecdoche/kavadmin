#!/usr/bin/env bash
# ==========================================================
# Kavio Edu (KavAdmin) - Linux Standalone Launcher Script
# ==========================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# If standalone linux unpacked executable exists, execute it directly
if [ -f "$SCRIPT_DIR/release/linux-unpacked/kavio-edu" ]; then
    echo "🚀 Membuka Kavio Edu Standalone Executable..."
    exec "$SCRIPT_DIR/release/linux-unpacked/kavio-edu" "$@"
fi

# Fallback: Check if dist exists, build if missing and run electron
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo "📦 Membangun build frontend..."
    npm run build
fi

echo "✨ Membuka aplikasi Kavio Edu via Electron..."
exec npx electron . "$@"
