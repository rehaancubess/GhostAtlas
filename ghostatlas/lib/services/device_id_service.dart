import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

/// Service for managing anonymous device identification.
/// Generates and persists a unique device ID for tracking user's stories
/// without requiring authentication.
class DeviceIdService {
  static const String _deviceIdKey = 'ghost_atlas_device_id';
  static final DeviceIdService _instance = DeviceIdService._internal();

  factory DeviceIdService() => _instance;

  DeviceIdService._internal();

  String? _cachedDeviceId;

  /// Get or generate the device ID.
  /// This ID persists across app restarts and is used to identify
  /// the user's stories without requiring login.
  Future<String> getDeviceId() async {
    // Return cached value if available
    if (_cachedDeviceId != null) {
      return _cachedDeviceId!;
    }

    final prefs = await SharedPreferences.getInstance();
    String? deviceId = prefs.getString(_deviceIdKey);

    if (deviceId == null) {
      // Generate new UUID for this device
      deviceId = const Uuid().v4();
      await prefs.setString(_deviceIdKey, deviceId);
      print('Generated new device ID: $deviceId');
    } else {
      print('Retrieved existing device ID: $deviceId');
    }

    _cachedDeviceId = deviceId;
    return deviceId;
  }

  /// Clear the device ID (for testing or reset purposes).
  /// This will cause a new ID to be generated on next access.
  Future<void> clearDeviceId() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_deviceIdKey);
    _cachedDeviceId = null;
    print('Device ID cleared');
  }
}
