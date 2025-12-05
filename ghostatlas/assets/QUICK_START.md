# GhostAtlas Assets - Quick Start Guide

This guide helps you quickly understand and use the GhostAtlas asset system.

## 🎯 Current Status

### ✅ What's Working Now
- **Fonts**: Creepster (via Google Fonts) - working perfectly
- **Onboarding Images**: All 5 illustrations present and configured
- **Icons**: Material Icons themed with ghost green color
- **Configuration**: pubspec.yaml properly configured

### 📦 What's Ready to Add (Optional)
- Local Creepster font file (for offline support)
- Custom app icon design
- Additional paranormal-themed icons

## 🚀 Quick Actions

### Using Fonts in Your Code

**Horror Font (Titles)**:
```dart
import 'package:google_fonts/google_fonts.dart';

Text(
  'Spooky Title',
  style: GoogleFonts.creepster(
    fontSize: 24,
    color: GhostAtlasColors.ghostGreen,
  ),
)
```

**Body Font (Content)**:
```dart
Text(
  'Story content here...',
  style: GoogleFonts.roboto(
    fontSize: 16,
    color: GhostAtlasColors.textSecondary,
  ),
)
```

**Using Theme Typography**:
```dart
// Recommended approach - uses pre-configured styles
Text(
  'Spooky Title',
  style: Theme.of(context).textTheme.displayLarge,
)
```

### Using Onboarding Images

```dart
Image.asset(
  'assets/onboarding/ghost_welcome.png',
  width: 300,
  height: 300,
)
```

### Using Icons

**Material Icons (Current)**:
```dart
Icon(
  Icons.auto_stories,
  color: GhostAtlasColors.ghostGreen,
  size: 24,
)
```

**Custom Icons (When Added)**:
```dart
Image.asset(
  'assets/icons/custom_ghost.png',
  width: 24,
  height: 24,
  color: GhostAtlasColors.ghostGreen,
)
```

## 📥 Optional: Add Local Fonts

If you want offline font support or faster loading:

### Automatic (Recommended)
```bash
cd ghostatlas/assets/fonts
./download_fonts.sh
cd ../..
flutter pub get
```

### Manual
1. Visit [Google Fonts - Creepster](https://fonts.google.com/specimen/Creepster)
2. Download the font family
3. Copy `Creepster-Regular.ttf` to `assets/fonts/`
4. Run `flutter pub get`
5. Hot restart your app

## 🎨 Optional: Create Custom App Icon

Follow the comprehensive guide:
```bash
open ghostatlas/assets/icons/APP_ICON_GUIDE.md
```

Quick steps:
1. Design 1024x1024px icon with ghost theme
2. Use black background (#000000)
3. Add green accent (#00FF41)
4. Generate all sizes using icon generator
5. Replace iOS and Android icons

## 📚 Full Documentation

For detailed information, see:

- **Complete Guide**: `assets/ASSETS_README.md`
- **Font Details**: `assets/fonts/README.md`
- **Icon Guide**: `assets/icons/README.md`
- **App Icon**: `assets/icons/APP_ICON_GUIDE.md`
- **Implementation Summary**: `assets/ASSET_IMPLEMENTATION_SUMMARY.md`

## 🔧 Troubleshooting

### Font Not Loading
```bash
flutter clean
flutter pub get
# Then hot restart (not hot reload)
```

### Asset Not Found
1. Check file exists in correct directory
2. Verify path in pubspec.yaml
3. Run `flutter pub get`
4. Hot restart app

### App Size Too Large
- Compress images with TinyPNG
- Use SVG for icons (requires flutter_svg package)
- Consider loading some assets from network

## 💡 Best Practices

1. **Always use theme typography** instead of hardcoding fonts
2. **Precache critical images** in main.dart for better performance
3. **Use Material Icons** for standard UI elements
4. **Reserve custom icons** for unique paranormal features
5. **Test on real devices** to verify asset loading

## 🎃 Horror Theme Colors

Quick reference for consistent theming:

```dart
// Backgrounds
GhostAtlasColors.primaryBackground    // #000000 - Pure black
GhostAtlasColors.secondaryBackground  // #0A0A0A - Near black
GhostAtlasColors.cardBackground       // #121212 - Elevated surfaces

// Accents
GhostAtlasColors.ghostGreen          // #00FF41 - Primary accent
GhostAtlasColors.ghostGreenGlow      // #00FF41 40% - Glow effect

// Text
GhostAtlasColors.textPrimary         // #FFFFFF - White
GhostAtlasColors.textSecondary       // #E0E0E0 - Light gray
GhostAtlasColors.textTertiary        // #999999 - Medium gray
```

## 📞 Need Help?

- Check the full documentation in `assets/ASSETS_README.md`
- Review implementation summary in `assets/ASSET_IMPLEMENTATION_SUMMARY.md`
- Refer to specific guides for fonts, icons, or app icon

---

**Remember**: The app is fully functional with current assets. Local fonts and custom icons are optional enhancements!
