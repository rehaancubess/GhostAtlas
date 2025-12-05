import 'dart:math';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class LocationUtils {
  /// Calculate distance between two LatLng points using Haversine formula
  /// Returns distance in meters
  static double calculateDistance(LatLng point1, LatLng point2) {
    const double earthRadius = 6371000; // Earth's radius in meters

    double lat1Rad = _degreesToRadians(point1.latitude);
    double lat2Rad = _degreesToRadians(point2.latitude);
    double deltaLatRad = _degreesToRadians(point2.latitude - point1.latitude);
    double deltaLngRad = _degreesToRadians(point2.longitude - point1.longitude);

    double a =
        sin(deltaLatRad / 2) * sin(deltaLatRad / 2) +
        cos(lat1Rad) *
            cos(lat2Rad) *
            sin(deltaLngRad / 2) *
            sin(deltaLngRad / 2);

    double c = 2 * atan2(sqrt(a), sqrt(1 - a));

    return earthRadius * c;
  }

  /// Check if two locations are within a specified radius (in meters)
  static bool isWithinRadius(
    LatLng point1,
    LatLng point2,
    double radiusMeters,
  ) {
    return calculateDistance(point1, point2) <= radiusMeters;
  }

  /// Convert degrees to radians
  static double _degreesToRadians(double degrees) {
    return degrees * pi / 180;
  }

  /// Format distance for display
  /// Returns string like "50m" or "1.2km"
  static String formatDistance(double distanceMeters) {
    if (distanceMeters < 1000) {
      return '${distanceMeters.round()}m';
    } else {
      return '${(distanceMeters / 1000).toStringAsFixed(1)}km';
    }
  }
}
