import '../../data/models/roadmap_session_model.dart';
import '../utils/session_time_evaluator.dart';

class CefrPresets {
  CefrPresets._();

  static const List<Map<String, String>> a1Preset = [
    {
      'title': 'Pengenalan Pondasi dan Struktur Kalimat Dasar',
      'description': 'Memperkenalkan struktur dasar kalimat utama (Subject-Verb-Object), perbedaan helper BE (am/is/are) dan DO, kalimat nominal dasar serta penguasaan subjek dan kata ganti (Subject Pronouns).'
    },
    {
      'title': 'Helper DO/DOES dan Simple Present Tense',
      'description': 'Pembelajaran mendalam aturan penggunaan helper DO dan DOES, penyesuaian akhiran kata kerja orang ketiga tunggal (-s/-es), dan penyusunan kalimat rutinitas sehari-hari.'
    },
    {
      'title': 'Formulasi Kalimat (Positif, Negatif, dan Tanya)',
      'description': 'Memahami logika penyusunan 3 bentuk variasi kalimat (Positive, Negative, Interrogative), penggunaan jawaban singkat (Short Answer), serta analisis kesalahan struktur dasar.'
    },
    {
      'title': 'Evaluasi Periodik 1 & Praktik Dialog Fondasi',
      'description': 'Mengulang dan menguji integrasi materi Sesi 1–3 melalui latihan dialog singkat, identifikasi kendala tata bahasa dasar, serta pengenalan topik periode berikutnya.'
    },
    {
      'title': 'Kata Tanya 5W+1H dan Open-Ended Questions',
      'description': 'Mempelajari pola pembuatan pertanyaan terbuka menggunakan What, Where, When, Who, Why, dan How yang dikombinasikan dengan helper DO/DOES dan BE.'
    },
    {
      'title': 'Kata Sandang, Penunjuk, dan Kepemilikan (Articles & Possessives)',
      'description': 'Penggunaan articles (a/an/the), demonstrative pronouns (this, that, these, those), serta possessive adjectives (my, your, his, her, our, their) dalam mendeskripsikan benda di sekitar.'
    },
    {
      'title': 'Preposisi Waktu & Tempat serta Penunjuk Waktu (Time & Location)',
      'description': 'Penggunaan preposisi dasar (in, on, at), cara membaca dan menyatakan jam/waktu, hari, bulan, serta lokasi sederhana dalam konteks aktivitas harian.'
    },
    {
      'title': 'Evaluasi Periodik 2 & Roleplay Situasional',
      'description': 'Menggabungkan materi pembentukan pertanyaan dan preposisi dalam skenario roleplay kontekstual (memesan makanan, menanyakan arah, menceritakan jadwal).'
    },
    {
      'title': 'Kata Sifat, Perasaan, dan Deskripsi Karakter (Adjectives)',
      'description': 'Memperkaya kosakata kata sifat (fisik, emosi, kepribadian) dan penempatannya sebelum kata benda atau setelah to be dalam kalimat deskriptif.'
    },
    {
      'title': 'Modal Auxiliary Sederhana (Can / Could / May / Must / Should)',
      'description': 'Mempelajari kata kerja bantu modal untuk mengungkapkan kemampuan (ability), izin (permission), keharusan (obligation), dan saran sopan.'
    },
    {
      'title': 'Pengenalan Kalimat Lampau (Simple Past Tense Dasar)',
      'description': 'Pola pembentukan kalimat masa lampau dengan Regular & Irregular Verbs dasar, penanda waktu (yesterday, last week, ago), serta helper DID.'
    },
    {
      'title': 'Evaluasi Akhir 1-Batch & Uji Kelulusan Kompetensi',
      'description': 'Review menyeluruh seluruh materi Sesi 1–11, ujian lisan terpadu, evaluasi matriks kemampuan mandiri, dan pengarahan rencana belajar batch berikutnya.'
    },
  ];

  static List<RoadmapSessionModel> generateSessions({
    String cefrLevel = 'A1',
    int totalCount = 12,
    int startFromSession = 1,
    required String startDateStr,
    String slotTime = '15:00',
  }) {
    final result = <RoadmapSessionModel>[];
    DateTime? baseDate;
    try {
      baseDate = DateTime.parse(startDateStr);
    } catch (_) {
      baseDate = DateTime.now();
    }

    final startIndex = startFromSession > 0 ? startFromSession - 1 : 0;

    for (int i = 0; i < totalCount; i++) {
      final currentSessionNum = startFromSession + i;
      final presetIdx = startIndex + i;

      Map<String, String> topic;
      if (presetIdx < a1Preset.length) {
        topic = a1Preset[presetIdx];
      } else {
        topic = {
          'title': 'Pendalaman Materi & Praktik Terapan (Sesi $currentSessionNum)',
          'description': 'Sesi penguatan konsep kontekstual, studi kasus lisan, dan evaluasi terarah lanjutan untuk jenjang $cefrLevel.'
        };
      }

      // Hitung tanggal mingguan (+7 hari per sesi)
      final sessionDate = baseDate.add(Duration(days: i * 7));
      final sessionDateStr = "${sessionDate.year}-${sessionDate.month.toString().padLeft(2, '0')}-${sessionDate.day.toString().padLeft(2, '0')}";

      // Evaluasi status dinamis
      final eval = SessionTimeEvaluator.evaluate(
        dateStr: sessionDateStr,
        timeStr: slotTime,
      );

      final isCompleted = eval['isCompleted'] as bool;
      result.add(
        RoadmapSessionModel(
          sessionNumber: currentSessionNum,
          level: cefrLevel.toUpperCase(),
          title: topic['title']!,
          description: topic['description']!,
          date: sessionDateStr,
          time: slotTime,
          status: eval['status'] as String,
          isCompleted: isCompleted,
          mastery: isCompleted ? 85 : 0,
        ),
      );
    }

    return result;
  }

  // Backward compatibility method
  static List<RoadmapSessionModel> getPresetForLevel(String level) {
    return generateSessions(
      cefrLevel: level,
      totalCount: 12,
      startFromSession: 1,
      startDateStr: DateTime.now().toIso8601String().split('T')[0],
      slotTime: '15:00',
    );
  }
}
