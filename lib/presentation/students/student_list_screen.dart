import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../../core/constants/app_colors.dart';
import '../../data/models/student_model.dart';
import '../../data/repositories/student_repository.dart';

class StudentListScreen extends ConsumerWidget {
  const StudentListScreen({super.key});

  void _showStudentForm(BuildContext context, WidgetRef ref, [StudentModel? student]) {
    final nameCtrl = TextEditingController(text: student?.name ?? '');
    final parentCtrl = TextEditingController(text: student?.parentName ?? '');
    final phoneCtrl = TextEditingController(text: student?.phone ?? '');
    String selectedTier = student?.programTier ?? 'GROW';
    String selectedBatch = student?.batchName ?? 'BATCH 1';
    String selectedCefr = student?.cefrLevel ?? 'A1';
    String selectedSlot = student?.sessionSlot ?? '15:00';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                student == null ? 'Tambah Siswa Baru' : 'Edit Data Siswa',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textMain),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: nameCtrl,
                decoration: const InputDecoration(labelText: 'Nama Siswa', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: parentCtrl,
                decoration: const InputDecoration(labelText: 'Nama Orang Tua / Wali', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: phoneCtrl,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: 'No. WhatsApp Siswa / Wali', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: selectedCefr,
                      decoration: const InputDecoration(labelText: 'Level CEFR', border: OutlineInputBorder()),
                      items: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
                          .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                          .toList(),
                      onChanged: (v) => setModalState(() => selectedCefr = v!),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: selectedSlot,
                      decoration: const InputDecoration(labelText: 'Slot Sesi', border: OutlineInputBorder()),
                      items: const [
                        DropdownMenuItem(value: '09:00', child: Text('09:00 WIB (Pagi)')),
                        DropdownMenuItem(value: '13:00', child: Text('13:00 WIB (Siang)')),
                        DropdownMenuItem(value: '15:00', child: Text('15:00 WIB (Sore)')),
                      ],
                      onChanged: (v) => setModalState(() => selectedSlot = v!),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primarySky,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () async {
                  if (nameCtrl.text.isEmpty) return;
                  final newStudent = StudentModel(
                    id: student?.id ?? '',
                    name: nameCtrl.text.trim(),
                    parentName: parentCtrl.text.trim(),
                    phone: phoneCtrl.text.trim(),
                    programTier: selectedTier,
                    batchName: selectedBatch,
                    cefrLevel: selectedCefr,
                    sessionSlot: selectedSlot,
                    startDate: student?.startDate ?? DateTime.now().toIso8601String().split('T')[0],
                  );

                  if (student == null) {
                    await ref.read(studentRepositoryProvider).addStudent(newStudent);
                  } else {
                    await ref.read(studentRepositoryProvider).updateStudent(student.id, newStudent);
                  }
                  Navigator.pop(ctx);
                },
                child: Text(student == null ? 'Simpan Siswa' : 'Perbarui Data'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final studentsAsync = ref.watch(studentsStreamProvider);

    return Scaffold(
      backgroundColor: AppColors.bgLight,
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primarySky,
        foregroundColor: Colors.white,
        icon: const Icon(LucideIcons.user_plus, size: 18),
        label: const Text('Tambah Siswa', style: TextStyle(fontWeight: FontWeight.bold)),
        onPressed: () => _showStudentForm(context, ref),
      ),
      body: studentsAsync.when(
        data: (students) {
          if (students.isEmpty) {
            return const Center(
              child: Text(
                'Belum ada siswa terdaftar.\nKlik tombol Tambah Siswa untuk memulai.',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.textMuted, fontSize: 13),
              ),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: students.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (ctx, idx) {
              final s = students[idx];
              return Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: AppColors.skyLight,
                      child: Text(
                        s.cefrLevel,
                        style: const TextStyle(color: AppColors.primarySky, fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            s.name,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textMain),
                          ),
                          Text(
                            'Wali: ${s.parentName.isNotEmpty ? s.parentName : "-"} | Paket ${s.programTier}',
                            style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '${s.sessionSlot} WIB',
                        style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold, fontSize: 11),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(LucideIcons.pencil, size: 16, color: AppColors.textMuted),
                      onPressed: () => _showStudentForm(context, ref, s),
                    ),
                  ],
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primarySky)),
        error: (err, _) => Center(child: Text('Error: $err', style: const TextStyle(color: AppColors.error))),
      ),
    );
  }
}
