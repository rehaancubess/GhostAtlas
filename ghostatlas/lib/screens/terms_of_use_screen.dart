import 'package:flutter/material.dart';
import '../theme/ghost_atlas_colors.dart';
import '../theme/ghost_atlas_typography.dart';

class TermsOfUseScreen extends StatelessWidget {
  const TermsOfUseScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GhostAtlasColors.primaryBackground,
      appBar: AppBar(
        backgroundColor: GhostAtlasColors.secondaryBackground,
        elevation: 0,
        title: Text(
          'Terms of Use',
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
              '1. Acceptance of Terms',
              'By accessing and using GhostAtlas, you accept and agree to be bound by these Terms of Use. If you do not agree, please do not use the app.',
            ),
            const SizedBox(height: 24),
            _buildSection(
              '2. User Content & Content Moderation',
              'You are responsible for the content you submit:\n\n'
                  '• Stories must be your own or you must have permission to share them\n'
                  '• Content must not be offensive, harmful, or illegal\n'
                  '• You grant us a license to display and enhance your stories with AI\n\n'
                  'ZERO TOLERANCE POLICY:\n'
                  '• We have ZERO TOLERANCE for objectionable content\n'
                  '• All content is filtered and moderated\n'
                  '• Users can report objectionable content\n'
                  '• Users can block abusive users\n'
                  '• Reported content will be reviewed within 24 hours\n'
                  '• Violating content will be removed immediately\n'
                  '• Users who post objectionable content will be permanently banned',
            ),
            const SizedBox(height: 24),
            _buildSection(
              '3. AI-Generated Content',
              'GhostAtlas uses AI to enhance stories with narratives, narrations, and illustrations. By submitting a story, you consent to AI enhancement of your content.',
            ),
            const SizedBox(height: 24),
            _buildSection(
              '4. Prohibited Activities',
              'You may not:\n\n'
                  '• Submit false or misleading information\n'
                  '• Harass, threaten, or harm other users\n'
                  '• Post offensive, hateful, or discriminatory content\n'
                  '• Share violent, graphic, or disturbing content\n'
                  '• Post sexually explicit or inappropriate content\n'
                  '• Attempt to hack or disrupt the service\n'
                  '• Use the app for commercial purposes without permission\n'
                  '• Submit spam or duplicate content\n'
                  '• Impersonate others or create fake accounts',
            ),
            const SizedBox(height: 24),
            _buildSection(
              '5. Intellectual Property',
              'All app content, design, and features are owned by GhostAtlas. You retain ownership of your submitted stories, but grant us a license to use them.',
            ),
            const SizedBox(height: 24),
            _buildSection(
              '6. Disclaimer',
              'GhostAtlas is provided "as is" without warranties. We are not responsible for:\n\n'
                  '• Accuracy of user-submitted content\n'
                  '• Availability or reliability of the service\n'
                  '• Any damages resulting from use of the app',
            ),
            const SizedBox(height: 24),
            _buildSection(
              '7. Limitation of Liability',
              'To the maximum extent permitted by law, GhostAtlas shall not be liable for any indirect, incidental, or consequential damages.',
            ),
            const SizedBox(height: 24),
            _buildSection(
              '8. Termination',
              'We reserve the right to terminate or suspend access to the app for violations of these terms.',
            ),
            const SizedBox(height: 24),
            _buildSection(
              '9. Changes to Terms',
              'We may modify these terms at any time. Continued use of the app constitutes acceptance of updated terms.',
            ),
            const SizedBox(height: 24),
            _buildSection(
              '10. Governing Law',
              'These terms are governed by applicable laws. Any disputes shall be resolved through appropriate legal channels.',
            ),
            const SizedBox(height: 24),
            _buildSection(
              'Contact Us',
              'For questions about these terms, contact:\nrehaancubes@gmail.com',
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
