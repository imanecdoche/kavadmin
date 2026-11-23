import 'dart:typed_data';
import 'package:flutter/services.dart' show rootBundle;
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../core/constants/paper_dimensions.dart';
import '../core/utils/session_time_evaluator.dart';
import '../data/models/student_model.dart';
import '../data/models/roadmap_session_model.dart';
import '../data/models/report_card_model.dart';
import '../data/models/certificate_model.dart';

/// 🖨️ Universal Native Vector PDF Generation Engine for Kavio Edu
class PdfEngineService {
  PdfEngineService._();

  // ===========================================================================
  // 1. UNIVERSAL MASTER HEADER & BANNER
  // ===========================================================================

  /// Membangun Header Brand Universal Kavio Edu
  static pw.Widget buildUniversalMasterHeader({
    required String documentNumber,
    required String issueDate,
    required String programName,
    String? periodInfo,
  }) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        pw.Row(
          mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
          crossAxisAlignment: pw.CrossAxisAlignment.start,
          children: [
            // Sisi Kiri: Brand Typography
            pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Text(
                  'KAVIO EDU',
                  style: pw.TextStyle(
                    fontSize: 20,
                    fontWeight: pw.FontWeight.bold,
                    letterSpacing: 2.5,
                    color: PdfColors.blueGrey900,
                  ),
                ),
                pw.SizedBox(height: 2),
                pw.Text(
                  'Private English Class & Academic Mentoring',
                  style: const pw.TextStyle(
                    fontSize: 9.5,
                    fontWeight: pw.FontWeight.bold,
                    color: PdfColor.fromInt(0xFF0369A1),
                  ),
                ),
              ],
            ),

            // Sisi Kanan: Metadata Dokumen
            pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.end,
              children: [
                pw.Text(
                  'NO. DOKUMEN: $documentNumber',
                  style: pw.TextStyle(
                    fontSize: 9.5,
                    fontWeight: pw.FontWeight.bold,
                    fontStyle: pw.FontStyle.italic,
                    color: PdfColors.blueGrey900,
                  ),
                ),
                pw.SizedBox(height: 2),
                pw.Text(
                  'Tanggal: $issueDate',
                  style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey700),
                ),
                pw.Text(
                  'Program: Paket $programName ${periodInfo != null ? "| $periodInfo" : ""}',
                  style: const pw.TextStyle(
                    fontSize: 9,
                    fontWeight: pw.FontWeight.bold,
                    color: PdfColor.fromInt(0xFF075985),
                  ),
                ),
              ],
            ),
          ],
        ),
        pw.SizedBox(height: 8),
        pw.Container(
          height: 1.5,
          color: PdfColors.blueGrey900,
        ),
        pw.SizedBox(height: 10),
      ],
    );
  }

  /// Membangun Banner Judul Dokumen (Title Banner)
  static pw.Widget buildDocumentTitleBanner({
    required String title,
    required String subtitle,
  }) {
    return pw.Container(
      alignment: pw.Alignment.center,
      padding: const pw.EdgeInsets.symmetric(vertical: 6),
      child: pw.Column(
        children: [
          pw.Text(
            title.toUpperCase(),
            style: pw.TextStyle(
              fontSize: 12.5,
              fontWeight: pw.FontWeight.bold,
              letterSpacing: 1.2,
              color: PdfColors.blueGrey900,
            ),
          ),
          pw.SizedBox(height: 2),
          pw.Text(
            subtitle.toUpperCase(),
            style: const pw.TextStyle(
              fontSize: 8.5,
              letterSpacing: 0.8,
              color: PdfColors.grey600,
            ),
          ),
          pw.SizedBox(height: 8),
          pw.Container(height: 0.5, color: PdfColors.grey300),
        ],
      ),
    );
  }

  /// Trigger Langsung Dialog Print / Simpan PDF
  static Future<void> printOrSaveDocument({
    required Uint8List pdfBytes,
    required String fileName,
  }) async {
    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => pdfBytes,
      name: fileName,
    );
  }

  /// Share File PDF Langsung ke WhatsApp / Aplikasi Lain
  static Future<void> shareDocument({
    required Uint8List pdfBytes,
    required String fileName,
  }) async {
    await Printing.sharePdf(
      bytes: pdfBytes,
      filename: '$fileName.pdf',
    );
  }

  static Future<void> printOrShareDocument({
    required Uint8List bytes,
    required String filename,
  }) async {
    await printOrSaveDocument(pdfBytes: bytes, fileName: filename);
  }

  // ===========================================================================
  // 2. ROADMAP PDF GENERATOR
  // ===========================================================================
  static Future<Uint8List> generateRoadmapPdf({
    required StudentRoadmapModel roadmap,
    required StudentModel student,
    String paperSizeKey = 'a4',
  }) async {
    final pdf = pw.Document();
    final paperConfig = PaperDimensions.fromKey(paperSizeKey);

    final regularFont = await PdfGoogleFonts.plusJakartaSansRegular();
    final boldFont = await PdfGoogleFonts.plusJakartaSansBold();
    final italicFont = await PdfGoogleFonts.plusJakartaSansItalic();

    pw.MemoryImage? stampImage;
    pw.MemoryImage? signatureImage;

    try {
      final stampBytes = await rootBundle.load('assets/images/stempel_kavioedu.png');
      stampImage = pw.MemoryImage(stampBytes.buffer.asUint8List());
    } catch (_) {}

    try {
      final sigBytes = await rootBundle.load('assets/images/ttd_fatih_founderkavio.png');
      signatureImage = pw.MemoryImage(sigBytes.buffer.asUint8List());
    } catch (_) {}

    final sessions = roadmap.sessions;
    const int sessionsPerPage = 6;
    final int totalPages = (sessions.length / sessionsPerPage).ceil().clamp(1, 99);

    for (int pageIdx = 0; pageIdx < totalPages; pageIdx++) {
      final startIdx = pageIdx * sessionsPerPage;
      final endIdx = (startIdx + sessionsPerPage < sessions.length)
          ? startIdx + sessionsPerPage
          : sessions.length;
      final pageSessions = sessions.sublist(startIdx, endIdx);
      final isLastPage = (pageIdx == totalPages - 1);

      pdf.addPage(
        pw.Page(
          pageFormat: paperConfig.pdfFormat,
          margin: const pw.EdgeInsets.all(28),
          build: (pw.Context context) {
            return pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                if (pageIdx == 0) ...[
                  buildUniversalMasterHeader(
                    documentNumber: 'KE/RDM/${student.id.replaceAll('std_', '')}',
                    issueDate: SessionTimeEvaluator.formatDateShort(DateTime.now()),
                    programName: student.programTier,
                    periodInfo: student.cefrLevel,
                  ),
                  buildDocumentTitleBanner(
                    title: 'Modular Learning Roadmap & Curriculum',
                    subtitle: 'Syllabus & Session-by-Session Mastery Architecture',
                  ),
                  pw.SizedBox(height: 6),
                  pw.Container(
                    padding: const pw.EdgeInsets.all(8),
                    decoration: pw.BoxDecoration(
                      color: PdfColors.grey100,
                      borderRadius: pw.BorderRadius.circular(6),
                      border: pw.Border.all(color: PdfColors.grey300),
                    ),
                    child: pw.Row(
                      mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                      children: [
                        pw.Column(
                          crossAxisAlignment: pw.CrossAxisAlignment.start,
                          children: [
                            pw.Text('Nama Siswa: ${student.name}',
                                style: pw.TextStyle(font: boldFont, fontSize: 10)),
                            pw.Text('Wali: ${student.parentName} | Batch: ${student.batchName}',
                                style: pw.TextStyle(font: regularFont, fontSize: 9)),
                          ],
                        ),
                        pw.Column(
                          crossAxisAlignment: pw.CrossAxisAlignment.end,
                          children: [
                            pw.Text('Level: ${student.cefrLevel} | Slot: ${student.sessionSlot} WIB',
                                style: pw.TextStyle(font: boldFont, fontSize: 10)),
                            pw.Text(
                                'Progress: ${roadmap.progressPercentage}% (${roadmap.completedCount}/${roadmap.totalSessions})',
                                style: pw.TextStyle(font: regularFont, fontSize: 9)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  pw.SizedBox(height: 10),
                ] else ...[
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Text(
                        'KAVIO EDU LEARNING ROADMAP — ${student.name} (${pageIdx + 1}/$totalPages)',
                        style: pw.TextStyle(font: boldFont, fontSize: 9, color: PdfColors.blue800),
                      ),
                      pw.Text(
                        'Paket: ${student.programTier}',
                        style: pw.TextStyle(font: regularFont, fontSize: 8, color: PdfColors.grey600),
                      ),
                    ],
                  ),
                  pw.SizedBox(height: 6),
                  pw.Divider(thickness: 0.5, color: PdfColors.grey400),
                  pw.SizedBox(height: 8),
                ],

                pw.Expanded(
                  child: pw.ListView.separated(
                    itemCount: pageSessions.length,
                    separatorBuilder: (_, __) => pw.SizedBox(height: 8),
                    itemBuilder: (context, i) {
                      final session = pageSessions[i];
                      final isComp = session.isCompleted || session.status.toUpperCase() == 'SELESAI';

                      return pw.Container(
                        padding: const pw.EdgeInsets.all(8),
                        decoration: pw.BoxDecoration(
                          color: isComp ? PdfColors.blue50 : PdfColors.white,
                          borderRadius: pw.BorderRadius.circular(6),
                          border: pw.Border.all(
                            color: isComp ? PdfColors.blue300 : PdfColors.grey300,
                            width: 0.8,
                          ),
                        ),
                        child: pw.Column(
                          crossAxisAlignment: pw.CrossAxisAlignment.start,
                          children: [
                            pw.Row(
                              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                              children: [
                                pw.Text(
                                  'Sesi ${session.sessionNumber.toString().padLeft(2, '0')} • Level ${session.level}',
                                  style: pw.TextStyle(font: boldFont, fontSize: 9, color: PdfColors.blue900),
                                ),
                                pw.Container(
                                  padding: const pw.EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: pw.BoxDecoration(
                                    color: isComp ? PdfColors.green100 : PdfColors.grey200,
                                    borderRadius: pw.BorderRadius.circular(4),
                                  ),
                                  child: pw.Text(
                                    session.status.toUpperCase(),
                                    style: pw.TextStyle(
                                      font: boldFont,
                                      fontSize: 7,
                                      color: isComp ? PdfColors.green900 : PdfColors.grey800,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            pw.SizedBox(height: 4),
                            pw.Text(
                              session.title,
                              style: pw.TextStyle(font: boldFont, fontSize: 10, color: PdfColors.black),
                            ),
                            if (session.description.isNotEmpty) ...[
                              pw.SizedBox(height: 2),
                              pw.Text(
                                session.description,
                                style: pw.TextStyle(font: regularFont, fontSize: 8, color: PdfColors.grey800),
                              ),
                            ],
                          ],
                        ),
                      );
                    },
                  ),
                ),

                if (isLastPage) ...[
                  pw.SizedBox(height: 12),
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: pw.CrossAxisAlignment.end,
                    children: [
                      pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          pw.Text('Dokumen Kurikulum Resmi Kavio Edu',
                              style: pw.TextStyle(font: boldFont, fontSize: 8)),
                          pw.Text('Kavling Sukatani Permai, Rajeg, Kab. Tangerang',
                              style: pw.TextStyle(font: regularFont, fontSize: 7, color: PdfColors.grey700)),
                          pw.Text('Verifikasi: https://kavioedu.web.app',
                              style: pw.TextStyle(font: regularFont, fontSize: 7, color: PdfColors.blue700)),
                        ],
                      ),
                      pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.center,
                        children: [
                          pw.Text('Academic Lead & Founder',
                              style: pw.TextStyle(font: regularFont, fontSize: 8)),
                          pw.SizedBox(height: 4),
                          pw.Stack(
                            alignment: pw.Alignment.center,
                            children: [
                              if (stampImage != null)
                                pw.Container(width: 50, height: 50, child: pw.Image(stampImage)),
                              if (signatureImage != null)
                                pw.Container(width: 60, height: 35, child: pw.Image(signatureImage)),
                            ],
                          ),
                          pw.SizedBox(height: 4),
                          pw.Text('Fatih Farhat', style: pw.TextStyle(font: boldFont, fontSize: 9)),
                        ],
                      ),
                    ],
                  ),
                ],

                pw.SizedBox(height: 8),
                pw.Center(
                  child: pw.Text(
                    'Halaman ${pageIdx + 1} dari $totalPages',
                    style: pw.TextStyle(font: regularFont, fontSize: 7, color: PdfColors.grey600),
                  ),
                ),
              ],
            );
          },
        ),
      );
    }

    return pdf.save();
  }

  // ===========================================================================
  // 3. REPORT CARD PDF GENERATOR
  // ===========================================================================
  static Future<Uint8List> generateReportCardPdf({
    required ReportCardModel report,
    required StudentModel student,
  }) async {
    final pdf = pw.Document();

    final regularFont = await PdfGoogleFonts.plusJakartaSansRegular();
    final boldFont = await PdfGoogleFonts.plusJakartaSansBold();

    pw.MemoryImage? stampImage;
    pw.MemoryImage? signatureImage;

    try {
      final stampBytes = await rootBundle.load('assets/images/stempel_kavioedu.png');
      stampImage = pw.MemoryImage(stampBytes.buffer.asUint8List());
    } catch (_) {}

    try {
      final sigBytes = await rootBundle.load('assets/images/ttd_fatih_founderkavio.png');
      signatureImage = pw.MemoryImage(sigBytes.buffer.asUint8List());
    } catch (_) {}

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(32),
        build: (context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              buildUniversalMasterHeader(
                documentNumber: 'KE/REP/${(report.id ?? "0001").replaceAll('rep_', '')}',
                issueDate: SessionTimeEvaluator.formatDateShort(DateTime.now()),
                programName: student.programTier,
                periodInfo: report.period,
              ),
              buildDocumentTitleBanner(
                title: 'Laporan Perkembangan Belajar Siswa',
                subtitle: 'Official Academic Progress & Competency Report',
              ),
              pw.SizedBox(height: 10),

              pw.Container(
                padding: const pw.EdgeInsets.all(10),
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
                        pw.Text('Nama Siswa : ${student.name}', style: pw.TextStyle(font: boldFont, fontSize: 10)),
                        pw.Text('Wali       : ${student.parentName}', style: pw.TextStyle(font: regularFont, fontSize: 9)),
                      ],
                    ),
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.end,
                      children: [
                        pw.Text('Level CEFR : ${student.cefrLevel}', style: pw.TextStyle(font: boldFont, fontSize: 10)),
                        pw.Text('Predikat   : ${report.predicate}', style: pw.TextStyle(font: regularFont, fontSize: 9)),
                      ],
                    ),
                  ],
                ),
              ),
              pw.SizedBox(height: 14),

              pw.Text('Rubrik Evaluasi Kompetensi', style: pw.TextStyle(font: boldFont, fontSize: 11)),
              pw.SizedBox(height: 6),
              pw.TableHelper.fromTextArray(
                context: context,
                border: pw.TableBorder.all(color: PdfColors.grey300, width: 0.5),
                headerStyle: pw.TextStyle(font: boldFont, fontSize: 9, color: PdfColors.white),
                headerDecoration: const pw.BoxDecoration(color: PdfColors.blue800),
                cellStyle: pw.TextStyle(font: regularFont, fontSize: 8.5),
                headers: ['No', 'Kompetensi Bahasa', 'Bobot', 'Nilai (0-100)', 'Kategori Capaian'],
                data: List.generate(report.competencies.length, (idx) {
                  final c = report.competencies[idx];
                  return [
                    '${idx + 1}',
                    c.label,
                    '${c.weight.toInt()}%',
                    '${c.score.toInt()}',
                    c.benchmark,
                  ];
                }),
              ),
              pw.SizedBox(height: 14),

              pw.Container(
                padding: const pw.EdgeInsets.all(12),
                decoration: pw.BoxDecoration(
                  color: PdfColors.blue50,
                  borderRadius: pw.BorderRadius.circular(8),
                  border: pw.Border.all(color: PdfColors.blue300),
                ),
                child: pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text('Nilai Komposit Terbobot', style: pw.TextStyle(font: regularFont, fontSize: 9)),
                        pw.Text(
                          '${report.compositeScore.toStringAsFixed(1)} / 100',
                          style: pw.TextStyle(font: boldFont, fontSize: 18, color: PdfColors.blue900),
                        ),
                      ],
                    ),
                    pw.Container(
                      padding: const pw.EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: pw.BoxDecoration(
                        color: PdfColors.blue900,
                        borderRadius: pw.BorderRadius.circular(6),
                      ),
                      child: pw.Text(
                        'GRADE ${report.letterGrade}',
                        style: pw.TextStyle(font: boldFont, fontSize: 16, color: PdfColors.white),
                      ),
                    ),
                  ],
                ),
              ),

              if (report.overallComment.isNotEmpty) ...[
                pw.SizedBox(height: 14),
                pw.Text('Catatan Evaluator & Rekomendasi:', style: pw.TextStyle(font: boldFont, fontSize: 10)),
                pw.SizedBox(height: 4),
                pw.Container(
                  width: double.infinity,
                  padding: const pw.EdgeInsets.all(8),
                  decoration: pw.BoxDecoration(
                    color: PdfColors.grey50,
                    borderRadius: pw.BorderRadius.circular(6),
                    border: pw.Border.all(color: PdfColors.grey200),
                  ),
                  child: pw.Text(
                    report.overallComment,
                    style: pw.TextStyle(font: regularFont, fontSize: 8.5, color: PdfColors.grey900),
                  ),
                ),
              ],

              pw.Spacer(),

              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text('Kavio Edu Official Report', style: pw.TextStyle(font: boldFont, fontSize: 8)),
                      pw.Text('Diterbitkan pada: ${SessionTimeEvaluator.formatDateIndonesian(DateTime.now())}',
                          style: pw.TextStyle(font: regularFont, fontSize: 8)),
                    ],
                  ),
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.center,
                    children: [
                      pw.Text('Academic Lead & Tutor', style: pw.TextStyle(font: regularFont, fontSize: 8)),
                      pw.SizedBox(height: 4),
                      pw.Stack(
                        alignment: pw.Alignment.center,
                        children: [
                          if (stampImage != null)
                            pw.Container(width: 48, height: 48, child: pw.Image(stampImage)),
                          if (signatureImage != null)
                            pw.Container(width: 58, height: 32, child: pw.Image(signatureImage)),
                        ],
                      ),
                      pw.SizedBox(height: 4),
                      pw.Text(report.tutorName, style: pw.TextStyle(font: boldFont, fontSize: 8.5)),
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

  // ===========================================================================
  // 4. CERTIFICATE PDF GENERATOR
  // ===========================================================================
  static Future<Uint8List> generateCertificatePdf({
    required CertificateModel certificate,
  }) async {
    final pdf = pw.Document();

    final regularFont = await PdfGoogleFonts.plusJakartaSansRegular();
    final boldFont = await PdfGoogleFonts.plusJakartaSansBold();
    final serifFont = await PdfGoogleFonts.cinzelBold();

    pw.MemoryImage? stampImage;
    pw.MemoryImage? signatureImage;

    try {
      final stampBytes = await rootBundle.load('assets/images/stempel_kavioedu.png');
      stampImage = pw.MemoryImage(stampBytes.buffer.asUint8List());
    } catch (_) {}

    try {
      final sigBytes = await rootBundle.load('assets/images/ttd_fatih_founderkavio.png');
      signatureImage = pw.MemoryImage(sigBytes.buffer.asUint8List());
    } catch (_) {}

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4.landscape,
        margin: const pw.EdgeInsets.all(24),
        build: (context) {
          return pw.Container(
            padding: const pw.EdgeInsets.all(20),
            decoration: pw.BoxDecoration(
              border: pw.Border.all(color: PdfColors.amber800, width: 3),
              borderRadius: pw.BorderRadius.circular(12),
            ),
            child: pw.Column(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.center,
                  children: [
                    pw.Column(
                      children: [
                        pw.Text(
                          'CERTIFICATE OF ACHIEVEMENT',
                          style: pw.TextStyle(font: serifFont, fontSize: 20, color: PdfColors.blue900),
                        ),
                        pw.Text(
                          'No: ${certificate.certificateNumber}',
                          style: pw.TextStyle(font: regularFont, fontSize: 9, color: PdfColors.grey700),
                        ),
                      ],
                    ),
                  ],
                ),
                pw.Column(
                  children: [
                    pw.Text('This certificate is proudly presented to:',
                        style: pw.TextStyle(font: regularFont, fontSize: 11, color: PdfColors.grey800)),
                    pw.SizedBox(height: 8),
                    pw.Text(
                      certificate.studentName.toUpperCase(),
                      style: pw.TextStyle(font: boldFont, fontSize: 24, color: PdfColors.blue900),
                    ),
                    pw.SizedBox(height: 8),
                    pw.Container(width: 250, height: 1, color: PdfColors.amber800),
                    pw.SizedBox(height: 10),
                    pw.Text(
                      'for successfully completing the rigorous curriculum of',
                      style: pw.TextStyle(font: regularFont, fontSize: 10, color: PdfColors.grey800),
                    ),
                    pw.SizedBox(height: 4),
                    pw.Text(
                      '${certificate.program} — Level ${certificate.levelCompleted}',
                      style: pw.TextStyle(font: boldFont, fontSize: 13, color: PdfColors.black),
                    ),
                    pw.SizedBox(height: 4),
                    pw.Text(
                      'with Academic Grade: ${certificate.grade}',
                      style: pw.TextStyle(font: boldFont, fontSize: 11, color: PdfColors.amber900),
                    ),
                  ],
                ),
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: pw.CrossAxisAlignment.end,
                  children: [
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text('Issue Date: ${certificate.issueDate.isNotEmpty ? certificate.issueDate : SessionTimeEvaluator.formatDateIndonesian(DateTime.now())}',
                            style: pw.TextStyle(font: regularFont, fontSize: 9)),
                        pw.Text('Verification: https://kavioedu.web.app',
                            style: pw.TextStyle(font: regularFont, fontSize: 8, color: PdfColors.blue700)),
                      ],
                    ),
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.center,
                      children: [
                        pw.Stack(
                          alignment: pw.Alignment.center,
                          children: [
                            if (stampImage != null)
                              pw.Container(width: 50, height: 50, child: pw.Image(stampImage)),
                            if (signatureImage != null)
                              pw.Container(width: 65, height: 35, child: pw.Image(signatureImage)),
                          ],
                        ),
                        pw.SizedBox(height: 4),
                        pw.Text(certificate.signatoryName, style: pw.TextStyle(font: boldFont, fontSize: 10)),
                        pw.Text(certificate.signatoryRole, style: pw.TextStyle(font: regularFont, fontSize: 8)),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );

    return pdf.save();
  }
}
