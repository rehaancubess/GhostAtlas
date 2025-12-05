# Location Service Documentation

## Overview

The `LocationService` provides a centralized, user-friendly wrapper around the `geolocator` package for handling all location-related operations in the GhostAtlas app. It manages permissions, GPS availability checks, continuous tracking, and provides clear error messages.

## Features

✅ **Permission Management**: Automatic permission request flow with user-friendly error messages  
✅ **GPS Availability Checks**: Verify location services are enabled before requesting location  
✅ **Current Position**: Get one-time location with high accuracy  
✅ **Continuous Tracking**: Stream location updates with configurable accuracy and distance filters  
✅ **Proximity Detection**: Check if user is within a specified radius of a target location  
✅ **Distance Calculation**: Calculate distance from current location to any target  
✅ **Settings Integration**: Open device location settings or app settings when needed  
✅ **Error Handling**: Custom exceptions with user-friendly messages for all error scenarios

## Requirements Addressed

This implementation addresses the following requirements from the spec:

- **Requirement 1.2**: Capture geographic coordinates with accuracy within 10 meters
- **Requirement 4.1**: Enable Ghostbuster Mode when user is within 50 meters of encounter location
- **Requirement 6.1**: Display encounters sorted by proximity to user's current location
- **Requirement 6.5**: Update user's location in real-time as they move

## Usage

### Basic Usage - Get Current Location

```dart
final locationService = LocationService();

try {
  final LatLng location = await locationService.getCurrentPosition();
  print('Current location: ${location.latitude}, ${location.longitude}');
} on LocationServiceException catch (e) {
  // Show user-friendly error message
  print('Error: ${e.message}');
}

locationService.dispose();
```

### Continuous Location Tracking

```dart
final locationService = LocationService();

// Start tracking
await locationService.startLocationTracking(
  distanceFilter: 10, // Update every 10 meters
);

// Listen to updates
locationService.locationStream.listen(
  (LatLng location) {
    print('Location updated: $location');
  },
  onError: (error) {
    if (error is LocationServiceException) {
      print('Tracking error: ${error.message}');
    }
  },
);

// Stop tracking when done
await locationService.stopLocationTracking();
locationService.dispose();
```

### Check Proximity to Location

```dart
final locationService = LocationService();
final targetLocation = LatLng(37.7749, -122.4194);

try {
  final bool isNearby = await locationService.isWithinRadius(
    targetLocation,
    50, // 50 meters
  );
  
  if (isNearby) {
    print('User is within 50m of target');
  }
} on LocationServiceException catch (e) {
  print('Error: ${e.message}');
}

locationService.dispose();
```

### Handle Permission Errors with UI

```dart
try {
  final location = await locationService.getCurrentPosition();
  // Use location
} on LocationServiceException catch (e) {
  // Show error with option to open settings
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text(e.message),
      action: SnackBarAction(
        label: 'Settings',
        onPressed: () => locationService.openAppSettings(),
      ),
    ),
  );
}
```

## API Reference

### Methods

#### `Future<bool> isLocationServiceEnabled()`
Check if location services are enabled on the device.

#### `Future<LocationPermission> checkPermission()`
Check current location permission status.

#### `Future<LocationPermission> requestPermission()`
Request location permission from user.

#### `Future<bool> ensurePermissions()`
Check and request permissions if needed. Throws `LocationServiceException` if permission denied.

#### `Future<LatLng> getCurrentPosition()`
Get current position with high accuracy (within 10 meters). Throws `LocationServiceException` on failure.

#### `Future<LatLng> getCurrentPositionWithAccuracy(LocationAccuracy accuracy)`
Get current position with custom accuracy setting.

#### `Future<bool> startLocationTracking({LocationAccuracy accuracy, int distanceFilter})`
Start continuous location tracking. Updates sent through `locationStream`.

**Parameters:**
- `accuracy`: GPS accuracy level (default: `LocationAccuracy.high`)
- `distanceFilter`: Minimum distance in meters before update (default: 10)

#### `Future<void> stopLocationTracking()`
Stop continuous location tracking.

#### `Future<bool> isWithinRadius(LatLng targetLocation, double radiusMeters)`
Check if user is within specified radius of target location.

#### `Future<double> getDistanceToLocation(LatLng targetLocation)`
Get distance from current location to target in meters.

#### `Future<bool> openLocationSettings()`
Open device location settings.

#### `Future<bool> openAppSettings()`
Open app settings for permission management.

#### `void dispose()`
Clean up resources. Always call when done using the service.

### Properties

#### `Stream<LatLng> locationStream`
Broadcast stream of location updates during continuous tracking.

## Error Handling

The service throws `LocationServiceException` with user-friendly messages:

- **GPS Disabled**: "Location services are disabled. Please enable GPS in your device settings."
- **Permission Denied**: "Location permission is required to use this feature. Please grant permission in settings."
- **Permission Permanently Denied**: "Location permission is permanently denied. Please enable it in your device settings."
- **GPS Signal Issues**: "Unable to get your current location. Please check your GPS signal."
- **Tracking Interrupted**: "Location tracking interrupted. Please check your GPS."

## Platform Configuration

### Android (AndroidManifest.xml)

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

### iOS (Info.plist)

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>GhostAtlas needs your location to show nearby haunted locations and verify encounters.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>GhostAtlas needs your location to show nearby haunted locations and verify encounters.</string>
```

## Integration in Screens

### Haunted Map Screen
- Uses continuous tracking to update user location on map
- Displays user's current position marker
- Calculates distances to encounters for sorting

### Submit Story Screen
- Gets current location for encounter submission
- Allows manual location selection on map
- Validates location accuracy (within 10m requirement)

### Ghostbuster Mode Screen
- Checks proximity to encounter location (50m radius)
- Validates user is at the location before allowing verification
- Provides real-time distance feedback

## Best Practices

1. **Always dispose**: Call `dispose()` when done to prevent memory leaks
2. **Handle errors**: Always catch `LocationServiceException` and show user-friendly messages
3. **Offer settings**: When permission denied, offer to open settings
4. **Stop tracking**: Stop location tracking when not needed to save battery
5. **Check availability**: Use `isLocationServiceEnabled()` before requesting location
6. **Use appropriate accuracy**: Choose accuracy level based on use case (high for verification, medium for general tracking)

## Testing

The service has been integrated and tested in:
- ✅ Haunted Map Screen (continuous tracking)
- ✅ Submit Story Screen (one-time location)
- ✅ Ghostbuster Mode Screen (proximity detection)

All screens now use the centralized LocationService instead of direct geolocator calls.

## Dependencies

- `geolocator: ^10.1.0`
- `google_maps_flutter: ^2.5.0`

## Future Enhancements

Potential improvements for future versions:
- Background location tracking for notifications
- Geofencing for automatic Ghostbuster Mode activation
- Location history for user's visited haunted locations
- Offline location caching
