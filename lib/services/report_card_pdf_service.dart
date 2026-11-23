import 'dart:typed_data';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import '../data/models/report_card_model.dart';
import 'pdf_engine_service.dart';

class ReportCardPdfService {
  static Future<Uint8List> generateReportCardPdf(ReportCardModel report) async {
    final pdf = pw.Document();

    const colorEmerald700 = PdfColor.fromInt(0xFF047857);
    const colorSky800 = PdfColor.fromInt(0xFF075985);
    const colorSky900 = PdfColor.fromInt(0xFF0C4A6E);
    const colorSky50 = PdfColor.fromInt(0xFFF0F9FF);
    const colorSky200 = PdfColor.fromInt(0xFFBAE6FD);

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(28),
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              // 1. Universal Master Header
              PdfEngineService.buildUniversalMasterHeader(
                documentNumber: report.documentNumber,
                issueDate: report.issueDate,
                programName: report.programTier,
                periodInfo: '${report.batchName} • Level ${report.cefrLevel}',
              ),

              // 2. Title Banner
              PdfEngineService.buildDocumentTitleBanner(
                title: 'LAPORAN PERKEMBANGAN BELAJAR RESMI',
                subtitle: 'OFFICIAL ACADEMIC PROGRESS & COMPETENCY EVALUATION REPORT',
              ),
              pw.SizedBox(height: 10),

              // 3. Profil Siswa & Kehadiran
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
                        pw.Text('PROFIL SISWA', style: pw.TextStyle(fontSize: 7.5, fontWeight: pw.FontWeight.bold, color: PdfColors.grey600)),
                        pw.Text(report.studentName, style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold, color: PdfColors.blueGrey900)),
                        pw.Text('Orang Tua/Wali: ${report.parentName}', style: const pw.TextStyle(fontSize: 8.5, color: PdfColors.grey700)),
                      ],
                    ),
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.end,
                      children: [
                        pw.Text('KEHADIRAN & STATUS', style: pw.TextStyle(fontSize: 7.5, fontWeight: pw.FontWeight.bold, color: PdfColors.grey600)),
                        pw.Text(
                          '${report.attendanceAttended} / ${report.attendanceTotal} Sesi Hadir (100%)',
                          style: pw.TextStyle(fontSize: 10, fontWeight: pw.FontWeight.bold, color: colorEmerald700),
                        ),
                        pw.Text('Status: Batch Tuntas', style: const pw.TextStyle(fontSize: 8.5, color: colorSky800)),
                      ],
                    ),
                  ],
                ),
              ),
              pw.SizedBox(height: 14),

              // 4. Matriks Kompetensi 4 Pilar
              pw.Text('EVALUASI KOMPETENSI BAHASA & CAPAIAN', style: pw.TextStyle(fontSize: 9.5, fontWeight: pw.FontWeight.bold, color: PdfColors.blueGrey900)),
              pw.SizedBox(height: 6),
              ...report.competencies.map((comp) {
                return pw.Container(
                  margin: const pw.EdgeInsets.only(bottom: 8),
                  padding: const pw.EdgeInsets.all(8),
                  decoration: pw.BoxDecoration(
                    border: pw.Border.all(color: PdfColors.grey200),
                    borderRadius: pw.BorderRadius.circular(6),
                  ),
                  child: pw.Row(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Expanded(
                        child: pw.Column(
                          crossAxisAlignment: pw.CrossAxisAlignment.start,
                          children: [
                            pw.Text(comp.title, style: pw.TextStyle(fontSize: 9, fontWeight: pw.FontWeight.bold, color: PdfColors.blueGrey900)),
                            pw.SizedBox(height: 2),
                            pw.Text(comp.description, style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey700)),
                          ],
                        ),
                      ),
                      pw.SizedBox(width: 12),
                      pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.end,
                        children: [
                          pw.Text('${comp.score}/100', style: pw.TextStyle(fontSize: 10, fontWeight: pw.FontWeight.bold, color: colorSky800)),
                          pw.Text(comp.grade, style: pw.TextStyle(fontSize: 7.5, fontWeight: pw.FontWeight.bold, color: comp.score >= 85 ? colorEmerald700 : PdfColors.blueGrey700)),
                        ],
                      ),
                    ],
                  ),
                );
              }),

              pw.SizedBox(height: 10),

              // 5. Catatan Mentor & Target Selanjutnya
              pw.Container(
                padding: const pw.EdgeInsets.all(10),
                decoration: pw.BoxDecoration(
                  color: colorSky50,
                  borderRadius: pw.BorderRadius.circular(6),
                  border: pw.Border.all(color: colorSky200),
                ),
                child: pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Text('CATATAN EVALUASI & PROYEKSI AKADEMIK:', style: pw.TextStyle(fontSize: 8.5, fontWeight: pw.FontWeight.bold, color: colorSky900)),
                    pw.SizedBox(height: 4),
                    pw.Text(report.tutorNotes, style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey800, lineSpacing: 1.3)),
                    pw.SizedBox(height: 6),
                    pw.Text('Rekomendasi Tahap Berikutnya: ${report.nextTarget}', style: pw.TextStyle(fontSize: 8, fontWeight: pw.FontWeight.bold, color: colorSky900)),
                  ],
                ),
              ),

              pw.Spacer(),

              // 6. Signature Area
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text('Kavio Edu Academic Mentoring', style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey600)),
                      pw.Text('Dokumen Elektronik Sah & Terverifikasi', style: const pw.TextStyle(fontSize: 7.5, color: PdfColors.grey500)),
                    ],
                  ),
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.end,
                    children: [
                      pw.Text('Pandeglang, ${report.issueDate}', style: const pw.TextStyle(fontSize: 8.5, color: PdfColors.grey700)),
                      pw.SizedBox(height: 28),
                      pw.Text('Fatih Farhat Asshidiq', style: pw.TextStyle(fontSize: 9, fontWeight: pw.FontWeight.bold, color: PdfColors.blueGrey900)),
                      pw.Text('Founder & Academic Director', style: const pw.TextStyle(fontSize: 7.5, color: PdfColors.grey600)),
                    ],
                  ),
                ],
              ),
            ],
          );
        },
      ),
    );

    return pdf.save();
  }
}
