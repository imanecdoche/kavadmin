#!/usr/bin/env bash
# ==========================================================
# Install Kavio Edu Desktop Entry to Linux Applications Menu
# ==========================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

APPS_DIR="$HOME/.local/share/applications"
DESKTOP_DIR="$HOME/Desktop"
DESKTOP_FILE="$APPS_DIR/kavio-edu.desktop"

mkdir -p "$APPS_DIR"

# Ensure start script has executable permissions
chmod +x "$SCRIPT_DIR/start-linux.sh"

echo "📝 Membuat desktop entry di $DESKTOP_FILE..."

cat <<EOF > "$DESKTOP_FILE"
[Desktop Entry]
Name=Kavio Edu
Comment=Kavio Edu Management & Invoice Generator
Exec="$SCRIPT_DIR/start-linux.sh"
Icon=$SCRIPT_DIR/public/logobaru.png
Terminal=false
Type=Application
Categories=Office;Education;Finance;
StartupNotify=true
StartupWMClass=kavio-edu
EOF

chmod +x "$DESKTOP_FILE"

# If Desktop folder exists, also copy or symlink there for easy access
if [ -d "$DESKTOP_DIR" ]; then
    cp "$DESKTOP_FILE" "$DESKTOP_DIR/kavio-edu.desktop"
    chmod +x "$DESKTOP_DIR/kavio-edu.desktop"
    echo "📌 Shortcut desktop juga dibuat di $DESKTOP_DIR/kavio-edu.desktop"
fi

# Update desktop database if tool is available
if command -v update-desktop-database > /dev/null 2>&1; then
    update-desktop-database "$APPS_DIR" || true
fi

echo "✅ Berhasil mendaftarkan Kavio Edu ke menu aplikasi Linux!"
echo "Sekarang Anda dapat membuka Kavio Edu langsung dari Menu Aplikasi (App Launcher) atau Desktop."
