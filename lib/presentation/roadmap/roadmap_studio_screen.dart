import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:intl/intl.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/paper_dimensions.dart';
import '../../core/constants/cefr_presets.dart';
import '../../data/models/student_model.dart';
import '../../data/models/roadmap_session_model.dart';
import '../../data/repositories/student_repository.dart';
import '../../services/roadmap_pdf_service.dart';
import '../../services/pdf_engine_service.dart';

class RoadmapStudioScreen extends ConsumerStatefulWidget {
  final StudentModel? initialStudent;

  const RoadmapStudioScreen({super.key, this.initialStudent});

  @override
  ConsumerState<RoadmapStudioScreen> createState() => _RoadmapStudioScreenState();
}

class _RoadmapStudioScreenState extends ConsumerState<RoadmapStudioScreen> {
  StudentModel? _selectedStudent;
  PaperSizePreset _selectedPaper = PaperSizePreset.a4;
  int _startSessionNumber = 1;
  int _totalSessionsCount = 12;
  String _startDate = DateFormat('yyyy-MM-dd').format(DateTime.now());
  final String _roadmapTitle = 'PETA ALUR BELAJAR MODULAR 1-BATCH';

  List<RoadmapSessionModel> _sessions = [];
  bool _isGeneratingPdf = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialStudent != null) {
      _selectedStudent = widget.initialStudent;
      _startDate = widget.initialStudent!.startDate.isNotEmpty
          ? widget.initialStudent!.startDate
          : _startDate;
      _generateRoadmapSessions();
    }
  }

  void _onStudentChanged(StudentModel student) {
    setState(() {
      _selectedStudent = student;
      _startDate = student.startDate.isNotEmpty ? student.startDate : _startDate;
      _generateRoadmapSessions();
    });
  }

  void _generateRoadmapSessions() {
    if (_selectedStudent == null) return;

    final generated = CefrPresets.generateSessions(
      cefrLevel: _selectedStudent!.cefrLevel,
      totalCount: _totalSessionsCount,
      startFromSession: _startSessionNumber,
      startDateStr: _startDate,
      slotTime: _selectedStudent!.sessionSlot,
    );

    setState(() {
      _sessions = generated;
    });
  }

  void _updateSessionMastery(int index, int newMastery) {
    setState(() {
      _sessions[index] = _sessions[index].copyWith(mastery: newMastery);
    });
  }

  Future<void> _exportPdf() async {
    if (_selectedStudent == null || _sessions.isEmpty) return;

    setState(() => _isGeneratingPdf = true);
    try {
      final pdfBytes = await RoadmapPdfService.generateRoadmapPdf(
        student: _selectedStudent!,
        sessions: _sessions,
        paperPreset: _selectedPaper,
        roadmapTitle: _roadmapTitle,
      );

      final fileName = 'Roadmap_KavioEdu_${_selectedStudent!.name.replaceAll(" ", "_")}_${_selectedStudent!.batchName}';
      await PdfEngineService.shareDocument(pdfBytes: pdfBytes, fileName: fileName);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal membuat PDF: $e'), backgroundColor: AppColors.error),
      );
    } finally {
      if (mounted) setState(() => _isGeneratingPdf = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final studentsAsync = ref.watch(studentsStreamProvider);

    return Scaffold(
      backgroundColor: AppColors.bgLight,
      body: studentsAsync.when(
        data: (students) {
          if (students.isEmpty) {
            return const Center(child: Text('Daftarkan siswa terlebih dahulu di tab Siswa.'));
          }

          if (_selectedStudent == null && students.isNotEmpty) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              _onStudentChanged(students.first);
            });
          }

          return CustomScrollView(
            slivers: [
              // PARAMETER CONTROL CARD
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(LucideIcons.sliders_horizontal, size: 16, color: AppColors.primarySky),
                            SizedBox(width: 8),
                            Text('PARAMETER 1-BATCH ROADMAP', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textMain)),
                          ],
                        ),
                        const SizedBox(height: 14),

                        // Pilih Siswa
                        DropdownButtonFormField<String>(
                          value: _selectedStudent?.id,
                          decoration: const InputDecoration(labelText: 'Pilih Siswa Terdaftar', border: OutlineInputBorder()),
                          items: students.map((s) => DropdownMenuItem(value: s.id, child: Text('${s.name} (${s.batchName} - Level ${s.cefrLevel})'))).toList(),
                          onChanged: (id) {
                            if (id == null) return;
                            final student = students.firstWhere((s) => s.id == id);
                            _onStudentChanged(student);
                          },
                        ),
                        const SizedBox(height: 12),

                        // Mulai Dari Sesi & Total Sesi
                        Row(
                          children: [
                            Expanded(
                              child: TextFormField(
                                initialValue: _startSessionNumber.toString(),
                                keyboardType: TextInputType.number,
                                decoration: const InputDecoration(labelText: 'Mulai dari Sesi Ke-', border: OutlineInputBorder()),
                                onChanged: (v) {
                                  _startSessionNumber = int.tryParse(v) ?? 1;
                                  _generateRoadmapSessions();
                                },
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: TextFormField(
                                initialValue: _totalSessionsCount.toString(),
                                keyboardType: TextInputType.number,
                                decoration: const InputDecoration(labelText: 'Jumlah Sesi', border: OutlineInputBorder()),
                                onChanged: (v) {
                                  _totalSessionsCount = int.tryParse(v) ?? 12;
                                  _generateRoadmapSessions();
                                },
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),

                        // Pilihan Kertas Cetak
                        DropdownButtonFormField<PaperSizePreset>(
                          value: _selectedPaper,
                          decoration: const InputDecoration(labelText: 'Ukuran Kertas Cetak', border: OutlineInputBorder()),
                          items: PaperSizePreset.values.map((p) => DropdownMenuItem(value: p, child: Text(p.displayName))).toList(),
                          onChanged: (p) => setState(() => _selectedPaper = p!),
                        ),
                        const SizedBox(height: 16),

                        // Tombol Cetak / Bagikan PDF
                        SizedBox(
                          width: double.infinity,
                          height: 44,
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primarySky,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            icon: _isGeneratingPdf
                                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                : const Icon(LucideIcons.share_2, size: 16),
                            label: Text(_isGeneratingPdf ? 'Memproses PDF Vektor...' : 'Cetak / Bagikan PDF Roadmap'),
                            onPressed: (_selectedStudent == null || _isGeneratingPdf) ? null : _exportPdf,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // LIST SESI GRANULAR & SLIDER MASTERY
              if (_sessions.isNotEmpty)
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (ctx, idx) {
                        final s = _sessions[idx];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: Colors.grey.shade200),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      Text('Sesi ${s.sessionNumber.toString().padLeft(2, "0")}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textMain)),
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: s.status == 'SELESAI' ? Colors.green.shade50 : s.status == 'SEDANG BERJALAN' ? Colors.lightBlue.shade50 : Colors.grey.shade100,
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          s.status,
                                          style: TextStyle(
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                            color: s.status == 'SELESAI' ? AppColors.success : s.status == 'SEDANG BERJALAN' ? AppColors.primarySky : AppColors.textMuted,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  Text('${s.date} (${s.time})', style: const TextStyle(fontSize: 11, color: AppColors.textMuted, fontFamily: 'monospace')),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(s.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppColors.textMain)),
                              const SizedBox(height: 4),
                              Text(s.description, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                              const SizedBox(height: 10),

                              // Slider Penguasaan Materi (Mastery Rate)
                              Row(
                                children: [
                                  const Text('Penguasaan:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textMain)),
                                  Expanded(
                                    child: Slider(
                                      value: s.mastery.toDouble(),
                                      min: 0,
                                      max: 100,
                                      divisions: 20,
                                      activeColor: s.mastery >= 85 ? AppColors.success : s.mastery >= 70 ? AppColors.primarySky : AppColors.warning,
                                      onChanged: (val) => _updateSessionMastery(idx, val.round()),
                                    ),
                                  ),
                                  Text('${s.mastery}%', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
                                ],
                              ),
                            ],
                          ),
                        );
                      },
                      childCount: _sessions.length,
                    ),
                  ),
                ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primarySky)),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }
}
