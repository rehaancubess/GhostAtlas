# GhostAtlas App Icon Guide

This guide explains how to create and implement a horror-themed app icon for GhostAtlas.

## Design Concept

The app icon should embody the paranormal investigation theme with these elements:

### Visual Elements
- **Primary**: Ghost silhouette or paranormal symbol
- **Background**: Deep black (#000000) or dark gradient
- **Accent**: Eerie green (#00FF41) glow effect
- **Style**: Minimalist, recognizable at small sizes

### Design Ideas

1. **Ghost Silhouette**
   - Simple white/green ghost shape on black background
   - Subtle green glow around edges
   - Clean, iconic design

2. **Location Pin with Ghost**
   - Map pin shape with ghost inside
   - Combines location and paranormal themes
   - Green outline on black background

3. **Paranormal Detector**
   - EMF meter or radar-style design
   - Green scanning lines or waves
   - Tech meets supernatural aesthetic

4. **Atlas with Ghost**
   - Open book or map with ghost emerging
   - Combines "Atlas" and "Ghost" concepts
   - More detailed, works better at larger sizes

## Icon Sizes Required

### iOS
- 1024x1024px - App Store
- 180x180px - iPhone (3x)
- 120x120px - iPhone (2x)
- 167x167px - iPad Pro
- 152x152px - iPad (2x)
- 76x76px - iPad (1x)

### Android
- 512x512px - Play Store
- 192x192px - xxxhdpi
- 144x144px - xxhdpi
- 96x96px - xhdpi
- 72x72px - hdpi
- 48x48px - mdpi

### Adaptive Icon (Android)
- 432x432px - Foreground layer
- 432x432px - Background layer
- Safe zone: 264x264px center area

## Color Palette

```
Background: #000000 (Pure Black)
Primary: #00FF41 (Ghost Green)
Glow: #00FF41 with 40% opacity
Highlights: #FFFFFF (White)
Shadows: #0A0A0A (Near Black)
```

## Design Tools

### Online Tools (Free)
- **Canva** - Easy icon creator with templates
- **Figma** - Professional design tool (free tier)
- **GIMP** - Free Photoshop alternative

### Icon Generators
- **App Icon Generator** - https://appicon.co/
- **Icon Kitchen** - https://icon.kitchen/
- **MakeAppIcon** - https://makeappicon.com/

### AI Tools
- **DALL-E** - Generate icon concepts
- **Midjourney** - Create horror-themed designs
- **Stable Diffusion** - Free AI image generation

## Implementation Steps

### 1. Design the Icon
Create a 1024x1024px icon with your chosen design

### 2. Generate All Sizes
Use an icon generator tool to create all required sizes

### 3. iOS Implementation
```bash
# Replace icons in:
ghostatlas/ios/Runner/Assets.xcassets/AppIcon.appiconset/

# Update Contents.json with new icon files
```

### 4. Android Implementation
```bash
# Replace icons in:
ghostatlas/android/app/src/main/res/mipmap-*/ic_launcher.png

# For adaptive icons:
ghostatlas/android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml
```

### 5. Update Flutter Configuration
```yaml
# In pubspec.yaml, you can use flutter_launcher_icons package:
dev_dependencies:
  flutter_launcher_icons: ^0.13.1

flutter_launcher_icons:
  android: true
  ios: true
  image_path: "assets/icons/app_icon.png"
  adaptive_icon_background: "#000000"
  adaptive_icon_foreground: "assets/icons/app_icon_foreground.png"
```

## Design Guidelines

### Do's
✅ Keep it simple and recognizable
✅ Use high contrast (green on black)
✅ Test at small sizes (48x48px)
✅ Ensure it works on various backgrounds
✅ Make it unique and memorable
✅ Follow platform guidelines (iOS/Android)

### Don'ts
❌ Don't use too much detail
❌ Avoid text (except single letter)
❌ Don't use photos or complex gradients
❌ Avoid thin lines that disappear at small sizes
❌ Don't copy other app icons
❌ Avoid too many colors

## Testing

Test your icon:
1. View at actual size (48x48px) on device
2. Check on light and dark backgrounds
3. Verify it's distinguishable from other apps
4. Test in app drawer/home screen
5. Check App Store/Play Store preview

## Current Placeholder

The app currently uses Flutter's default icon. Replace it with your custom horror-themed design following this guide.

## Resources

- [iOS Human Interface Guidelines - App Icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Android Icon Design Guidelines](https://developer.android.com/guide/practices/ui_guidelines/icon_design_launcher)
- [Material Design - Product Icons](https://material.io/design/iconography/product-icons.html)
