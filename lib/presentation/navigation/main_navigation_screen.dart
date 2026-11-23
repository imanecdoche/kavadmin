import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../../core/constants/app_colors.dart';
import '../../core/auth/session_manager.dart';
import '../students/student_list_screen.dart';
import '../roadmap/roadmap_studio_screen.dart';
import '../reports/report_card_studio_screen.dart';
import '../certificate/certificate_studio_screen.dart';

class MainNavigationScreen extends ConsumerStatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  ConsumerState<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends ConsumerState<MainNavigationScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const StudentListScreen(),
    const RoadmapStudioScreen(),
    const ReportCardStudioScreen(),
    const CertificateStudioScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgLight,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: const Row(
          children: [
            Icon(LucideIcons.graduation_cap, color: AppColors.primarySky, size: 22),
            SizedBox(width: 10),
            Text(
              'KAVIO EDU',
              style: TextStyle(
                color: AppColors.textMain,
                fontSize: 16,
                fontWeight: FontWeight.w900,
                letterSpacing: 1.5,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Logout Sesi',
            icon: const Icon(LucideIcons.log_out, size: 20, color: AppColors.textMuted),
            onPressed: () {
              ref.read(authProvider.notifier).manualLogout();
            },
          ),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) {
          setState(() {
            _currentIndex = idx;
          });
        },
        backgroundColor: Colors.white,
        indicatorColor: AppColors.skyLight,
        destinations: const [
          NavigationDestination(
            icon: Icon(LucideIcons.users),
            selectedIcon: Icon(LucideIcons.users, color: AppColors.primarySky),
            label: 'Siswa',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.map),
            selectedIcon: Icon(LucideIcons.map, color: AppColors.primarySky),
            label: 'Roadmap',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.file_text),
            selectedIcon: Icon(LucideIcons.file_text, color: AppColors.primarySky),
            label: 'Rapor',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.award),
            selectedIcon: Icon(LucideIcons.award, color: AppColors.primarySky),
            label: 'Sertifikat',
          ),
        ],
      ),
    );
  }
}
