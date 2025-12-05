import 'package:flutter/material.dart';
import '../models/encounter.dart';
import '../services/api_service.dart';
import '../services/read_stories_service.dart';
import '../theme/ghost_atlas_colors.dart';
import '../theme/ghost_atlas_typography.dart';
import '../widgets/story_card.dart';
import '../widgets/ghost_loading_indicator.dart';
import '../widgets/error_view.dart';
import '../widgets/empty_state.dart';
import 'story_detail_screen.dart';

/// Stories tab screen displaying a scrollable list of ghost encounters.
/// Features atmospheric styling, pull-to-refresh, and filter/sort options.
class StoriesTab extends StatefulWidget {
  final VoidCallback? onTitleTap;

  const StoriesTab({super.key, this.onTitleTap});

  @override
  State<StoriesTab> createState() => _StoriesTabState();
}

class _StoriesTabState extends State<StoriesTab> {
  final ApiService _apiService = ApiService();
  final ReadStoriesService _readStoriesService = ReadStoriesService();
  List<Encounter> _encounters = [];
  List<Encounter> _filteredEncounters = [];
  Set<String> _readStoryIds = {};
  bool _isLoading = true;
  bool _showingReadStories = false;
  String? _errorMessage;
  String _sortBy = 'recent'; // 'recent', 'rating', 'verified'
  String _filterBy = 'all'; // 'all', 'illustrated', 'narrated'

  @override
  void initState() {
    super.initState();
    _loadEncounters();
  }

  @override
  void dispose() {
    _apiService.dispose();
    super.dispose();
  }

  /// Load encounters from the API
  Future<void> _loadEncounters() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Fetch approved encounters from API
      final encounters = await _apiService.getEncounters();

      // Load read stories
      final readStories = await _readStoriesService.getReadStories();

      setState(() {
        _encounters = encounters;
        _readStoryIds = readStories.toSet();
        _applySortAndFilter();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load stories: ${e.toString()}';
        _isLoading = false;
      });
    }
  }

  /// Apply current sort and filter settings
  void _applySortAndFilter() {
    // Filter by read/unread status
    List<Encounter> filtered =
        _showingReadStories
            ? _encounters.where((e) => _readStoryIds.contains(e.id)).toList()
            : _encounters.where((e) => !_readStoryIds.contains(e.id)).toList();

    // Apply content filter
    switch (_filterBy) {
      case 'illustrated':
        filtered =
            filtered.where((e) => e.illustrationUrls.isNotEmpty).toList();
        break;
      case 'narrated':
        filtered = filtered.where((e) => e.narrationUrl != null).toList();
        break;
      case 'all':
      default:
        // No filtering
        break;
    }

    // Apply sort
    switch (_sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating.compareTo(a.rating));
        break;
      case 'verified':
        filtered.sort(
          (a, b) => b.verificationCount.compareTo(a.verificationCount),
        );
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => b.submittedAt.compareTo(a.submittedAt));
        break;
    }

    setState(() {
      _filteredEncounters = filtered;
    });
  }

  /// Show sort options bottom sheet
  void _showSortOptions() {
    showModalBottomSheet(
      context: context,
      backgroundColor: GhostAtlasColors.cardBackground,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        side: BorderSide(color: GhostAtlasColors.ghostGreen, width: 1),
      ),
      builder:
          (context) => Container(
            padding: const EdgeInsets.symmetric(vertical: 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Title
                Text(
                  'SORT BY',
                  style: GhostAtlasTypography.textTheme.labelLarge,
                ),
                const SizedBox(height: 16),
                const Divider(color: GhostAtlasColors.textMuted, height: 1),

                // Sort options
                _buildSortOption('Most Recent', 'recent', Icons.access_time),
                _buildSortOption('Highest Rated', 'rating', Icons.star),
                _buildSortOption('Most Verified', 'verified', Icons.verified),
              ],
            ),
          ),
    );
  }

  /// Build a single sort option
  Widget _buildSortOption(String label, String value, IconData icon) {
    final isSelected = _sortBy == value;

    return ListTile(
      leading: Icon(
        icon,
        color:
            isSelected
                ? GhostAtlasColors.ghostGreen
                : GhostAtlasColors.textMuted,
      ),
      title: Text(
        label,
        style: TextStyle(
          color:
              isSelected
                  ? GhostAtlasColors.ghostGreen
                  : GhostAtlasColors.textSecondary,
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
        ),
      ),
      trailing:
          isSelected
              ? const Icon(Icons.check, color: GhostAtlasColors.ghostGreen)
              : null,
      onTap: () {
        setState(() {
          _sortBy = value;
        });
        Navigator.pop(context);
        _loadEncounters();
      },
    );
  }

  /// Show filter options bottom sheet
  void _showFilterOptions() {
    showModalBottomSheet(
      context: context,
      backgroundColor: GhostAtlasColors.cardBackground,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        side: BorderSide(color: GhostAtlasColors.ghostGreen, width: 1),
      ),
      builder:
          (context) => Container(
            padding: const EdgeInsets.symmetric(vertical: 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Title
                Text(
                  'FILTER BY',
                  style: GhostAtlasTypography.textTheme.labelLarge,
                ),
                const SizedBox(height: 16),
                const Divider(color: GhostAtlasColors.textMuted, height: 1),

                // Filter options
                _buildFilterOption('All Stories', 'all', Icons.auto_stories),
                _buildFilterOption(
                  'With Illustrations',
                  'illustrated',
                  Icons.image,
                ),
                _buildFilterOption(
                  'With Narration',
                  'narrated',
                  Icons.volume_up,
                ),
              ],
            ),
          ),
    );
  }

  /// Build a single filter option
  Widget _buildFilterOption(String label, String value, IconData icon) {
    final isSelected = _filterBy == value;

    return ListTile(
      leading: Icon(
        icon,
        color:
            isSelected
                ? GhostAtlasColors.ghostGreen
                : GhostAtlasColors.textMuted,
      ),
      title: Text(
        label,
        style: TextStyle(
          color:
              isSelected
                  ? GhostAtlasColors.ghostGreen
                  : GhostAtlasColors.textSecondary,
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
        ),
      ),
      trailing:
          isSelected
              ? const Icon(Icons.check, color: GhostAtlasColors.ghostGreen)
              : null,
      onTap: () {
        setState(() {
          _filterBy = value;
        });
        Navigator.pop(context);
        _loadEncounters();
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GhostAtlasColors.primaryBackground,
      appBar: AppBar(
        backgroundColor: GhostAtlasColors.secondaryBackground,
        elevation: 0,
        title: GestureDetector(
          onTap: widget.onTitleTap,
          child: RichText(
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
                  text: 'Atlas',
                  style: GhostAtlasTypography.appTitle.copyWith(
                    color: Colors.red,
                    fontSize: 28,
                  ),
                ),
              ],
            ),
          ),
        ),
        centerTitle: true,
        actions: [
          // Sort button
          IconButton(
            icon: const Icon(Icons.sort, color: GhostAtlasColors.ghostGreen),
            onPressed: _showSortOptions,
            tooltip: 'Sort',
          ),
        ],
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

  /// Build the main body content based on current state
  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: GhostLoadingIndicator(message: 'Loading stories...'),
      );
    }

    if (_errorMessage != null) {
      return ErrorView(message: _errorMessage!, onRetry: _loadEncounters);
    }

    if (_encounters.isEmpty) {
      return EmptyState(
        icon: Icons.auto_stories,
        title: 'No Stories Found',
        message: _getEmptyStateMessage(),
        actionLabel: 'Refresh',
        onAction: _loadEncounters,
      );
    }

    return RefreshIndicator(
      onRefresh: _loadEncounters,
      color: GhostAtlasColors.ghostGreen,
      backgroundColor: GhostAtlasColors.cardBackground,
      child: Column(
        children: [
          Expanded(
            child:
                _filteredEncounters.isEmpty
                    ? Center(
                      child: EmptyState(
                        icon: Icons.auto_stories,
                        title:
                            _showingReadStories
                                ? 'No Read Stories'
                                : 'No New Stories',
                        message:
                            _showingReadStories
                                ? 'You haven\'t read any stories yet.\nExplore the unread stories!'
                                : _getEmptyStateMessage(),
                      ),
                    )
                    : ListView.builder(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      itemCount: _filteredEncounters.length,
                      itemBuilder: (context, index) {
                        final encounter = _filteredEncounters[index];
                        return StoryCard(
                          encounter: encounter,
                          onTap: () => _navigateToStoryDetail(encounter),
                        );
                      },
                    ),
          ),
          // Button to toggle read/unread stories
          if (!_showingReadStories && _readStoryIds.isNotEmpty ||
              _showingReadStories)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: GhostAtlasColors.secondaryBackground,
                border: Border(
                  top: BorderSide(
                    color: GhostAtlasColors.ghostGreen.withValues(alpha: 0.3),
                    width: 1,
                  ),
                ),
              ),
              child: SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () {
                    setState(() {
                      _showingReadStories = !_showingReadStories;
                      _applySortAndFilter();
                    });
                  },
                  icon: Icon(
                    _showingReadStories ? Icons.fiber_new : Icons.history,
                    color: GhostAtlasColors.ghostGreen,
                  ),
                  label: Text(
                    _showingReadStories
                        ? 'View New Stories'
                        : 'View Read Stories (${_readStoryIds.length})',
                    style: TextStyle(
                      color: GhostAtlasColors.ghostGreen,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 1.2,
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: GhostAtlasColors.ghostGreen),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  /// Get appropriate empty state message based on current filter
  String _getEmptyStateMessage() {
    switch (_filterBy) {
      case 'illustrated':
        return 'No stories with AI illustrations found.\nTry changing your filter.';
      case 'narrated':
        return 'No stories with narration found.\nTry changing your filter.';
      default:
        return 'The paranormal realm is quiet...\nBe the first to share an encounter.';
    }
  }

  /// Navigate to story detail screen
  Future<void> _navigateToStoryDetail(Encounter encounter) async {
    // Mark as read
    await _readStoriesService.markAsRead(encounter.id);

    // Update local state
    setState(() {
      _readStoryIds.add(encounter.id);
      _applySortAndFilter();
    });

    // Navigate to detail
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => StoryDetailScreen(encounter: encounter),
      ),
    );
  }
}
