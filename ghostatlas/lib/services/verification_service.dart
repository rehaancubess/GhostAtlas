import 'package:shared_preferences/shared_preferences.dart';

/// Service for managing user verifications locally
/// Prevents duplicate verifications by tracking which encounters the user has verified
class VerificationService {
  static const String _keyPrefix = 'verification_';

  /// Check if user has already verified an encounter
  Future<bool> hasVerified(String encounterId) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool('$_keyPrefix$encounterId') ?? false;
  }

  /// Mark an encounter as verified by the user
  Future<void> markAsVerified(String encounterId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('$_keyPrefix$encounterId', true);
  }

  /// Clear verification status for an encounter (for testing)
  Future<void> clearVerification(String encounterId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('$_keyPrefix$encounterId');
  }

  /// Clear all verifications (for testing)
  Future<void> clearAllVerifications() async {
    final prefs = await SharedPreferences.getInstance();
    final keys = prefs.getKeys();
    for (final key in keys) {
      if (key.startsWith(_keyPrefix)) {
        await prefs.remove(key);
      }
    }
  }
}
