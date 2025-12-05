# Google Maps API Setup

## Current Status
⚠️ **Google Maps API key is required for the app to run**

## Error
```
Google Maps SDK for iOS must be initialized via [GMSServices provideAPIKey:...] prior to use
```

## Setup Instructions

### 1. Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps SDK for iOS**
   - **Maps SDK for Android** (if you plan to support Android)
   - **Geocoding API** (for address search)
4. Go to "Credentials" and create an API Key
5. Restrict the key:
   - For iOS: Add your bundle ID (`com.mobil80.ghostatlas` or your actual bundle ID)
   - For Android: Add your package name and SHA-1 certificate fingerprint

### 2. Add API Key to iOS App

Open `ghostatlas/ios/Runner/AppDelegate.swift` and replace:
```swift
GMSServices.provideAPIKey("YOUR_GOOGLE_MAPS_API_KEY_HERE")
```

With your actual API key:
```swift
GMSServices.provideAPIKey("AIza...your-actual-key-here")
```

### 3. Add API Key to Android App (Optional)

If you plan to support Android, edit `ghostatlas/android/app/src/main/AndroidManifest.xml` and add inside the `<application>` tag:

```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_GOOGLE_MAPS_API_KEY_HERE"/>
```

### 4. Rebuild the App

After adding your API key:
```bash
cd ghostatlas
flutter clean
flutter pub get
flutter run
```

## Security Note

⚠️ **Important**: Never commit your API key to version control!

Add this to your `.gitignore`:
```
# API Keys (create a separate config file)
**/api_keys.dart
```

Consider using environment variables or a secure configuration management system for production apps.

## Alternative: Use a Config File

Create `ghostatlas/lib/config/api_keys.dart`:
```dart
class ApiKeys {
  static const String googleMapsApiKey = 'YOUR_KEY_HERE';
}
```

Then update AppDelegate.swift to read from this file (requires additional setup).

## Free Tier Limits

Google Maps offers a free tier with:
- $200 monthly credit
- Approximately 28,000 map loads per month
- More than enough for development and testing

## Need Help?

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Flutter Google Maps Plugin](https://pub.dev/packages/google_maps_flutter)
