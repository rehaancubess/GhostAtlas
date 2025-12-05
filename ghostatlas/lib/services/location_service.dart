import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

/// Service for handling all location-related operations
/// Provides centralized location permission management, GPS checks, and position tracking
class LocationService {
  StreamSubscription<Position>? _positionStreamSubscription;
  final StreamController<LatLng> _locationStreamController =
      StreamController<LatLng>.broadcast();

  /// Stream of user location updates
  Stream<LatLng> get locationStream => _locationStreamController.stream;

  /// Check if location services are enabled on the device
  Future<bool> isLocationServiceEnabled() async {
    try {
      return await Geolocator.isLocationServiceEnabled();
    } catch (e) {
      debugPrint('Error checking location service: $e');
      return false;
    }
  }

  /// Check current location permission status
  Future<LocationPermission> checkPermission() async {
    try {
      return await Geolocator.checkPermission();
    } catch (e) {
      debugPrint('Error checking location permission: $e');
      return LocationPermission.denied;
    }
  }

  /// Request location permission from user
  /// Returns the permission status after request
  Future<LocationPermission> requestPermission() async {
    try {
      return await Geolocator.requestPermission();
    } catch (e) {
      debugPrint('Error requesting location permission: $e');
      return LocationPermission.denied;
    }
  }

  /// Check and request location permissions if needed
  /// Returns true if permission is granted, false otherwise
  /// Throws LocationServiceException with user-friendly message on failure
  Future<bool> ensurePermissions() async {
    // Check if location services are enabled
    final serviceEnabled = await isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw LocationServiceException(
        'Location services are disabled. Please enable GPS in your device settings.',
      );
    }

    // Check permission status
    LocationPermission permission = await checkPermission();

    if (permission == LocationPermission.denied) {
      permission = await requestPermission();
      if (permission == LocationPermission.denied) {
        throw LocationServiceException(
          'Location permission is required to use this feature. Please grant permission in settings.',
        );
      }
    }

    if (permission == LocationPermission.deniedForever) {
      throw LocationServiceException(
        'Location permission is permanently denied. Please enable it in your device settings.',
      );
    }

    return permission == LocationPermission.whileInUse ||
        permission == LocationPermission.always;
  }

  /// Get current position with high accuracy
  /// Throws LocationServiceException on failure
  Future<LatLng> getCurrentPosition() async {
    try {
      await ensurePermissions();

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 10),
      );

      return LatLng(position.latitude, position.longitude);
    } on LocationServiceException {
      rethrow;
    } catch (e) {
      debugPrint('Error getting current position: $e');
      throw LocationServiceException(
        'Unable to get your current location. Please check your GPS signal.',
      );
    }
  }

  /// Get current position with custom accuracy
  /// Throws LocationServiceException on failure
  Future<LatLng> getCurrentPositionWithAccuracy(
    LocationAccuracy accuracy,
  ) async {
    try {
      await ensurePermissions();

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: accuracy,
        timeLimit: const Duration(seconds: 10),
      );

      return LatLng(position.latitude, position.longitude);
    } on LocationServiceException {
      rethrow;
    } catch (e) {
      debugPrint('Error getting current position: $e');
      throw LocationServiceException(
        'Unable to get your current location. Please check your GPS signal.',
      );
    }
  }

  /// Start continuous location tracking
  /// Updates are sent through the locationStream
  /// Returns true if tracking started successfully
  Future<bool> startLocationTracking({
    LocationAccuracy accuracy = LocationAccuracy.high,
    int distanceFilter = 10,
  }) async {
    try {
      await ensurePermissions();

      // Stop existing tracking if any
      await stopLocationTracking();

      final locationSettings = LocationSettings(
        accuracy: accuracy,
        distanceFilter: distanceFilter,
      );

      _positionStreamSubscription = Geolocator.getPositionStream(
        locationSettings: locationSettings,
      ).listen(
        (Position position) {
          _locationStreamController.add(
            LatLng(position.latitude, position.longitude),
          );
        },
        onError: (error) {
          debugPrint('Location tracking error: $error');
          _locationStreamController.addError(
            LocationServiceException(
              'Location tracking interrupted. Please check your GPS.',
            ),
          );
        },
      );

      return true;
    } on LocationServiceException {
      rethrow;
    } catch (e) {
      debugPrint('Error starting location tracking: $e');
      throw LocationServiceException(
        'Unable to start location tracking. Please check your GPS settings.',
      );
    }
  }

  /// Stop continuous location tracking
  Future<void> stopLocationTracking() async {
    await _positionStreamSubscription?.cancel();
    _positionStreamSubscription = null;
  }

  /// Check if user is within specified radius of a target location
  /// Returns true if within radius, false otherwise
  Future<bool> isWithinRadius(
    LatLng targetLocation,
    double radiusMeters,
  ) async {
    try {
      final currentLocation = await getCurrentPosition();
      final distance = Geolocator.distanceBetween(
        currentLocation.latitude,
        currentLocation.longitude,
        targetLocation.latitude,
        targetLocation.longitude,
      );
      return distance <= radiusMeters;
    } catch (e) {
      debugPrint('Error checking proximity: $e');
      return false;
    }
  }

  /// Get distance from current location to target location in meters
  /// Throws LocationServiceException on failure
  Future<double> getDistanceToLocation(LatLng targetLocation) async {
    try {
      final currentLocation = await getCurrentPosition();
      return Geolocator.distanceBetween(
        currentLocation.latitude,
        currentLocation.longitude,
        targetLocation.latitude,
        targetLocation.longitude,
      );
    } on LocationServiceException {
      rethrow;
    } catch (e) {
      debugPrint('Error calculating distance: $e');
      throw LocationServiceException(
        'Unable to calculate distance. Please check your GPS.',
      );
    }
  }

  /// Open device location settings
  Future<bool> openLocationSettings() async {
    try {
      return await Geolocator.openLocationSettings();
    } catch (e) {
      debugPrint('Error opening location settings: $e');
      return false;
    }
  }

  /// Open app settings (for permission management)
  Future<bool> openAppSettings() async {
    try {
      return await Geolocator.openAppSettings();
    } catch (e) {
      debugPrint('Error opening app settings: $e');
      return false;
    }
  }

  /// Clean up resources
  void dispose() {
    stopLocationTracking();
    _locationStreamController.close();
  }
}

/// Custom exception for location service errors with user-friendly messages
class LocationServiceException implements Exception {
  final String message;

  LocationServiceException(this.message);

  @override
  String toString() => message;
}
