import 'dart:typed_data';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import '../data/models/certificate_model.dart';

class CertificatePdfService {
  static Future<Uint8List> generateCertificatePdf(CertificateModel cert) async {
    final pdf = pw.Document();

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.symmetric(horizontal: 36, vertical: 36),
        build: (pw.Context context) {
          return pw.Column(
            mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
            crossAxisAlignment: pw.CrossAxisAlignment.center,
            children: [
              // 1. MASTER HEADER SERTIFIKAT
              pw.Column(
                children: [
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          pw.Text(
                            'KAVIO EDU',
                            style: pw.TextStyle(
                              fontSize: 22,
                              fontWeight: pw.FontWeight.bold,
                              letterSpacing: 3.0,
                              color: PdfColors.blueGrey900,
                            ),
                          ),
                          pw.SizedBox(height: 2),
                          pw.Text(
                            'Private English Class & Academic Mentoring',
                            style: const pw.TextStyle(fontSize: 9, fontWeight: pw.FontWeight.bold, color: PdfColor.fromInt(0xFF0369A1)),
                          ),
                        ],
                      ),
                      pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.end,
                        children: [
                          pw.Text('NO. SERTIFIKAT: ${cert.documentId}', style: pw.TextStyle(fontSize: 9, fontWeight: pw.FontWeight.bold, color: PdfColors.blueGrey900)),
                          pw.SizedBox(height: 2),
                          pw.Text('Terbit: ${cert.issueDate}', style: const pw.TextStyle(fontSize: 8.5, color: PdfColors.grey700)),
                        ],
                      ),
                    ],
                  ),
                  pw.SizedBox(height: 12),
                  pw.Container(height: 1.5, color: PdfColors.blueGrey900),
                ],
              ),

              // 2. TITEL & PERNYATAAN PENERIMA
              pw.Column(
                children: [
                  pw.Text(
                    'CERTIFICATE OF COMPLETION',
                    style: const pw.TextStyle(fontSize: 11, fontWeight: pw.FontWeight.bold, letterSpacing: 3.0, color: PdfColor.fromInt(0xFF075985)),
                  ),
                  pw.SizedBox(height: 6),
                  pw.Text(
                    'SERTIFIKAT KELULUSAN & PENCAPAIAN',
                    style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold, letterSpacing: 1.5, color: PdfColors.blueGrey900),
                  ),
                  pw.SizedBox(height: 6),
                  pw.Container(width: 50, height: 1, color: PdfColors.blueGrey900),
                  pw.SizedBox(height: 20),

                  pw.Text(
                    'Diberikan dengan penuh penghargaan dan pengakuan resmi kepada:',
                    style: const pw.TextStyle(fontSize: 9.5, fontStyle: pw.FontStyle.italic, color: PdfColors.grey700),
                  ),
                  pw.SizedBox(height: 12),

                  // NAMA SISWA BESAR & TEGAS
                  pw.Text(
                    cert.studentName,
                    style: pw.TextStyle(
                      fontSize: 26,
                      fontWeight: pw.FontWeight.bold,
                      letterSpacing: 1.2,
                      color: PdfColors.blueGrey900,
                    ),
                  ),
                  pw.SizedBox(height: 4),
                  pw.Container(width: 220, height: 0.8, color: PdfColors.grey400),
                  pw.SizedBox(height: 14),

                  pw.Container(
                    width: 440,
                    child: pw.Text(
                      'Telah berhasil menyelesaikan seluruh silabus kurikulum pembelajaran intensif secara terstruktur pada jenjang ${cert.cefrLevel}, mencakup penguasaan tata bahasa fungsional, kelancaran berbicara, serta pemahaman kontekstual.',
                      textAlign: pw.TextAlign.center,
                      style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey800, lineSpacing: 1.4),
                    ),
                  ),
                ],
              ),

              // 3. MATRIKS PENCAPAIAN FLAT & CLEAN
              pw.Container(
                margin: const pw.EdgeInsets.symmetric(vertical: 8),
                padding: const pw.EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                decoration: const pw.BoxDecoration(
                  border: pw.Border(
                    top: pw.BorderSide(color: PdfColors.grey300, width: 0.8),
                    bottom: pw.BorderSide(color: PdfColors.grey300, width: 0.8),
                  ),
                ),
                child: pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceAround,
                  children: [
                    _buildMatrixCell('PROGRAM', cert.programName),
                    _buildMatrixDivider(),
                    _buildMatrixCell('PERIODE / BATCH', cert.batchName),
                    _buildMatrixDivider(),
                    _buildMatrixCell('TOTAL SESI', '${cert.totalSessions} Sesi Selesai'),
                    _buildMatrixDivider(),
                    _buildMatrixCell('HASIL EVALUASI', cert.predicate, isHighlight: true),
                  ],
                ),
              ),

              // 4. FOOTER & TANDA TANGAN RESMI
              pw.Column(
                children: [
                  pw.Container(height: 0.8, color: PdfColors.grey300),
                  pw.SizedBox(height: 12),
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: pw.CrossAxisAlignment.end,
                    children: [
                      // Kolom Kiri: Verifikasi & Legalitas
                      pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          pw.Text('DOKUMEN RESMI TERVERIFIKASI', style: pw.TextStyle(fontSize: 8.5, fontWeight: pw.FontWeight.bold, color: PdfColors.blueGrey900)),
                          pw.SizedBox(height: 2),
                          pw.Text('Diterbitkan sah oleh Kavio Edu Academic System.', style: const pw.TextStyle(fontSize: 7.5, color: PdfColors.grey600)),
                          pw.SizedBox(height: 2),
                          pw.Text('Security Hash: ${cert.verificationHash}', style: const pw.TextStyle(fontSize: 7, color: PdfColors.grey500)),
                        ],
                      ),

                      // Kolom Kanan: Tanda Tangan Founder
                      pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.end,
                        children: [
                          pw.Text('${cert.signLocation}, ${cert.issueDate}', style: const pw.TextStyle(fontSize: 8.5, color: PdfColors.grey700)),
                          pw.SizedBox(height: 36), // Ruang Stempel / TTD
                          pw.Text(cert.directorName, style: pw.TextStyle(fontSize: 10, fontWeight: pw.FontWeight.bold, color: PdfColors.blueGrey900)),
                          pw.Text(cert.directorTitle, style: const pw.TextStyle(fontSize: 7.5, color: PdfColors.grey600)),
                        ],
                      ),
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

  static pw.Widget _buildMatrixCell(String label, String value, {bool isHighlight = false}) {
    return pw.Column(
      children: [
        pw.Text(label, style: pw.TextStyle(fontSize: 7.5, fontWeight: pw.FontWeight.bold, color: PdfColors.grey500)),
        pw.SizedBox(height: 3),
        pw.Text(
          value,
          style: pw.TextStyle(
            fontSize: 9,
            fontWeight: pw.FontWeight.bold,
            color: isHighlight ? const PdfColor.fromInt(0xFF047857) : PdfColors.blueGrey900,
          ),
        ),
      ],
    );
  }

  static pw.Widget _buildMatrixDivider() {
    return pw.Container(width: 0.8, height: 24, color: PdfColors.grey300);
  }
}
