// Example usage of LocationService
// This file demonstrates how to use the LocationService in different scenarios

import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'location_service.dart';

/// Example 1: Get current location once
Future<void> exampleGetCurrentLocation() async {
  final locationService = LocationService();

  try {
    final LatLng currentLocation = await locationService.getCurrentPosition();
    debugPrint(
      'Current location: ${currentLocation.latitude}, ${currentLocation.longitude}',
    );
  } on LocationServiceException catch (e) {
    // Handle user-friendly error message
    debugPrint('Location error: ${e.message}');
    // Show error to user in UI
  }

  locationService.dispose();
}

/// Example 2: Check if user is within radius of a location
Future<void> exampleCheckProximity() async {
  final locationService = LocationService();
  final targetLocation = const LatLng(37.7749, -122.4194); // San Francisco

  try {
    final bool isNearby = await locationService.isWithinRadius(
      targetLocation,
      50, // 50 meters
    );

    if (isNearby) {
      debugPrint('User is within 50m of the target location');
    } else {
      debugPrint('User is too far from the target location');
    }
  } on LocationServiceException catch (e) {
    debugPrint('Error checking proximity: ${e.message}');
  }

  locationService.dispose();
}

/// Example 3: Continuous location tracking
class LocationTrackingExample extends StatefulWidget {
  const LocationTrackingExample({super.key});

  @override
  State<LocationTrackingExample> createState() =>
      _LocationTrackingExampleState();
}

class _LocationTrackingExampleState extends State<LocationTrackingExample> {
  final LocationService _locationService = LocationService();
  LatLng? _currentLocation;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _startTracking();
  }

  @override
  void dispose() {
    _locationService.dispose();
    super.dispose();
  }

  Future<void> _startTracking() async {
    try {
      await _locationService.startLocationTracking(
        distanceFilter: 10, // Update every 10 meters
      );

      // Listen to location updates
      _locationService.locationStream.listen(
        (LatLng location) {
          setState(() {
            _currentLocation = location;
            _errorMessage = null;
          });
        },
        onError: (error) {
          if (error is LocationServiceException) {
            setState(() {
              _errorMessage = error.message;
            });
          }
        },
      );
    } on LocationServiceException catch (e) {
      setState(() {
        _errorMessage = e.message;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Location Tracking')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (_currentLocation != null)
              Text(
                'Lat: ${_currentLocation!.latitude.toStringAsFixed(6)}\n'
                'Lng: ${_currentLocation!.longitude.toStringAsFixed(6)}',
                textAlign: TextAlign.center,
              ),
            if (_errorMessage != null)
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  _errorMessage!,
                  style: const TextStyle(color: Colors.red),
                  textAlign: TextAlign.center,
                ),
              ),
          ],
        ),
      ),
    );
  }
}

/// Example 4: Handle permission errors with UI feedback
class PermissionHandlingExample extends StatefulWidget {
  const PermissionHandlingExample({super.key});

  @override
  State<PermissionHandlingExample> createState() =>
      _PermissionHandlingExampleState();
}

class _PermissionHandlingExampleState extends State<PermissionHandlingExample> {
  final LocationService _locationService = LocationService();

  Future<void> _requestLocation() async {
    try {
      final location = await _locationService.getCurrentPosition();

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Location: ${location.latitude}, ${location.longitude}',
          ),
          backgroundColor: Colors.green,
        ),
      );
    } on LocationServiceException catch (e) {
      if (!mounted) return;

      // Show error with option to open settings
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.message),
          backgroundColor: Colors.red,
          action: SnackBarAction(
            label: 'Settings',
            onPressed: () => _locationService.openAppSettings(),
          ),
          duration: const Duration(seconds: 5),
        ),
      );
    }
  }

  @override
  void dispose() {
    _locationService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Permission Handling')),
      body: Center(
        child: ElevatedButton(
          onPressed: _requestLocation,
          child: const Text('Get Location'),
        ),
      ),
    );
  }
}

/// Example 5: Calculate distance to a location
Future<void> exampleCalculateDistance() async {
  final locationService = LocationService();
  final targetLocation = const LatLng(37.7749, -122.4194);

  try {
    final double distance = await locationService.getDistanceToLocation(
      targetLocation,
    );

    debugPrint('Distance to target: ${distance.toStringAsFixed(2)} meters');

    if (distance < 1000) {
      debugPrint('${distance.round()}m away');
    } else {
      debugPrint('${(distance / 1000).toStringAsFixed(1)}km away');
    }
  } on LocationServiceException catch (e) {
    debugPrint('Error: ${e.message}');
  }

  locationService.dispose();
}

/// Example 6: Check GPS availability before requesting location
Future<void> exampleCheckGPSAvailability() async {
  final locationService = LocationService();

  // Check if location services are enabled
  final bool isEnabled = await locationService.isLocationServiceEnabled();

  if (!isEnabled) {
    debugPrint('GPS is disabled. Opening location settings...');
    await locationService.openLocationSettings();
    return;
  }

  // Check permission status
  final permission = await locationService.checkPermission();
  debugPrint('Current permission: $permission');

  locationService.dispose();
}
