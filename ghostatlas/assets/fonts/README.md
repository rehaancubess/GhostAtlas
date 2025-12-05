# GhostAtlas Fonts

This directory contains custom font files for the GhostAtlas application.

## Horror Font: Creepster

The app uses **Creepster** font for horror-themed titles and headings.

### Option 1: Using Google Fonts (Current Implementation)

The app currently uses Google Fonts package which downloads fonts dynamically. This is already configured and working.

### Option 2: Using Local Font Files (For Offline Support)

To add local font files for offline support or faster loading:

1. **Download Creepster Font:**
   - Visit [Google Fonts - Creepster](https://fonts.google.com/specimen/Creepster)
   - Click "Download family"
   - Extract the ZIP file

2. **Add Font Files:**
   - Copy `Creepster-Regular.ttf` to this directory (`assets/fonts/`)
   - The pubspec.yaml is already configured to use these files

3. **Font Files Needed:**
   ```
   assets/fonts/
   ├── Creepster-Regular.ttf
   └── README.md (this file)
   ```

### License

Creepster is licensed under the Apache License, Version 2.0.
- Designer: Sideshow
- License: https://fonts.google.com/specimen/Creepster/license

## Body Font: Roboto

Roboto is used for body text and is included by default in Flutter's Material Design package.

## Alternative Horror Fonts

If you want to try different horror fonts, consider these alternatives:

- **Nosifer** - Zombie/horror style
- **Eater** - Dripping horror effect
- **Butcherman** - Bold horror style
- **Metal Mania** - Heavy metal horror aesthetic

To use an alternative font:
1. Download from Google Fonts
2. Add TTF files to this directory
3. Update `ghost_atlas_typography.dart` to reference the new font family
4. Update `pubspec.yaml` fonts section
