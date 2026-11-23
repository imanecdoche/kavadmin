import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:intl/intl.dart';

import '../../core/constants/app_colors.dart';
import '../../data/models/student_model.dart';
import '../../data/models/report_card_model.dart';
import '../../data/repositories/student_repository.dart';
import '../../services/report_card_pdf_service.dart';
import '../../services/pdf_engine_service.dart';

class ReportCardStudioScreen extends ConsumerStatefulWidget {
  final StudentModel? initialStudent;

  const ReportCardStudioScreen({super.key, this.initialStudent});

  @override
  ConsumerState<ReportCardStudioScreen> createState() => _ReportCardStudioScreenState();
}

class _ReportCardStudioScreenState extends ConsumerState<ReportCardStudioScreen> {
  StudentModel? _selectedStudent;
  final _tutorNotesCtrl = TextEditingController(text: 'Siswa menunjukkan penguasaan struktur dasar yang sangat baik dan konsisten.');
  final _nextTargetCtrl = TextEditingController(text: 'Lanjut ke Batch Berikutnya (Materi A2 Elementary & Dialog Terapan).');
  
  int _scoreSpeaking = 88;
  int _scoreGrammar = 85;
  int _scoreListening = 90;
  int _scoreVocab = 84;
  bool _isExporting = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialStudent != null) {
      _selectedStudent = widget.initialStudent;
    }
  }

  @override
  void dispose() {
    _tutorNotesCtrl.dispose();
    _nextTargetCtrl.dispose();
    super.dispose();
  }

  void _onStudentSelected(StudentModel student) {
    setState(() {
      _selectedStudent = student;
    });
  }

  Future<void> _exportReportPdf() async {
    if (_selectedStudent == null) return;

    setState(() => _isExporting = true);
    try {
      final report = ReportCardModel(
        documentNumber: 'ROA/KEEN/${DateFormat("yyyyMM").format(DateTime.now())}/0001',
        issueDate: DateFormat('dd MMMM yyyy').format(DateTime.now()),
        studentName: _selectedStudent!.name,
        parentName: _selectedStudent!.parentName,
        programTier: _selectedStudent!.programTier,
        batchName: _selectedStudent!.batchName,
        cefrLevel: _selectedStudent!.cefrLevel,
        tutorNotes: _tutorNotesCtrl.text.trim(),
        nextTarget: _nextTargetCtrl.text.trim(),
        competencies: [
          CompetencyScore(title: 'Speaking Fluency & Confidence', description: 'Keberanian berbicara, intonasi, dan kemampuan merespons pertanyaan spontan.', score: _scoreSpeaking),
          CompetencyScore(title: 'Grammar Application & Sentence Form', description: 'Penerapan Subject-Verb Agreement, Helper Tenses, dan formulasi kalimat.', score: _scoreGrammar),
          CompetencyScore(title: 'Listening Comprehension & Context', description: 'Memahami instruksi, konteks percakapan, dan penangkapan kata kunci.', score: _scoreListening),
          CompetencyScore(title: 'Vocabulary Richness & Pronunciation', description: 'Variasi kosakata yang digunakan serta kejelasan pelafalan kata.', score: _scoreVocab),
        ],
      );

      final pdfBytes = await ReportCardPdfService.generateReportCardPdf(report);
      final fileName = 'Rapor_KavioEdu_${_selectedStudent!.name.replaceAll(" ", "_")}_${_selectedStudent!.batchName}';
      await PdfEngineService.shareDocument(pdfBytes: pdfBytes, fileName: fileName);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal export PDF: $e'), backgroundColor: AppColors.error),
      );
    } finally {
      if (mounted) setState(() => _isExporting = false);
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
              _onStudentSelected(students.first);
            });
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(
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
                          Icon(LucideIcons.file_check, size: 16, color: AppColors.primarySky),
                          SizedBox(width: 8),
                          Text('STUDIO RAPOR DIGITAL SISWA', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textMain)),
                        ],
                      ),
                      const SizedBox(height: 14),
                      DropdownButtonFormField<String>(
                        value: _selectedStudent?.id,
                        decoration: const InputDecoration(labelText: 'Pilih Siswa Terdaftar', border: OutlineInputBorder()),
                        items: students.map((s) => DropdownMenuItem(value: s.id, child: Text('${s.name} (${s.batchName})'))).toList(),
                        onChanged: (id) {
                          if (id == null) return;
                          _onStudentSelected(students.firstWhere((s) => s.id == id));
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),

                if (_selectedStudent != null) ...[
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('PENILAIAN 4 PILAR KOMPETENSI', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppColors.textMain)),
                        const SizedBox(height: 12),
                        _buildScoreSlider('Speaking Fluency & Confidence', _scoreSpeaking, (v) => setState(() => _scoreSpeaking = v)),
                        _buildScoreSlider('Grammar Application & Sentence Form', _scoreGrammar, (v) => setState(() => _scoreGrammar = v)),
                        _buildScoreSlider('Listening Comprehension & Context', _scoreListening, (v) => setState(() => _scoreListening = v)),
                        _buildScoreSlider('Vocabulary Richness & Pronunciation', _scoreVocab, (v) => setState(() => _scoreVocab = v)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),

                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('CATATAN EVALUASI & TARGET', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppColors.textMain)),
                        const SizedBox(height: 12),
                        TextField(controller: _tutorNotesCtrl, maxLines: 3, decoration: const InputDecoration(labelText: 'Catatan Akademik Mentor', border: OutlineInputBorder())),
                        const SizedBox(height: 12),
                        TextField(controller: _nextTargetCtrl, decoration: const InputDecoration(labelText: 'Proyeksi / Target Lanjutan', border: OutlineInputBorder())),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  SizedBox(
                    height: 46,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(backgroundColor: AppColors.primarySky, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                      icon: _isExporting ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Icon(LucideIcons.share_2, size: 16),
                      label: Text(_isExporting ? 'Membuat PDF Rapor...' : 'Cetak / Bagikan Rapor Digital'),
                      onPressed: _isExporting ? null : _exportReportPdf,
                    ),
                  ),
                ],
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primarySky)),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }

  Widget _buildScoreSlider(String label, int val, ValueChanged<int> onChanged) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(child: Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500))),
            Text('$val / 100', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primarySky)),
          ],
        ),
        Slider(value: val.toDouble(), min: 0, max: 100, divisions: 20, onChanged: (v) => onChanged(v.round())),
      ],
    );
  }
}
