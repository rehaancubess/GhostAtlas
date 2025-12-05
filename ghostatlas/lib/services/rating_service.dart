import 'package:shared_preferences/shared_preferences.dart';

/// Service for managing encounter ratings with device-based duplicate prevention
class RatingService {
  static const String _ratingPrefix = 'rating_';

  /// Get the user's rating for a specific encounter
  /// Returns -1 for downvote, 0 for no vote, 1 for upvote
  Future<int> getUserRating(String encounterId) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt('$_ratingPrefix$encounterId') ?? 0;
  }

  /// Save the user's rating for a specific encounter
  /// [encounterId] - The encounter ID
  /// [rating] - The rating value: -1 for downvote, 0 for no vote, 1 for upvote
  Future<void> saveUserRating(String encounterId, int rating) async {
    if (rating != -1 && rating != 0 && rating != 1) {
      throw ArgumentError('Rating must be -1, 0, or 1');
    }

    final prefs = await SharedPreferences.getInstance();

    if (rating == 0) {
      // Remove rating if set to 0 (no vote)
      await prefs.remove('$_ratingPrefix$encounterId');
    } else {
      await prefs.setInt('$_ratingPrefix$encounterId', rating);
    }
  }

  /// Check if the user has already rated an encounter
  Future<bool> hasUserRated(String encounterId) async {
    final rating = await getUserRating(encounterId);
    return rating != 0;
  }

  /// Clear all ratings (useful for testing or reset functionality)
  Future<void> clearAllRatings() async {
    final prefs = await SharedPreferences.getInstance();
    final keys = prefs.getKeys();

    for (final key in keys) {
      if (key.startsWith(_ratingPrefix)) {
        await prefs.remove(key);
      }
    }
  }
}
