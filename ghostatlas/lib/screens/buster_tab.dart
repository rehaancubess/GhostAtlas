import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../models/encounter.dart';
import '../models/location_utils.dart';
import '../services/location_service.dart';
import '../services/api_service.dart';
import '../data/mock_encounters.dart';
import '../widgets/ghost_loading_indicator.dart';
import '../widgets/error_view.dart';
import '../theme/ghost_atlas_colors.dart';
import '../theme/ghost_atlas_typography.dart';
import 'story_detail_screen.dart';

/// Buster tab - Shows a compact map with nearby ghost encounters listed below
class BusterTab extends StatefulWidget {
  const BusterTab({super.key});

  @override
  State<BusterTab> createState() => _BusterTabState();
}

class _BusterTabState extends State<BusterTab> {
  final LocationService _locationService = LocationService();
  final ApiService _apiService = ApiService();
  GoogleMapController? _mapController;

  List<Encounter> _encounters = [];
  List<Encounter> _visibleEncounters = [];
  Set<Marker> _markers = {};
  LatLng? _userLocation;
  LatLngBounds? _currentMapBounds;
  bool _isLoading = true;
  String? _errorMessage;
  StreamSubscription<LatLng>? _locationStreamSubscription;

  // Dark map style
  static const String _darkMapStyle = '''
  [
    {"elementType": "geometry", "stylers": [{"color": "#0a0a0a"}]},
    {"elementType": "labels.text.fill", "stylers": [{"color": "#666666"}]},
    {"elementType": "labels.text.stroke", "stylers": [{"color": "#000000"}]},
    {"featureType": "administrative", "elementType": "geometry", "stylers": [{"color": "#00ff41"}, {"weight": 0.5}]},
    {"featureType": "poi", "elementType": "geometry", "stylers": [{"color": "#121212"}]},
    {"featureType": "road", "elementType": "geometry", "stylers": [{"color": "#1a1a1a"}]},
    {"featureType": "water", "elementType": "geometry", "stylers": [{"color": "#000000"}]},
    {"featureType": "water", "elementType": "labels.text.fill", "stylers": [{"color": "#00ff41"}]}
  ]
  ''';

  @override
  void initState() {
    super.initState();
    _loadEncounters();
    _getUserLocation();
    _startLocationTracking();
  }

  @override
  void dispose() {
    _mapController?.dispose();
    _locationStreamSubscription?.cancel();
    _locationService.dispose();
    _apiService.dispose();
    super.dispose();
  }

  Future<void> _loadEncounters() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Fetch ALL approved encounters from API, fall back to mock data
      List<Encounter> encounters;
      try {
        encounters = await _apiService.getEncounters();

        // If API returns empty, use mock data
        if (encounters.isEmpty) {
          encounters = MockEncounters.getMockEncounters();
        }
      } catch (e) {
        debugPrint('API error, using mock data: $e');
        // Fall back to mock data if API fails
        encounters = MockEncounters.getMockEncounters();
      }

      setState(() {
        _encounters = encounters;
        _isLoading = false;
      });
      _updateVisibleEncounters();
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load encounters: ${e.toString()}';
        _isLoading = false;
      });
    }
  }

  Future<void> _getUserLocation() async {
    try {
      final location = await _locationService.getCurrentPosition();
      setState(() {
        _userLocation = location;
      });

      // Auto-zoom to user location when first loaded
      if (_mapController != null) {
        _mapController!.animateCamera(CameraUpdate.newLatLngZoom(location, 12));
      }

      _updateVisibleEncounters();
    } on LocationServiceException catch (e) {
      debugPrint('Location error: $e');
      // Location not available, but app continues to work with default view
    } on TimeoutException catch (e) {
      debugPrint('Location timeout: $e');
      // GPS signal weak or unavailable, app continues with default view
    } catch (e) {
      debugPrint('Error getting user location: $e');
      // Other location errors, app continues with default view
    }
  }

  void _startLocationTracking() async {
    try {
      await _locationService.startLocationTracking(distanceFilter: 50);
      _locationStreamSubscription = _locationService.locationStream.listen((
        LatLng location,
      ) {
        setState(() {
          _userLocation = location;
        });
      });
    } on TimeoutException catch (e) {
      debugPrint('Location tracking timeout: $e');
      // GPS signal weak, app continues without live tracking
    } catch (e) {
      debugPrint('Error starting location tracking: $e');
      // Location tracking unavailable, app continues without it
    }
  }

  void _onCameraMove(CameraPosition position) {
    // Update bounds when camera moves
    _updateMapBounds();
  }

  void _onCameraIdle() {
    // Update visible encounters when camera stops moving
    _updateVisibleEncounters();
  }

  Future<void> _updateMapBounds() async {
    if (_mapController == null) return;

    try {
      final bounds = await _mapController!.getVisibleRegion();
      setState(() {
        _currentMapBounds = bounds;
      });
    } catch (e) {
      debugPrint('Error getting map bounds: $e');
    }
  }

  void _updateVisibleEncounters() async {
    await _updateMapBounds();

    if (_currentMapBounds == null) {
      setState(() {
        _visibleEncounters = _encounters;
      });
      _updateMarkers();
      return;
    }

    // Filter encounters that are within the visible map bounds
    final visible =
        _encounters.where((encounter) {
          return _isLocationInBounds(encounter.location, _currentMapBounds!);
        }).toList();

    // Sort by distance from user if location is available, otherwise by rating
    if (_userLocation != null) {
      visible.sort((a, b) {
        final distA = _calculateDistance(
          _userLocation!.latitude,
          _userLocation!.longitude,
          a.location.latitude,
          a.location.longitude,
        );
        final distB = _calculateDistance(
          _userLocation!.latitude,
          _userLocation!.longitude,
          b.location.latitude,
          b.location.longitude,
        );
        return distA.compareTo(distB);
      });
    } else {
      visible.sort((a, b) => b.rating.compareTo(a.rating));
    }

    setState(() {
      _visibleEncounters = visible;
    });
    _updateMarkers();
  }

  bool _isLocationInBounds(LatLng location, LatLngBounds bounds) {
    return location.latitude <= bounds.northeast.latitude &&
        location.latitude >= bounds.southwest.latitude &&
        location.longitude <= bounds.northeast.longitude &&
        location.longitude >= bounds.southwest.longitude;
  }

  void _updateMarkers() {
    final markers = <Marker>{};

    // Show ALL encounters on the map with red markers
    for (final encounter in _encounters) {
      markers.add(
        Marker(
          markerId: MarkerId(encounter.id),
          position: encounter.location,
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
          onTap: () => _onMarkerTapped(encounter),
        ),
      );
    }

    setState(() {
      _markers = markers;
    });
  }

  double _calculateDistance(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    const double earthRadius = 6371000; // meters
    final dLat = _degreesToRadians(lat2 - lat1);
    final dLon = _degreesToRadians(lon2 - lon1);

    final a =
        sin(dLat / 2) * sin(dLat / 2) +
        cos(_degreesToRadians(lat1)) *
            cos(_degreesToRadians(lat2)) *
            sin(dLon / 2) *
            sin(dLon / 2);

    final c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return earthRadius * c;
  }

  double _degreesToRadians(double degrees) {
    return degrees * pi / 180;
  }

  void _onMarkerTapped(Encounter encounter) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => StoryDetailScreen(encounter: encounter),
      ),
    );
  }

  double? _getDistanceToEncounter(Encounter encounter) {
    if (_userLocation == null) return null;
    return LocationUtils.calculateDistance(_userLocation!, encounter.location);
  }

  String _formatDistance(double distanceMeters) {
    return LocationUtils.formatDistance(distanceMeters);
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays == 0) {
      return 'Today';
    } else if (difference.inDays == 1) {
      return 'Yesterday';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else if (difference.inDays < 30) {
      return '${(difference.inDays / 7).floor()}w ago';
    } else {
      return '${date.month}/${date.day}/${date.year}';
    }
  }

  String _generateTitle(Encounter encounter) {
    final story = encounter.enhancedStory.trim();
    if (story.isEmpty) return 'Untitled Encounter';

    // Find the first sentence
    final sentenceEnd = RegExp(r'[.!?]').firstMatch(story);
    if (sentenceEnd != null && sentenceEnd.start < 80) {
      return story.substring(0, sentenceEnd.start).trim();
    }

    // Otherwise take first 50 characters
    if (story.length > 50) {
      return '${story.substring(0, 50).trim()}...';
    }

    return story;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GhostAtlasColors.primaryBackground,
      appBar: AppBar(
        backgroundColor: GhostAtlasColors.secondaryBackground,
        elevation: 0,
        title: RichText(
          text: TextSpan(
            children: [
              TextSpan(
                text: 'Ghost',
                style: GhostAtlasTypography.appTitle.copyWith(
                  color: GhostAtlasColors.ghostGreen,
                  fontSize: 28,
                ),
              ),
              TextSpan(
                text: 'Buster',
                style: GhostAtlasTypography.appTitle.copyWith(
                  color: Colors.red,
                  fontSize: 28,
                ),
              ),
            ],
          ),
        ),
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(
            height: 1,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.transparent,
                  GhostAtlasColors.ghostGreen.withValues(alpha: 0.5),
                  Colors.transparent,
                ],
              ),
            ),
          ),
        ),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: GhostLoadingIndicator(message: 'Loading encounters...'),
      );
    }

    if (_errorMessage != null) {
      return ErrorView(message: _errorMessage!, onRetry: _loadEncounters);
    }

    return Column(
      children: [
        // Compact map at top
        _buildCompactMap(),

        // Nearby experiences list
        Expanded(child: _buildNearbyList()),
      ],
    );
  }

  Widget _buildCompactMap() {
    return Container(
      height: 250,
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: GhostAtlasColors.ghostGreen.withValues(alpha: 0.3),
            width: 1,
          ),
        ),
      ),
      child: GoogleMap(
        initialCameraPosition: const CameraPosition(
          target: LatLng(39.8283, -98.5795), // Center of USA
          zoom: 4, // Zoomed out to show entire USA
        ),
        style: _darkMapStyle,
        markers: _markers,
        myLocationEnabled: true,
        myLocationButtonEnabled: true,
        mapToolbarEnabled: false,
        zoomControlsEnabled: false,
        onMapCreated: (controller) {
          _mapController = controller;
          // Move to user location if available
          if (_userLocation != null) {
            controller.animateCamera(
              CameraUpdate.newLatLngZoom(_userLocation!, 12),
            );
          }
          // Initialize bounds after map is created
          _updateVisibleEncounters();
        },
        onCameraMove: _onCameraMove,
        onCameraIdle: _onCameraIdle,
      ),
    );
  }

  Widget _buildNearbyList() {
    if (_visibleEncounters.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.search_off,
                size: 64,
                color: GhostAtlasColors.ghostGreen.withValues(alpha: 0.5),
              ),
              const SizedBox(height: 16),
              Text(
                'No Encounters in View',
                style: GhostAtlasTypography.textTheme.headlineMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Move or zoom the map to see encounters in other areas',
                style: TextStyle(
                  fontSize: 14,
                  color: GhostAtlasColors.textTertiary,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadEncounters,
      color: GhostAtlasColors.ghostGreen,
      backgroundColor: GhostAtlasColors.cardBackground,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header showing count
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Text(
              'Encounters in View (${_visibleEncounters.length})',
              style: TextStyle(
                fontFamily: GhostAtlasTypography.horrorFontFamily,
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: GhostAtlasColors.ghostGreen,
                letterSpacing: 1.2,
              ),
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              itemCount: _visibleEncounters.length,
              itemBuilder: (context, index) {
                final encounter = _visibleEncounters[index];
                final distance = _getDistanceToEncounter(encounter);

                return _buildEncounterCard(encounter, distance);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEncounterCard(Encounter encounter, double? distance) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: GhostAtlasColors.cardBackground,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: GhostAtlasColors.ghostGreen.withValues(alpha: 0.3),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: GhostAtlasColors.ghostGreenGlow,
            blurRadius: 8,
            spreadRadius: 1,
          ),
        ],
      ),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => StoryDetailScreen(encounter: encounter),
            ),
          );
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Thumbnail
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child:
                    encounter.illustrationUrls.isNotEmpty
                        ? Image.network(
                          encounter.illustrationUrls.first,
                          width: 80,
                          height: 80,
                          fit: BoxFit.cover,
                          errorBuilder:
                              (context, error, stackTrace) => Container(
                                width: 80,
                                height: 80,
                                color: GhostAtlasColors.secondaryBackground,
                                child: Icon(
                                  Icons.image_not_supported,
                                  color: GhostAtlasColors.textMuted,
                                ),
                              ),
                        )
                        : Container(
                          width: 80,
                          height: 80,
                          color: GhostAtlasColors.secondaryBackground,
                          child: Icon(
                            Icons.auto_awesome,
                            color: GhostAtlasColors.ghostGreen,
                          ),
                        ),
              ),
              const SizedBox(width: 12),

              // Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title and distance
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            encounter.title ?? _generateTitle(encounter),
                            style: TextStyle(
                              fontFamily: GhostAtlasTypography.horrorFontFamily,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                              color: GhostAtlasColors.ghostGreen,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (distance != null) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: GhostAtlasColors.ghostGreen.withValues(
                                alpha: 0.2,
                              ),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: GhostAtlasColors.ghostGreen.withValues(
                                  alpha: 0.5,
                                ),
                                width: 1,
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.location_on,
                                  size: 12,
                                  color: GhostAtlasColors.ghostGreen,
                                ),
                                const SizedBox(width: 2),
                                Text(
                                  _formatDistance(distance),
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: GhostAtlasColors.ghostGreen,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 6),

                    // Author and time
                    Row(
                      children: [
                        Icon(
                          Icons.person,
                          size: 12,
                          color: GhostAtlasColors.textTertiary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          encounter.authorName,
                          style: TextStyle(
                            fontSize: 12,
                            color: GhostAtlasColors.textTertiary,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Icon(
                          Icons.access_time,
                          size: 12,
                          color: GhostAtlasColors.textTertiary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          _formatDate(encounter.encounterTime),
                          style: TextStyle(
                            fontSize: 12,
                            color: GhostAtlasColors.textTertiary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    // Stats - just show comment count
                    Row(
                      children: [
                        _buildStat(
                          Icons.check_circle,
                          '${encounter.verifications.length} ${encounter.verifications.length == 1 ? 'Comment' : 'Comments'}',
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStat(IconData icon, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: GhostAtlasColors.ghostGreen),
        const SizedBox(width: 2),
        Text(
          label,
          style: TextStyle(
            color: GhostAtlasColors.ghostGreen,
            fontWeight: FontWeight.bold,
            fontSize: 11,
          ),
        ),
      ],
    );
  }
}
