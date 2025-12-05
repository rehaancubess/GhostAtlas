import 'package:flutter/material.dart';
import '../theme/ghost_atlas_colors.dart';
import '../theme/ghost_atlas_typography.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GhostAtlasColors.primaryBackground,
      appBar: AppBar(
        backgroundColor: GhostAtlasColors.secondaryBackground,
        elevation: 0,
        title: Text(
          'Privacy Policy',
          style: GhostAtlasTypography.appTitle.copyWith(
            fontSize: 24,
            color: GhostAtlasColors.ghostGreen,
          ),
        ),
        iconTheme: IconThemeData(color: GhostAtlasColors.ghostGreen),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSection('Last Updated', 'December 2025'),
            const SizedBox(height: 24),
            _buildSection(
              '1. Information We Collect',
              'GhostAtlas collects the following information:\n\n'
                  '• Location data when you submit or verify encounters\n'
                  '• Story content and author names you provide\n'
                  '• Device identifiers for preventing duplicate ratings\n'
                  '• Usage data to improve the app experience',
            ),
            const SizedBox(height: 24),
            _buildSection(
              '2. How We Use Your Information',
              'We use your information to:\n\n'
                  '• Display your stories on the map and in the stories section\n'
                  '• Prevent duplicate ratings and verifications\n'
                  '• Generate AI-enhanced narratives and illustrations\n'
                  '• Improve app functionality and user experience',
            ),
            const SizedBox(height: 24),
            _buildSection(
              '3. Data Storage',
              'Your data is stored securely on AWS servers. We implement industry-standard security measures to protect your information.',
            ),
            const SizedBox(height: 24),
            _buildSection(
              '4. Data Sharing',
              'We do not sell or share your personal information with third parties. Your stories are publicly visible on the map if marked as public.',
            ),
            const SizedBox(height: 24),
            _buildSection(
              '5. Your Rights',
              'You have the right to:\n\n'
                  '• Request deletion of your stories\n'
                  '• Update your information\n'
                  '• Opt out of data collection\n\n'
                  'Contact us at rehaancubes@gmail.com for any requests.',
            ),
            const SizedBox(height: 24),
            _buildSection(
              '6. Children\'s Privacy',
              'GhostAtlas is not intended for children under 13. We do not knowingly collect information from children.',
            ),
            const SizedBox(height: 24),
            _buildSection(
              '7. Changes to This Policy',
              'We may update this privacy policy from time to time. Continued use of the app constitutes acceptance of any changes.',
            ),
            const SizedBox(height: 24),
            _buildSection(
              'Contact Us',
              'For questions about this privacy policy, contact:\nrehaancubes@gmail.com',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(String title, String content) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: GhostAtlasColors.ghostGreen,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          content,
          style: TextStyle(
            fontSize: 14,
            height: 1.6,
            color: GhostAtlasColors.textSecondary,
          ),
        ),
      ],
    );
  }
}
