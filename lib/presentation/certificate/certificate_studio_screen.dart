import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:intl/intl.dart';

import '../../core/constants/app_colors.dart';
import '../../data/models/student_model.dart';
import '../../data/models/certificate_model.dart';
import '../../data/repositories/student_repository.dart';
import '../../services/certificate_pdf_service.dart';
import '../../services/pdf_engine_service.dart';

class CertificateStudioScreen extends ConsumerStatefulWidget {
  final StudentModel? initialStudent;

  const CertificateStudioScreen({super.key, this.initialStudent});

  @override
  ConsumerState<CertificateStudioScreen> createState() => _CertificateStudioScreenState();
}

class _CertificateStudioScreenState extends ConsumerState<CertificateStudioScreen> {
  StudentModel? _selectedStudent;
  String _selectedPredicate = 'SANGAT BAIK (EXCELLENT)';
  int _totalSessions = 12;
  bool _isExporting = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialStudent != null) {
      _selectedStudent = widget.initialStudent;
    }
  }

  void _onStudentSelected(StudentModel student) {
    setState(() {
      _selectedStudent = student;
    });
  }

  Future<void> _exportCertificatePdf() async {
    if (_selectedStudent == null) return;

    setState(() => _isExporting = true);
    try {
      final cert = CertificateModel(
        documentId: 'CRT/KEEN/${DateFormat("yyyyMM").format(DateTime.now())}/0001',
        issueDate: DateFormat('dd MMMM yyyy').format(DateTime.now()),
        studentName: _selectedStudent!.name,
        programName: 'Paket ${_selectedStudent!.programTier}',
        batchName: _selectedStudent!.batchName,
        cefrLevel: '${_selectedStudent!.cefrLevel} - Elementary',
        totalSessions: _totalSessions,
        predicate: _selectedPredicate,
        verificationHash: 'VERIF-KEEN-${DateFormat("yyyyMM").format(DateTime.now())}-CERT',
      );

      final pdfBytes = await CertificatePdfService.generateCertificatePdf(cert);
      final fileName = 'Sertifikat_KavioEdu_${_selectedStudent!.name.replaceAll(" ", "_")}_${_selectedStudent!.batchName}';
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
                          Icon(LucideIcons.award, size: 16, color: AppColors.primarySky),
                          SizedBox(width: 8),
                          Text('STUDIO SERTIFIKAT KELULUSAN', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textMain)),
                        ],
                      ),
                      const SizedBox(height: 14),
                      DropdownButtonFormField<String>(
                        value: _selectedStudent?.id,
                        decoration: const InputDecoration(labelText: 'Pilih Siswa Terdaftar', border: OutlineInputBorder()),
                        items: students.map((s) => DropdownMenuItem(value: s.id, child: Text('${s.name} (${s.batchName} - Level ${s.cefrLevel})'))).toList(),
                        onChanged: (id) {
                          if (id == null) return;
                          _onStudentSelected(students.firstWhere((s) => s.id == id));
                        },
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        value: _selectedPredicate,
                        decoration: const InputDecoration(labelText: 'Predikat Kelulusan', border: OutlineInputBorder()),
                        items: const [
                          DropdownMenuItem(value: 'SANGAT BAIK (EXCELLENT)', child: Text('SANGAT BAIK (EXCELLENT)')),
                          DropdownMenuItem(value: 'DENGAN PUJIAN (DISTINCTION)', child: Text('DENGAN PUJIAN (DISTINCTION)')),
                          DropdownMenuItem(value: 'BAIK (GOOD)', child: Text('BAIK (GOOD)')),
                        ],
                        onChanged: (v) => setState(() => _selectedPredicate = v!),
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        initialValue: _totalSessions.toString(),
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'Total Sesi Diselesaikan', border: OutlineInputBorder()),
                        onChanged: (v) => _totalSessions = int.tryParse(v) ?? 12,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                SizedBox(
                  height: 46,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.primarySky, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                    icon: _isExporting ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Icon(LucideIcons.share_2, size: 16),
                    label: Text(_isExporting ? 'Membuat Sertifikat...' : 'Cetak / Bagikan Sertifikat A4'),
                    onPressed: (_selectedStudent == null || _isExporting) ? null : _exportCertificatePdf,
                  ),
                ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primarySky)),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }
}
