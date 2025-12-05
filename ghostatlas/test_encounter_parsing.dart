import 'dart:convert';
import 'lib/models/encounter.dart';

void main() {
  // Test with integer averageSpookiness
  final jsonWithInt = jsonDecode('''
  {
    "id": "test",
    "authorName": "Test",
    "location": {"latitude": 13.0, "longitude": 77.0},
    "originalStory": "Test story",
    "enhancedStory": "Enhanced test",
    "encounterTime": "2025-12-02T12:00:00Z",
    "submittedAt": "2025-12-02T12:00:00Z",
    "status": "enhanced",
    "imageUrls": [],
    "illustrationUrls": [],
    "rating": 0,
    "verificationCount": 1,
    "averageSpookiness": 5,
    "isPublic": true
  }
  ''');

  try {
    final encounter = Encounter.fromJson(jsonWithInt);
    print(
      '✅ SUCCESS: Parsed encounter with int averageSpookiness: ${encounter.averageSpookiness}',
    );
  } catch (e) {
    print('❌ FAILED: $e');
  }

  // Test with double averageSpookiness
  final jsonWithDouble = jsonDecode('''
  {
    "id": "test2",
    "authorName": "Test",
    "location": {"latitude": 13.0, "longitude": 77.0},
    "originalStory": "Test story",
    "enhancedStory": "Enhanced test",
    "encounterTime": "2025-12-02T12:00:00Z",
    "submittedAt": "2025-12-02T12:00:00Z",
    "status": "enhanced",
    "imageUrls": [],
    "illustrationUrls": [],
    "rating": 0,
    "verificationCount": 1,
    "averageSpookiness": 5.5,
    "isPublic": true
  }
  ''');

  try {
    final encounter2 = Encounter.fromJson(jsonWithDouble);
    print(
      '✅ SUCCESS: Parsed encounter with double averageSpookiness: ${encounter2.averageSpookiness}',
    );
  } catch (e) {
    print('❌ FAILED: $e');
  }

  // Test with null averageSpookiness
  final jsonWithNull = jsonDecode('''
  {
    "id": "test3",
    "authorName": "Test",
    "location": {"latitude": 13.0, "longitude": 77.0},
    "originalStory": "Test story",
    "enhancedStory": "Enhanced test",
    "encounterTime": "2025-12-02T12:00:00Z",
    "submittedAt": "2025-12-02T12:00:00Z",
    "status": "enhanced",
    "imageUrls": [],
    "illustrationUrls": [],
    "rating": 0,
    "verificationCount": 0,
    "isPublic": true
  }
  ''');

  try {
    final encounter3 = Encounter.fromJson(jsonWithNull);
    print(
      '✅ SUCCESS: Parsed encounter with null averageSpookiness: ${encounter3.averageSpookiness}',
    );
  } catch (e) {
    print('❌ FAILED: $e');
  }
}
