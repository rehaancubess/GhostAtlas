import 'package:flutter/material.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:intl/intl.dart';
import '../models/encounter.dart';
import '../models/location_utils.dart';
import '../services/api_service.dart';
import '../services/rating_service.dart';
import '../widgets/snackbar_helper.dart';
import '../widgets/ghost_button.dart';
import '../theme/ghost_atlas_colors.dart';
import '../theme/ghost_atlas_typography.dart';
import 'ghostbuster_mode_screen.dart';

class StoryDetailScreen extends StatefulWidget {
  final Encounter encounter;

  const StoryDetailScreen({super.key, required this.encounter});

  @override
  State<StoryDetailScreen> createState() => _StoryDetailScreenState();
}

class _StoryDetailScreenState extends State<StoryDetailScreen> {
  final ApiService _apiService = ApiService();
  final RatingService _ratingService = RatingService();
  final AudioPlayer _audioPlayer = AudioPlayer();
  final AudioPlayer _ambientPlayer = AudioPlayer();

  bool _isPlaying = false;
  bool _isLoadingAudio = false;
  int _userRating = 0; // -1 for downvote, 0 for no vote, 1 for upvote
  int _currentRating; // Track the current rating score
  bool _isSubmittingRating = false;
  bool _isNearby = false;
  Duration _audioDuration = Duration.zero;
  Duration _audioPosition = Duration.zero;

  _StoryDetailScreenState() : _currentRating = 0;

  @override
  void initState() {
    super.initState();
    _currentRating = widget.encounter.rating;
    _loadUserRating();
    _checkUserLocation();
    _setupAudioPlayer();
  }

  @override
  void dispose() {
    _audioPlayer.dispose();
    _ambientPlayer.dispose();
    _apiService.dispose();
    super.dispose();
  }

  Future<void> _loadUserRating() async {
    try {
      final rating = await _ratingService.getUserRating(widget.encounter.id);
      setState(() {
        _userRating = rating;
      });
    } catch (e) {
      debugPrint('Error loading user rating: $e');
    }
  }

  void _setupAudioPlayer() {
    _audioPlayer.onDurationChanged.listen((duration) {
      setState(() {
        _audioDuration = duration;
      });
    });

    _audioPlayer.onPositionChanged.listen((position) {
      setState(() {
        _audioPosition = position;
      });
    });

    _audioPlayer.onPlayerComplete.listen((_) async {
      setState(() {
        _isPlaying = false;
        _audioPosition = Duration.zero;
      });
      // Stop ambient music when narration completes
      await _ambientPlayer.stop();
    });

    _audioPlayer.onPlayerStateChanged.listen((state) {
      setState(() {
        _isPlaying = state == PlayerState.playing;
      });
    });

    // Setup ambient player to loop
    _ambientPlayer.setReleaseMode(ReleaseMode.loop);
    _ambientPlayer.setVolume(0.04); // 4% volume for ambient music
  }

  Future<void> _checkUserLocation() async {
    try {
      final permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        return;
      }

      final position = await Geolocator.getCurrentPosition();
      final userLatLng = LatLng(position.latitude, position.longitude);

      setState(() {
        _isNearby = LocationUtils.isWithinRadius(
          widget.encounter.location,
          userLatLng,
          50, // 50 meters
        );
      });
    } catch (e) {
      // Silently fail if location is unavailable
    }
  }

  Future<void> _toggleAudioPlayback() async {
    if (widget.encounter.narrationUrl == null) {
      SnackbarHelper.showWarning(
        context,
        'No narration available for this story',
      );
      return;
    }

    try {
      if (_isPlaying) {
        await _audioPlayer.pause();
        await _ambientPlayer.pause();
      } else {
        setState(() {
          _isLoadingAudio = true;
        });

        if (_audioPosition == Duration.zero) {
          // Start both narration and ambient music
          await _audioPlayer.play(UrlSource(widget.encounter.narrationUrl!));
          await _ambientPlayer.play(AssetSource('horror-ambient-442040.mp3'));
        } else {
          await _audioPlayer.resume();
          await _ambientPlayer.resume();
        }

        setState(() {
          _isLoadingAudio = false;
        });
      }
    } catch (e) {
      setState(() {
        _isLoadingAudio = false;
        _isPlaying = false;
      });
      SnackbarHelper.showError(
        context,
        'Failed to play audio: ${e.toString()}',
      );
    }
  }

  Future<void> _submitRating(int rating) async {
    if (_isSubmittingRating) return;

    // Toggle rating if same button pressed
    final newRating = _userRating == rating ? 0 : rating;
    final oldRating = _userRating;

    setState(() {
      _isSubmittingRating = true;
    });

    try {
      // Only submit to API if rating is not 0 (API doesn't accept 0)
      if (newRating != 0) {
        await _apiService.rateEncounter(widget.encounter.id, newRating);
      }

      // Save locally for duplicate prevention
      await _ratingService.saveUserRating(widget.encounter.id, newRating);

      if (!mounted) return;

      // Update local rating display
      final ratingDelta = newRating - oldRating;

      setState(() {
        _userRating = newRating;
        _currentRating += ratingDelta;
        _isSubmittingRating = false;
      });

      final message =
          newRating == 1
              ? '👻 Upvoted!'
              : newRating == -1
              ? '👎 Downvoted!'
              : 'Rating removed';
      SnackbarHelper.showSuccess(context, message);
    } catch (e) {
      if (!mounted) return;

      setState(() {
        _isSubmittingRating = false;
      });

      // Show more specific error message
      final errorMsg =
          e.toString().contains('already rated')
              ? 'You\'ve already rated this story'
              : 'Failed to submit rating. Please try again.';
      SnackbarHelper.showError(context, errorMsg);
    }
  }

  void _navigateToVerification() {
    if (!_isNearby) {
      SnackbarHelper.showWarning(
        context,
        'You must be within 50m of the location to verify',
      );
      return;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder:
            (context) => GhostbusterModeScreen(encounter: widget.encounter),
      ),
    );
  }

  String _formatTimestamp(DateTime timestamp) {
    final formatter = DateFormat('MMM d, yyyy • h:mm a');
    return formatter.format(timestamp);
  }

  void _showReportDialog() {
    String? selectedReason;
    final reasons = [
      'Offensive or inappropriate content',
      'Spam or misleading information',
      'Harassment or hate speech',
      'Violence or dangerous content',
      'False or fabricated story',
      'Other',
    ];

    showDialog(
      context: context,
      builder:
          (context) => StatefulBuilder(
            builder:
                (context, setState) => AlertDialog(
                  backgroundColor: GhostAtlasColors.cardBackground,
                  title: Row(
                    children: [
                      Icon(Icons.flag, color: GhostAtlasColors.error),
                      const SizedBox(width: 12),
                      Text(
                        'Report Story',
                        style: TextStyle(color: GhostAtlasColors.textPrimary),
                      ),
                    ],
                  ),
                  content: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Why are you reporting this story?',
                        style: TextStyle(
                          color: GhostAtlasColors.textSecondary,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 16),
                      ...reasons.map(
                        (reason) => RadioListTile<String>(
                          title: Text(
                            reason,
                            style: TextStyle(
                              color: GhostAtlasColors.textPrimary,
                              fontSize: 14,
                            ),
                          ),
                          value: reason,
                          groupValue: selectedReason,
                          activeColor: GhostAtlasColors.ghostGreen,
                          onChanged: (value) {
                            setState(() {
                              selectedReason = value;
                            });
                          },
                          contentPadding: EdgeInsets.zero,
                          dense: true,
                        ),
                      ),
                    ],
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: Text(
                        'Cancel',
                        style: TextStyle(color: GhostAtlasColors.textMuted),
                      ),
                    ),
                    ElevatedButton(
                      onPressed:
                          selectedReason == null
                              ? null
                              : () {
                                Navigator.pop(context);
                                _submitReport(selectedReason!);
                              },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: GhostAtlasColors.error,
                        disabledBackgroundColor: GhostAtlasColors.textMuted,
                      ),
                      child: const Text('Submit Report'),
                    ),
                  ],
                ),
          ),
    );
  }

  void _submitReport(String reason) {
    // TODO: Implement actual report submission to backend
    // For now, just show success message
    SnackbarHelper.showSuccess(
      context,
      'Report submitted. Our team will review within 24 hours.',
    );
  }

  void _showBlockUserDialog() {
    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            backgroundColor: GhostAtlasColors.cardBackground,
            title: Row(
              children: [
                Icon(Icons.block, color: GhostAtlasColors.error),
                const SizedBox(width: 12),
                Text(
                  'Block User',
                  style: TextStyle(color: GhostAtlasColors.textPrimary),
                ),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Block ${widget.encounter.authorName}?',
                  style: TextStyle(
                    color: GhostAtlasColors.textPrimary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'You will no longer see stories from this user.',
                  style: TextStyle(
                    color: GhostAtlasColors.textSecondary,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: Text(
                  'Cancel',
                  style: TextStyle(color: GhostAtlasColors.textMuted),
                ),
              ),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  _blockUser();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: GhostAtlasColors.error,
                ),
                child: const Text('Block User'),
              ),
            ],
          ),
    );
  }

  void _blockUser() {
    // TODO: Implement actual user blocking in backend
    // For now, just show success message and go back
    SnackbarHelper.showSuccess(
      context,
      '${widget.encounter.authorName} has been blocked',
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Hero image with app bar and vignette effect
          SliverAppBar(
            expandedHeight: 300,
            pinned: true,
            backgroundColor: GhostAtlasColors.secondaryBackground,
            iconTheme: IconThemeData(color: GhostAtlasColors.ghostGreen),
            actions: [
              PopupMenuButton<String>(
                icon: Icon(Icons.more_vert, color: GhostAtlasColors.ghostGreen),
                color: GhostAtlasColors.cardBackground,
                onSelected: (value) {
                  if (value == 'report') {
                    _showReportDialog();
                  } else if (value == 'block') {
                    _showBlockUserDialog();
                  }
                },
                itemBuilder:
                    (context) => [
                      PopupMenuItem(
                        value: 'report',
                        child: Row(
                          children: [
                            Icon(Icons.flag, color: GhostAtlasColors.error),
                            const SizedBox(width: 12),
                            Text(
                              'Report Story',
                              style: TextStyle(
                                color: GhostAtlasColors.textPrimary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      PopupMenuItem(
                        value: 'block',
                        child: Row(
                          children: [
                            Icon(Icons.block, color: GhostAtlasColors.error),
                            const SizedBox(width: 12),
                            Text(
                              'Block User',
                              style: TextStyle(
                                color: GhostAtlasColors.textPrimary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  widget.encounter.illustrationUrls.isNotEmpty
                      ? Image.network(
                        widget.encounter.illustrationUrls.first,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            color: GhostAtlasColors.secondaryBackground,
                            child: Center(
                              child: Icon(
                                Icons.image_not_supported,
                                size: 64,
                                color: GhostAtlasColors.textMuted,
                              ),
                            ),
                          );
                        },
                        loadingBuilder: (context, child, loadingProgress) {
                          if (loadingProgress == null) return child;
                          return Container(
                            color: GhostAtlasColors.secondaryBackground,
                            child: Center(
                              child: CircularProgressIndicator(
                                color: GhostAtlasColors.ghostGreen,
                                value:
                                    loadingProgress.expectedTotalBytes != null
                                        ? loadingProgress
                                                .cumulativeBytesLoaded /
                                            loadingProgress.expectedTotalBytes!
                                        : null,
                              ),
                            ),
                          );
                        },
                      )
                      : Container(
                        color: GhostAtlasColors.secondaryBackground,
                        child: Center(
                          child: Icon(
                            Icons.auto_stories,
                            size: 64,
                            color: GhostAtlasColors.textMuted,
                          ),
                        ),
                      ),
                  // Vignette effect overlay
                  Container(
                    decoration: BoxDecoration(
                      gradient: RadialGradient(
                        center: Alignment.center,
                        radius: 1.0,
                        colors: [
                          Colors.transparent,
                          GhostAtlasColors.primaryBackground.withOpacity(0.7),
                        ],
                        stops: const [0.3, 1.0],
                      ),
                    ),
                  ),
                  // Bottom gradient for smooth transition
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: Container(
                      height: 100,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            GhostAtlasColors.primaryBackground,
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title with horror font (using first line of enhanced story)
                  Text(
                    widget.encounter.enhancedStory.split('\n').first.length > 50
                        ? '${widget.encounter.enhancedStory.split('\n').first.substring(0, 50)}...'
                        : widget.encounter.enhancedStory.split('\n').first,
                    style: TextStyle(
                      fontFamily: GhostAtlasTypography.horrorFontFamily,
                      fontSize: 32,
                      color: GhostAtlasColors.ghostGreen,
                      shadows: [
                        Shadow(
                          color: GhostAtlasColors.ghostGreenGlow,
                          blurRadius: 20,
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Author and timestamp
                  Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: GhostAtlasColors.ghostGreen
                            .withOpacity(0.2),
                        child: Icon(
                          Icons.person,
                          color: GhostAtlasColors.ghostGreen,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.encounter.authorName,
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: GhostAtlasColors.textPrimary,
                              ),
                            ),
                            Text(
                              _formatTimestamp(widget.encounter.encounterTime),
                              style: TextStyle(
                                fontSize: 12,
                                color: GhostAtlasColors.textTertiary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // Enhancement status banner
                  if (widget.encounter.enhancedStory ==
                          widget.encounter.originalStory ||
                      widget.encounter.illustrationUrls.isEmpty ||
                      widget.encounter.narrationUrl == null)
                    Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.orange.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: Colors.orange.withValues(alpha: 0.5),
                          width: 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                Colors.orange,
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'AI Enhancement in Progress',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Colors.orange,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'This story is being enhanced with AI-generated narrative, illustrations, and narration. Check back in ~60 seconds.',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: GhostAtlasColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Audio player controls with green accents
                  if (widget.encounter.narrationUrl != null)
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
                        padding: const EdgeInsets.all(12.0),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Container(
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    boxShadow:
                                        _isPlaying
                                            ? [
                                              BoxShadow(
                                                color:
                                                    GhostAtlasColors
                                                        .ghostGreenGlow,
                                                blurRadius: 15,
                                                spreadRadius: 3,
                                              ),
                                            ]
                                            : [],
                                  ),
                                  child: IconButton(
                                    icon:
                                        _isLoadingAudio
                                            ? SizedBox(
                                              width: 24,
                                              height: 24,
                                              child: CircularProgressIndicator(
                                                strokeWidth: 2,
                                                color:
                                                    GhostAtlasColors.ghostGreen,
                                              ),
                                            )
                                            : Icon(
                                              _isPlaying
                                                  ? Icons.pause_circle_filled
                                                  : Icons.play_circle_filled,
                                              size: 48,
                                            ),
                                    onPressed:
                                        _isLoadingAudio
                                            ? null
                                            : _toggleAudioPlayback,
                                    color: GhostAtlasColors.ghostGreen,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Listen to narration',
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color: GhostAtlasColors.textPrimary,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      LinearProgressIndicator(
                                        value:
                                            _audioDuration.inMilliseconds > 0
                                                ? _audioPosition
                                                        .inMilliseconds /
                                                    _audioDuration
                                                        .inMilliseconds
                                                : 0,
                                        backgroundColor: GhostAtlasColors
                                            .textMuted
                                            .withOpacity(0.3),
                                        color: GhostAtlasColors.ghostGreen,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        '${_formatDuration(_audioPosition)} / ${_formatDuration(_audioDuration)}',
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: GhostAtlasColors.textTertiary,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),

                  const SizedBox(height: 24),

                  // Enhanced story text
                  Text(
                    widget.encounter.enhancedStory,
                    style: TextStyle(
                      fontSize: 16,
                      height: 1.6,
                      color: GhostAtlasColors.textSecondary,
                    ),
                  ),

                  const SizedBox(height: 24),

                  // User-uploaded images
                  if (widget.encounter.imageUrls.isNotEmpty) ...[
                    Text(
                      'Photos from the scene',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: GhostAtlasColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 200,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: widget.encounter.imageUrls.length,
                        itemBuilder: (context, index) {
                          return Padding(
                            padding: const EdgeInsets.only(right: 12.0),
                            child: GestureDetector(
                              onTap:
                                  () => _showImageFullScreen(
                                    widget.encounter.imageUrls[index],
                                  ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                child: Image.network(
                                  widget.encounter.imageUrls[index],
                                  width: 200,
                                  height: 200,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) {
                                    return Container(
                                      width: 200,
                                      height: 200,
                                      color: GhostAtlasColors.cardBackground,
                                      child: Center(
                                        child: Icon(
                                          Icons.broken_image,
                                          size: 48,
                                          color: GhostAtlasColors.textMuted,
                                        ),
                                      ),
                                    );
                                  },
                                  loadingBuilder: (
                                    context,
                                    child,
                                    loadingProgress,
                                  ) {
                                    if (loadingProgress == null) return child;
                                    return Container(
                                      width: 200,
                                      height: 200,
                                      color: GhostAtlasColors.cardBackground,
                                      child: Center(
                                        child: CircularProgressIndicator(
                                          color: GhostAtlasColors.ghostGreen,
                                          value:
                                              loadingProgress
                                                          .expectedTotalBytes !=
                                                      null
                                                  ? loadingProgress
                                                          .cumulativeBytesLoaded /
                                                      loadingProgress
                                                          .expectedTotalBytes!
                                                  : null,
                                        ),
                                      ),
                                    );
                                  },
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  const SizedBox(height: 8),

                  // Rating and verification stats with green highlights
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
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: [
                          // Rating buttons with green highlights
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: [
                              Column(
                                children: [
                                  Container(
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      boxShadow:
                                          _userRating == 1
                                              ? [
                                                BoxShadow(
                                                  color:
                                                      GhostAtlasColors
                                                          .ghostGreenGlow,
                                                  blurRadius: 15,
                                                  spreadRadius: 3,
                                                ),
                                              ]
                                              : [],
                                    ),
                                    child: IconButton(
                                      icon: Icon(
                                        _userRating == 1
                                            ? Icons.thumb_up
                                            : Icons.thumb_up_outlined,
                                        color:
                                            _userRating == 1
                                                ? GhostAtlasColors.ghostGreen
                                                : GhostAtlasColors.textMuted,
                                      ),
                                      onPressed:
                                          _isSubmittingRating
                                              ? null
                                              : () => _submitRating(1),
                                    ),
                                  ),
                                  Text(
                                    'Upvote',
                                    style: TextStyle(
                                      color: GhostAtlasColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                              Column(
                                children: [
                                  Text(
                                    '$_currentRating',
                                    style: TextStyle(
                                      fontSize: 24,
                                      fontWeight: FontWeight.bold,
                                      color:
                                          _currentRating > 0
                                              ? GhostAtlasColors.ghostGreen
                                              : _currentRating < 0
                                              ? GhostAtlasColors.error
                                              : GhostAtlasColors.textPrimary,
                                    ),
                                  ),
                                  Text(
                                    'Rating',
                                    style: TextStyle(
                                      color: GhostAtlasColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                              Column(
                                children: [
                                  Container(
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      boxShadow:
                                          _userRating == -1
                                              ? [
                                                BoxShadow(
                                                  color: GhostAtlasColors.error
                                                      .withOpacity(0.4),
                                                  blurRadius: 15,
                                                  spreadRadius: 3,
                                                ),
                                              ]
                                              : [],
                                    ),
                                    child: IconButton(
                                      icon: Icon(
                                        _userRating == -1
                                            ? Icons.thumb_down
                                            : Icons.thumb_down_outlined,
                                        color:
                                            _userRating == -1
                                                ? GhostAtlasColors.error
                                                : GhostAtlasColors.textMuted,
                                      ),
                                      onPressed:
                                          _isSubmittingRating
                                              ? null
                                              : () => _submitRating(-1),
                                    ),
                                  ),
                                  Text(
                                    'Downvote',
                                    style: TextStyle(
                                      color: GhostAtlasColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),

                          Divider(
                            height: 32,
                            color: GhostAtlasColors.ghostGreen.withOpacity(0.2),
                          ),

                          // Verification stats
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              Column(
                                children: [
                                  Text(
                                    '${widget.encounter.verificationCount}',
                                    style: TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                      color: GhostAtlasColors.ghostGreen,
                                    ),
                                  ),
                                  Text(
                                    'Verifications',
                                    style: TextStyle(
                                      color: GhostAtlasColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                              if (widget.encounter.averageSpookiness != null)
                                Column(
                                  children: [
                                    Text(
                                      widget.encounter.averageSpookiness!
                                          .toStringAsFixed(1),
                                      style: TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold,
                                        color: GhostAtlasColors.ghostGreen,
                                      ),
                                    ),
                                    Text(
                                      'Avg Spookiness',
                                      style: TextStyle(
                                        color: GhostAtlasColors.textSecondary,
                                      ),
                                    ),
                                  ],
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Comments Section
                  if (widget.encounter.verifications.isNotEmpty) ...[
                    Text(
                      'Comments',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: GhostAtlasColors.ghostGreen,
                        fontFamily: GhostAtlasTypography.horrorFontFamily,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ...widget.encounter.verifications
                        .where((v) => v.notes != null && v.notes!.isNotEmpty)
                        .map(
                          (verification) => Container(
                            margin: const EdgeInsets.only(bottom: 16),
                            decoration: BoxDecoration(
                              color: GhostAtlasColors.cardBackground,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color:
                                    verification.isTimeMatched
                                        ? GhostAtlasColors.ghostGreen
                                        : GhostAtlasColors.ghostGreen
                                            .withValues(alpha: 0.3),
                                width: verification.isTimeMatched ? 2 : 1,
                              ),
                              boxShadow:
                                  verification.isTimeMatched
                                      ? [
                                        BoxShadow(
                                          color:
                                              GhostAtlasColors.ghostGreenGlow,
                                          blurRadius: 15,
                                          spreadRadius: 2,
                                        ),
                                      ]
                                      : [],
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Icon(
                                        Icons.auto_awesome,
                                        color: GhostAtlasColors.ghostGreen,
                                        size: 20,
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        'Ghostbuster Verification',
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.bold,
                                          color: GhostAtlasColors.ghostGreen,
                                        ),
                                      ),
                                      const Spacer(),
                                      if (verification.isTimeMatched)
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 8,
                                            vertical: 4,
                                          ),
                                          decoration: BoxDecoration(
                                            color: GhostAtlasColors.ghostGreen
                                                .withValues(alpha: 0.2),
                                            borderRadius: BorderRadius.circular(
                                              8,
                                            ),
                                          ),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              Icon(
                                                Icons.access_time,
                                                size: 14,
                                                color:
                                                    GhostAtlasColors.ghostGreen,
                                              ),
                                              const SizedBox(width: 4),
                                              Text(
                                                'Time-Matched',
                                                style: TextStyle(
                                                  fontSize: 11,
                                                  fontWeight: FontWeight.bold,
                                                  color:
                                                      GhostAtlasColors
                                                          .ghostGreen,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    verification.notes!,
                                    style: TextStyle(
                                      fontSize: 15,
                                      color: GhostAtlasColors.textPrimary,
                                      height: 1.5,
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  Row(
                                    children: [
                                      Icon(
                                        Icons.star,
                                        size: 16,
                                        color: GhostAtlasColors.ghostGreen,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        'Spookiness: ${verification.spookinessScore.toStringAsFixed(1)}/10',
                                        style: TextStyle(
                                          fontSize: 13,
                                          color: GhostAtlasColors.textSecondary,
                                        ),
                                      ),
                                      const SizedBox(width: 16),
                                      Icon(
                                        Icons.calendar_today,
                                        size: 14,
                                        color: GhostAtlasColors.textMuted,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        _formatTimestamp(
                                          verification.verifiedAt,
                                        ),
                                        style: TextStyle(
                                          fontSize: 13,
                                          color: GhostAtlasColors.textTertiary,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        )
                        .toList(),
                    const SizedBox(height: 24),
                  ],

                  // Verify location button using GhostButton
                  if (_isNearby)
                    GhostButton(
                      text: 'VERIFY THIS LOCATION',
                      icon: Icons.location_on,
                      onPressed: _navigateToVerification,
                      size: GhostButtonSize.large,
                      fullWidth: true,
                    )
                  else
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 32,
                        vertical: 16,
                      ),
                      decoration: BoxDecoration(
                        color: GhostAtlasColors.cardBackground,
                        borderRadius: BorderRadius.circular(25),
                        border: Border.all(
                          color: GhostAtlasColors.textMuted,
                          width: 2,
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.location_off,
                            color: GhostAtlasColors.textMuted,
                          ),
                          const SizedBox(width: 12),
                          Text(
                            'MUST BE WITHIN 50M TO VERIFY',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 1.5,
                              color: GhostAtlasColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),

                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    final seconds = twoDigits(duration.inSeconds.remainder(60));
    return '$minutes:$seconds';
  }

  void _showImageFullScreen(String imageUrl) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder:
            (context) => Scaffold(
              backgroundColor: GhostAtlasColors.primaryBackground,
              appBar: AppBar(
                backgroundColor: GhostAtlasColors.primaryBackground,
                iconTheme: IconThemeData(color: GhostAtlasColors.ghostGreen),
              ),
              body: Center(
                child: InteractiveViewer(
                  child: Image.network(
                    imageUrl,
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) {
                      return Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.broken_image,
                              size: 64,
                              color: GhostAtlasColors.textMuted,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Failed to load image',
                              style: TextStyle(
                                color: GhostAtlasColors.textMuted,
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return Center(
                        child: CircularProgressIndicator(
                          color: GhostAtlasColors.ghostGreen,
                          value:
                              loadingProgress.expectedTotalBytes != null
                                  ? loadingProgress.cumulativeBytesLoaded /
                                      loadingProgress.expectedTotalBytes!
                                  : null,
                        ),
                      );
                    },
                  ),
                ),
              ),
            ),
      ),
    );
  }
}
