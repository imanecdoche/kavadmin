import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/roadmap_session_model.dart';

class SessionCardWidget extends StatelessWidget {
  final RoadmapSessionModel session;
  final VoidCallback? onTap;
  final ValueChanged<String>? onStatusChanged;

  const SessionCardWidget({
    super.key,
    required this.session,
    this.onTap,
    this.onStatusChanged,
  });

  @override
  Widget build(BuildContext context) {
    final isCompleted = session.isCompleted || session.status.toUpperCase() == 'SELESAI';
    final isInProgress = session.status.toUpperCase() == 'SEDANG BERJALAN' ||
        session.status.toUpperCase() == 'IN_PROGRESS';

    Color badgeColor = AppColors.textMuted;
    Color badgeBg = AppColors.bgCardLight;

    if (isCompleted) {
      badgeColor = AppColors.success;
      badgeBg = AppColors.successBg.withOpacity(0.3);
    } else if (isInProgress) {
      badgeColor = AppColors.accent;
      badgeBg = AppColors.primary.withOpacity(0.2);
    }

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isInProgress
                ? AppColors.accent.withOpacity(0.6)
                : isCompleted
                    ? AppColors.success.withOpacity(0.3)
                    : AppColors.border,
            width: isInProgress ? 1.5 : 1.0,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Session Number & Status Badge
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'SESI ${session.sessionNumber.toString().padLeft(2, '0')}',
                        style: GoogleFonts.jetbrainsMono(
                          color: AppColors.primaryLight,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.bgCardLight,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        session.level,
                        style: GoogleFonts.plusJakartaSans(
                          color: AppColors.textSecondary,
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: badgeBg,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: badgeColor.withOpacity(0.4)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        isCompleted
                            ? LucideIcons.checkCircle
                            : isInProgress
                                ? LucideIcons.playCircle
                                : LucideIcons.circle,
                        size: 12,
                        color: badgeColor,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        session.status.toUpperCase(),
                        style: GoogleFonts.plusJakartaSans(
                          color: badgeColor,
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Title
            Text(
              session.title,
              style: GoogleFonts.plusJakartaSans(
                color: AppColors.textPrimary,
                fontSize: 14,
                fontWeight: FontWeight.w700,
              ),
            ),

            // Description
            if (session.description.isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(
                session.description,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.plusJakartaSans(
                  color: AppColors.textSecondary,
                  fontSize: 12,
                  height: 1.4,
                ),
              ),
            ],

            const SizedBox(height: 12),

            // Mastery Progress Bar
            Row(
              children: [
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: (session.mastery / 100.0).clamp(0.0, 1.0),
                      backgroundColor: AppColors.bgDark,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        isCompleted ? AppColors.success : AppColors.accent,
                      ),
                      minHeight: 6,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  '${session.mastery.toInt()}%',
                  style: GoogleFonts.jetbrainsMono(
                    color: AppColors.textMuted,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
