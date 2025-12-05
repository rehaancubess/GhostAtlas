#!/bin/bash

# GhostAtlas Font Download Script
# This script downloads the Creepster font from Google Fonts CDN

echo "🎃 GhostAtlas Font Downloader 🎃"
echo "================================"
echo ""

# Check if curl is available
if ! command -v curl &> /dev/null; then
    echo "❌ Error: curl is not installed"
    echo "Please install curl and try again"
    exit 1
fi

# Font file details
FONT_FILE="Creepster-Regular.ttf"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "📥 Downloading Creepster font from Google Fonts CDN..."

# First, get the font URL from Google Fonts CSS API
FONT_URL=$(curl -s "https://fonts.googleapis.com/css2?family=Creepster" | grep -o "https://[^)]*\.ttf" | head -n 1)

if [ -z "$FONT_URL" ]; then
    echo "❌ Error: Could not retrieve font URL from Google Fonts"
    exit 1
fi

echo "📦 Font URL: $FONT_URL"

# Download font directly
curl -L "$FONT_URL" -o "$SCRIPT_DIR/$FONT_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Success! Font installed to: $SCRIPT_DIR/$FONT_FILE"
    echo ""
    echo "📝 Next steps:"
    echo "1. The font is already configured in pubspec.yaml"
    echo "2. Run: cd ghostatlas && flutter pub get"
    echo "3. Hot restart your app (not hot reload)"
    echo "4. The app will use local font with offline support"
else
    echo "❌ Error: Failed to download font file"
    exit 1
fi

echo ""
echo "🎃 Font installation complete! 🎃"
