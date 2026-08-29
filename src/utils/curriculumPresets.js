/**
 * 📚 Curriculum Presets Library for Kavio Edu
 * Pre-configured academic roadmap templates for SEED, GROW, BOOST, and MASTER tiers.
 */

export const CURRICULUM_PRESETS = {
  SEED: {
    tier: 'SEED',
    label: 'SEED — Foundation & Basic Communication',
    level: 'A1 - Beginner',
    targetDuration: '3 Bulan (9 Sesi)',
    description: 'Fokus pada fondasi tata bahasa dasar, kosakata harian esensial, dan keberanian berbicara kalimat sederhana.',
    milestones: [
      {
        id: 'seed-m1',
        milestoneNumber: 1,
        title: 'Alphabet, Pronunciation & Basic Greetings',
        level: 'A1',
        targetSessions: 3,
        description: 'Mengenal fonetik dasar alfabet bahasa Inggris, cara memperkenalkan diri, dan sapaan formal/informal.',
        materials: 'Phonetic sounds chart, self-introduction formulas, formal & informal greetings vocabulary.',
        status: 'IN_PROGRESS',
        checklists: [
          { id: 'c1-1', text: 'Melafalkan alfabet dan fonetik vokal dengan artikulasi yang tepat', completed: true },
          { id: 'c1-2', text: 'Mempraktikkan percakapan perkenalan diri 2 menit tanpa ragu', completed: false },
          { id: 'c1-3', text: 'Menguasai 20+ kosakata sapaan dan respons situasional', completed: false }
        ],
        linkedModuleId: null,
        evaluationNotes: ''
      },
      {
        id: 'seed-m2',
        milestoneNumber: 2,
        title: 'Auxiliary Verb BE & Subject-Verb Agreement',
        level: 'A1',
        targetSessions: 3,
        description: 'Pemahaman tuntas penggunaan to be (am/is/are) dalam kalimat positif, negatif, dan interogatif.',
        materials: 'To be nominal sentence structures, subject pronouns, demonstrative pronouns (this/that/these/those).',
        status: 'LOCKED',
        checklists: [
          { id: 'c2-1', text: 'Menyusun kalimat nominal menggunakan am/is/are dengan benar', completed: false },
          { id: 'c2-2', text: 'Membentuk kalimat tanya dan jawaban pendek (Yes/No questions)', completed: false },
          { id: 'c2-3', text: 'Menyelesaikan 15 soal latihan Subject-Verb Agreement', completed: false }
        ],
        linkedModuleId: null,
        evaluationNotes: ''
      },
      {
        id: 'seed-m3',
        milestoneNumber: 3,
        title: 'Simple Present Tense & Daily Routine Speaking',
        level: 'A1',
        targetSessions: 3,
        description: 'Menyusun kalimat verbal rutinitas harian dengan imbuhan kata kerja -s/-es dan adverbs of frequency.',
        materials: 'Simple present tense formulas, action verbs, frequency adverbs (always, usually, sometimes, never).',
        status: 'LOCKED',
        checklists: [
          { id: 'c3-1', text: 'Menceritakan jadwal rutinitas dari pagi hingga malam secara lisan', completed: false },
          { id: 'c3-2', text: 'Menerapkan aturan -s/-es pada subjek orang ketiga tunggal (He/She/It)', completed: false },
          { id: 'c3-3', text: 'Evaluasi lisan sesi perpisahan modul SEED', completed: false }
        ],
        linkedModuleId: null,
        evaluationNotes: ''
      }
    ]
  },

  GROW: {
    tier: 'GROW',
    label: 'GROW — Elementary Grammar & Active Fluency',
    level: 'A2 - Elementary',
    targetDuration: '3 Bulan (12 Sesi)',
    description: 'Pengembangan tata bahasa waktu (Past, Present Continuous, Future) dan percakapan kontekstual dua arah.',
    milestones: [
      {
        id: 'grow-m1',
        milestoneNumber: 1,
        title: 'Present Continuous & Dynamic vs Stative Verbs',
        level: 'A2',
        targetSessions: 3,
        description: 'Membedakan aktivitas yang sedang terjadi dengan kebiasaan serta mengidentifikasi kata kerja statif.',
        materials: 'Present continuous formulas (be + V-ing), stative verbs list (love, understand, know, want).',
        status: 'IN_PROGRESS',
        checklists: [
          { id: 'grow-c1-1', text: 'Menjelaskan situasi yang sedang berlangsung di sekitar secara spontan', completed: true },
          { id: 'grow-c1-2', text: 'Menghindari penggunaan -ing pada kata kerja statif', completed: false },
          { id: 'grow-c1-3', text: 'Latihan roleplay mendeskripsikan gambar situasi dinamis', completed: false }
        ],
        linkedModuleId: null,
        evaluationNotes: ''
      },
      {
        id: 'grow-m2',
        milestoneNumber: 2,
        title: 'Simple Past Tense: Regular & Irregular Mastery',
        level: 'A2',
        targetSessions: 3,
        description: 'Menceritakan pengalaman masa lalu menggunakan kata kerja bentuk lampau (V2) dengan intonasi yang alami.',
        materials: 'Regular past tense pronunciation (-ed /t/, /d/, /id/), 50 common irregular verbs list, time markers.',
        status: 'LOCKED',
        checklists: [
          { id: 'grow-c2-1', text: 'Menghafal dan mengaplikasikan 30 irregular verbs populer dalam kalimat', completed: false },
          { id: 'grow-c2-2', text: 'Menceritakan pengalaman liburan atau kejadian kemarin secara runut', completed: false },
          { id: 'grow-c2-3', text: 'Menyusun mini paragraf recount teks 5-7 kalimat', completed: false }
        ],
        linkedModuleId: null,
        evaluationNotes: ''
      },
      {
        id: 'grow-m3',
        milestoneNumber: 3,
        title: 'Future Plans: Will vs Be Going To & Modals',
        level: 'A2',
        targetSessions: 3,
        description: 'Menyatakan rencana masa depan, janji spontan, prediksi, serta penggunaan modal verbs (can, must, should).',
        materials: 'Will vs Be Going To contrast charts, modal auxiliary verbs for ability & advice.',
        status: 'LOCKED',
        checklists: [
          { id: 'grow-c3-1', text: 'Membedakan rencana yang sudah terjadwal vs keputusan spontan', completed: false },
          { id: 'grow-c3-2', text: 'Memberikan saran kepada teman menggunakan should/ought to', completed: false },
          { id: 'grow-c3-3', text: 'Simulasi percakapan rencana akhir pekan bersama tutor', completed: false }
        ],
        linkedModuleId: null,
        evaluationNotes: ''
      },
      {
        id: 'grow-m4',
        milestoneNumber: 4,
        title: 'Situational Roleplay & Mid-Program Evaluation',
        level: 'A2',
        targetSessions: 3,
        description: 'Integrasi seluruh tenses A2 dalam simulasi percakapan nyata (restoran, belanja, bertanya arah jalan).',
        materials: 'Real-world dialogues, ordering food scripts, giving directions maps & vocab.',
        status: 'LOCKED',
        checklists: [
          { id: 'grow-c4-1', text: 'Roleplay pemesanan makanan dan transaksi perbelanjaan', completed: false },
          { id: 'grow-c4-2', text: 'Percakapan navigasi dan penunjuk arah secara akurat', completed: false },
          { id: 'grow-c4-3', text: 'Evaluasi performa lisan dan penyusunan catatan kemajuan', completed: false }
        ],
        linkedModuleId: null,
        evaluationNotes: ''
      }
    ]
  },

  BOOST: {
    tier: 'BOOST',
    label: 'BOOST — Intermediate Competency & Fluency Accelerator',
    level: 'B1 - Intermediate',
    targetDuration: '3 Bulan (24 Sesi)',
    description: 'Peningkatan kemampuan analisis teks, Present Perfect, Conditional Sentences, dan diskusi bertema opini.',
    milestones: [
      {
        id: 'boost-m1',
        milestoneNumber: 1,
        title: 'Present Perfect Tense & Life Experiences',
        level: 'B1',
        targetSessions: 6,
        description: 'Penguasaan Have/Has + V3, time signals (since, for, ever, never, already, yet) untuk pengalaman hidup.',
        materials: 'Present Perfect vs Simple Past matrix, V3 past participles, conversation triggers.',
        status: 'IN_PROGRESS',
        checklists: [
          { id: 'boost-c1-1', text: 'Membedakan Simple Past vs Present Perfect dalam konteks percakapan', completed: true },
          { id: 'boost-c1-2', text: 'Menyusun dialog wawancara pengalaman kerja atau prestasi', completed: false },
          { id: 'boost-c1-3', text: 'Kuis tata bahasa Present Perfect skor minimal 85%', completed: false }
        ],
        linkedModuleId: null,
        evaluationNotes: ''
      },
      {
        id: 'boost-m2',
        milestoneNumber: 2,
        title: 'Conditional Sentences (Types 0, 1 & 2)',
        level: 'B1',
        targetSessions: 6,
        description: 'Mengungkapkan fakta umum, kemungkinan masa depan, dan pengandaian imajinatif (if clauses).',
        materials: 'Zero, First & Second Conditional syntax formulas, hypothetical speaking prompts.',
        status: 'LOCKED',
        checklists: [
          { id: 'boost-c2-1', text: 'Menjelaskan sebab-akibat ilmiah dengan Zero Conditional', completed: false },
          { id: 'boost-c2-2', text: 'Membuat janji bersyarat dengan First Conditional', completed: false },
          { id: 'boost-c2-3', text: 'Diskusi pengandaian "If I ruled the world..." dengan Second Conditional', completed: false }
        ],
        linkedModuleId: null,
        evaluationNotes: ''
      },
      {
        id: 'boost-m3',
        milestoneNumber: 3,
        title: 'Passive Voice & Technical Sentence Structure',
        level: 'B1',
        targetSessions: 6,
        description: 'Mengubah kalimat aktif menjadi pasif di berbagai tenses untuk keperluan penulisan formal dan berita.',
        materials: 'Passive voice conversion table (be + V3), agent "by", formal journalistic texts.',
        status: 'LOCKED',
        checklists: [
          { id: 'boost-c3-1', text: 'Mengubah 15 kalimat aktif menjadi bentuk pasif dengan tepat', completed: false },
          { id: 'boost-c3-2', text: 'Membaca dan menganalisis struktur artikel berita pendek', completed: false },
          { id: 'boost-c3-3', text: 'Menulis deskripsi proses manufaktur/alam dalam bentuk pasif', completed: false }
        ],
        linkedModuleId: null,
        evaluationNotes: ''
      },
      {
        id: 'boost-m4',
        milestoneNumber: 4,
        title: 'Thematic Debate & Academic Essay Drafting',
        level: 'B1',
        targetSessions: 6,
        description: 'Membangun argumen logis dalam debat terarah dan menyusun esai terstruktur 3 paragraf.',
        materials: 'Connectors & transitional words, opinion debate topics, paragraph development guides.',
        status: 'LOCKED',
        checklists: [
          { id: 'boost-c4-1', text: 'Menyampaikan argumen pro/kontra dengan konjungsi transisi yang tepat', completed: false },
          { id: 'boost-c4-2', text: 'Menyusun draf esai opini dengan Topic Sentence yang kuat', completed: false },
          { id: 'boost-c4-3', text: 'Ujian komprehensif lisan & tulisan tingkat Intermediate', completed: false }
        ],
        linkedModuleId: null,
        evaluationNotes: ''
      }
    ]
  },

  MASTER: {
    tier: 'MASTER',
    label: 'MASTER — Advanced Academic Mentoring & Professional Communication',
    level: 'B2 - Upper Intermediate / Advanced',
    targetDuration: '3 Bulan (24 Sesi / 90 Menit)',
    description: 'Program persiapan TOEFL/IELTS, presentasi profesional, analisis wacana kritis, dan retorika bahasa tingkat tinggi.',
    milestones: [
      {
        id: 'master-m1',
        milestoneNumber: 1,
        title: 'Complex Sentences, Relative Clauses & Inversion',
        level: 'B2',
        targetSessions: 6,
        description: 'Membangun kalimat bertingkat dengan Relative Pronouns (who, which, whose, whom) dan variasi kalimat inversi.',
        materials: 'Defining vs Non-defining relative clauses, negative inversion patterns, academic syntax.',
        status: 'IN_PROGRESS',
        checklists: [
          { id: 'master-c1-1', text: 'Menggabungkan 2 klausa kompleks dengan Relative Clauses secara presisi', completed: true },
          { id: 'master-c1-2', text: 'Menggunakan pola inversi untuk penekanan makna dalam tulisan formal', completed: false },
          { id: 'master-c1-3', text: 'Analisis struktur kalimat pada jurnal akademik berbahasa Inggris', completed: false }
        ],
        linkedModuleId: null,
        evaluationNotes: ''
      },
      {
        id: 'master-m2',
        milestoneNumber: 2,
        title: 'Professional Presentation & Public Speaking Rhetoric',
        level: 'B2',
        targetSessions: 6,
        description: 'Teknik presentasi bisnis/ilmiah, bahasa visualisasi data, transisi slide yang mulus, dan penanganan sesi Q&A.',
        materials: 'Presentation signposting language, data commentary vocabs, pitch delivery frameworks.',
        status: 'LOCKED',
        checklists: [
          { id: 'master-c2-1', text: 'Menyampaikan presentasi 10 menit dengan slide visual berbahasa Inggris', completed: false },
          { id: 'master-c2-2', text: 'Menjelaskan grafik dan diagram data menggunakan diksi analitis yang tepat', completed: false },
          { id: 'master-c2-3', text: 'Menjawab pertanyaan sanggahan audiens secara tanggap dan sopan', completed: false }
        ],
        linkedModuleId: null,
        evaluationNotes: ''
      },
      {
        id: 'master-m3',
        milestoneNumber: 3,
        title: 'Standardized Test Mastery (TOEFL/IELTS Prep)',
        level: 'B2',
        targetSessions: 6,
        description: 'Strategi pengerjaan soal Reading, Listening, Speaking, and Writing terstandarisasi internasional.',
        materials: 'Skimming/Scanning speed drills, listening paraphrase recognition, IELTS Task 2 templates.',
        status: 'LOCKED',
        checklists: [
          { id: 'master-c3-1', text: 'Simulasi tes TOEFL/IELTS Reading & Listening', completed: false },
          { id: 'master-c3-2', text: 'Menulis esai argumentatif akademik 250 kata dalam 40 menit', completed: false },
          { id: 'master-c3-3', text: 'Simulasi speaking interview one-on-one bersama instruktur', completed: false }
        ],
        linkedModuleId: null,
        evaluationNotes: ''
      },
      {
        id: 'master-m4',
        milestoneNumber: 4,
        title: 'Capstone Defense & Final Academic Portfolio',
        level: 'B2',
        targetSessions: 6,
        description: 'Penyusunan portofolio akademik menyeluruh, presentasi akhir (Capstone project), dan sertifikasi kelulusan.',
        materials: 'Academic portfolio guidelines, capstone project rubrics, graduation evaluation criteria.',
        status: 'LOCKED',
        checklists: [
          { id: 'master-c4-1', text: 'Menyelesaikan portofolio tulisan esai dan materi modul lengkap', completed: false },
          { id: 'master-c4-2', text: 'Sidang presentasi capstone di hadapan Academic Director', completed: false },
          { id: 'master-c4-3', text: 'Penerbitan sertifikat kelulusan dan laporan evaluasi akhir resmi', completed: false }
        ],
        linkedModuleId: null,
        evaluationNotes: ''
      }
    ]
  }
}
