class CompetencyScore {
  final String title;
  final String description;
  final int score; // 1 - 100

  CompetencyScore({
    required this.title,
    required this.description,
    required this.score,
  });

  String get grade {
    if (score >= 85) return 'A (Sangat Baik)';
    if (score >= 70) return 'B (Baik)';
    if (score >= 55) return 'C (Cukup)';
    return 'D (Perlu Pendampingan)';
  }

  String get label => title;
  double get weight => 25.0;
  String get benchmark => grade;

  Map<String, dynamic> toMap() => {
        'title': title,
        'description': description,
        'score': score,
      };

  factory CompetencyScore.fromMap(Map<String, dynamic> map) {
    return CompetencyScore(
      title: map['title']?.toString() ?? '',
      description: map['description']?.toString() ?? '',
      score: (map['score'] as num?)?.toInt() ?? 80,
    );
  }
}

class ReportCardModel {
  final String documentNumber;
  final String issueDate;
  final String studentName;
  final String parentName;
  final String programTier;
  final String batchName;
  final String cefrLevel;
  final int attendanceAttended;
  final int attendanceTotal;
  final List<CompetencyScore> competencies;
  final String tutorNotes;
  final String nextTarget;
  final String? id;

  ReportCardModel({
    required this.documentNumber,
    required this.issueDate,
    required this.studentName,
    required this.parentName,
    required this.programTier,
    required this.batchName,
    required this.cefrLevel,
    this.attendanceAttended = 12,
    this.attendanceTotal = 12,
    required this.competencies,
    required this.tutorNotes,
    required this.nextTarget,
    this.id,
  });

  // Compatibility getters
  String get level => '$programTier ($cefrLevel)';
  String get period => batchName;
  String get predicate => 'Sangat Baik (Distinction)';
  String get overallComment => tutorNotes;
  String get tutorName => 'Fatih Farhat Asshidiq';
  String get letterGrade => 'A';
  double get compositeScore {
    if (competencies.isEmpty) return 85.0;
    final total = competencies.fold<int>(0, (sum, c) => sum + c.score);
    return total / competencies.length;
  }

  Map<String, dynamic> toMap() => {
        'documentNumber': documentNumber,
        'issueDate': issueDate,
        'studentName': studentName,
        'parentName': parentName,
        'programTier': programTier,
        'batchName': batchName,
        'cefrLevel': cefrLevel,
        'attendanceAttended': attendanceAttended,
        'attendanceTotal': attendanceTotal,
        'competencies': competencies.map((c) => c.toMap()).toList(),
        'tutorNotes': tutorNotes,
        'nextTarget': nextTarget,
      };

  factory ReportCardModel.fromMap(Map<String, dynamic> map, {String? docId}) {
    final rawComps = map['competencies'];
    List<CompetencyScore> parsed = [];
    if (rawComps is List) {
      parsed = rawComps
          .whereType<Map>()
          .map((m) => CompetencyScore.fromMap(Map<String, dynamic>.from(m)))
          .toList();
    }

    return ReportCardModel(
      id: docId ?? map['id']?.toString(),
      documentNumber: map['documentNumber']?.toString() ?? 'ROA/KEEN/202608/0001',
      issueDate: map['issueDate']?.toString() ?? '',
      studentName: map['studentName']?.toString() ?? '',
      parentName: map['parentName']?.toString() ?? '',
      programTier: map['programTier']?.toString() ?? 'GROW',
      batchName: map['batchName']?.toString() ?? 'BATCH 1',
      cefrLevel: map['cefrLevel']?.toString() ?? 'A1',
      attendanceAttended: (map['attendanceAttended'] as num?)?.toInt() ?? 12,
      attendanceTotal: (map['attendanceTotal'] as num?)?.toInt() ?? 12,
      competencies: parsed,
      tutorNotes: map['tutorNotes']?.toString() ?? '',
      nextTarget: map['nextTarget']?.toString() ?? '',
    );
  }
}
