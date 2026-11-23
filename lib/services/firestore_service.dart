import 'package:cloud_firestore/cloud_firestore.dart';
import '../data/models/student_model.dart';
import '../data/models/roadmap_session_model.dart';
import '../data/models/report_card_model.dart';
import '../data/models/certificate_model.dart';

/// 🔥 Central Firestore Service for Kavadmin
class FirestoreService {
  final FirebaseFirestore _firestore;

  FirestoreService({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  // Collections
  CollectionReference<Map<String, dynamic>> get _studentsCol =>
      _firestore.collection('students');
  CollectionReference<Map<String, dynamic>> get _roadmapsCol =>
      _firestore.collection('roadmaps');
  CollectionReference<Map<String, dynamic>> get _reportsCol =>
      _firestore.collection('reports');
  CollectionReference<Map<String, dynamic>> get _certificatesCol =>
      _firestore.collection('certificates');
  CollectionReference<Map<String, dynamic>> get _authCol =>
      _firestore.collection('system_auth');

  // ===================== STUDENTS =====================
  Stream<List<StudentModel>> streamStudents() {
    return _studentsCol.snapshots().map((snapshot) {
      return snapshot.docs
          .map((doc) => StudentModel.fromMap(doc.data(), docId: doc.id))
          .toList();
    });
  }

  Future<void> saveStudent(StudentModel student) async {
    final docId = student.id.isNotEmpty
        ? student.id
        : 'std_${DateTime.now().millisecondsSinceEpoch}';
    final data = student.copyWith(id: docId).toMap();
    data['updatedAt'] = DateTime.now().toIso8601String();
    if (data['createdAt'] == null) {
      data['createdAt'] = DateTime.now().toIso8601String();
    }
    await _studentsCol.doc(docId).set(data, SetOptions(merge: true));
  }

  Future<void> deleteStudent(String studentId) async {
    await _studentsCol.doc(studentId).delete();
  }

  // ===================== ROADMAPS =====================
  Stream<List<StudentRoadmapModel>> streamRoadmaps() {
    return _roadmapsCol.snapshots().map((snapshot) {
      return snapshot.docs
          .map((doc) => StudentRoadmapModel.fromMap(doc.data(), docId: doc.id))
          .toList();
    });
  }

  Stream<StudentRoadmapModel?> streamRoadmapByStudent(String studentId) {
    return _roadmapsCol.doc(studentId).snapshots().map((doc) {
      if (!doc.exists || doc.data() == null) return null;
      return StudentRoadmapModel.fromMap(doc.data()!, docId: doc.id);
    });
  }

  Future<void> saveRoadmap(StudentRoadmapModel roadmap) async {
    final docId = roadmap.id.isNotEmpty ? roadmap.id : roadmap.studentId;
    final data = roadmap.toMap();
    data['updatedAt'] = DateTime.now().toIso8601String();
    await _roadmapsCol.doc(docId).set(data, SetOptions(merge: true));
  }

  Future<void> deleteRoadmap(String docId) async {
    await _roadmapsCol.doc(docId).delete();
  }

  // ===================== REPORTS =====================
  Stream<List<ReportCardModel>> streamReports() {
    return _reportsCol.snapshots().map((snapshot) {
      return snapshot.docs
          .map((doc) => ReportCardModel.fromMap(doc.data(), docId: doc.id))
          .toList();
    });
  }

  Future<void> saveReport(ReportCardModel report) async {
    final docId = (report.id != null && report.id!.isNotEmpty)
        ? report.id!
        : 'rep_${DateTime.now().millisecondsSinceEpoch}';
    final data = report.toMap();
    data['updatedAt'] = DateTime.now().toIso8601String();
    await _reportsCol.doc(docId).set(data, SetOptions(merge: true));
  }

  Future<void> deleteReport(String reportId) async {
    await _reportsCol.doc(reportId).delete();
  }

  // ===================== CERTIFICATES =====================
  Stream<List<CertificateModel>> streamCertificates() {
    return _certificatesCol.snapshots().map((snapshot) {
      return snapshot.docs
          .map((doc) => CertificateModel.fromMap(doc.data(), docId: doc.id))
          .toList();
    });
  }

  Future<void> saveCertificate(CertificateModel cert) async {
    final docId = (cert.id != null && cert.id!.isNotEmpty)
        ? cert.id!
        : 'cert_${DateTime.now().millisecondsSinceEpoch}';
    await _certificatesCol.doc(docId).set(cert.toMap(), SetOptions(merge: true));
  }

  Future<void> deleteCertificate(String certId) async {
    await _certificatesCol.doc(certId).delete();
  }
}
