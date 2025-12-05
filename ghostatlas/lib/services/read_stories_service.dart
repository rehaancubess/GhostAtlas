import 'package:shared_preferences/shared_preferences.dart';

/// Service to track which stories have been read by the user
class ReadStoriesService {
  static const String _readStoriesKey = 'read_stories';

  /// Mark a story as read
  Future<void> markAsRead(String encounterId) async {
    final prefs = await SharedPreferences.getInstance();
    final readStories = await getReadStories();

    if (!readStories.contains(encounterId)) {
      readStories.add(encounterId);
      await prefs.setStringList(_readStoriesKey, readStories);
    }
  }

  /// Get list of read story IDs
  Future<List<String>> getReadStories() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList(_readStoriesKey) ?? [];
  }

  /// Check if a story has been read
  Future<bool> isRead(String encounterId) async {
    final readStories = await getReadStories();
    return readStories.contains(encounterId);
  }

  /// Clear all read stories (for testing or reset)
  Future<void> clearReadStories() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_readStoriesKey);
  }

  /// Get count of read stories
  Future<int> getReadCount() async {
    final readStories = await getReadStories();
    return readStories.length;
  }
}
