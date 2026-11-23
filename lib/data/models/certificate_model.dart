class CertificateModel {
  final String documentId;
  final String issueDate;
  final String studentName;
  final String programName;
  final String batchName;
  final String cefrLevel;
  final int totalSessions;
  final String predicate;
  final String verificationHash;
  final String signLocation;
  final String directorName;
  final String directorTitle;
  final String? id;

  CertificateModel({
    required this.documentId,
    required this.issueDate,
    required this.studentName,
    required this.programName,
    required this.batchName,
    required this.cefrLevel,
    this.totalSessions = 12,
    this.predicate = 'SANGAT BAIK (EXCELLENT)',
    required this.verificationHash,
    this.signLocation = 'Pandeglang',
    this.directorName = 'Fatih Farhat Asshidiq',
    this.directorTitle = 'Founder & Academic Director',
    this.id,
  });

  // Compatibility aliases
  String get certificateNumber => documentId;
  String get program => programName;
  String get levelCompleted => cefrLevel;
  String get grade => predicate;
  String get signatoryName => directorName;
  String get signatoryRole => directorTitle;

  Map<String, dynamic> toMap() => {
        'documentId': documentId,
        'issueDate': issueDate,
        'studentName': studentName,
        'programName': programName,
        'batchName': batchName,
        'cefrLevel': cefrLevel,
        'totalSessions': totalSessions,
        'predicate': predicate,
        'verificationHash': verificationHash,
        'signLocation': signLocation,
        'directorName': directorName,
        'directorTitle': directorTitle,
      };

  factory CertificateModel.fromMap(Map<String, dynamic> map, {String? docId}) {
    return CertificateModel(
      id: docId ?? map['id']?.toString(),
      documentId: map['documentId']?.toString() ?? map['certificateNumber']?.toString() ?? 'CRT/KEEN/202608/0001',
      issueDate: map['issueDate']?.toString() ?? '',
      studentName: map['studentName']?.toString() ?? '',
      programName: map['programName']?.toString() ?? map['program']?.toString() ?? 'Paket GROW',
      batchName: map['batchName']?.toString() ?? 'BATCH 1',
      cefrLevel: map['cefrLevel']?.toString() ?? map['levelCompleted']?.toString() ?? 'A1',
      totalSessions: (map['totalSessions'] as num?)?.toInt() ?? 12,
      predicate: map['predicate']?.toString() ?? map['grade']?.toString() ?? 'SANGAT BAIK (EXCELLENT)',
      verificationHash: map['verificationHash']?.toString() ?? 'VERIF-KEEN-2026-CERT',
      signLocation: map['signLocation']?.toString() ?? 'Pandeglang',
      directorName: map['directorName']?.toString() ?? map['signatoryName']?.toString() ?? 'Fatih Farhat Asshidiq',
      directorTitle: map['directorTitle']?.toString() ?? map['signatoryRole']?.toString() ?? 'Founder & Academic Director',
    );
  }
}
