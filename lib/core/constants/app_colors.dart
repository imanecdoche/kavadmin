import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Brand Primary & Accent
  static const Color primarySky = Color(0xFF0284C7);
  static const Color primarySkyDark = Color(0xFF0369A1);
  static const Color skyLight = Color(0xFFE0F2FE);

  // Background & Slate Neutrals
  static const Color bgDark = Color(0xFF020617);
  static const Color cardDark = Color(0xFF0F172A);
  static const Color borderDark = Color(0xFF1E293B);
  
  static const Color bgLight = Color(0xFFF8FAFC);
  static const Color textMain = Color(0xFF0F172A);
  static const Color textMuted = Color(0xFF64748B);

  // Status Colors
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFF43F5E);

  // Aliases for compatibility with other studio screens
  static const Color primary = primarySky;
  static const Color primaryDark = primarySkyDark;
  static const Color primaryLight = Color(0xFF38BDF8);
  static const Color accent = primarySky;
  static const Color bgCard = cardDark;
  static const Color bgCardLight = Color(0xFF1E293B);
  static const Color border = borderDark;
  static const Color textPrimary = Color(0xFFF8FAFC);
  static const Color textSecondary = textMuted;
  static const Color successBg = Color(0xFF064E3B);
  static const Color warningBg = Color(0xFF78350F);
  static const Color errorBg = Color(0xFF4C0519);
}
