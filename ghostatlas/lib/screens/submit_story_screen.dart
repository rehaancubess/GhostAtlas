import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import '../models/encounter_submission.dart';
import '../services/api_service.dart';
import '../services/location_service.dart';
import '../services/device_id_service.dart';
import '../widgets/ghost_success_animation.dart';
import '../widgets/error_view.dart';
import '../widgets/ghost_button.dart';
import '../theme/ghost_atlas_colors.dart';
import '../theme/ghost_atlas_typography.dart';
import 'terms_of_use_screen.dart';

class SubmitStoryScreen extends StatefulWidget {
  const SubmitStoryScreen({super.key});

  @override
  State<SubmitStoryScreen> createState() => _SubmitStoryScreenState();
}

class _SubmitStoryScreenState extends State<SubmitStoryScreen> {
  final _formKey = GlobalKey<FormState>();
  final _authorNameController = TextEditingController();
  final _storyController = TextEditingController();
  final ApiService _apiService = ApiService();
  final LocationService _locationService = LocationService();
  final DeviceIdService _deviceIdService = DeviceIdService();
  late stt.SpeechToText _speech;

  LatLng? _selectedLocation;
  DateTime? _encounterTime;
  bool _isSubmitting = false;
  bool _isLoadingLocation = false;
  bool _isListening = false;
  bool _speechAvailable = false;
  bool _isPublic = true; // Default to public
  bool _agreedToTerms = false; // EULA agreement

  @override
  void initState() {
    super.initState();
    _initSpeech();
  }

  @override
  void dispose() {
    _authorNameController.dispose();
    _storyController.dispose();
    _locationService.dispose();
    super.dispose();
  }

  Future<void> _initSpeech() async {
    _speech = stt.SpeechToText();
    try {
      _speechAvailable = await _speech.initialize(
        onStatus: (status) {
          debugPrint('Speech status: $status');
          if (status == 'done' || status == 'notListening') {
            setState(() => _isListening = false);
          }
        },
        onError: (error) {
          debugPrint('Speech error: ${error.errorMsg}');
          setState(() => _isListening = false);

          // Only show user-friendly errors, not technical ones
          if (error.errorMsg.contains('error_no_match')) {
            // This is normal - just means no speech was detected
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: const Text(
                    'No speech detected. Please try again and speak clearly.',
                  ),
                  backgroundColor: GhostAtlasColors.warning,
                  duration: const Duration(seconds: 2),
                ),
              );
            }
          } else if (error.errorMsg.contains('error_listen_failed')) {
            // Microphone access issue
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: const Text(
                    'Microphone access failed. Check permissions in Settings.',
                  ),
                  backgroundColor: GhostAtlasColors.error,
                  duration: const Duration(seconds: 3),
                  action: SnackBarAction(
                    label: 'Settings',
                    textColor: Colors.white,
                    onPressed: () => _locationService.openAppSettings(),
                  ),
                ),
              );
            }
          }
        },
      );
      setState(() {});
    } catch (e) {
      debugPrint('Speech initialization error: $e');
      _speechAvailable = false;
    }
  }

  String _textBeforeSpeech = '';

  Future<void> _toggleListening() async {
    if (!_speechAvailable) {
      _showErrorSnackBar('Speech recognition not available on this device');
      return;
    }

    if (_isListening) {
      await _speech.stop();
      setState(() => _isListening = false);
    } else {
      // Check if speech recognition is available before starting
      bool available = await _speech.initialize();
      if (!available) {
        _showErrorSnackBar(
          'Speech recognition not available. Check microphone permissions.',
        );
        return;
      }

      // Save existing text before starting speech recognition
      _textBeforeSpeech = _storyController.text;

      setState(() => _isListening = true);

      try {
        await _speech.listen(
          onResult: (result) {
            setState(() {
              // Append new speech to existing text
              String newText = result.recognizedWords;
              if (_textBeforeSpeech.isNotEmpty && newText.isNotEmpty) {
                // Add space between existing text and new speech
                _storyController.text = '$_textBeforeSpeech $newText';
              } else {
                _storyController.text = _textBeforeSpeech + newText;
              }
            });
          },
          listenFor: const Duration(minutes: 3),
          pauseFor: const Duration(seconds: 5),
          partialResults: true,
          cancelOnError: false, // Don't cancel on errors, let user try again
          listenMode: stt.ListenMode.dictation,
          onSoundLevelChange: (level) {
            // Optional: Could show sound level indicator
            debugPrint('Sound level: $level');
          },
        );
      } catch (e) {
        debugPrint('Listen error: $e');
        setState(() => _isListening = false);
        _showErrorSnackBar('Failed to start listening. Please try again.');
      }
    }
  }

  Future<void> _getCurrentLocation() async {
    setState(() {
      _isLoadingLocation = true;
    });

    try {
      final location = await _locationService.getCurrentPosition();
      setState(() {
        _selectedLocation = location;
      });
    } on LocationServiceException catch (e) {
      if (mounted) {
        _showErrorSnackBar(e.message);
        // Offer to open settings
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.message),
            action: SnackBarAction(
              label: 'Settings',
              onPressed: () => _locationService.openAppSettings(),
            ),
            duration: const Duration(seconds: 5),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        _showErrorSnackBar('Failed to get current location: ${e.toString()}');
      }
    } finally {
      setState(() {
        _isLoadingLocation = false;
      });
    }
  }

  Future<void> _selectTime() async {
    final DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime.now(),
    );

    if (pickedDate != null && mounted) {
      final TimeOfDay? pickedTime = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.now(),
      );

      if (pickedTime != null) {
        setState(() {
          _encounterTime = DateTime(
            pickedDate.year,
            pickedDate.month,
            pickedDate.day,
            pickedTime.hour,
            pickedTime.minute,
          );
        });
      }
    }
  }

  Future<void> _showLocationPicker() async {
    // Get initial location (current location, selected location, or default)
    LatLng initialLocation;

    if (_selectedLocation != null) {
      // Use previously selected location
      initialLocation = _selectedLocation!;
    } else {
      // Try to get current location first
      try {
        setState(() => _isLoadingLocation = true);
        initialLocation = await _locationService.getCurrentPosition();
      } catch (e) {
        debugPrint('Could not get current location: $e');
        // Fall back to default location (San Francisco)
        initialLocation = const LatLng(37.7749, -122.4194);
      } finally {
        if (mounted) {
          setState(() => _isLoadingLocation = false);
        }
      }
    }

    final LatLng? result = await Navigator.push<LatLng>(
      context,
      MaterialPageRoute(
        builder:
            (context) =>
                _LocationPickerScreen(initialLocation: initialLocation),
      ),
    );

    if (result != null) {
      setState(() {
        _selectedLocation = result;
      });
    }
  }

  Future<void> _submitStory() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    // Check EULA agreement
    if (!_agreedToTerms) {
      _showErrorSnackBar(
        'Please agree to the Terms of Use to submit your story',
      );
      return;
    }

    // Only validate location and time for public stories
    if (_isPublic) {
      if (_selectedLocation == null) {
        _showErrorSnackBar('Please select a location for public stories');
        return;
      }

      if (_encounterTime == null) {
        _showErrorSnackBar('Please select when the encounter occurred');
        return;
      }
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      // Get device ID
      final deviceId = await _deviceIdService.getDeviceId();

      final submission = EncounterSubmission(
        authorName: _authorNameController.text.trim(),
        location:
            _selectedLocation ??
            const LatLng(0, 0), // Dummy location for private stories
        storyText: _storyController.text.trim(),
        encounterTime:
            _encounterTime ?? DateTime.now(), // Dummy time for private stories
        images: [], // No user images - AI will generate illustration
        isPublic: _isPublic,
        deviceId: deviceId,
      );

      await _apiService.submitEncounter(submission);

      if (mounted) {
        _showSuccessDialog();
      }
    } catch (e) {
      if (mounted) {
        _showErrorSnackBar('Failed to submit story: ${e.toString()}');
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  void _showSuccessDialog() {
    GhostSuccessAnimation.show(
      context,
      title: 'Story Submitted!',
      message:
          _isPublic
              ? 'Your public story has been submitted for admin review. '
                  'Once approved, our AI will enhance it with a spooky narrative and illustration, '
                  'then it will appear on the Buster Map and Stories section!'
              : 'Your private story has been submitted for admin review. '
                  'Once approved, our AI will enhance it and it will appear in the Stories section only.',
      onComplete: _resetForm,
    );
  }

  void _resetForm() {
    _formKey.currentState?.reset();
    _authorNameController.clear();
    _storyController.clear();
    setState(() {
      _selectedLocation = null;
      _encounterTime = null;
      _isPublic = true; // Reset to default
    });
  }

  void _showErrorSnackBar(String message) {
    ErrorSnackBar.show(context, message);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: RichText(
          text: TextSpan(
            children: [
              TextSpan(
                text: 'Submit Your ',
                style: GhostAtlasTypography.appTitle.copyWith(
                  fontSize: 28,
                  color: GhostAtlasColors.ghostGreen,
                ),
              ),
              TextSpan(
                text: 'Story',
                style: GhostAtlasTypography.appTitle.copyWith(
                  fontSize: 28,
                  color: Colors.red,
                ),
              ),
            ],
          ),
        ),
        backgroundColor: GhostAtlasColors.secondaryBackground,
        elevation: 0,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16.0),
          children: [
            // Public/Private Toggle (at the top)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: GhostAtlasColors.cardBackground,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: GhostAtlasColors.ghostGreen.withValues(alpha: 0.3),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        _isPublic ? Icons.public : Icons.lock,
                        color: GhostAtlasColors.ghostGreen,
                        size: 24,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Story Type',
                          style: TextStyle(
                            color: GhostAtlasColors.textPrimary,
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      Switch(
                        value: _isPublic,
                        onChanged: (value) {
                          setState(() {
                            _isPublic = value;
                            // Clear location and time when switching to private
                            if (!value) {
                              _selectedLocation = null;
                              _encounterTime = null;
                            }
                          });
                        },
                        activeColor: GhostAtlasColors.ghostGreen,
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _isPublic
                        ? '🌍 Public: Appears on Buster Map and Stories section after admin approval. Requires location and time.'
                        : '📖 Private: Only appears in Stories section after admin approval. No location or time needed.',
                    style: TextStyle(
                      color: GhostAtlasColors.textTertiary,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Author Name Field
            TextFormField(
              controller: _authorNameController,
              style: TextStyle(color: GhostAtlasColors.textPrimary),
              decoration: InputDecoration(
                labelText: 'Your Name',
                hintText: 'Enter your name',
                filled: true,
                fillColor: GhostAtlasColors.secondaryBackground,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: GhostAtlasColors.textMuted),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: GhostAtlasColors.textMuted),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: GhostAtlasColors.ghostGreen,
                    width: 2,
                  ),
                ),
                errorBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: GhostAtlasColors.error),
                ),
                focusedErrorBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: GhostAtlasColors.error,
                    width: 2,
                  ),
                ),
                prefixIcon: Icon(
                  Icons.person,
                  color: GhostAtlasColors.ghostGreen,
                ),
                labelStyle: TextStyle(color: GhostAtlasColors.textTertiary),
                hintStyle: TextStyle(color: GhostAtlasColors.textMuted),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter your name';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Location Picker (only for public stories)
            if (_isPublic)
              Container(
                decoration: BoxDecoration(
                  color: GhostAtlasColors.cardBackground,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: GhostAtlasColors.ghostGreen.withValues(alpha: 0.3),
                    width: 1,
                  ),
                ),
                child: ListTile(
                  leading: Icon(
                    Icons.location_on,
                    color: GhostAtlasColors.ghostGreen,
                  ),
                  title: Text(
                    _selectedLocation == null
                        ? 'Select Location'
                        : 'Location: ${_selectedLocation!.latitude.toStringAsFixed(4)}, ${_selectedLocation!.longitude.toStringAsFixed(4)}',
                    style: TextStyle(
                      color: GhostAtlasColors.textPrimary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  subtitle: Text(
                    'Tap to choose on map',
                    style: TextStyle(color: GhostAtlasColors.textTertiary),
                  ),
                  trailing:
                      _isLoadingLocation
                          ? SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                GhostAtlasColors.ghostGreen,
                              ),
                            ),
                          )
                          : Icon(
                            Icons.arrow_forward_ios,
                            color: GhostAtlasColors.ghostGreen,
                          ),
                  onTap: _isLoadingLocation ? null : _showLocationPicker,
                ),
              ),
            if (_isPublic) const SizedBox(height: 8),

            // Current Location Button (only for public stories)
            if (_isPublic)
              OutlinedButton.icon(
                onPressed: _isLoadingLocation ? null : _getCurrentLocation,
                icon:
                    _isLoadingLocation
                        ? SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              GhostAtlasColors.ghostGreen,
                            ),
                          ),
                        )
                        : Icon(
                          Icons.my_location,
                          color: GhostAtlasColors.ghostGreen,
                        ),
                label: Text(
                  'Use Current Location',
                  style: TextStyle(color: GhostAtlasColors.ghostGreen),
                ),
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: GhostAtlasColors.ghostGreen),
                  backgroundColor: Colors.transparent,
                ),
              ),
            if (_isPublic) const SizedBox(height: 16),

            // Time Picker (only for public stories)
            if (_isPublic)
              Container(
                decoration: BoxDecoration(
                  color: GhostAtlasColors.cardBackground,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: GhostAtlasColors.ghostGreen.withValues(alpha: 0.3),
                    width: 1,
                  ),
                ),
                child: ListTile(
                  leading: Icon(
                    Icons.access_time,
                    color: GhostAtlasColors.ghostGreen,
                  ),
                  title: Text(
                    _encounterTime == null
                        ? 'When did this happen?'
                        : 'Time: ${_encounterTime!.toString().substring(0, 16)}',
                    style: TextStyle(
                      color: GhostAtlasColors.textPrimary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  subtitle: Text(
                    'Tap to select date and time',
                    style: TextStyle(color: GhostAtlasColors.textTertiary),
                  ),
                  trailing: Icon(
                    Icons.arrow_forward_ios,
                    color: GhostAtlasColors.ghostGreen,
                  ),
                  onTap: _selectTime,
                ),
              ),
            const SizedBox(height: 16),

            // Story Text Field with Voice Input
            Stack(
              children: [
                TextFormField(
                  controller: _storyController,
                  style: TextStyle(color: GhostAtlasColors.textPrimary),
                  textInputAction: TextInputAction.done,
                  decoration: InputDecoration(
                    labelText: 'Your Story',
                    hintText: 'Type or tap the mic to narrate...',
                    filled: true,
                    fillColor: GhostAtlasColors.secondaryBackground,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: GhostAtlasColors.textMuted),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: GhostAtlasColors.textMuted),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color:
                            _isListening
                                ? Colors.red
                                : GhostAtlasColors.ghostGreen,
                        width: 2,
                      ),
                    ),
                    errorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: GhostAtlasColors.error),
                    ),
                    focusedErrorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color: GhostAtlasColors.error,
                        width: 2,
                      ),
                    ),
                    alignLabelWithHint: true,
                    labelStyle: TextStyle(color: GhostAtlasColors.textTertiary),
                    hintStyle: TextStyle(color: GhostAtlasColors.textMuted),
                    contentPadding: const EdgeInsets.fromLTRB(16, 16, 60, 16),
                  ),
                  maxLines: 5,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Please describe your encounter';
                    }
                    if (value.trim().length < 20) {
                      return 'Please provide more details (at least 20 characters)';
                    }
                    return null;
                  },
                ),
                // Voice input button
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color:
                          _isListening
                              ? Colors.red.withOpacity(0.2)
                              : GhostAtlasColors.ghostGreen.withOpacity(0.1),
                      border: Border.all(
                        color:
                            _isListening
                                ? Colors.red
                                : GhostAtlasColors.ghostGreen,
                        width: 2,
                      ),
                      boxShadow:
                          _isListening
                              ? [
                                BoxShadow(
                                  color: Colors.red.withOpacity(0.5),
                                  blurRadius: 10,
                                  spreadRadius: 2,
                                ),
                              ]
                              : [],
                    ),
                    child: IconButton(
                      icon: Icon(
                        _isListening ? Icons.mic : Icons.mic_none,
                        color:
                            _isListening
                                ? Colors.red
                                : GhostAtlasColors.ghostGreen,
                      ),
                      onPressed: _speechAvailable ? _toggleListening : null,
                      tooltip:
                          _isListening
                              ? 'Stop recording'
                              : 'Start voice narration',
                    ),
                  ),
                ),
              ],
            ),
            if (_isListening)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.red.withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.fiber_manual_record,
                        color: Colors.red,
                        size: 12,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Listening... Speak clearly and describe your encounter',
                          style: TextStyle(
                            color: Colors.red,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              )
            else if (_speechAvailable)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Row(
                  children: [
                    Icon(
                      Icons.info_outline,
                      size: 14,
                      color: GhostAtlasColors.ghostGreen,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Tip: Tap the microphone to narrate your story with your voice',
                        style: TextStyle(
                          color: GhostAtlasColors.textTertiary,
                          fontSize: 11,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 16),

            // AI Illustration Info
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: GhostAtlasColors.ghostGreen.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: GhostAtlasColors.ghostGreen.withValues(alpha: 0.3),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.auto_awesome,
                    color: GhostAtlasColors.ghostGreen,
                    size: 24,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Our AI will generate a spooky illustration based on your story!',
                      style: TextStyle(
                        color: GhostAtlasColors.textPrimary,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // EULA Agreement Checkbox
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: GhostAtlasColors.cardBackground,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color:
                      _agreedToTerms
                          ? GhostAtlasColors.ghostGreen.withValues(alpha: 0.5)
                          : GhostAtlasColors.error.withValues(alpha: 0.3),
                  width: 2,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Checkbox(
                        value: _agreedToTerms,
                        onChanged: (value) {
                          setState(() {
                            _agreedToTerms = value ?? false;
                          });
                        },
                        activeColor: GhostAtlasColors.ghostGreen,
                        checkColor: GhostAtlasColors.primaryBackground,
                      ),
                      Expanded(
                        child: GestureDetector(
                          onTap: () {
                            setState(() {
                              _agreedToTerms = !_agreedToTerms;
                            });
                          },
                          child: RichText(
                            text: TextSpan(
                              style: TextStyle(
                                color: GhostAtlasColors.textPrimary,
                                fontSize: 14,
                              ),
                              children: [
                                const TextSpan(text: 'I agree to the '),
                                WidgetSpan(
                                  child: GestureDetector(
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder:
                                              (context) =>
                                                  const TermsOfUseScreen(),
                                        ),
                                      );
                                    },
                                    child: Text(
                                      'Terms of Use',
                                      style: TextStyle(
                                        color: GhostAtlasColors.ghostGreen,
                                        fontWeight: FontWeight.bold,
                                        decoration: TextDecoration.underline,
                                      ),
                                    ),
                                  ),
                                ),
                                const TextSpan(
                                  text:
                                      ' and understand that objectionable content is not tolerated',
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Padding(
                    padding: const EdgeInsets.only(left: 12),
                    child: Text(
                      '⚠️ By submitting, you confirm:\n'
                      '• No offensive, harmful, or illegal content\n'
                      '• Content may be removed if it violates our terms\n'
                      '• Abusive users will be blocked',
                      style: TextStyle(
                        color: GhostAtlasColors.textTertiary,
                        fontSize: 12,
                        height: 1.5,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Submit Button
            _isSubmitting
                ? Center(
                  child: SizedBox(
                    height: 60,
                    child: CircularProgressIndicator(
                      strokeWidth: 3,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        GhostAtlasColors.ghostGreen,
                      ),
                    ),
                  ),
                )
                : GhostButton(
                  text: 'ADD STORY',
                  icon: Icons.add_location,
                  onPressed: _submitStory,
                  size: GhostButtonSize.large,
                  fullWidth: true,
                  color: Colors.red,
                ),
          ],
        ),
      ),
    );
  }
}

// Location Picker Screen
class _LocationPickerScreen extends StatefulWidget {
  final LatLng initialLocation;

  const _LocationPickerScreen({required this.initialLocation});

  @override
  State<_LocationPickerScreen> createState() => _LocationPickerScreenState();
}

class _LocationPickerScreenState extends State<_LocationPickerScreen> {
  late LatLng _selectedLocation;

  @override
  void initState() {
    super.initState();
    _selectedLocation = widget.initialLocation;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Select Location',
          style: GhostAtlasTypography.appTitle.copyWith(fontSize: 20),
        ),
        backgroundColor: GhostAtlasColors.secondaryBackground,
        elevation: 0,
        iconTheme: IconThemeData(color: GhostAtlasColors.ghostGreen),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop(_selectedLocation);
            },
            child: Text(
              'DONE',
              style: TextStyle(
                color: GhostAtlasColors.ghostGreen,
                fontWeight: FontWeight.w600,
                letterSpacing: 1.2,
              ),
            ),
          ),
        ],
      ),
      body: GoogleMap(
        initialCameraPosition: CameraPosition(
          target: _selectedLocation,
          zoom: 15,
        ),
        onMapCreated: (controller) {
          // Map controller created
        },
        onTap: (position) {
          setState(() {
            _selectedLocation = position;
          });
        },
        onLongPress: (position) {
          setState(() {
            _selectedLocation = position;
          });
        },
        markers: {
          Marker(
            markerId: const MarkerId('selected_location'),
            position: _selectedLocation,
            draggable: true,
            onDragEnd: (newPosition) {
              setState(() {
                _selectedLocation = newPosition;
              });
            },
          ),
        },
        myLocationEnabled: true,
        myLocationButtonEnabled: true,
      ),
    );
  }
}
