# GhostAtlas Assets Guide

This document provides an overview of all assets used in the GhostAtlas application and instructions for managing them.

## Directory Structure

```
assets/
├── fonts/                      # Custom font files
│   ├── Creepster-Regular.ttf  # Horror font for titles (to be added)
│   └── README.md              # Font installation guide
├── icons/                      # Custom icons and graphics
│   ├── APP_ICON_GUIDE.md      # App icon creation guide
│   └── README.md              # Icon usage guide
├── onboarding/                 # Onboarding screen illustrations
│   ├── ghost_welcome.png      # Welcome screen illustration
│   ├── submit_story.png       # Submit feature illustration
│   ├── haunted_map.png        # Map feature illustration
│   ├── ghostbuster.png        # Ghostbuster mode illustration
│   ├── permissions.png        # Permissions screen illustration
│   ├── README.md              # Onboarding assets documentation
│   └── IMPLEMENTATION_SUMMARY.md
└── ASSETS_README.md           # This file
```

## Asset Categories

### 1. Fonts (`assets/fonts/`)

**Purpose**: Custom typography for horror-themed branding

**Current Implementation**:
- Using Google Fonts package for dynamic loading
- Creepster font for horror titles and headings
- Roboto font for body text (included in Flutter)

**Local Font Support**:
- Add `Creepster-Regular.ttf` to `assets/fonts/` for offline support
- See `assets/fonts/README.md` for download instructions
- Already configured in `pubspec.yaml`

**Usage in Code**:
```dart
import 'package:google_fonts/google_fonts.dart';

// Using Google Fonts (current)
Text('Spooky Title', style: GoogleFonts.creepster(fontSize: 24));

// Using local fonts (when added)
Text('Spooky Title', style: TextStyle(fontFamily: 'Creepster', fontSize: 24));
```

### 2. Icons (`assets/icons/`)

**Purpose**: Custom paranormal-themed icons and app branding

**Current Implementation**:
- Using Material Icons for most UI elements
- Custom icons directory prepared for future additions

**Recommended Custom Icons**:
- App icon (1024x1024px for stores)
- Custom map markers
- Paranormal activity indicators
- Ghostbuster badges

**Usage in Code**:
```dart
// Material Icons (current)
Icon(Icons.auto_stories, color: GhostAtlasColors.ghostGreen);

// Custom icons (when added)
Image.asset('assets/icons/ghost_icon.png', width: 24, height: 24);
```

### 3. Onboarding Illustrations (`assets/onboarding/`)

**Purpose**: Atmospheric illustrations for first-time user experience

**Current Assets**:
1. `ghost_welcome.png` - Welcome screen with ghost theme
2. `submit_story.png` - Story submission feature showcase
3. `haunted_map.png` - Map exploration feature
4. `ghostbuster.png` - Ghostbuster mode explanation
5. `permissions.png` - Location permission request

**Specifications**:
- Format: PNG with transparency
- Recommended size: 512x512px or larger
- Color scheme: Dark backgrounds with green accents
- Style: Horror-themed, atmospheric

**Usage in Code**:
```dart
Image.asset(
  'assets/onboarding/ghost_welcome.png',
  width: 300,
  height: 300,
);
```

## Asset Management Best Practices

### Adding New Assets

1. **Place files in appropriate directory**
   ```bash
   # For images
   cp new_image.png ghostatlas/assets/icons/
   
   # For fonts
   cp CustomFont.ttf ghostatlas/assets/fonts/
   ```

2. **Update pubspec.yaml**
   ```yaml
   flutter:
     assets:
       - assets/icons/new_image.png
     fonts:
       - family: CustomFont
         fonts:
           - asset: assets/fonts/CustomFont.ttf
   ```

3. **Run flutter pub get**
   ```bash
   cd ghostatlas
   flutter pub get
   ```

4. **Hot restart the app** (hot reload won't pick up new assets)

### Image Optimization

**Before adding images**:
1. Compress images to reduce app size
2. Use appropriate formats:
   - PNG for images with transparency
   - JPG for photos without transparency
   - SVG for vector graphics (requires flutter_svg package)
3. Provide multiple resolutions if needed:
   ```
   assets/
   ├── image.png          # 1x
   ├── 2.0x/
   │   └── image.png      # 2x
   └── 3.0x/
       └── image.png      # 3x
   ```

**Optimization Tools**:
- TinyPNG - https://tinypng.com/
- ImageOptim (Mac) - https://imageoptim.com/
- Squoosh - https://squoosh.app/

### Font Licensing

**Important**: Ensure all fonts are properly licensed

**Creepster Font**:
- License: Apache License 2.0
- Free for commercial use
- No attribution required
- Source: Google Fonts

**Adding Other Fonts**:
1. Check license compatibility
2. Include license file in assets/fonts/
3. Add attribution if required

## Current Asset Status

### ✅ Completed
- [x] Onboarding illustrations (5 images)
- [x] Asset directory structure
- [x] pubspec.yaml configuration
- [x] Documentation and guides

### ⏳ Pending (Optional)
- [ ] Local Creepster font file (currently using Google Fonts)
- [ ] Custom app icon design
- [ ] Custom paranormal icons
- [ ] Additional resolution variants (@2x, @3x)

## Asset Loading Performance

### Current Strategy
- **Fonts**: Loaded via Google Fonts (cached after first download)
- **Images**: Bundled with app, loaded on demand
- **Icons**: Material Icons (included in Flutter)

### Optimization Tips
1. **Lazy Loading**: Load images only when needed
2. **Caching**: Use `CachedNetworkImage` for remote images
3. **Precaching**: Precache critical images in main.dart:
   ```dart
   await precacheImage(AssetImage('assets/onboarding/ghost_welcome.png'), context);
   ```
4. **Asset Bundles**: Consider splitting assets for large apps

## Troubleshooting

### Asset Not Found Error
```
Error: Unable to load asset: assets/image.png
```

**Solutions**:
1. Check file path in pubspec.yaml
2. Ensure file exists in correct directory
3. Run `flutter clean && flutter pub get`
4. Hot restart (not hot reload)
5. Check for typos in file name

### Font Not Displaying
```
Font family not found: 'Creepster'
```

**Solutions**:
1. Verify font file exists in assets/fonts/
2. Check pubspec.yaml font declaration
3. Ensure font family name matches
4. Run `flutter clean && flutter pub get`
5. For Google Fonts, check internet connection

### Large App Size

**If app size is too large**:
1. Compress images
2. Remove unused assets
3. Use vector graphics (SVG) where possible
4. Consider loading some assets from network
5. Use Flutter's deferred loading for non-critical assets

## Resources

- [Flutter Assets Documentation](https://docs.flutter.dev/development/ui/assets-and-images)
- [Google Fonts Package](https://pub.dev/packages/google_fonts)
- [Flutter SVG Package](https://pub.dev/packages/flutter_svg)
- [Image Optimization Guide](https://docs.flutter.dev/perf/rendering/best-practices#images)

## Contact

For questions about assets or to request new assets, refer to the project documentation or contact the development team.
