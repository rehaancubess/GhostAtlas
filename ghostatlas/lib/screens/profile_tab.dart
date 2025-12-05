import 'package:flutter/material.dart';
import '../models/encounter.dart';
import '../services/api_service.dart';
import '../services/device_id_service.dart';
import '../data/mock_encounters.dart';
import '../theme/ghost_atlas_colors.dart';
import '../theme/ghost_atlas_typography.dart';
import '../widgets/story_card.dart';
import '../widgets/ghost_loading_indicator.dart';
import '../widgets/error_view.dart';
import 'story_detail_screen.dart';
import 'privacy_policy_screen.dart';
import 'terms_of_use_screen.dart';

/// Profile tab screen displaying user statistics, settings, and submitted stories.
/// Features atmospheric styling with dark backgrounds and green accents.
class ProfileTab extends StatefulWidget {
  const ProfileTab({super.key});

  @override
  State<ProfileTab> createState() => _ProfileTabState();
}

class _ProfileTabState extends State<ProfileTab> {
  final ApiService _apiService = ApiService();
  List<Encounter> _userEncounters = [];
  bool _isLoading = true;
  String? _errorMessage;

  // Mock user statistics - in a real app, these would come from the API
  final Map<String, dynamic> _userStats = {
    'storiesSubmitted': 0,
    'verifications': 0,
    'avgSpookiness': 0.0,
  };

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  @override
  void dispose() {
    _apiService.dispose();
    super.dispose();
  }

  /// Load user data including statistics and submitted stories
  Future<void> _loadUserData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Get all encounters from API
      List<Encounter> allEncounters;
      try {
        allEncounters = await _apiService.getEncounters();

        // If API returns empty, use mock data
        if (allEncounters.isEmpty) {
          allEncounters = MockEncounters.getMockEncounters();
        }
      } catch (e) {
        debugPrint('API error, using mock data: $e');
        // Fall back to mock data if API fails
        allEncounters = MockEncounters.getMockEncounters();
      }

      // Get device ID to filter user's own stories
      final deviceIdService = DeviceIdService();
      final deviceId = await deviceIdService.getDeviceId();

      // Filter encounters by device ID to show only user's stories
      _userEncounters =
          allEncounters
              .where((encounter) => encounter.deviceId == deviceId)
              .toList();

      // Sort by submission date (newest first)
      _userEncounters.sort((a, b) => b.submittedAt.compareTo(a.submittedAt));

      // Calculate statistics
      setState(() {
        _userStats['storiesSubmitted'] = _userEncounters.length;
        _userStats['verifications'] = _userEncounters.fold(
          0,
          (sum, e) => sum + e.verifications.length,
        );

        // Calculate average spookiness across all user stories
        if (_userEncounters.isNotEmpty) {
          final totalSpookiness = _userEncounters.fold<double>(
            0.0,
            (sum, e) => sum + (e.averageSpookiness ?? 0.0),
          );
          _userStats['avgSpookiness'] =
              totalSpookiness / _userEncounters.length;
        } else {
          _userStats['avgSpookiness'] = 0.0;
        }

        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
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
                text: 'My ',
                style: GhostAtlasTypography.appTitle.copyWith(
                  color: GhostAtlasColors.ghostGreen,
                  fontSize: 28,
                ),
              ),
              TextSpan(
                text: 'Profile',
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

  /// Build the main body content based on current state
  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: GhostLoadingIndicator(message: 'Loading profile...'),
      );
    }

    if (_errorMessage != null) {
      return ErrorView(message: _errorMessage!, onRetry: _loadUserData);
    }

    return RefreshIndicator(
      onRefresh: _loadUserData,
      color: GhostAtlasColors.ghostGreen,
      backgroundColor: GhostAtlasColors.cardBackground,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // User statistics cards
            _buildStatisticsSection(),

            const SizedBox(height: 24),

            // Settings section
            _buildSettingsSection(),

            const SizedBox(height: 24),

            // User's submitted stories
            _buildStoriesSection(),
          ],
        ),
      ),
    );
  }

  /// Build the statistics section with themed cards
  Widget _buildStatisticsSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section title
          Text(
            'YOUR PARANORMAL ACTIVITY',
            style: GhostAtlasTypography.textTheme.labelLarge,
          ),
          const SizedBox(height: 16),

          // Statistics cards in a row
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  icon: Icons.auto_stories,
                  label: 'Stories',
                  value: _userStats['storiesSubmitted']!,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatCard(
                  icon: Icons.verified,
                  label: 'Comments',
                  value: _userStats['verifications']!,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildSpookinessStatCard(
                  icon: Icons.auto_awesome,
                  label: 'Avg Spookiness',
                  value: _userStats['avgSpookiness']!,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Build a single statistics card
  Widget _buildStatCard({
    required IconData icon,
    required String label,
    required int value,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
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
      child: Column(
        children: [
          // Icon
          Icon(icon, size: 32, color: GhostAtlasColors.ghostGreen),
          const SizedBox(height: 8),

          // Value
          Text(
            value.toString(),
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: GhostAtlasColors.textPrimary,
            ),
          ),

          // Label
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: GhostAtlasColors.textTertiary,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }

  /// Build a spookiness statistics card with decimal value
  Widget _buildSpookinessStatCard({
    required IconData icon,
    required String label,
    required double value,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
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
      child: Column(
        children: [
          // Icon
          Icon(icon, size: 32, color: GhostAtlasColors.ghostGreen),
          const SizedBox(height: 8),

          // Value
          Text(
            value.toStringAsFixed(1),
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: GhostAtlasColors.textPrimary,
            ),
          ),

          // Label
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: GhostAtlasColors.textTertiary,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }

  /// Build the settings section
  Widget _buildSettingsSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section title
          Text(
            'LEGAL & SUPPORT',
            style: GhostAtlasTypography.textTheme.labelLarge,
          ),
          const SizedBox(height: 16),

          // Settings list
          Container(
            decoration: BoxDecoration(
              color: GhostAtlasColors.cardBackground,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: GhostAtlasColors.ghostGreen.withValues(alpha: 0.3),
                width: 1,
              ),
            ),
            child: Column(
              children: [
                _buildSettingItem(
                  icon: Icons.privacy_tip,
                  title: 'Privacy Policy',
                  subtitle: 'How we protect your data',
                  onTap: () => _navigateToPrivacyPolicy(),
                ),
                _buildDivider(),
                _buildSettingItem(
                  icon: Icons.description,
                  title: 'Terms of Use',
                  subtitle: 'Terms and conditions',
                  onTap: () => _navigateToTermsOfUse(),
                ),
                _buildDivider(),
                _buildSettingItem(
                  icon: Icons.email,
                  title: 'Contact Us',
                  subtitle: 'Get in touch with support',
                  onTap: () => _showContactDialog(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Build a single setting item
  Widget _buildSettingItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: GhostAtlasColors.ghostGreen.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, size: 20, color: GhostAtlasColors.ghostGreen),
      ),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w500,
          color: GhostAtlasColors.textPrimary,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: TextStyle(fontSize: 12, color: GhostAtlasColors.textTertiary),
      ),
      trailing: Icon(Icons.chevron_right, color: GhostAtlasColors.ghostGreen),
      onTap: onTap,
    );
  }

  /// Build a divider between settings items
  Widget _buildDivider() {
    return Divider(
      height: 1,
      thickness: 1,
      color: GhostAtlasColors.ghostGreen.withValues(alpha: 0.1),
      indent: 16,
      endIndent: 16,
    );
  }

  /// Build the user's submitted stories section
  Widget _buildStoriesSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section title
          Text(
            'YOUR ENCOUNTERS',
            style: GhostAtlasTypography.textTheme.labelLarge,
          ),
          const SizedBox(height: 16),

          // Stories list or empty state
          if (_userEncounters.isEmpty)
            _buildEmptyStoriesState()
          else
            ..._userEncounters.map((encounter) {
              return StoryCard(
                encounter: encounter,
                onTap: () => _navigateToStoryDetail(encounter),
              );
            }),
        ],
      ),
    );
  }

  /// Build horror-themed empty state for new users
  Widget _buildEmptyStoriesState() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: GhostAtlasColors.cardBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: GhostAtlasColors.ghostGreen.withValues(alpha: 0.3),
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
      child: Column(
        children: [
          // Ghost icon
          Icon(
            Icons.auto_stories_outlined,
            size: 64,
            color: GhostAtlasColors.ghostGreen.withValues(alpha: 0.5),
          ),
          const SizedBox(height: 16),

          // Title
          Text(
            'No Encounters Yet',
            style: GhostAtlasTypography.textTheme.headlineMedium?.copyWith(
              fontSize: 20,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),

          // Message
          Text(
            'The spirits are waiting...\nShare your first paranormal encounter',
            style: TextStyle(
              fontSize: 14,
              color: GhostAtlasColors.textTertiary,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  /// Navigate to Privacy Policy screen
  void _navigateToPrivacyPolicy() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const PrivacyPolicyScreen()),
    );
  }

  /// Navigate to Terms of Use screen
  void _navigateToTermsOfUse() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const TermsOfUseScreen()),
    );
  }

  /// Show contact dialog with email
  void _showContactDialog() {
    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            backgroundColor: GhostAtlasColors.cardBackground,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(
                color: GhostAtlasColors.ghostGreen.withValues(alpha: 0.3),
                width: 1,
              ),
            ),
            title: Row(
              children: [
                Icon(Icons.email, color: GhostAtlasColors.ghostGreen),
                const SizedBox(width: 8),
                Text(
                  'Contact Us',
                  style: TextStyle(
                    color: GhostAtlasColors.ghostGreen,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Have questions or feedback?',
                  style: TextStyle(
                    color: GhostAtlasColors.textPrimary,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Email us at:',
                  style: TextStyle(
                    color: GhostAtlasColors.textTertiary,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                SelectableText(
                  'rehaancubes@gmail.com',
                  style: TextStyle(
                    color: GhostAtlasColors.ghostGreen,
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: Text(
                  'CLOSE',
                  style: TextStyle(
                    color: GhostAtlasColors.ghostGreen,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
    );
  }

  /// Navigate to story detail screen
  void _navigateToStoryDetail(Encounter encounter) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => StoryDetailScreen(encounter: encounter),
      ),
    );
  }
}
