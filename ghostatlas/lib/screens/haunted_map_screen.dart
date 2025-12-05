import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geocoding/geocoding.dart';
import '../models/encounter.dart';
import '../models/location_utils.dart';
import '../services/api_service.dart';
import '../services/location_service.dart';
import '../data/mock_encounters.dart';
import '../widgets/ghost_loading_indicator.dart';
import '../widgets/error_view.dart';
import '../widgets/empty_state.dart';
import '../theme/ghost_atlas_colors.dart';
import '../theme/ghost_atlas_typography.dart';

class HauntedMapScreen extends StatefulWidget {
  final VoidCallback? onLogoTapped;

  const HauntedMapScreen({super.key, this.onLogoTapped});

  @override
  State<HauntedMapScreen> createState() => _HauntedMapScreenState();
}

class _HauntedMapScreenState extends State<HauntedMapScreen>
    with TickerProviderStateMixin {
  final ApiService _apiService = ApiService();
  final LocationService _locationService = LocationService();
  GoogleMapController? _mapController;

  // Dark map style JSON for horror atmosphere
  static const String _darkMapStyle = '''
  [
    {
      "elementType": "geometry",
      "stylers": [{"color": "#0a0a0a"}]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#666666"}]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [{"color": "#000000"}]
    },
    {
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [{"color": "#00ff41"}, {"weight": 0.5}]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [{"color": "#121212"}]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#666666"}]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [{"color": "#0d1f0d"}]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{"color": "#1a1a1a"}]
    },
    {
      "featureType": "road",
      "elementType": "geometry.stroke",
      "stylers": [{"color": "#0a0a0a"}]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [{"color": "#1f1f1f"}]
    },
    {
      "featureType": "transit",
      "elementType": "geometry",
      "stylers": [{"color": "#121212"}]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{"color": "#000000"}]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#00ff41"}]
    }
  ]
  ''';

  List<Encounter> _encounters = [];
  List<Encounter> _filteredEncounters = [];
  Set<Marker> _markers = {};
  LatLng? _userLocation;
  bool _isLoading = true;
  String? _errorMessage;

  final TextEditingController _searchController = TextEditingController();
  StreamSubscription<LatLng>? _locationStreamSubscription;

  // Filter and sort options
  String _sortBy = 'rating'; // 'rating', 'distance', 'recent'
  double _maxDistance = 50.0; // km
  int _minRating = -100; // minimum rating filter
  bool _showFilters = false;
  bool _nearbyOnly = false; // Show only nearby encounters

  // Search autocomplete
  List<Location> _searchSuggestions = [];
  bool _isSearching = false;
  Timer? _searchDebounce;

  // View mode
  bool _showListView = false;

  // Animation for pulsing hotspot markers
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _initializePulseAnimation();
    _loadEncounters();
    _getUserLocation();
    _startLocationTracking();
  }

  @override
  void dispose() {
    _mapController?.dispose();
    _searchController.dispose();
    _locationStreamSubscription?.cancel();
    _pulseController.dispose();
    _searchDebounce?.cancel();
    _apiService.dispose();
    _locationService.dispose();
    super.dispose();
  }

  void _initializePulseAnimation() {
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat(reverse: true);
  }

  Future<void> _loadEncounters() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 500));

      // Use mock data instead of API
      final encounters = MockEncounters.getMockEncounters();

      setState(() {
        _encounters = encounters;
        _isLoading = false;
      });
      _applyFiltersAndSort();
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  void _applyFiltersAndSort() {
    List<Encounter> filtered = List.from(_encounters);

    // Apply distance filter if user location is available and nearby filter is enabled
    if (_userLocation != null && _nearbyOnly) {
      filtered =
          filtered.where((encounter) {
            final distance =
                _calculateDistance(
                  _userLocation!.latitude,
                  _userLocation!.longitude,
                  encounter.location.latitude,
                  encounter.location.longitude,
                ) /
                1000; // Convert to km
            return distance <= _maxDistance;
          }).toList();
    }

    // Apply rating filter
    filtered =
        filtered.where((encounter) {
          return encounter.rating >= _minRating;
        }).toList();

    // Sort encounters
    switch (_sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating.compareTo(a.rating));
        break;
      case 'distance':
        if (_userLocation != null) {
          filtered.sort((a, b) {
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
        }
        break;
      case 'recent':
        filtered.sort((a, b) => b.submittedAt.compareTo(a.submittedAt));
        break;
    }

    setState(() {
      _filteredEncounters = filtered;
    });
    _updateMarkers();
  }

  Future<void> _getUserLocation() async {
    try {
      final location = await _locationService.getCurrentPosition();
      setState(() {
        _userLocation = location;
      });

      // Auto-center map on user location when first loaded
      if (_mapController != null && _userLocation != null) {
        _mapController!.animateCamera(
          CameraUpdate.newLatLngZoom(_userLocation!, 12),
        );
      }

      // Reapply filters with location data
      _applyFiltersAndSort();
    } on LocationServiceException catch (e) {
      debugPrint('Location error: $e');
      if (mounted) {
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
      debugPrint('Error getting user location: $e');
    }
  }

  void _startLocationTracking() async {
    try {
      await _locationService.startLocationTracking(distanceFilter: 10);

      _locationStreamSubscription = _locationService.locationStream.listen(
        (LatLng location) {
          setState(() {
            _userLocation = location;
          });
          // Reapply filters when location changes (for distance sorting)
          if (_sortBy == 'distance') {
            _applyFiltersAndSort();
          }
        },
        onError: (error) {
          debugPrint('Location tracking error: $error');
          if (error is LocationServiceException && mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(error.message),
                duration: const Duration(seconds: 3),
              ),
            );
          }
        },
      );
    } on LocationServiceException catch (e) {
      debugPrint('Failed to start location tracking: $e');
    } catch (e) {
      debugPrint('Error starting location tracking: $e');
    }
  }

  void _updateMarkers() {
    final markers = <Marker>{};
    final hotspots = _detectHotspots();

    for (final encounter in _filteredEncounters) {
      final isHotspot = hotspots.any((h) => h.contains(encounter));

      markers.add(
        Marker(
          markerId: MarkerId(encounter.id),
          position: encounter.location,
          icon:
              isHotspot
                  ? BitmapDescriptor.defaultMarkerWithHue(
                    BitmapDescriptor.hueGreen, // Green for hotspots
                  )
                  : BitmapDescriptor.defaultMarkerWithHue(
                    120.0, // Light green for regular markers
                  ),
          onTap: () => _onMarkerTapped(encounter),
        ),
      );
    }

    setState(() {
      _markers = markers;
    });
  }

  List<List<Encounter>> _detectHotspots() {
    final hotspots = <List<Encounter>>[];
    final processed = <String>{};

    for (final encounter in _filteredEncounters) {
      if (processed.contains(encounter.id)) continue;

      final nearby =
          _filteredEncounters.where((e) {
            if (e.id == encounter.id || processed.contains(e.id)) return false;
            return _calculateDistance(
                  encounter.location.latitude,
                  encounter.location.longitude,
                  e.location.latitude,
                  e.location.longitude,
                ) <=
                50; // 50 meters
          }).toList();

      if (nearby.isNotEmpty) {
        final hotspot = [encounter, ...nearby];
        hotspots.add(hotspot);
        for (final e in hotspot) {
          processed.add(e.id);
        }
      }
    }

    return hotspots;
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
    _showEncounterBottomSheet(encounter);
  }

  void _showEncounterBottomSheet(Encounter encounter) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _buildEncounterPreview(encounter),
    );
  }

  Widget _buildEncounterPreview(Encounter encounter) {
    return Container(
      decoration: BoxDecoration(
        color: GhostAtlasColors.cardBackground,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        border: Border.all(
          color: GhostAtlasColors.ghostGreen.withOpacity(0.3),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: GhostAtlasColors.ghostGreenGlow,
            blurRadius: 20,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Handle bar
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: GhostAtlasColors.ghostGreen.withOpacity(0.5),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Illustration with vignette effect
          if (encounter.illustrationUrls.isNotEmpty)
            Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(
                    encounter.illustrationUrls.first,
                    height: 200,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder:
                        (context, error, stackTrace) => Container(
                          height: 200,
                          color: GhostAtlasColors.secondaryBackground,
                          child: Icon(
                            Icons.image_not_supported,
                            size: 50,
                            color: GhostAtlasColors.textMuted,
                          ),
                        ),
                  ),
                ),
                // Vignette overlay
                Container(
                  height: 200,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    gradient: RadialGradient(
                      center: Alignment.center,
                      radius: 1.0,
                      colors: [
                        Colors.transparent,
                        Colors.black.withOpacity(0.7),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          const SizedBox(height: 16),

          // Author and time
          Row(
            children: [
              Icon(Icons.person, size: 16, color: GhostAtlasColors.ghostGreen),
              const SizedBox(width: 4),
              Text(
                encounter.authorName,
                style: TextStyle(
                  fontFamily: GhostAtlasTypography.horrorFontFamily,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: GhostAtlasColors.ghostGreen,
                ),
              ),
              const Spacer(),
              Icon(
                Icons.access_time,
                size: 16,
                color: GhostAtlasColors.textTertiary,
              ),
              const SizedBox(width: 4),
              Text(
                _formatDate(encounter.encounterTime),
                style: TextStyle(
                  color: GhostAtlasColors.textTertiary,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Story preview
          Text(
            encounter.enhancedStory,
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 14,
              color: GhostAtlasColors.textSecondary,
            ),
          ),
          const SizedBox(height: 16),

          // Stats
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _buildStatChip(
                Icons.check_circle,
                '${encounter.verifications.length} ${encounter.verifications.length == 1 ? 'Comment' : 'Comments'}',
                GhostAtlasColors.ghostGreen,
              ),
              if (_userLocation != null)
                _buildStatChip(
                  Icons.location_on,
                  _formatDistance(_getDistanceToEncounter(encounter)!),
                  GhostAtlasColors.ghostGreenDim,
                ),
            ],
          ),
          const SizedBox(height: 16),

          // View details button
          Container(
            width: double.infinity,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(25),
              boxShadow: [
                BoxShadow(
                  color: GhostAtlasColors.ghostGreenGlow,
                  blurRadius: 20,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.pushNamed(
                  context,
                  '/story-detail',
                  arguments: encounter,
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                foregroundColor: GhostAtlasColors.ghostGreen,
                side: BorderSide(color: GhostAtlasColors.ghostGreen, width: 2),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(25),
                ),
                elevation: 0,
              ),
              child: Text(
                'VIEW FULL STORY',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: GhostAtlasColors.ghostGreen,
                  letterSpacing: 1.5,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatChip(IconData icon, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.3), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays == 0) {
      return 'Today';
    } else if (difference.inDays == 1) {
      return 'Yesterday';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} days ago';
    } else {
      return '${date.month}/${date.day}/${date.year}';
    }
  }

  String _formatDistance(double distanceMeters) {
    return LocationUtils.formatDistance(distanceMeters);
  }

  double? _getDistanceToEncounter(Encounter encounter) {
    if (_userLocation == null) return null;
    return LocationUtils.calculateDistance(_userLocation!, encounter.location);
  }

  Future<void> _onSearchChanged(String query) async {
    // Cancel previous search
    _searchDebounce?.cancel();

    if (query.isEmpty) {
      setState(() {
        _searchSuggestions = [];
        _isSearching = false;
      });
      return;
    }

    setState(() {
      _isSearching = true;
    });

    // Debounce search to avoid too many API calls
    _searchDebounce = Timer(const Duration(milliseconds: 500), () async {
      await _performSearch(query);
    });
  }

  Future<void> _performSearch(String query) async {
    try {
      final locations = await locationFromAddress(query);
      setState(() {
        _searchSuggestions = locations.take(5).toList();
        _isSearching = false;
      });
    } catch (e) {
      debugPrint('Search error: $e');
      setState(() {
        _searchSuggestions = [];
        _isSearching = false;
      });
    }
  }

  Future<void> _selectSearchResult(Location location) async {
    try {
      // Get place name for the location
      final placemarks = await placemarkFromCoordinates(
        location.latitude,
        location.longitude,
      );

      String placeName = 'Selected Location';
      if (placemarks.isNotEmpty) {
        final place = placemarks.first;
        placeName = [
          place.locality,
          place.administrativeArea,
          place.country,
        ].where((e) => e != null && e.isNotEmpty).join(', ');
      }

      setState(() {
        _searchController.text = placeName;
        _searchSuggestions = [];
      });

      // Move map to selected location
      final targetLocation = LatLng(location.latitude, location.longitude);
      _mapController?.animateCamera(
        CameraUpdate.newLatLngZoom(targetLocation, 14),
      );

      // Optionally update user location for distance calculations
      // (This is for search purposes, not actual GPS location)
      setState(() {
        _userLocation = targetLocation;
      });

      // Reapply filters with new location
      _applyFiltersAndSort();
    } catch (e) {
      debugPrint('Error selecting search result: $e');
    }
  }

  Widget _buildListView() {
    if (_filteredEncounters.isEmpty) {
      return RefreshIndicator(
        onRefresh: _loadEncounters,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: SizedBox(
            height: MediaQuery.of(context).size.height - 200,
            child: EmptyState(
              icon: Icons.search_off,
              title: 'No encounters found',
              message: 'Try adjusting your filters or pull to refresh',
              actionLabel: 'RESET FILTERS',
              onAction: () {
                setState(() {
                  _sortBy = 'rating';
                  _maxDistance = 50.0;
                  _minRating = -100;
                  _nearbyOnly = false;
                });
                _applyFiltersAndSort();
              },
            ),
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadEncounters,
      child: ListView.builder(
        padding: EdgeInsets.only(
          top: MediaQuery.of(context).padding.top + 220,
          bottom: 16,
          left: 16,
          right: 16,
        ),
        itemCount: _filteredEncounters.length,
        itemBuilder: (context, index) {
          final encounter = _filteredEncounters[index];
          final distance = _getDistanceToEncounter(encounter);

          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            elevation: 2,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            child: InkWell(
              onTap: () {
                Navigator.pushNamed(
                  context,
                  '/story-detail',
                  arguments: encounter,
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
                                      color: Colors.grey[300],
                                      child: const Icon(
                                        Icons.image_not_supported,
                                      ),
                                    ),
                              )
                              : Container(
                                width: 80,
                                height: 80,
                                color: Colors.grey[300],
                                child: const Icon(Icons.auto_awesome),
                              ),
                    ),
                    const SizedBox(width: 12),
                    // Content
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Author and distance
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  encounter.authorName,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                  maxLines: 1,
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
                                    color: Colors.purple.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(
                                        Icons.location_on,
                                        size: 12,
                                        color: Colors.purple,
                                      ),
                                      const SizedBox(width: 2),
                                      Text(
                                        _formatDistance(distance),
                                        style: const TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.purple,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ],
                          ),
                          const SizedBox(height: 4),
                          // Story preview
                          Text(
                            encounter.enhancedStory,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.grey[700],
                            ),
                          ),
                          const SizedBox(height: 8),
                          // Stats
                          Row(
                            children: [
                              _buildCompactStat(
                                Icons.check_circle,
                                '${encounter.verifications.length} ${encounter.verifications.length == 1 ? 'Comment' : 'Comments'}',
                                Colors.green,
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
        },
      ),
    );
  }

  Widget _buildCompactStat(IconData icon, String label, Color color) {
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Map or List View
          _isLoading
              ? const GhostLoadingIndicator(message: 'Loading encounters...')
              : _errorMessage != null
              ? ErrorView(message: _errorMessage!, onRetry: _loadEncounters)
              : _showListView
              ? _buildListView()
              : Stack(
                children: [
                  GoogleMap(
                    initialCameraPosition: CameraPosition(
                      target: _userLocation ?? const LatLng(37.7749, -122.4194),
                      zoom: 12,
                    ),
                    style: _darkMapStyle,
                    markers: _markers,
                    myLocationEnabled: true,
                    myLocationButtonEnabled:
                        true, // Enable default location button
                    mapToolbarEnabled: false,
                    zoomControlsEnabled: false,
                    onMapCreated: (controller) {
                      _mapController = controller;
                      // Auto-center on user location when map is created
                      if (_userLocation != null) {
                        controller.animateCamera(
                          CameraUpdate.newLatLngZoom(_userLocation!, 12),
                        );
                      }
                    },
                  ),
                  // Pull-to-refresh overlay for map view
                  Positioned(
                    top: MediaQuery.of(context).padding.top + 16,
                    right: 80,
                    child: Material(
                      elevation: 0,
                      borderRadius: BorderRadius.circular(8),
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: _loadEncounters,
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: GhostAtlasColors.cardBackground,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: GhostAtlasColors.ghostGreen.withOpacity(
                                0.3,
                              ),
                              width: 1,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: GhostAtlasColors.ghostGreenGlow,
                                blurRadius: 10,
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.refresh,
                                size: 18,
                                color: GhostAtlasColors.ghostGreen,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                'Refresh',
                                style: TextStyle(
                                  color: GhostAtlasColors.ghostGreen,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  letterSpacing: 1.2,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),

          // Logo (tappable for easter egg)
          Positioned(
            top: MediaQuery.of(context).padding.top + 16,
            left: 16,
            child: GestureDetector(
              onTap: widget.onLogoTapped,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: GhostAtlasColors.cardBackground,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: GhostAtlasColors.ghostGreen.withOpacity(0.3),
                    width: 1,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: GhostAtlasColors.ghostGreenGlow,
                      blurRadius: 15,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.auto_awesome,
                      color: GhostAtlasColors.ghostGreen,
                      size: 24,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'GhostAtlas',
                      style: TextStyle(
                        fontFamily: GhostAtlasTypography.horrorFontFamily,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: GhostAtlasColors.ghostGreen,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Search bar with autocomplete
          Positioned(
            top: MediaQuery.of(context).padding.top + 80,
            left: 16,
            right: 16,
            child: Column(
              children: [
                Container(
                  decoration: BoxDecoration(
                    color: GhostAtlasColors.cardBackground,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: GhostAtlasColors.ghostGreen.withOpacity(0.3),
                      width: 1,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: GhostAtlasColors.ghostGreenGlow,
                        blurRadius: 10,
                      ),
                    ],
                  ),
                  child: TextField(
                    controller: _searchController,
                    style: TextStyle(color: GhostAtlasColors.textPrimary),
                    decoration: InputDecoration(
                      hintText: 'Search haunted locations...',
                      hintStyle: TextStyle(color: GhostAtlasColors.textMuted),
                      prefixIcon:
                          _isSearching
                              ? Padding(
                                padding: const EdgeInsets.all(12.0),
                                child: SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: GhostAtlasColors.ghostGreen,
                                  ),
                                ),
                              )
                              : Icon(
                                Icons.search,
                                color: GhostAtlasColors.ghostGreen,
                              ),
                      suffixIcon:
                          _searchController.text.isNotEmpty
                              ? IconButton(
                                icon: Icon(
                                  Icons.clear,
                                  color: GhostAtlasColors.textMuted,
                                ),
                                onPressed: () {
                                  _searchController.clear();
                                  setState(() {
                                    _searchSuggestions = [];
                                  });
                                },
                              )
                              : null,
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 14,
                      ),
                    ),
                    onChanged: _onSearchChanged,
                  ),
                ),
                // Autocomplete suggestions
                if (_searchSuggestions.isNotEmpty)
                  Container(
                    margin: const EdgeInsets.only(top: 8),
                    decoration: BoxDecoration(
                      color: GhostAtlasColors.cardBackground,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: GhostAtlasColors.ghostGreen.withOpacity(0.3),
                        width: 1,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: GhostAtlasColors.ghostGreenGlow,
                          blurRadius: 10,
                        ),
                      ],
                    ),
                    child: ListView.separated(
                      shrinkWrap: true,
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      itemCount: _searchSuggestions.length,
                      separatorBuilder:
                          (context, index) => Divider(
                            height: 1,
                            indent: 16,
                            endIndent: 16,
                            color: GhostAtlasColors.ghostGreen.withOpacity(0.2),
                          ),
                      itemBuilder: (context, index) {
                        final location = _searchSuggestions[index];
                        return ListTile(
                          dense: true,
                          leading: Icon(
                            Icons.location_on,
                            color: GhostAtlasColors.ghostGreen,
                            size: 20,
                          ),
                          title: FutureBuilder<List<Placemark>>(
                            future: placemarkFromCoordinates(
                              location.latitude,
                              location.longitude,
                            ),
                            builder: (context, snapshot) {
                              if (snapshot.hasData &&
                                  snapshot.data!.isNotEmpty) {
                                final place = snapshot.data!.first;
                                final name = [
                                      place.locality,
                                      place.administrativeArea,
                                      place.country,
                                    ]
                                    .where((e) => e != null && e.isNotEmpty)
                                    .join(', ');
                                return Text(
                                  name,
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: GhostAtlasColors.textSecondary,
                                  ),
                                );
                              }
                              return Text(
                                '${location.latitude.toStringAsFixed(4)}, ${location.longitude.toStringAsFixed(4)}',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: GhostAtlasColors.textSecondary,
                                ),
                              );
                            },
                          ),
                          onTap: () => _selectSearchResult(location),
                        );
                      },
                    ),
                  ),
              ],
            ),
          ),

          // View toggle and filter buttons
          Positioned(
            top: MediaQuery.of(context).padding.top + 150,
            right: 16,
            child: Column(
              children: [
                Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: GhostAtlasColors.ghostGreenGlow,
                        blurRadius: 10,
                      ),
                    ],
                  ),
                  child: FloatingActionButton(
                    mini: true,
                    backgroundColor: GhostAtlasColors.cardBackground,
                    heroTag: 'view_toggle',
                    onPressed:
                        () => setState(() => _showListView = !_showListView),
                    child: Icon(
                      _showListView ? Icons.map : Icons.list,
                      color: GhostAtlasColors.ghostGreen,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: GhostAtlasColors.ghostGreenGlow,
                        blurRadius: 10,
                      ),
                    ],
                  ),
                  child: FloatingActionButton(
                    mini: true,
                    backgroundColor: GhostAtlasColors.cardBackground,
                    heroTag: 'filter_toggle',
                    onPressed:
                        () => setState(() => _showFilters = !_showFilters),
                    child: Icon(
                      _showFilters ? Icons.close : Icons.filter_list,
                      color: GhostAtlasColors.ghostGreen,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Filter panel
          if (_showFilters)
            Positioned(
              top: MediaQuery.of(context).padding.top + 200,
              left: 16,
              right: 16,
              child: Container(
                decoration: BoxDecoration(
                  color: GhostAtlasColors.cardBackground,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: GhostAtlasColors.ghostGreen.withOpacity(0.3),
                    width: 1,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: GhostAtlasColors.ghostGreenGlow,
                      blurRadius: 15,
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Sort & Filter',
                      style: TextStyle(
                        fontFamily: GhostAtlasTypography.horrorFontFamily,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: GhostAtlasColors.ghostGreen,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Sort options
                    Text(
                      'Sort by',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: GhostAtlasColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: [
                        ChoiceChip(
                          label: Text('Rating'),
                          selected: _sortBy == 'rating',
                          selectedColor: GhostAtlasColors.ghostGreen
                              .withOpacity(0.3),
                          backgroundColor: GhostAtlasColors.secondaryBackground,
                          labelStyle: TextStyle(
                            color:
                                _sortBy == 'rating'
                                    ? GhostAtlasColors.ghostGreen
                                    : GhostAtlasColors.textMuted,
                            fontWeight: FontWeight.w600,
                          ),
                          side: BorderSide(
                            color:
                                _sortBy == 'rating'
                                    ? GhostAtlasColors.ghostGreen
                                    : GhostAtlasColors.textMuted.withOpacity(
                                      0.3,
                                    ),
                          ),
                          onSelected: (selected) {
                            if (selected) {
                              setState(() => _sortBy = 'rating');
                              _applyFiltersAndSort();
                            }
                          },
                        ),
                        ChoiceChip(
                          label: Text('Distance'),
                          selected: _sortBy == 'distance',
                          selectedColor: GhostAtlasColors.ghostGreen
                              .withOpacity(0.3),
                          backgroundColor: GhostAtlasColors.secondaryBackground,
                          labelStyle: TextStyle(
                            color:
                                _sortBy == 'distance'
                                    ? GhostAtlasColors.ghostGreen
                                    : GhostAtlasColors.textMuted,
                            fontWeight: FontWeight.w600,
                          ),
                          side: BorderSide(
                            color:
                                _sortBy == 'distance'
                                    ? GhostAtlasColors.ghostGreen
                                    : GhostAtlasColors.textMuted.withOpacity(
                                      0.3,
                                    ),
                          ),
                          onSelected: (selected) {
                            if (selected) {
                              setState(() => _sortBy = 'distance');
                              _applyFiltersAndSort();
                            }
                          },
                        ),
                        ChoiceChip(
                          label: Text('Recent'),
                          selected: _sortBy == 'recent',
                          selectedColor: GhostAtlasColors.ghostGreen
                              .withOpacity(0.3),
                          backgroundColor: GhostAtlasColors.secondaryBackground,
                          labelStyle: TextStyle(
                            color:
                                _sortBy == 'recent'
                                    ? GhostAtlasColors.ghostGreen
                                    : GhostAtlasColors.textMuted,
                            fontWeight: FontWeight.w600,
                          ),
                          side: BorderSide(
                            color:
                                _sortBy == 'recent'
                                    ? GhostAtlasColors.ghostGreen
                                    : GhostAtlasColors.textMuted.withOpacity(
                                      0.3,
                                    ),
                          ),
                          onSelected: (selected) {
                            if (selected) {
                              setState(() => _sortBy = 'recent');
                              _applyFiltersAndSort();
                            }
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Nearby toggle
                    if (_userLocation != null) ...[
                      SwitchListTile(
                        dense: true,
                        contentPadding: EdgeInsets.zero,
                        title: Text(
                          'Show nearby only',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: GhostAtlasColors.textSecondary,
                          ),
                        ),
                        subtitle: Text(
                          'Within ${_maxDistance.toStringAsFixed(0)} km',
                          style: TextStyle(
                            fontSize: 12,
                            color: GhostAtlasColors.textTertiary,
                          ),
                        ),
                        value: _nearbyOnly,
                        activeColor: GhostAtlasColors.ghostGreen,
                        onChanged: (value) {
                          setState(() => _nearbyOnly = value);
                          _applyFiltersAndSort();
                        },
                      ),
                      const SizedBox(height: 8),
                    ],

                    // Distance filter
                    if (_userLocation != null) ...[
                      Text(
                        'Max Distance: ${_maxDistance.toStringAsFixed(0)} km',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: GhostAtlasColors.textSecondary,
                        ),
                      ),
                      SliderTheme(
                        data: SliderThemeData(
                          activeTrackColor: GhostAtlasColors.ghostGreen,
                          inactiveTrackColor: GhostAtlasColors.textMuted
                              .withOpacity(0.3),
                          thumbColor: GhostAtlasColors.ghostGreen,
                          overlayColor: GhostAtlasColors.ghostGreenGlow,
                          valueIndicatorColor: GhostAtlasColors.ghostGreen,
                          valueIndicatorTextStyle: TextStyle(
                            color: GhostAtlasColors.primaryBackground,
                          ),
                        ),
                        child: Slider(
                          value: _maxDistance,
                          min: 1,
                          max: 100,
                          divisions: 99,
                          label: '${_maxDistance.toStringAsFixed(0)} km',
                          onChanged: (value) {
                            setState(() => _maxDistance = value);
                          },
                          onChangeEnd: (value) {
                            _applyFiltersAndSort();
                          },
                        ),
                      ),
                      const SizedBox(height: 8),
                    ],

                    // Rating filter
                    Text(
                      'Min Rating: ${_minRating == -100 ? 'Any' : _minRating}',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: GhostAtlasColors.textSecondary,
                      ),
                    ),
                    SliderTheme(
                      data: SliderThemeData(
                        activeTrackColor: GhostAtlasColors.ghostGreen,
                        inactiveTrackColor: GhostAtlasColors.textMuted
                            .withOpacity(0.3),
                        thumbColor: GhostAtlasColors.ghostGreen,
                        overlayColor: GhostAtlasColors.ghostGreenGlow,
                        valueIndicatorColor: GhostAtlasColors.ghostGreen,
                        valueIndicatorTextStyle: TextStyle(
                          color: GhostAtlasColors.primaryBackground,
                        ),
                      ),
                      child: Slider(
                        value: _minRating.toDouble(),
                        min: -100,
                        max: 100,
                        divisions: 40,
                        label:
                            _minRating == -100 ? 'Any' : _minRating.toString(),
                        onChanged: (value) {
                          setState(() => _minRating = value.toInt());
                        },
                        onChangeEnd: (value) {
                          _applyFiltersAndSort();
                        },
                      ),
                    ),
                    const SizedBox(height: 8),

                    // Results count
                    Center(
                      child: Text(
                        'Showing ${_filteredEncounters.length} of ${_encounters.length} encounters',
                        style: TextStyle(
                          fontSize: 12,
                          color: GhostAtlasColors.textTertiary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
