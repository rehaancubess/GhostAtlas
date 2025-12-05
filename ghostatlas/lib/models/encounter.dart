import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'verification.dart';

class Encounter {
  final String id;
  final String authorName;
  final LatLng location;
  final String originalStory;
  final String enhancedStory;
  final String? title; // AI-generated title
  final DateTime encounterTime;
  final DateTime submittedAt;
  final String status; // 'pending', 'approved', 'rejected'
  final List<String> imageUrls; // User-uploaded images
  final List<String>
  illustrationUrls; // AI-generated illustrations (3-5 images)
  final String? narrationUrl;
  final int rating; // Net upvotes - downvotes
  final int verificationCount;
  final double? averageSpookiness;
  final bool isPublic; // true = appears on map, false = private
  final String? deviceId; // Anonymous device identifier
  final List<Verification> verifications; // Ghostbuster verifications

  Encounter({
    required this.id,
    required this.authorName,
    required this.location,
    required this.originalStory,
    required this.enhancedStory,
    this.title,
    required this.encounterTime,
    required this.submittedAt,
    required this.status,
    required this.imageUrls,
    required this.illustrationUrls,
    this.narrationUrl,
    this.rating = 0,
    this.verificationCount = 0,
    this.averageSpookiness,
    this.isPublic = true,
    this.deviceId,
    this.verifications = const [],
  });

  factory Encounter.fromJson(Map<String, dynamic> json) {
    // Handle both API formats: lat/lng and latitude/longitude
    final locationData = json['location'] as Map<String, dynamic>;
    final double latitude =
        ((locationData['latitude'] ?? locationData['lat']) as num).toDouble();
    final double longitude =
        ((locationData['longitude'] ?? locationData['lng']) as num).toDouble();

    return Encounter(
      id: json['id'] as String,
      authorName: json['authorName'] as String,
      location: LatLng(latitude, longitude),
      originalStory: json['originalStory'] as String,
      enhancedStory:
          json['enhancedStory'] as String? ??
          json['originalStory']
              as String, // Use original if enhanced not available
      title: json['title'] as String?,
      encounterTime: DateTime.parse(json['encounterTime'] as String),
      submittedAt: DateTime.parse(
        json['submittedAt'] as String? ??
            json['createdAt'] as String? ??
            json['updatedAt'] as String,
      ),
      status: json['status'] as String,
      imageUrls:
          (json['imageUrls'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      illustrationUrls:
          (json['illustrationUrls'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          // Fallback to single illustrationUrl for backward compatibility
          (json['illustrationUrl'] != null
              ? [json['illustrationUrl'] as String]
              : []),
      narrationUrl: json['narrationUrl'] as String?,
      rating: json['rating'] as int? ?? 0,
      verificationCount: json['verificationCount'] as int? ?? 0,
      averageSpookiness: (json['averageSpookiness'] as num?)?.toDouble(),
      isPublic: json['isPublic'] as bool? ?? true,
      deviceId: json['deviceId'] as String?,
      verifications:
          (json['verifications'] as List<dynamic>?)
              ?.map((v) => Verification.fromJson(v as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'authorName': authorName,
      'location': {'lat': location.latitude, 'lng': location.longitude},
      'originalStory': originalStory,
      'enhancedStory': enhancedStory,
      'title': title,
      'encounterTime': encounterTime.toIso8601String(),
      'submittedAt': submittedAt.toIso8601String(),
      'status': status,
      'imageUrls': imageUrls,
      'illustrationUrls': illustrationUrls,
      'narrationUrl': narrationUrl,
      'rating': rating,
      'verificationCount': verificationCount,
      'averageSpookiness': averageSpookiness,
      'isPublic': isPublic,
      'deviceId': deviceId,
      'verifications': verifications.map((v) => v.toJson()).toList(),
    };
  }
}
