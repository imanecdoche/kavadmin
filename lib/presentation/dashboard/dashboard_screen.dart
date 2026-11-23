import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/session_time_evaluator.dart';
import '../../data/models/student_model.dart';
import '../../data/repositories/student_repository.dart';
import '../shared/master_app_header.dart';
import '../shared/custom_text_field.dart';
import '../roadmap/roadmap_studio_screen.dart';
import '../reports/report_card_studio_screen.dart';
import '../certificate/certificate_studio_screen.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    final studentsAsync = ref.watch(studentsStreamProvider);

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: Column(
        children: [
          const MasterAppHeader(
            title: 'KAVADMIN DASHBOARD',
            subtitle: 'Kavio Edu Academic CRM & Operations Hub',
          ),

          Expanded(
            child: studentsAsync.when(
              loading: () => const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              ),
              error: (err, _) => Center(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(LucideIcons.alertCircle, color: AppColors.error, size: 36),
                      const SizedBox(height: 12),
                      Text(
                        'Koneksi Cloud Error: $err',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.plusJakartaSans(color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: () => ref.refresh(studentsStreamProvider),
                        child: const Text('Coba Lagi'),
                      ),
                    ],
                  ),
                ),
              ),
              data: (students) {
                final filtered = students.where((s) {
                  if (_searchQuery.isEmpty) return true;
                  final q = _searchQuery.toLowerCase();
                  return s.name.toLowerCase().contains(q) ||
                      s.school.toLowerCase().contains(q) ||
                      s.program.toLowerCase().contains(q);
                }).toList();

                // Compute Metrics
                final totalStudents = students.length;
                final totalSessions = students.fold<int>(0, (acc, s) => acc + s.totalSessions);
                final totalRevenue = students.fold<num>(0, (acc, s) => acc + s.totalInvestment);
                final totalPaid = students.fold<num>(0, (acc, s) => acc + s.paid);

                return RefreshIndicator(
                  onRefresh: () async => ref.refresh(studentsStreamProvider),
                  color: AppColors.primary,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      // 2-Column Mobile Metric Cards
                      GridView.count(
                        crossAxisCount: 2,
                        crossAxisSpacing: 10,
                        mainAxisSpacing: 10,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        childAspectRatio: 1.6,
                        children: [
                          _buildMetricCard(
                            'TOTAL SISWA',
                            '$totalStudents Siswa',
                            LucideIcons.users,
                            AppColors.primaryLight,
                          ),
                          _buildMetricCard(
                            'TOTAL SESI',
                            '$totalSessions Pertemuan',
                            LucideIcons.calendar,
                            AppColors.accent,
                          ),
                          _buildMetricCard(
                            'TOTAL INVESTASI',
                            SessionTimeEvaluator.formatRupiah(totalRevenue),
                            LucideIcons.wallet,
                            AppColors.success,
                          ),
                          _buildMetricCard(
                            'TERBAYAR',
                            SessionTimeEvaluator.formatRupiah(totalPaid),
                            LucideIcons.checkCircle,
                            AppColors.warning,
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Sesi Mendatang (3 Hari) Unboxed Section
                      _buildUpcomingSessionsSection(students),
                      const SizedBox(height: 20),

                      // Search & Header CRM
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'STUDENT CRM (${filtered.length})',
                            style: GoogleFonts.plusJakartaSans(
                              color: AppColors.textSecondary,
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1.0,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(LucideIcons.userPlus, color: AppColors.accent, size: 20),
                            onPressed: () => _showAddStudentDialog(context),
                            tooltip: 'Tambah Siswa Baru',
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),

                      // Search Bar
                      TextField(
                        onChanged: (val) => setState(() => _searchQuery = val),
                        style: GoogleFonts.plusJakartaSans(color: AppColors.textPrimary, fontSize: 13),
                        decoration: InputDecoration(
                          hintText: 'Cari siswa, program, atau sekolah...',
                          hintStyle: GoogleFonts.plusJakartaSans(
                            color: AppColors.textMuted,
                            fontSize: 12,
                          ),
                          prefixIcon: const Icon(LucideIcons.search, size: 16, color: AppColors.textMuted),
                          filled: true,
                          fillColor: AppColors.bgCard,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: const BorderSide(color: AppColors.border),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: const BorderSide(color: AppColors.border),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Student CRM List
                      if (filtered.isEmpty)
                        Container(
                          padding: const EdgeInsets.all(28),
                          alignment: Alignment.center,
                          child: Text(
                            'Tidak ada data siswa yang cocok.',
                            style: GoogleFonts.plusJakartaSans(color: AppColors.textMuted, fontSize: 12),
                          ),
                        )
                      else
                        ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: filtered.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 8),
                          itemBuilder: (ctx, i) {
                            final student = filtered[i];
                            return _buildStudentListItem(student);
                          },
                        ),
                      const SizedBox(height: 40),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.primary,
        onPressed: () => _showAddStudentDialog(context),
        child: const Icon(LucideIcons.plus, color: Colors.white),
      ),
    );
  }

  Widget _buildMetricCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border.withOpacity(0.8)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: GoogleFonts.plusJakartaSans(
                  color: AppColors.textMuted,
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                ),
              ),
              Icon(icon, size: 14, color: color),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.jetbrainsMono(
              color: AppColors.textPrimary,
              fontSize: 14,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUpcomingSessionsSection(List<StudentModel> students) {
    final upcomingList = <Map<String, dynamic>>[];
    for (final s in students) {
      if (s.scheduleDays.isEmpty) continue;
      final dates = SessionTimeEvaluator.getUpcomingSessionDates(s.scheduleDays, daysAhead: 3);
      for (final d in dates) {
        upcomingList.add({'student': s, 'date': d});
      }
    }

    upcomingList.sort((a, b) => (a['date'] as DateTime).compareTo(b['date'] as DateTime));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(LucideIcons.clock, size: 14, color: AppColors.accent),
            const SizedBox(width: 6),
            Text(
              'SESI MENDATANG (3 HARI)',
              style: GoogleFonts.plusJakartaSans(
                color: AppColors.textSecondary,
                fontSize: 11,
                fontWeight: FontWeight.w800,
                letterSpacing: 1.0,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        if (upcomingList.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 8.0),
            child: Text(
              'Tidak ada jadwal sesi dalam 3 hari ke depan.',
              style: GoogleFonts.plusJakartaSans(color: AppColors.textMuted, fontSize: 11),
            ),
          )
        else
          ...upcomingList.take(4).map((item) {
            final StudentModel s = item['student'];
            final DateTime d = item['date'];
            return Container(
              margin: const EdgeInsets.only(bottom: 6),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: AppColors.border, width: 0.5)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        s.name,
                        style: GoogleFonts.plusJakartaSans(
                          color: AppColors.textPrimary,
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      Text(
                        '${s.program} • ${s.scheduleTime.isNotEmpty ? s.scheduleTime : 'Waktu Terjadwal'}',
                        style: GoogleFonts.plusJakartaSans(
                          color: AppColors.textMuted,
                          fontSize: 10,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      SessionTimeEvaluator.formatDateShort(d),
                      style: GoogleFonts.jetbrainsMono(
                        color: AppColors.primaryLight,
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            );
          }),
      ],
    );
  }

  Widget _buildStudentListItem(StudentModel student) {
    final isPaid = student.isPaidOff;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      student.name,
                      style: GoogleFonts.plusJakartaSans(
                        color: AppColors.textPrimary,
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    if (student.school.isNotEmpty)
                      Text(
                        student.school,
                        style: GoogleFonts.plusJakartaSans(
                          color: AppColors.textSecondary,
                          fontSize: 11,
                        ),
                      ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: isPaid ? AppColors.successBg.withOpacity(0.4) : AppColors.warningBg.withOpacity(0.4),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  isPaid ? 'LUNAS' : 'TERBAYAR (${student.paidPercentage}%)',
                  style: GoogleFonts.plusJakartaSans(
                    color: isPaid ? AppColors.success : AppColors.warning,
                    fontSize: 9,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${student.program} • ${student.totalSessions} Sesi',
                style: GoogleFonts.plusJakartaSans(color: AppColors.textMuted, fontSize: 11),
              ),
              Text(
                SessionTimeEvaluator.formatRupiah(student.totalInvestment),
                style: GoogleFonts.jetbrainsMono(
                  color: AppColors.textPrimary,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Action Buttons: Roadmap, Report, Certificate
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    side: const BorderSide(color: AppColors.primary),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                  ),
                  icon: const Icon(LucideIcons.map, size: 12, color: AppColors.primaryLight),
                  label: Text(
                    'Roadmap',
                    style: GoogleFonts.plusJakartaSans(color: AppColors.primaryLight, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => RoadmapStudioScreen(student: student)),
                    );
                  },
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    side: const BorderSide(color: AppColors.accent),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                  ),
                  icon: const Icon(LucideIcons.fileText, size: 12, color: AppColors.accent),
                  label: Text(
                    'Rapor',
                    style: GoogleFonts.plusJakartaSans(color: AppColors.accent, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => ReportCardStudioScreen(student: student)),
                    );
                  },
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    side: const BorderSide(color: AppColors.warning),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                  ),
                  icon: const Icon(LucideIcons.award, size: 12, color: AppColors.warning),
                  label: Text(
                    'Sertifikat',
                    style: GoogleFonts.plusJakartaSans(color: AppColors.warning, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => CertificateStudioScreen(student: student)),
                    );
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showAddStudentDialog(BuildContext context) {
    final nameCtrl = TextEditingController();
    final schoolCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final valCtrl = TextEditingController(text: '500000');
    final paidCtrl = TextEditingController(text: '0');

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          backgroundColor: AppColors.bgCard,
          title: Text(
            'Tambah Siswa Baru',
            style: GoogleFonts.plusJakartaSans(color: AppColors.textPrimary, fontWeight: FontWeight.bold),
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                CustomTextField(label: 'Nama Lengkap', controller: nameCtrl),
                const SizedBox(height: 10),
                CustomTextField(label: 'Sekolah / Instansi', controller: schoolCtrl),
                const SizedBox(height: 10),
                CustomTextField(label: 'No. WhatsApp', controller: phoneCtrl, keyboardType: TextInputType.phone),
                const SizedBox(height: 10),
                CustomTextField(label: 'Biaya per Bulan (Rp)', controller: valCtrl, keyboardType: TextInputType.number),
                const SizedBox(height: 10),
                CustomTextField(label: 'Jumlah Terbayar (Rp)', controller: paidCtrl, keyboardType: TextInputType.number),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Batal'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
              onPressed: () async {
                final name = nameCtrl.text.trim();
                if (name.isEmpty) return;

                final newStudent = StudentModel(
                  id: 'std_${DateTime.now().millisecondsSinceEpoch}',
                  name: name,
                  school: schoolCtrl.text.trim(),
                  phone: phoneCtrl.text.trim(),
                  valPerMonth: num.tryParse(valCtrl.text.trim()) ?? 0,
                  paid: num.tryParse(paidCtrl.text.trim()) ?? 0,
                );

                await ref.read(studentRepositoryProvider).saveStudent(newStudent);
                if (ctx.mounted) Navigator.pop(ctx);
              },
              child: const Text('Simpan Siswa', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }
}
