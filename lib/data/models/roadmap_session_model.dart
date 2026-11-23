class RoadmapSessionModel {
  final int sessionNumber;
  final String level;
  final String title;
  final String description;
  final String date;        // 'YYYY-MM-DD'
  final String time;        // '09:00', '13:00', '15:00'
  final int durationMinutes;// Default 90
  final String status;      // 'SELESAI', 'SEDANG BERJALAN', 'BELUM MULAI'
  final bool isCompleted;
  final int mastery;        // 0 - 100

  RoadmapSessionModel({
    required this.sessionNumber,
    required this.level,
    required this.title,
    required this.description,
    required this.date,
    this.time = '15:00',
    this.durationMinutes = 90,
    required this.status,
    required this.isCompleted,
    this.mastery = 0,
  });

  RoadmapSessionModel copyWith({
    int? sessionNumber,
    String? level,
    String? title,
    String? description,
    String? date,
    String? time,
    int? durationMinutes,
    String? status,
    bool? isCompleted,
    int? mastery,
  }) {
    return RoadmapSessionModel(
      sessionNumber: sessionNumber ?? this.sessionNumber,
      level: level ?? this.level,
      title: title ?? this.title,
      description: description ?? this.description,
      date: date ?? this.date,
      time: time ?? this.time,
      durationMinutes: durationMinutes ?? this.durationMinutes,
      status: status ?? this.status,
      isCompleted: isCompleted ?? this.isCompleted,
      mastery: mastery ?? this.mastery,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'sessionNumber': sessionNumber,
      'level': level,
      'title': title,
      'description': description,
      'date': date,
      'time': time,
      'durationMinutes': durationMinutes,
      'status': status,
      'isCompleted': isCompleted,
      'mastery': mastery,
    };
  }

  factory RoadmapSessionModel.fromMap(Map<String, dynamic> map) {
    final rawStatus = map['status']?.toString() ?? 'BELUM MULAI';
    final rawCompleted = map['isCompleted'] == true || rawStatus.toUpperCase() == 'SELESAI';
    return RoadmapSessionModel(
      sessionNumber: (map['sessionNumber'] as num?)?.toInt() ?? 1,
      level: map['level']?.toString() ?? 'A1',
      title: map['title']?.toString() ?? '',
      description: map['description']?.toString() ?? '',
      date: map['date']?.toString() ?? '',
      time: map['time']?.toString() ?? '15:00',
      durationMinutes: (map['durationMinutes'] as num?)?.toInt() ?? 90,
      status: rawStatus,
      isCompleted: rawCompleted,
      mastery: (map['mastery'] as num?)?.toInt() ?? (rawCompleted ? 100 : 0),
    );
  }
}

class StudentRoadmapModel {
  final String id;
  final String studentId;
  final String studentName;
  final String program;
  final String targetLevel;
  final int sessionsPerMonth;
  final int durationMonths;
  final String paperSize;
  final List<RoadmapSessionModel> sessions;
  final String? createdAt;
  final String? updatedAt;

  const StudentRoadmapModel({
    required this.id,
    required this.studentId,
    required this.studentName,
    this.program = 'SEED (A1)',
    this.targetLevel = 'A1',
    this.sessionsPerMonth = 4,
    this.durationMonths = 3,
    this.paperSize = 'a4',
    this.sessions = const [],
    this.createdAt,
    this.updatedAt,
  });

  int get totalSessions => sessions.length;
  int get completedCount => sessions.where((s) => s.isCompleted || s.status.toUpperCase() == 'SELESAI').length;
  int get inProgressCount => sessions.where((s) => s.status.toUpperCase() == 'SEDANG BERJALAN' || s.status.toUpperCase() == 'IN_PROGRESS').length;
  int get progressPercentage => totalSessions > 0 ? ((completedCount / totalSessions) * 100).round().clamp(0, 100) : 0;

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'studentId': studentId,
      'studentName': studentName,
      'program': program,
      'targetLevel': targetLevel,
      'sessionsPerMonth': sessionsPerMonth,
      'durationMonths': durationMonths,
      'paperSize': paperSize,
      'sessions': sessions.map((s) => s.toMap()).toList(),
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }

  factory StudentRoadmapModel.fromMap(Map<String, dynamic> map, {String? docId}) {
    final rawSessions = map['sessions'];
    List<RoadmapSessionModel> parsedSessions = [];
    if (rawSessions is List) {
      parsedSessions = rawSessions
          .whereType<Map>()
          .map((m) => RoadmapSessionModel.fromMap(Map<String, dynamic>.from(m)))
          .toList();
    }

    return StudentRoadmapModel(
      id: docId ?? map['id']?.toString() ?? '',
      studentId: map['studentId']?.toString() ?? '',
      studentName: map['studentName']?.toString() ?? '',
      program: map['program']?.toString() ?? 'SEED (A1)',
      targetLevel: map['targetLevel']?.toString() ?? 'A1',
      sessionsPerMonth: (map['sessionsPerMonth'] as num?)?.toInt() ?? 4,
      durationMonths: (map['durationMonths'] as num?)?.toInt() ?? 3,
      paperSize: map['paperSize']?.toString() ?? 'a4',
      sessions: parsedSessions,
      createdAt: map['createdAt']?.toString(),
      updatedAt: map['updatedAt']?.toString(),
    );
  }
}
