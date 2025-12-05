import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/encounter.dart';
import '../theme/ghost_atlas_colors.dart';
import '../theme/ghost_atlas_typography.dart';
import '../utils/image_effects.dart';

/// A story card widget that displays a ghost encounter with atmospheric styling.
/// Features dark backgrounds, green borders, vignette effects, and horror typography.
class StoryCard extends StatelessWidget {
  final Encounter encounter;
  final VoidCallback? onTap;

  const StoryCard({super.key, required this.encounter, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: GhostAtlasColors.cardBackground,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: Colors.red.withValues(alpha: 0.5),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.red.withValues(alpha: 0.2),
              blurRadius: 10,
              spreadRadius: 1,
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image with vignette overlay and AI badge
            if (encounter.illustrationUrls.isNotEmpty) _buildImageSection(),

            // Content section
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title in horror font
                  _buildTitle(),

                  const SizedBox(height: 8),

                  // Location and date metadata
                  _buildMetadata(),

                  const SizedBox(height: 12),

                  // Rating and verification count
                  _buildStats(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Builds the image section with vignette overlay and AI badge
  Widget _buildImageSection() {
    // Check if AI enhancement is complete
    final bool isEnhanced =
        encounter.illustrationUrls.isNotEmpty &&
        encounter.enhancedStory != encounter.originalStory;

    return Stack(
      children: [
        // Main image with vignette effect
        ImageEffects.withVignette(
          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
          intensity: 0.7,
          child: ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            child: Image.network(
              encounter.illustrationUrls.first,
              height: 200,
              width: double.infinity,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  height: 200,
                  color: GhostAtlasColors.secondaryBackground,
                  child: const Center(
                    child: Icon(
                      Icons.image_not_supported,
                      size: 48,
                      color: GhostAtlasColors.textMuted,
                    ),
                  ),
                );
              },
              loadingBuilder: (context, child, loadingProgress) {
                if (loadingProgress == null) return child;
                return Container(
                  height: 200,
                  color: GhostAtlasColors.secondaryBackground,
                  child: Center(
                    child: CircularProgressIndicator(
                      value:
                          loadingProgress.expectedTotalBytes != null
                              ? loadingProgress.cumulativeBytesLoaded /
                                  loadingProgress.expectedTotalBytes!
                              : null,
                      color: GhostAtlasColors.ghostGreen,
                    ),
                  ),
                );
              },
            ),
          ),
        ),
        // AI Enhancement badge
        if (isEnhanced)
          Positioned(
            top: 8,
            right: 8,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: GhostAtlasColors.ghostGreen.withValues(alpha: 0.9),
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: GhostAtlasColors.ghostGreenGlow,
                    blurRadius: 8,
                    spreadRadius: 1,
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.auto_awesome,
                    size: 14,
                    color: GhostAtlasColors.primaryBackground,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'AI Enhanced',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: GhostAtlasColors.primaryBackground,
                    ),
                  ),
                ],
              ),
            ),
          ),
        // Enhancement in progress badge
        if (!isEnhanced)
          Positioned(
            top: 8,
            right: 8,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.orange.withValues(alpha: 0.9),
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.orange.withValues(alpha: 0.3),
                    blurRadius: 8,
                    spreadRadius: 1,
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(
                    width: 12,
                    height: 12,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        GhostAtlasColors.primaryBackground,
                      ),
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Enhancing...',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: GhostAtlasColors.primaryBackground,
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }

  /// Builds the title using horror font
  Widget _buildTitle() {
    // Use the AI-generated title or fallback to generated one
    final title = encounter.title ?? _generateTitle();

    return Text(
      title,
      style: GhostAtlasTypography.storyTitle.copyWith(fontSize: 18),
      maxLines: 2,
      overflow: TextOverflow.ellipsis,
    );
  }

  /// Builds the location and date metadata row
  Widget _buildMetadata() {
    return Row(
      children: [
        // Location icon and text
        Icon(Icons.location_on, size: 14, color: GhostAtlasColors.textTertiary),
        const SizedBox(width: 4),
        Flexible(
          child: Text(
            _formatLocation(),
            style: TextStyle(
              fontSize: 12,
              color: GhostAtlasColors.textTertiary,
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ),
        const SizedBox(width: 12),

        // Date icon and text
        Icon(
          Icons.calendar_today,
          size: 14,
          color: GhostAtlasColors.textTertiary,
        ),
        const SizedBox(width: 4),
        Text(
          _formatDate(encounter.encounterTime),
          style: TextStyle(fontSize: 12, color: GhostAtlasColors.textTertiary),
        ),
      ],
    );
  }

  /// Builds the verification stats row
  Widget _buildStats() {
    return Row(
      children: [
        // Verification count with check icon
        Icon(Icons.check_circle, size: 18, color: GhostAtlasColors.ghostGreen),
        const SizedBox(width: 6),
        Text(
          '${encounter.verifications.length} ${encounter.verifications.length == 1 ? 'Comment' : 'Comments'}',
          style: TextStyle(
            fontSize: 14,
            color: GhostAtlasColors.textSecondary,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  /// Generates a title from the enhanced story
  String _generateTitle() {
    // Try to extract the first sentence or first 50 characters as a title
    final story = encounter.enhancedStory.trim();

    if (story.isEmpty) {
      return 'Untitled Encounter';
    }

    // Find the first sentence (ending with . ! or ?)
    final sentenceEnd = RegExp(r'[.!?]').firstMatch(story);
    if (sentenceEnd != null && sentenceEnd.start < 80) {
      return story.substring(0, sentenceEnd.start).trim();
    }

    // Otherwise, take first 50 characters
    if (story.length > 50) {
      return '${story.substring(0, 50).trim()}...';
    }

    return story;
  }

  /// Formats the location coordinates as a string
  String _formatLocation() {
    final lat = encounter.location.latitude;
    final lng = encounter.location.longitude;

    // Format coordinates with 2 decimal places
    final latStr = lat.toStringAsFixed(2);
    final lngStr = lng.toStringAsFixed(2);

    // Determine cardinal directions
    final latDir = lat >= 0 ? 'N' : 'S';
    final lngDir = lng >= 0 ? 'E' : 'W';

    return '${latStr.replaceAll('-', '')}°$latDir, ${lngStr.replaceAll('-', '')}°$lngDir';
  }

  /// Formats a date as a readable string
  String _formatDate(DateTime date) {
    final formatter = DateFormat('MMM d, yyyy');
    return formatter.format(date);
  }
}
