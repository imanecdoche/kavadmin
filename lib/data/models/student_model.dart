import 'package:cloud_firestore/cloud_firestore.dart';

class StudentModel {
  final String id;
  final String name;
  final String parentName;
  final String phone;
  final String programTier; // 'GROW', 'LITE', 'INTENSIVE'
  final String batchName;   // 'BATCH 1', 'BATCH 2'
  final String cefrLevel;   // 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'
  final String sessionSlot; // '09:00', '13:00', '15:00'
  final String startDate;   // 'YYYY-MM-DD'
  final bool isActive;

  StudentModel({
    required this.id,
    required this.name,
    required this.parentName,
    this.phone = '',
    this.programTier = 'GROW',
    this.batchName = 'BATCH 1',
    this.cefrLevel = 'A1',
    this.sessionSlot = '15:00',
    required this.startDate,
    this.isActive = true,
  });

  // Compatibility aliases for studio modules
  String get program => 'Paket $programTier';
  String get level => cefrLevel;
  int get sessionsPerMonth => 4;
  int get durationMonths => 3;
  int get totalSessions => 12;

  factory StudentModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    return StudentModel(
      id: doc.id,
      name: data['name'] ?? '',
      parentName: data['parentName'] ?? '',
      phone: data['phone'] ?? '',
      programTier: data['programTier'] ?? 'GROW',
      batchName: data['batchName'] ?? 'BATCH 1',
      cefrLevel: data['cefrLevel'] ?? 'A1',
      sessionSlot: data['sessionSlot'] ?? '15:00',
      startDate: data['startDate'] ?? DateTime.now().toIso8601String().split('T')[0],
      isActive: data['isActive'] ?? true,
    );
  }

  factory StudentModel.fromMap(Map<String, dynamic> data, {String? docId}) {
    return StudentModel(
      id: docId ?? data['id'] ?? '',
      name: data['name'] ?? '',
      parentName: data['parentName'] ?? '',
      phone: data['phone'] ?? '',
      programTier: data['programTier'] ?? 'GROW',
      batchName: data['batchName'] ?? 'BATCH 1',
      cefrLevel: data['cefrLevel'] ?? 'A1',
      sessionSlot: data['sessionSlot'] ?? '15:00',
      startDate: data['startDate'] ?? DateTime.now().toIso8601String().split('T')[0],
      isActive: data['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'parentName': parentName,
      'phone': phone,
      'programTier': programTier,
      'batchName': batchName,
      'cefrLevel': cefrLevel,
      'sessionSlot': sessionSlot,
      'startDate': startDate,
      'isActive': isActive,
      'updatedAt': FieldValue.serverTimestamp(),
    };
  }

  StudentModel copyWith({
    String? id,
    String? name,
    String? parentName,
    String? phone,
    String? programTier,
    String? batchName,
    String? cefrLevel,
    String? sessionSlot,
    String? startDate,
    bool? isActive,
  }) {
    return StudentModel(
      id: id ?? this.id,
      name: name ?? this.name,
      parentName: parentName ?? this.parentName,
      phone: phone ?? this.phone,
      programTier: programTier ?? this.programTier,
      batchName: batchName ?? this.batchName,
      cefrLevel: cefrLevel ?? this.cefrLevel,
      sessionSlot: sessionSlot ?? this.sessionSlot,
      startDate: startDate ?? this.startDate,
      isActive: isActive ?? this.isActive,
    );
  }
}
