import 'package:flutter/material.dart';
import '../theme/ghost_atlas_colors.dart';
import '../theme/ghost_atlas_typography.dart';
import '../widgets/ghost_button.dart';
import '../widgets/ghost_text_field.dart';
import '../widgets/pulsing_button.dart';
import '../utils/image_effects.dart';
import '../utils/page_transitions.dart';

/// Demo screen showcasing all visual effects and animations.
/// This screen is for development/testing purposes only.
class VisualEffectsDemoScreen extends StatefulWidget {
  const VisualEffectsDemoScreen({super.key});

  @override
  State<VisualEffectsDemoScreen> createState() =>
      _VisualEffectsDemoScreenState();
}

class _VisualEffectsDemoScreenState extends State<VisualEffectsDemoScreen> {
  final _textController = TextEditingController();
  bool _pulseEnabled = true;

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Visual Effects Demo',
          style: GhostAtlasTypography.appTitle,
        ),
        backgroundColor: GhostAtlasColors.secondaryBackground,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSectionTitle('Page Transitions'),
            _buildTransitionButtons(),
            const SizedBox(height: 32),
            _buildSectionTitle('Text Field with Glow'),
            _buildTextFieldDemo(),
            const SizedBox(height: 32),
            _buildSectionTitle('Image Vignette Effects'),
            _buildVignetteDemo(),
            const SizedBox(height: 32),
            _buildSectionTitle('Pulse Animations'),
            _buildPulseDemo(),
            const SizedBox(height: 32),
            _buildSectionTitle('Button Variants'),
            _buildButtonDemo(),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Text(title, style: GhostAtlasTypography.textTheme.headlineSmall),
    );
  }

  Widget _buildTransitionButtons() {
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: [
        GhostButton(
          text: 'FADE',
          onPressed: () => context.pushFade(_DemoDestinationScreen('Fade')),
        ),
        GhostButton(
          text: 'SLIDE UP',
          onPressed:
              () => context.pushSlideUp(_DemoDestinationScreen('Slide Up')),
        ),
        GhostButton(
          text: 'SLIDE RIGHT',
          onPressed:
              () =>
                  context.pushSlideRight(_DemoDestinationScreen('Slide Right')),
        ),
        GhostButton(
          text: 'SCALE',
          onPressed: () => context.pushScale(_DemoDestinationScreen('Scale')),
        ),
      ],
    );
  }

  Widget _buildTextFieldDemo() {
    return Column(
      children: [
        GhostTextField(
          controller: _textController,
          labelText: 'Story Title',
          hintText: 'Enter your ghost story title...',
          prefixIcon: Icons.title,
        ),
        const SizedBox(height: 16),
        GhostTextField(
          labelText: 'Multi-line Story',
          hintText: 'Tell us your encounter...',
          prefixIcon: Icons.description,
          maxLines: 4,
        ),
      ],
    );
  }

  Widget _buildVignetteDemo() {
    return Column(
      children: [
        Text(
          'Standard Vignette',
          style: TextStyle(color: GhostAtlasColors.textSecondary, fontSize: 14),
        ),
        const SizedBox(height: 8),
        ImageEffects.withVignette(
          borderRadius: BorderRadius.circular(16),
          intensity: 0.7,
          child: Container(
            height: 150,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              gradient: LinearGradient(
                colors: [
                  GhostAtlasColors.ghostGreen.withValues(alpha: 0.3),
                  GhostAtlasColors.secondaryBackground,
                ],
              ),
            ),
            child: Center(
              child: Icon(
                Icons.image,
                size: 48,
                color: GhostAtlasColors.textMuted,
              ),
            ),
          ),
        ),
        const SizedBox(height: 16),
        Text(
          'Ghost Vignette (with green tint)',
          style: TextStyle(color: GhostAtlasColors.textSecondary, fontSize: 14),
        ),
        const SizedBox(height: 8),
        ImageEffects.withVignette(
          borderRadius: BorderRadius.circular(16),
          intensity: 0.6,
          useGhostVignette: true,
          child: Container(
            height: 150,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              gradient: LinearGradient(
                colors: [
                  GhostAtlasColors.ghostGreen.withValues(alpha: 0.3),
                  GhostAtlasColors.secondaryBackground,
                ],
              ),
            ),
            child: Center(
              child: Icon(
                Icons.auto_awesome,
                size: 48,
                color: GhostAtlasColors.ghostGreen,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPulseDemo() {
    return Column(
      children: [
        Row(
          children: [
            Text(
              'Pulse Enabled',
              style: TextStyle(
                color: GhostAtlasColors.textSecondary,
                fontSize: 14,
              ),
            ),
            const SizedBox(width: 8),
            Switch(
              value: _pulseEnabled,
              onChanged: (value) => setState(() => _pulseEnabled = value),
              activeColor: GhostAtlasColors.ghostGreen,
            ),
          ],
        ),
        const SizedBox(height: 16),
        PulsingButton(
          enabled: _pulseEnabled,
          child: GhostButton(
            text: 'PULSING BUTTON',
            icon: Icons.favorite,
            onPressed: () {},
          ),
        ),
        const SizedBox(height: 16),
        GlowPulseButton(
          enabled: _pulseEnabled,
          child: GhostButton(
            text: 'GLOW PULSE',
            icon: Icons.star,
            onPressed: () {},
          ),
        ),
      ],
    );
  }

  Widget _buildButtonDemo() {
    return Column(
      children: [
        GhostButton(
          text: 'NORMAL BUTTON',
          icon: Icons.touch_app,
          onPressed: () {},
        ),
        const SizedBox(height: 12),
        GhostButton(
          text: 'LARGE BUTTON',
          icon: Icons.add_location,
          size: GhostButtonSize.large,
          onPressed: () {},
        ),
        const SizedBox(height: 12),
        GhostButton(
          text: 'FULL WIDTH',
          icon: Icons.check,
          fullWidth: true,
          onPressed: () {},
        ),
        const SizedBox(height: 12),
        const GhostButton(text: 'DISABLED', icon: Icons.block, onPressed: null),
      ],
    );
  }
}

class _DemoDestinationScreen extends StatelessWidget {
  final String transitionType;

  const _DemoDestinationScreen(this.transitionType);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          '$transitionType Transition',
          style: GhostAtlasTypography.appTitle,
        ),
        backgroundColor: GhostAtlasColors.secondaryBackground,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.check_circle,
              size: 80,
              color: GhostAtlasColors.ghostGreen,
            ),
            const SizedBox(height: 24),
            Text(
              'Transition Complete!',
              style: TextStyle(
                fontSize: 24,
                color: GhostAtlasColors.textPrimary,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Used: $transitionType',
              style: TextStyle(
                fontSize: 16,
                color: GhostAtlasColors.textSecondary,
              ),
            ),
            const SizedBox(height: 32),
            GhostButton(
              text: 'GO BACK',
              icon: Icons.arrow_back,
              onPressed: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }
}
