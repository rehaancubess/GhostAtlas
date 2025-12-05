# GhostAtlas Custom Icons

This directory contains custom paranormal and ghost-themed icons for the GhostAtlas application.

## Icon Usage

The app primarily uses Material Icons for standard UI elements. Custom icons in this directory are used for:

- App branding and logo
- Special paranormal-themed features
- Custom map markers
- Unique UI elements that need horror theming

## Current Icons

### Material Icons Used in App

The app uses these Material Icons with green theming:

- `Icons.auto_stories` - Stories tab
- `Icons.map` - Map tab  
- `Icons.add_location` - Submit tab
- `Icons.person` - Profile tab
- `Icons.location_on` - Location markers
- `Icons.star` - Ratings
- `Icons.verified` - Verifications
- `Icons.auto_awesome` - AI badge
- `Icons.volume_up` - Audio playback

### Custom Icons Needed

If you want to add custom paranormal icons, create SVG or PNG files here:

1. **ghost_icon.svg** - Custom ghost logo for branding
2. **haunted_marker.svg** - Custom map marker for haunted locations
3. **ghostbuster_badge.svg** - Badge for Ghostbuster Mode
4. **paranormal_activity.svg** - Icon for high activity areas
5. **spirit_orb.svg** - Decorative element for loading states

## Icon Specifications

### SVG Icons (Recommended)
- Format: SVG
- Size: 24x24dp base size
- Color: Use single color (#00FF41 ghost green) or design for theming
- Stroke width: 2px for consistency with Material Icons

### PNG Icons (Alternative)
- Format: PNG with transparency
- Sizes needed:
  - 1x: 24x24px
  - 2x: 48x48px  
  - 3x: 72x72px
- Color space: sRGB

## Using Custom Icons in Flutter

### For SVG Icons:
```dart
// Add flutter_svg package to pubspec.yaml
import 'package:flutter_svg/flutter_svg.dart';

SvgPicture.asset(
  'assets/icons/ghost_icon.svg',
  width: 24,
  height: 24,
  color: GhostAtlasColors.ghostGreen,
)
```

### For PNG Icons:
```dart
Image.asset(
  'assets/icons/ghost_icon.png',
  width: 24,
  height: 24,
  color: GhostAtlasColors.ghostGreen,
)
```

## Icon Resources

Free paranormal/horror icon sources:

- **Material Symbols** - Extended Material icon set
- **Font Awesome** - Has some ghost/halloween icons
- **Noun Project** - Search for "ghost", "paranormal", "haunted"
- **Flaticon** - Horror and halloween icon packs
- **Custom Design** - Use Figma or Adobe Illustrator to create custom icons

## License Considerations

Ensure any icons added to this directory:
- Are properly licensed for commercial use
- Include attribution if required
- Are compatible with the app's license
