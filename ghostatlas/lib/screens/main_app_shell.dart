import 'package:flutter/material.dart';
import '../theme/ghost_atlas_colors.dart';
import '../widgets/animated_indexed_stack.dart';
import 'buster_tab.dart';
import 'submit_story_screen.dart';
import 'admin_panel_screen.dart';
import 'stories_tab.dart';
import 'profile_tab.dart';

/// Main application shell with bottom navigation bar.
/// Provides navigation between Stories, Map, Submit, and Profile tabs.
class MainAppShell extends StatefulWidget {
  const MainAppShell({super.key});

  @override
  State<MainAppShell> createState() => _MainAppShellState();
}

class _MainAppShellState extends State<MainAppShell> {
  int _currentIndex = 0;
  int _logoTapCount = 0;
  bool _adminUnlocked = false;

  // Screens for each tab
  late final List<Widget> _screens;

  @override
  void initState() {
    super.initState();
    _screens = [
      StoriesTab(onTitleTap: _onLogoTapped),
      const BusterTab(),
      const SubmitStoryScreen(),
      const ProfileTab(),
    ];
  }

  void _onLogoTapped() {
    setState(() {
      _logoTapCount++;
      if (_logoTapCount >= 7 && !_adminUnlocked) {
        _adminUnlocked = true;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('🎃 Admin panel unlocked! 🎃'),
            backgroundColor: GhostAtlasColors.ghostGreen,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AnimatedIndexedStack(
        index: _currentIndex,
        duration: const Duration(milliseconds: 300),
        children: [
          _screens[0],
          _screens[1],
          _screens[2],
          _screens[3],
          if (_adminUnlocked) const AdminPanelScreen(),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          border: Border(
            top: BorderSide(
              color: GhostAtlasColors.ghostGreen.withValues(alpha: 0.3),
              width: 1,
            ),
          ),
          boxShadow: [
            BoxShadow(
              color: GhostAtlasColors.ghostGreenGlow,
              blurRadius: 20,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          type: BottomNavigationBarType.fixed,
          backgroundColor: GhostAtlasColors.secondaryBackground,
          selectedItemColor: GhostAtlasColors.ghostGreen,
          unselectedItemColor: GhostAtlasColors.textMuted,
          selectedLabelStyle: const TextStyle(
            fontWeight: FontWeight.w600,
            letterSpacing: 1.2,
            fontSize: 11,
          ),
          unselectedLabelStyle: const TextStyle(fontSize: 11),
          items: [
            const BottomNavigationBarItem(
              icon: Icon(Icons.auto_stories),
              label: 'STORIES',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.explore),
              label: 'BUSTER',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.add_location),
              label: 'SUBMIT',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.person),
              label: 'PROFILE',
            ),
            if (_adminUnlocked)
              const BottomNavigationBarItem(
                icon: Icon(Icons.admin_panel_settings),
                label: 'ADMIN',
              ),
          ],
        ),
      ),
    );
  }
}
