import 'dart:typed_data';
import 'package:intl/intl.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import '../core/constants/paper_dimensions.dart';
import '../data/models/student_model.dart';
import '../data/models/roadmap_session_model.dart';
import 'pdf_engine_service.dart';

class RoadmapPdfService {
  static Future<Uint8List> generateRoadmapPdf({
    required StudentModel student,
    required List<RoadmapSessionModel> sessions,
    required PaperSizePreset paperPreset,
    String roadmapTitle = 'PETA ALUR BELAJAR MODULAR 1-BATCH',
    String documentNumber = 'ROA/KEEN/202608/0001',
  }) async {
    final pdf = pw.Document();
    final format = paperPreset.pageFormat;

    const colorEmerald700 = PdfColor.fromInt(0xFF047857);
    const colorEmerald600 = PdfColor.fromInt(0xFF059669);
    const colorEmerald500 = PdfColor.fromInt(0xFF10B981);
    const colorSky700 = PdfColor.fromInt(0xFF0369A1);
    const colorSky600 = PdfColor.fromInt(0xFF0284C7);
    const colorSky500 = PdfColor.fromInt(0xFF0EA5E9);

    // Hitung ringkasan batch
    final totalSessions = sessions.length;
    final completedCount = sessions.where((s) => s.isCompleted || s.status == 'SELESAI').length;
    final inProgressCount = sessions.where((s) => s.status == 'SEDANG BERJALAN').length;
    final percentComplete = totalSessions > 0 ? ((completedCount / totalSessions) * 100).round() : 0;

    pdf.addPage(
      pw.MultiPage(
        pageFormat: format,
        margin: const pw.EdgeInsets.symmetric(horizontal: 24, vertical: 24),
        header: (pw.Context context) {
          if (context.pageNumber == 1) {
            return pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                PdfEngineService.buildUniversalMasterHeader(
                  documentNumber: documentNumber,
                  issueDate: DateFormat('dd MMM yyyy').format(DateTime.now()),
                  programName: student.programTier,
                  periodInfo: '${student.batchName} • Level ${student.cefrLevel}',
                ),
                PdfEngineService.buildDocumentTitleBanner(
                  title: roadmapTitle,
                  subtitle: 'OFFICIAL 1-BATCH MODULAR LEARNING ROADMAP & SESSION MATRIX',
                ),
                pw.SizedBox(height: 10),
                
                // Ringkasan Profil Siswa & Capaian
                pw.Container(
                  padding: const pw.EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                  decoration: pw.BoxDecoration(
                    color: PdfColors.grey100,
                    borderRadius: pw.BorderRadius.circular(6),
                  ),
                  child: pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          pw.Text('PROFIL SISWA', style: pw.TextStyle(fontSize: 8, fontWeight: pw.FontWeight.bold, color: PdfColors.grey600)),
                          pw.Text(student.name, style: pw.TextStyle(fontSize: 13, fontWeight: pw.FontWeight.bold, color: PdfColors.blueGrey900)),
                          pw.Text('Orang Tua/Wali: ${student.parentName}', style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey700)),
                        ],
                      ),
                      pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.end,
                        children: [
                          pw.Text('CAPAIAN BATCH', style: pw.TextStyle(fontSize: 8, fontWeight: pw.FontWeight.bold, color: PdfColors.grey600)),
                          pw.Text(
                            '$completedCount / $totalSessions Sesi Selesai ($percentComplete%)',
                            style: pw.TextStyle(fontSize: 11, fontWeight: pw.FontWeight.bold, color: colorEmerald700),
                          ),
                          if (inProgressCount > 0)
                            pw.Text('Sedang Berjalan: $inProgressCount Sesi', style: const pw.TextStyle(fontSize: 8.5, color: colorSky700)),
                        ],
                      ),
                    ],
                  ),
                ),
                pw.SizedBox(height: 14),
              ],
            );
          }
          return pw.Container(
            padding: const pw.EdgeInsets.only(bottom: 8),
            child: pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Text('KAVIO EDU — $roadmapTitle', style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey500)),
                pw.Text('Hal. ${context.pageNumber} / ${context.pagesCount}', style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey500)),
              ],
            ),
          );
        },
        build: (pw.Context context) {
          return [
            // List Sesi Granular dengan Smart Page Break (anti-potong)
            pw.ListView.separated(
              itemCount: sessions.length,
              separatorBuilder: (_, __) => pw.Container(
                margin: const pw.EdgeInsets.symmetric(vertical: 6),
                height: 0.5,
                color: PdfColors.grey200,
              ),
              itemBuilder: (ctx, index) {
                final s = sessions[index];
                
                PdfColor statusColor = PdfColors.grey500;
                if (s.status == 'SELESAI') statusColor = colorEmerald600;
                if (s.status == 'SEDANG BERJALAN') statusColor = colorSky600;

                return pw.Container(
                  padding: const pw.EdgeInsets.symmetric(vertical: 4),
                  child: pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      // Row 1: Sesi, Level, Status, Tanggal & Jam
                      pw.Row(
                        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                        children: [
                          pw.Row(
                            children: [
                              pw.Text('Sesi ${s.sessionNumber.toString().padLeft(2, "0")}', style: pw.TextStyle(fontSize: 9.5, fontWeight: pw.FontWeight.bold, color: PdfColors.blueGrey900)),
                              pw.SizedBox(width: 6),
                              pw.Text('• ${s.level} •', style: const pw.TextStyle(fontSize: 8.5, color: PdfColors.grey600)),
                              pw.SizedBox(width: 6),
                              pw.Text(s.status, style: pw.TextStyle(fontSize: 8.5, fontWeight: pw.FontWeight.bold, color: statusColor)),
                            ],
                          ),
                          pw.Text(
                            '${s.date} | ${s.time} WIB',
                            style: const pw.TextStyle(fontSize: 8.5, color: PdfColors.grey600),
                          ),
                        ],
                      ),
                      pw.SizedBox(height: 3),

                      // Row 2: Judul Materi
                      pw.Text(
                        s.title,
                        style: pw.TextStyle(fontSize: 10.5, fontWeight: pw.FontWeight.bold, color: PdfColors.blueGrey900),
                      ),
                      pw.SizedBox(height: 2),

                      // Row 3: Deskripsi
                      pw.Text(
                        s.description,
                        style: const pw.TextStyle(fontSize: 8.5, color: PdfColors.grey700, lineSpacing: 1.2),
                      ),
                      pw.SizedBox(height: 4),

                      // Row 4: Progress Bar Tingkat Penguasaan
                      pw.Row(
                        children: [
                          pw.Expanded(
                            child: pw.Stack(
                              children: [
                                pw.Container(height: 4, decoration: pw.BoxDecoration(color: PdfColors.grey200, borderRadius: pw.BorderRadius.circular(2))),
                                pw.Container(
                                  height: 4,
                                  width: (s.mastery / 100) * 400,
                                  decoration: pw.BoxDecoration(
                                    color: s.mastery >= 85 ? colorEmerald500 : s.mastery >= 70 ? colorSky500 : PdfColors.amber500,
                                    borderRadius: pw.BorderRadius.circular(2),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          pw.SizedBox(width: 10),
                          pw.Text(
                            '${s.mastery}%',
                            style: pw.TextStyle(fontSize: 8.5, fontWeight: pw.FontWeight.bold, color: PdfColors.blueGrey800),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ];
        },
      ),
    );

    return pdf.save();
  }
}
