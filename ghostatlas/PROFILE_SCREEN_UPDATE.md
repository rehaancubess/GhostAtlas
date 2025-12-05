# Profile Screen Update

## Changes Made

### 1. Removed Unnecessary Items
- ❌ Removed "Notifications" (was showing "coming soon")
- ❌ Removed "Location Services" (was showing "coming soon")
- ❌ Removed "About" dialog

### 2. Added Legal & Support Section
Renamed "SETTINGS" to "LEGAL & SUPPORT" with three new items:

#### Privacy Policy
- Icon: 🛡️ Privacy tip icon
- Subtitle: "How we protect your data"
- Opens dedicated Privacy Policy screen
- Covers: data collection, usage, storage, sharing, user rights

#### Terms of Use
- Icon: 📄 Description icon
- Subtitle: "Terms and conditions"
- Opens dedicated Terms of Use screen
- Covers: user content, AI enhancement, prohibited activities, liability

#### Contact Us
- Icon: ✉️ Email icon
- Subtitle: "Get in touch with support"
- Shows dialog with email: **rehaancubes@gmail.com**
- Email is selectable for easy copying

### 3. New Screens Created

**File**: `ghostatlas/lib/screens/privacy_policy_screen.dart`
- Full privacy policy with sections
- Themed with GhostAtlas colors
- Scrollable content
- Back button to return to profile

**File**: `ghostatlas/lib/screens/terms_of_use_screen.dart`
- Complete terms of use
- 10 sections covering all legal aspects
- Themed consistently
- Scrollable content

## User Experience

### Before
```
SETTINGS
├─ Notifications → "Coming soon..."
├─ Location Services → "Coming soon..."
└─ About → Version info dialog
```

### After
```
LEGAL & SUPPORT
├─ Privacy Policy → Full privacy policy screen
├─ Terms of Use → Full terms screen
└─ Contact Us → Email dialog (rehaancubes@gmail.com)
```

## Next Steps (TODO)

### Make "Your Paranormal Activity" Dynamic
Currently uses mock data. Need to:
1. Create API endpoint to fetch user stats
2. Track user's submitted stories
3. Count verifications made by user
4. Calculate total rating across user's stories
5. Update `_loadUserData()` to call real API

### Implementation Plan
```dart
// Add to ApiService
Future<Map<String, int>> getUserStats(String deviceId) async {
  final response = await _getWithRetry('/api/users/$deviceId/stats');
  return {
    'storiesSubmitted': response['storiesSubmitted'],
    'verifications': response['verifications'],
    'totalRating': response['totalRating'],
  };
}

// Update ProfileTab
Future<void> _loadUserData() async {
  final deviceId = await _deviceIdService.getDeviceId();
  final stats = await _apiService.getUserStats(deviceId);
  setState(() {
    _userStats.addAll(stats);
  });
}
```

## Files Modified
- `ghostatlas/lib/screens/profile_tab.dart` - Updated settings section
- `ghostatlas/lib/screens/privacy_policy_screen.dart` - New file
- `ghostatlas/lib/screens/terms_of_use_screen.dart` - New file

## Testing
- [x] Privacy Policy screen opens and displays correctly
- [x] Terms of Use screen opens and displays correctly
- [x] Contact Us dialog shows email
- [x] Email is selectable in Contact Us dialog
- [x] All screens maintain spooky theme
- [x] Back navigation works properly
