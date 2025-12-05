import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../models/encounter.dart';
import '../models/location_utils.dart';
import '../services/api_service.dart';
import '../services/location_service.dart';
import '../services/verification_service.dart';
import '../widgets/success_animation.dart';
import '../widgets/loading_indicator.dart';
import '../widgets/snackbar_helper.dart';
import '../widgets/ghost_button.dart';
import '../theme/ghost_atlas_colors.dart';
import '../theme/ghost_atlas_typography.dart';

class GhostbusterModeScreen extends StatefulWidget {
  final Encounter encounter;

  const GhostbusterModeScreen({super.key, required this.encounter});

  @override
  State<GhostbusterModeScreen> createState() => _GhostbusterModeScreenState();
}

class _GhostbusterModeScreenState extends State<GhostbusterModeScreen> {
  final ApiService _apiService = ApiService();
  final LocationService _locationService = LocationService();
  final VerificationService _verificationService = VerificationService();
  final TextEditingController _notesController = TextEditingController();

  double _spookinessScore = 5.0;
  bool _isSubmitting = false;
  bool _isCheckingLocation = true;
  bool _isWithinRange = false;
  bool _isTimeMatched = false;
  bool _hasAlreadyVerified = false;
  LatLng? _currentLocation;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _checkProximityAndTime();
    _checkIfAlreadyVerified();
  }

  Future<void> _checkIfAlreadyVerified() async {
    final hasVerified = await _verificationService.hasVerified(
      widget.encounter.id,
    );
    setState(() {
      _hasAlreadyVerified = hasVerified;
    });
  }

  @override
  void dispose() {
    _notesController.dispose();
    _apiService.dispose();
    _locationService.dispose();
    super.dispose();
  }

  /// Check if user is within 50m of encounter location and if time matches
  Future<void> _checkProximityAndTime() async {
    setState(() {
      _isCheckingLocation = true;
      _errorMessage = null;
    });

    try {
      // Get current location
      _currentLocation = await _locationService.getCurrentPosition();

      // Check proximity (within 50m)
      double distance = LocationUtils.calculateDistance(
        _currentLocation!,
        widget.encounter.location,
      );

      _isWithinRange = distance <= 50;

      // Check time match (within 2 hours of original encounter time)
      _isTimeMatched = _checkTimeMatch();

      setState(() {
        _isCheckingLocation = false;
      });
    } on LocationServiceException catch (e) {
      setState(() {
        _isCheckingLocation = false;
        _errorMessage = e.message;
      });
    } catch (e) {
      setState(() {
        _isCheckingLocation = false;
        _errorMessage = 'Unable to get your location. Please try again.';
      });
    }
  }

  /// Check if current time matches the encounter time (within 2 hours)
  bool _checkTimeMatch() {
    final now = DateTime.now();
    final encounterTime = widget.encounter.encounterTime;

    // Compare time of day (hour and minute)
    final nowTimeOfDay = Duration(hours: now.hour, minutes: now.minute);
    final encounterTimeOfDay = Duration(
      hours: encounterTime.hour,
      minutes: encounterTime.minute,
    );

    final timeDifference = (nowTimeOfDay - encounterTimeOfDay).abs();

    // Within 2 hours (120 minutes)
    return timeDifference.inMinutes <= 120;
  }

  /// Submit verification
  Future<void> _submitVerification() async {
    if (_hasAlreadyVerified) {
      SnackbarHelper.showWarning(
        context,
        'You have already verified this location.',
      );
      return;
    }

    if (!_isWithinRange) {
      SnackbarHelper.showWarning(
        context,
        'You must be within 50m of the location to verify.',
      );
      return;
    }

    if (_currentLocation == null) {
      SnackbarHelper.showError(context, 'Unable to determine your location.');
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      final notes = _notesController.text.trim();

      final result = await _apiService.verifyEncounter(
        widget.encounter.id,
        _currentLocation!,
        _spookinessScore,
        notes: notes.isEmpty ? null : notes,
      );

      // Update isTimeMatched from backend response
      _isTimeMatched = result['isTimeMatched'] as bool? ?? false;

      // Mark as verified locally
      await _verificationService.markAsVerified(widget.encounter.id);

      if (!mounted) return;

      // Show success dialog
      _showSuccessDialog();
    } catch (e) {
      setState(() {
        _isSubmitting = false;
        _errorMessage = e.toString();
      });

      if (!mounted) return;

      // Show more specific error message
      final errorMsg = e.toString();
      if (errorMsg.contains('meters from encounter location')) {
        SnackbarHelper.showError(context, 'You\'re too far from the location');
      } else if (errorMsg.contains('not found')) {
        SnackbarHelper.showError(context, 'Story not found');
      } else {
        SnackbarHelper.showError(
          context,
          'Failed to submit verification. Please try again.',
        );
      }
    }
  }

  /// Show success confirmation dialog
  void _showSuccessDialog() {
    final message =
        _isTimeMatched
            ? 'Your spookiness score: ${_spookinessScore.toStringAsFixed(1)}\n\n'
                '⏰ Time-matched verification!\n'
                'Bonus credibility awarded'
            : 'Your spookiness score: ${_spookinessScore.toStringAsFixed(1)}';

    SuccessAnimation.show(
      context,
      title: 'Verification Submitted!',
      message: message,
      onComplete: () {
        Navigator.of(context).pop(); // Close screen
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GhostAtlasColors.primaryBackground,
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.auto_awesome,
              color: GhostAtlasColors.ghostGreen,
              size: 24,
            ),
            const SizedBox(width: 8),
            Text(
              'Ghostbuster Mode',
              style: TextStyle(
                fontFamily: GhostAtlasTypography.horrorFontFamily,
                color: GhostAtlasColors.ghostGreen,
              ),
            ),
          ],
        ),
        backgroundColor: GhostAtlasColors.secondaryBackground,
        iconTheme: const IconThemeData(color: GhostAtlasColors.ghostGreen),
      ),
      body:
          _isCheckingLocation
              ? const LoadingIndicator(message: 'Checking your location...')
              : SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Header card
                    Container(
                      decoration: BoxDecoration(
                        color: GhostAtlasColors.cardBackground,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: GhostAtlasColors.ghostGreen.withOpacity(0.3),
                          width: 1,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: GhostAtlasColors.ghostGreenGlow,
                            blurRadius: 10,
                            spreadRadius: 1,
                          ),
                        ],
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          children: [
                            Icon(
                              Icons.auto_awesome,
                              size: 48,
                              color: GhostAtlasColors.ghostGreen,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              widget.encounter.authorName,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: GhostAtlasColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Encountered: ${_formatDateTime(widget.encounter.encounterTime)}',
                              style: const TextStyle(
                                fontSize: 14,
                                color: GhostAtlasColors.textTertiary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Proximity status
                    _buildStatusCard(
                      icon: _isWithinRange ? Icons.check_circle : Icons.cancel,
                      iconColor:
                          _isWithinRange
                              ? GhostAtlasColors.ghostGreen
                              : GhostAtlasColors.error,
                      title:
                          _isWithinRange
                              ? 'You are at the location!'
                              : 'You are not close enough',
                      subtitle:
                          _isWithinRange
                              ? 'Within 50m of the encounter'
                              : 'You must be within 50m to verify',
                    ),
                    const SizedBox(height: 16),

                    // Time match status - with horror aesthetic
                    if (_isTimeMatched)
                      Container(
                        decoration: BoxDecoration(
                          color: GhostAtlasColors.cardBackground,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: GhostAtlasColors.ghostGreen,
                            width: 2,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: GhostAtlasColors.ghostGreenGlow,
                              blurRadius: 20,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            children: [
                              Icon(
                                Icons.access_time,
                                color: GhostAtlasColors.ghostGreen,
                                size: 32,
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Time-Matched Verification!',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: GhostAtlasColors.ghostGreen,
                                        fontFamily:
                                            GhostAtlasTypography
                                                .horrorFontFamily,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'You\'re here at the same time as the original encounter',
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: GhostAtlasColors.textSecondary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    if (_isTimeMatched) const SizedBox(height: 24),

                    // Error message
                    if (_errorMessage != null) ...[
                      Container(
                        decoration: BoxDecoration(
                          color: GhostAtlasColors.cardBackground,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: GhostAtlasColors.error,
                            width: 1,
                          ),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Row(
                            children: [
                              Icon(Icons.error, color: GhostAtlasColors.error),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _errorMessage!,
                                  style: const TextStyle(
                                    color: GhostAtlasColors.error,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],

                    // Spookiness slider
                    Text(
                      'How spooky is this location?',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: GhostAtlasColors.textPrimary,
                        fontFamily: GhostAtlasTypography.horrorFontFamily,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      decoration: BoxDecoration(
                        color: GhostAtlasColors.cardBackground,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: GhostAtlasColors.ghostGreen.withOpacity(0.3),
                          width: 1,
                        ),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Not Spooky',
                                  style: TextStyle(
                                    color: GhostAtlasColors.textTertiary,
                                  ),
                                ),
                                Text(
                                  _spookinessScore.toStringAsFixed(1),
                                  style: const TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                    color: GhostAtlasColors.ghostGreen,
                                  ),
                                ),
                                const Text(
                                  'Very Spooky',
                                  style: TextStyle(
                                    color: GhostAtlasColors.textTertiary,
                                  ),
                                ),
                              ],
                            ),
                            SliderTheme(
                              data: SliderThemeData(
                                activeTrackColor: GhostAtlasColors.ghostGreen,
                                inactiveTrackColor: GhostAtlasColors.textMuted
                                    .withOpacity(0.3),
                                thumbColor: GhostAtlasColors.ghostGreen,
                                overlayColor: GhostAtlasColors.ghostGreenGlow,
                                thumbShape: const RoundSliderThumbShape(
                                  enabledThumbRadius: 10,
                                ),
                                overlayShape: const RoundSliderOverlayShape(
                                  overlayRadius: 20,
                                ),
                              ),
                              child: Slider(
                                value: _spookinessScore,
                                min: 0,
                                max: 10,
                                divisions: 100,
                                onChanged: (value) {
                                  setState(() {
                                    _spookinessScore = value;
                                  });
                                },
                              ),
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: List.generate(
                                11,
                                (index) => Text(
                                  '$index',
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: GhostAtlasColors.textMuted,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Notes field
                    Text(
                      'Your Experience (Optional)',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: GhostAtlasColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _notesController,
                      maxLines: 4,
                      maxLength: 500,
                      style: const TextStyle(
                        color: GhostAtlasColors.textPrimary,
                      ),
                      decoration: InputDecoration(
                        hintText: 'Describe what you experienced here...',
                        hintStyle: const TextStyle(
                          color: GhostAtlasColors.textMuted,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(
                            color: GhostAtlasColors.textMuted,
                          ),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(
                            color: GhostAtlasColors.textMuted,
                          ),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(
                            color: GhostAtlasColors.ghostGreen,
                            width: 2,
                          ),
                        ),
                        filled: true,
                        fillColor: GhostAtlasColors.secondaryBackground,
                        counterStyle: const TextStyle(
                          color: GhostAtlasColors.textTertiary,
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Submit button using GhostButton
                    _isSubmitting
                        ? Center(
                          child: SizedBox(
                            height: 60,
                            width: 60,
                            child: CircularProgressIndicator(
                              strokeWidth: 3,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                GhostAtlasColors.ghostGreen,
                              ),
                            ),
                          ),
                        )
                        : GhostButton(
                          text:
                              _hasAlreadyVerified
                                  ? 'ALREADY VERIFIED'
                                  : 'SUBMIT VERIFICATION',
                          icon:
                              _hasAlreadyVerified
                                  ? Icons.check_circle
                                  : Icons.verified,
                          onPressed:
                              (!_isWithinRange || _hasAlreadyVerified)
                                  ? null
                                  : _submitVerification,
                          size: GhostButtonSize.large,
                          fullWidth: true,
                        ),
                    const SizedBox(height: 16),

                    // Retry location button
                    if (_errorMessage != null)
                      TextButton.icon(
                        onPressed: _checkProximityAndTime,
                        icon: const Icon(
                          Icons.refresh,
                          color: GhostAtlasColors.ghostGreen,
                        ),
                        label: const Text(
                          'Retry Location Check',
                          style: TextStyle(
                            color: GhostAtlasColors.ghostGreen,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
    );
  }

  Widget _buildStatusCard({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: GhostAtlasColors.cardBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: GhostAtlasColors.ghostGreen.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(icon, color: iconColor, size: 32),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: GhostAtlasColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 14,
                      color: GhostAtlasColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDateTime(DateTime dateTime) {
    return '${dateTime.day}/${dateTime.month}/${dateTime.year} at ${dateTime.hour}:${dateTime.minute.toString().padLeft(2, '0')}';
  }
}
