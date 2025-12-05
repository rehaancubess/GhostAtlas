import 'dart:io';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class EncounterSubmission {
  final String authorName;
  final LatLng location;
  final String storyText;
  final DateTime encounterTime;
  final List<File> images;
  final bool isPublic;
  final String deviceId;

  EncounterSubmission({
    required this.authorName,
    required this.location,
    required this.storyText,
    required this.encounterTime,
    this.images = const [],
    this.isPublic = true,
    required this.deviceId,
  });

  Map<String, dynamic> toJson() {
    return {
      'authorName': authorName,
      'location': {'lat': location.latitude, 'lng': location.longitude},
      'storyText': storyText,
      'encounterTime': encounterTime.toIso8601String(),
      'isPublic': isPublic,
      'deviceId': deviceId,
      // Note: images are handled separately in multipart upload
    };
  }
}
