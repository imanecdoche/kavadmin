import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/student_model.dart';
import '../models/roadmap_session_model.dart';
import '../models/report_card_model.dart';
import '../models/certificate_model.dart';

final studentRepositoryProvider = Provider<StudentRepository>((ref) {
  return StudentRepository(FirebaseFirestore.instance);
});

final studentsStreamProvider = StreamProvider<List<StudentModel>>((ref) {
  final repo = ref.watch(studentRepositoryProvider);
  return repo.getStudentsStream();
});

class StudentRepository {
  final FirebaseFirestore _firestore;
  static const String _collection = 'students';

  StudentRepository(this._firestore);

  Stream<List<StudentModel>> getStudentsStream() {
    return _firestore
        .collection(_collection)
        .orderBy('name', descending: false)
        .snapshots()
        .map((snapshot) =>
            snapshot.docs.map((doc) => StudentModel.fromFirestore(doc)).toList());
  }

  Future<void> addStudent(StudentModel student) async {
    await _firestore.collection(_collection).add(student.toMap());
  }

  Future<void> updateStudent(String id, StudentModel student) async {
    await _firestore.collection(_collection).doc(id).update(student.toMap());
  }

  Future<void> deleteStudent(String id) async {
    await _firestore.collection(_collection).doc(id).delete();
  }

  // Helper alias for studio compatibility
  Future<void> saveStudent(StudentModel student) async {
    if (student.id.isEmpty) {
      await addStudent(student);
    } else {
      await updateStudent(student.id, student);
    }
  }

  Future<void> saveRoadmap(StudentRoadmapModel roadmap) async {
    final docId = roadmap.id.isNotEmpty ? roadmap.id : roadmap.studentId;
    await _firestore.collection('roadmaps').doc(docId).set(roadmap.toMap(), SetOptions(merge: true));
  }

  Future<void> saveReport(ReportCardModel report) async {
    final docId = (report.id != null && report.id!.isNotEmpty) ? report.id! : 'rep_${DateTime.now().millisecondsSinceEpoch}';
    await _firestore.collection('reports').doc(docId).set(report.toMap(), SetOptions(merge: true));
  }

  Future<void> saveCertificate(CertificateModel cert) async {
    final docId = (cert.id != null && cert.id!.isNotEmpty) ? cert.id! : 'cert_${DateTime.now().millisecondsSinceEpoch}';
    await _firestore.collection('certificates').doc(docId).set(cert.toMap(), SetOptions(merge: true));
  }
}
