import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:google_fonts/google_fonts.dart';

import 'core/constants/app_colors.dart';
import 'core/auth/session_manager.dart';
import 'core/auth/auth_gate_screen.dart';
import 'presentation/navigation/main_navigation_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
    await Firebase.initializeApp();
  } catch (e) {
    try {
      await Firebase.initializeApp(
        options: const FirebaseOptions(
          apiKey: "AIzaSyCrU4DL_8xWnCTxR2tZ6jjkHfysnmfZ0Ns",
          appId: "1:1097982274898:web:59939771464f15b331de8b",
          messagingSenderId: "1097982274898",
          projectId: "gen-lang-client-0731211118",
          storageBucket: "gen-lang-client-0731211118.firebasestorage.app",
          authDomain: "gen-lang-client-0731211118.firebaseapp.com",
        ),
      );
    } catch (_) {}
  }

  runApp(
    const ProviderScope(
      child: KavadminApp(),
    ),
  );
}

class KavadminApp extends ConsumerWidget {
  const KavadminApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return MaterialApp(
      title: 'Kavio Edu Admin',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primarySky,
          primary: AppColors.primarySky,
          surface: AppColors.bgLight,
        ),
        textTheme: GoogleFonts.interTextTheme(
          Theme.of(context).textTheme,
        ),
      ),
      home: authState.isLoading
          ? const Scaffold(
              backgroundColor: AppColors.bgDark,
              body: Center(
                child: CircularProgressIndicator(
                  color: AppColors.primarySky,
                ),
              ),
            )
          : authState.isAuthenticated
              ? const MainNavigationScreen()
              : const AuthGateScreen(),
    );
  }
}
