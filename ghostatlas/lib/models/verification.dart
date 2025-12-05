import 'package:google_maps_flutter/google_maps_flutter.dart';

class Verification {
  final String id;
  final LatLng location;
  final double spookinessScore;
  final String? notes;
  final DateTime verifiedAt;
  final bool isTimeMatched;
  final double distanceMeters;

  Verification({
    required this.id,
    required this.location,
    required this.spookinessScore,
    this.notes,
    required this.verifiedAt,
    required this.isTimeMatched,
    required this.distanceMeters,
  });

  factory Verification.fromJson(Map<String, dynamic> json) {
    final locationData = json['location'] as Map<String, dynamic>;
    final double latitude = locationData['latitude'] as double;
    final double longitude = locationData['longitude'] as double;

    return Verification(
      id: json['id'] as String,
      location: LatLng(latitude, longitude),
      spookinessScore: (json['spookinessScore'] as num).toDouble(),
      notes: json['notes'] as String?,
      verifiedAt: DateTime.parse(json['verifiedAt'] as String),
      isTimeMatched: json['isTimeMatched'] as bool? ?? false,
      distanceMeters: (json['distanceMeters'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'location': {
        'latitude': location.latitude,
        'longitude': location.longitude,
      },
      'spookinessScore': spookinessScore,
      'notes': notes,
      'verifiedAt': verifiedAt.toIso8601String(),
      'isTimeMatched': isTimeMatched,
      'distanceMeters': distanceMeters,
    };
  }
}
