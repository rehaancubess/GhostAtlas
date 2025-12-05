import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../config/api_config.dart';
import '../models/encounter.dart';
import '../models/encounter_submission.dart';
import 'device_id_service.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, [this.statusCode]);

  @override
  String toString() =>
      'ApiException: $message${statusCode != null ? ' (Status: $statusCode)' : ''}';
}

class ApiService {
  // Use configuration from ApiConfig
  static String get baseUrl => ApiConfig.baseUrl;
  static int get maxRetries => ApiConfig.maxRetries;
  static Duration get retryDelay => ApiConfig.retryDelay;
  static Duration get requestTimeout => ApiConfig.requestTimeout;

  final http.Client _client;

  ApiService({http.Client? client}) : _client = client ?? http.Client();

  // Helper method for GET requests with retry logic
  Future<http.Response> _getWithRetry(
    String endpoint, {
    Map<String, String>? queryParams,
  }) async {
    final uri = Uri.parse(
      '$baseUrl$endpoint',
    ).replace(queryParameters: queryParams);

    for (int attempt = 0; attempt < maxRetries; attempt++) {
      try {
        final response = await _client.get(uri).timeout(requestTimeout);

        if (response.statusCode >= 200 && response.statusCode < 300) {
          return response;
        } else if (response.statusCode >= 500 && attempt < maxRetries - 1) {
          // Retry on server errors
          await Future.delayed(retryDelay * (attempt + 1));
          continue;
        } else {
          throw ApiException(_parseErrorMessage(response), response.statusCode);
        }
      } on SocketException {
        if (attempt < maxRetries - 1) {
          await Future.delayed(retryDelay * (attempt + 1));
          continue;
        }
        throw ApiException(
          'No internet connection. Please check your network.',
        );
      } on http.ClientException {
        if (attempt < maxRetries - 1) {
          await Future.delayed(retryDelay * (attempt + 1));
          continue;
        }
        throw ApiException('Network error. Please try again.');
      } catch (e) {
        if (attempt < maxRetries - 1) {
          await Future.delayed(retryDelay * (attempt + 1));
          continue;
        }
        throw ApiException('An unexpected error occurred: $e');
      }
    }

    throw ApiException('Request failed after $maxRetries attempts');
  }

  // Helper method for POST requests with retry logic
  Future<http.Response> _postWithRetry(
    String endpoint,
    Map<String, dynamic> body,
  ) async {
    final uri = Uri.parse('$baseUrl$endpoint');

    for (int attempt = 0; attempt < maxRetries; attempt++) {
      try {
        final response = await _client
            .post(
              uri,
              headers: {'Content-Type': 'application/json'},
              body: jsonEncode(body),
            )
            .timeout(requestTimeout);

        if (response.statusCode >= 200 && response.statusCode < 300) {
          return response;
        } else if (response.statusCode >= 500 && attempt < maxRetries - 1) {
          await Future.delayed(retryDelay * (attempt + 1));
          continue;
        } else {
          throw ApiException(_parseErrorMessage(response), response.statusCode);
        }
      } on SocketException {
        if (attempt < maxRetries - 1) {
          await Future.delayed(retryDelay * (attempt + 1));
          continue;
        }
        throw ApiException(
          'No internet connection. Please check your network.',
        );
      } on http.ClientException {
        if (attempt < maxRetries - 1) {
          await Future.delayed(retryDelay * (attempt + 1));
          continue;
        }
        throw ApiException('Network error. Please try again.');
      } catch (e) {
        if (attempt < maxRetries - 1) {
          await Future.delayed(retryDelay * (attempt + 1));
          continue;
        }
        throw ApiException('An unexpected error occurred: $e');
      }
    }

    throw ApiException('Request failed after $maxRetries attempts');
  }

  // Helper method for PUT requests with retry logic
  Future<http.Response> _putWithRetry(String endpoint) async {
    final uri = Uri.parse('$baseUrl$endpoint');

    for (int attempt = 0; attempt < maxRetries; attempt++) {
      try {
        final response = await _client
            .put(uri, headers: {'Content-Type': 'application/json'})
            .timeout(requestTimeout);

        if (response.statusCode >= 200 && response.statusCode < 300) {
          return response;
        } else if (response.statusCode >= 500 && attempt < maxRetries - 1) {
          await Future.delayed(retryDelay * (attempt + 1));
          continue;
        } else {
          throw ApiException(_parseErrorMessage(response), response.statusCode);
        }
      } on SocketException {
        if (attempt < maxRetries - 1) {
          await Future.delayed(retryDelay * (attempt + 1));
          continue;
        }
        throw ApiException(
          'No internet connection. Please check your network.',
        );
      } on http.ClientException {
        if (attempt < maxRetries - 1) {
          await Future.delayed(retryDelay * (attempt + 1));
          continue;
        }
        throw ApiException('Network error. Please try again.');
      } catch (e) {
        if (attempt < maxRetries - 1) {
          await Future.delayed(retryDelay * (attempt + 1));
          continue;
        }
        throw ApiException('An unexpected error occurred: $e');
      }
    }

    throw ApiException('Request failed after $maxRetries attempts');
  }

  // Parse error message from response
  String _parseErrorMessage(http.Response response) {
    try {
      final body = jsonDecode(response.body);
      return body['message'] ?? body['error'] ?? 'Request failed';
    } catch (e) {
      return 'Request failed with status ${response.statusCode}';
    }
  }

  /// Get all approved encounters (no location filtering)
  ///
  /// Returns list of all approved encounters
  Future<List<Encounter>> getEncounters() async {
    try {
      final response = await _getWithRetry('/api/encounters/all');

      final Map<String, dynamic> responseData = jsonDecode(response.body);
      final List<dynamic> encounters = responseData['encounters'] ?? [];
      return encounters.map((json) => Encounter.fromJson(json)).toList();
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Failed to load encounters: $e');
    }
  }

  /// Get nearby encounters within a specified radius
  ///
  /// [latitude] - Center point latitude
  /// [longitude] - Center point longitude
  /// [radiusKm] - Search radius in kilometers
  /// [status] - Filter by status: 'approved', 'pending', 'rejected'
  /// Returns list of encounters within the radius
  Future<List<Encounter>> getNearbyEncounters({
    required double latitude,
    required double longitude,
    double radiusKm = 50.0,
    String status = 'approved',
  }) async {
    try {
      final response = await _getWithRetry(
        '/api/encounters',
        queryParams: {
          'latitude': latitude.toString(),
          'longitude': longitude.toString(),
          'radius': radiusKm.toString(),
        },
      );

      final Map<String, dynamic> responseData = jsonDecode(response.body);
      final List<dynamic> encounters = responseData['encounters'] ?? [];
      return encounters.map((json) => Encounter.fromJson(json)).toList();
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Failed to load nearby encounters: $e');
    }
  }

  /// Get a specific encounter by ID
  ///
  /// [id] - The encounter ID
  /// Returns the encounter details
  Future<Encounter> getEncounterById(String id) async {
    try {
      final response = await _getWithRetry('/api/encounters/$id');

      final data = jsonDecode(response.body);
      return Encounter.fromJson(data);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Failed to load encounter: $e');
    }
  }

  /// Submit a new encounter (AI will generate illustration after admin approval)
  ///
  /// [submission] - The encounter submission data
  /// Returns the encounter ID
  Future<String> submitEncounter(EncounterSubmission submission) async {
    try {
      // Submit encounter metadata - stays in 'pending' status for admin review
      final requestBody = {
        'authorName': submission.authorName,
        'deviceId': submission.deviceId,
        'location': {
          'latitude': submission.location.latitude,
          'longitude': submission.location.longitude,
        },
        'originalStory': submission.storyText,
        'encounterTime': submission.encounterTime.toIso8601String(),
        'imageCount':
            0, // No user images - AI generates illustration after approval
        'isPublic': submission.isPublic,
      };

      final response = await _postWithRetry('/api/encounters', requestBody);
      final responseData = jsonDecode(response.body);

      final encounterId = responseData['encounterId'] as String;

      // Note: AI enhancement is triggered by admin approval, not here
      // This keeps the encounter in 'pending' status for review

      return encounterId;
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Failed to submit encounter: $e');
    }
  }

  /// Notify backend to start AI enhancement
  /// This triggers the AI enhancement pipeline (narrative, narration, illustration)
  Future<void> _notifyUploadComplete(String encounterId) async {
    try {
      await _putWithRetry('/api/encounters/$encounterId/upload-complete');
    } catch (e) {
      // Log but don't fail the submission if notification fails
      // The encounter is already created, just won't be enhanced yet
      print('Warning: Failed to trigger AI enhancement: $e');
    }
  }

  /// Rate an encounter (upvote or downvote)
  ///
  /// [id] - The encounter ID
  /// [rating] - The rating value: 1 for upvote, -1 for downvote
  Future<void> rateEncounter(String id, int rating) async {
    if (rating != 1 && rating != -1) {
      throw ArgumentError('Rating must be 1 (upvote) or -1 (downvote)');
    }

    try {
      // Get device ID for duplicate prevention
      final DeviceIdService deviceIdService = DeviceIdService();
      final deviceId = await deviceIdService.getDeviceId();

      await _postWithRetry('/api/encounters/$id/rate', {
        'rating': rating,
        'deviceId': deviceId,
      });
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Failed to rate encounter: $e');
    }
  }

  /// Verify an encounter at a location
  ///
  /// [id] - The encounter ID
  /// [location] - Current location coordinates
  /// [spookinessScore] - Score from 0-10
  /// [notes] - Optional notes about the verification
  Future<Map<String, dynamic>> verifyEncounter(
    String id,
    LatLng location,
    double spookinessScore, {
    String? notes,
  }) async {
    if (spookinessScore < 0 || spookinessScore > 10) {
      throw ArgumentError('Spookiness score must be between 0 and 10');
    }

    try {
      final requestBody = {
        'location': {
          'latitude': location.latitude,
          'longitude': location.longitude,
        },
        'spookinessScore': spookinessScore,
        if (notes != null && notes.isNotEmpty) 'notes': notes,
      };

      final response = await _postWithRetry(
        '/api/encounters/$id/verify',
        requestBody,
      );
      return jsonDecode(response.body);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Failed to verify encounter: $e');
    }
  }

  /// Get pending encounters (admin only)
  ///
  /// Returns list of pending encounters
  Future<List<Encounter>> getPendingEncounters() async {
    try {
      final response = await _getWithRetry(
        '/api/admin/encounters',
        queryParams: {'status': 'pending'},
      );

      final Map<String, dynamic> responseData = jsonDecode(response.body);
      final List<dynamic> encounters = responseData['encounters'] ?? [];
      return encounters.map((json) => Encounter.fromJson(json)).toList();
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Failed to load pending encounters: $e');
    }
  }

  /// Approve an encounter (admin only)
  ///
  /// [id] - The encounter ID to approve
  Future<void> approveEncounter(String id) async {
    try {
      await _putWithRetry('/api/admin/encounters/$id/approve');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Failed to approve encounter: $e');
    }
  }

  /// Reject an encounter (admin only)
  ///
  /// [id] - The encounter ID to reject
  Future<void> rejectEncounter(String id) async {
    try {
      await _putWithRetry('/api/admin/encounters/$id/reject');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Failed to reject encounter: $e');
    }
  }

  /// Close the HTTP client
  void dispose() {
    _client.close();
  }
}
