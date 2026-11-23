import 'package:pdf/pdf.dart';

enum PaperSizePreset { a4, f4, legal, letter }

extension PaperSizePresetExt on PaperSizePreset {
  PdfPageFormat get pageFormat {
    switch (this) {
      case PaperSizePreset.a4:
        return PdfPageFormat.a4;
      case PaperSizePreset.f4:
        // Format F4 / Folio: 215mm x 330mm
        return const PdfPageFormat(215 * PdfPageFormat.mm, 330 * PdfPageFormat.mm, marginAll: 20 * PdfPageFormat.mm);
      case PaperSizePreset.legal:
        return PdfPageFormat.legal;
      case PaperSizePreset.letter:
        return PdfPageFormat.letter;
    }
  }

  String get displayName {
    switch (this) {
      case PaperSizePreset.a4:
        return 'A4 (210 × 297 mm)';
      case PaperSizePreset.f4:
        return 'F4 / Folio (215 × 330 mm)';
      case PaperSizePreset.legal:
        return 'US Legal (216 × 356 mm)';
      case PaperSizePreset.letter:
        return 'US Letter (216 × 279 mm)';
    }
  }
}

// Backward compatibility helper
class PaperDimension {
  final String key;
  final String name;
  final PdfPageFormat pdfFormat;

  const PaperDimension({required this.key, required this.name, required this.pdfFormat});
}

class PaperDimensions {
  PaperDimensions._();

  static const List<PaperDimension> all = [
    PaperDimension(key: 'a4', name: 'A4', pdfFormat: PdfPageFormat.a4),
    PaperDimension(key: 'f4', name: 'F4 / Folio', pdfFormat: PdfPageFormat(215 * PdfPageFormat.mm, 330 * PdfPageFormat.mm)),
    PaperDimension(key: 'legal', name: 'US Legal', pdfFormat: PdfPageFormat.legal),
    PaperDimension(key: 'letter', name: 'US Letter', pdfFormat: PdfPageFormat.letter),
  ];

  static PaperDimension fromKey(String? key) {
    if (key == null) return all[0];
    final norm = key.toLowerCase();
    return all.firstWhere((p) => p.key == norm, orElse: () => all[0]);
  }
}
