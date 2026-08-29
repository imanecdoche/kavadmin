/**
 * 📚 Granular Curriculum Presets Library for Kavio Edu
 * Pre-configured 1-Batch session-by-session curriculum roadmaps (SEED, GROW, BOOST, MASTER).
 */

export const CEFR_A1_PRESET = [
  {
    sessionNumber: 1,
    level: "A1",
    title: "Pengenalan Pondasi dan Struktur Kalimat Dasar",
    description: "Memperkenalkan struktur dasar kalimat utama (Subject-Verb-Object), perbedaan helper BE (am/is/are) dan DO, kalimat nominal dasar, serta penguasaan subjek dan kata ganti (Subject Pronouns).",
    status: "SEDANG BERJALAN",
    isCompleted: false,
    date: ""
  },
  {
    sessionNumber: 2,
    level: "A1",
    title: "Helper DO/DOES dan Simple Present Tense",
    description: "Pembelajaran mendalam aturan penggunaan helper DO dan DOES, penyesuaian akhiran kata kerja orang ketiga tunggal (-s/-es), dan penyusunan kalimat rutinitas sehari-hari.",
    status: "BELUM MULAI",
    isCompleted: false,
    date: ""
  },
  {
    sessionNumber: 3,
    level: "A1",
    title: "Formulasi Kalimat (Positif, Negatif, dan Tanya)",
    description: "Memahami logika penyusunan 3 bentuk variasi kalimat (Positive, Negative, Interrogative), penggunaan jawaban singkat (Short Answers), serta analisis kesalahan struktur dasar.",
    status: "BELUM MULAI",
    isCompleted: false,
    date: ""
  },
  {
    sessionNumber: 4,
    level: "A1",
    title: "Evaluasi Periode 1 & Praktik Dialog Fondasi",
    description: "Mengulang dan menguji integrasi materi Sesi 1–3 melalui latihan dialog singkat, identifikasi kendala tata bahasa dasar, serta pengenalan topik periode berikutnya.",
    status: "BELUM MULAI",
    isCompleted: false,
    date: ""
  },
  {
    sessionNumber: 5,
    level: "A1",
    title: "Kata Tanya 5W+1H dan Open-Ended Questions",
    description: "Mempelajari pola pembuatan pertanyaan terbuka menggunakan What, Where, When, Who, Why, dan How yang dikombinasikan dengan helper DO/DOES dan BE.",
    status: "BELUM MULAI",
    isCompleted: false,
    date: ""
  },
  {
    sessionNumber: 6,
    level: "A1",
    title: "Kata Sandang, Penunjuk, dan Kepemilikan (Articles & Possessives)",
    description: "Penggunaan articles (a/an/the), demonstrative pronouns (this, that, these, those), serta possessive adjectives (my, your, his, her, our, their) dalam mendeskripsikan benda di sekitar.",
    status: "BELUM MULAI",
    isCompleted: false,
    date: ""
  },
  {
    sessionNumber: 7,
    level: "A1",
    title: "Preposisi Waktu & Tempat serta Penunjuk Waktu (Time & Location)",
    description: "Penggunaan preposisi dasar (in, on, at), cara membaca dan menyatakan jam/waktu, hari, bulan, serta lokasi sederhana dalam konteks aktivitas harian.",
    status: "BELUM MULAI",
    isCompleted: false,
    date: ""
  },
  {
    sessionNumber: 8,
    level: "A1",
    title: "Evaluasi Tengah Program & Simulasi Percakapan Harian",
    description: "Uji performa lisan perkenalan diri dan deskripsi rutinitas, evaluasi ketepatan penggunaan tenses & preposisi, serta pengenalan materi periode ke-3.",
    status: "BELUM MULAI",
    isCompleted: false,
    date: ""
  },
  {
    sessionNumber: 9,
    level: "A1",
    title: "Present Continuous Tense & Aksi yang Sedang Berlangsung",
    description: "Memahami struktur kalimat Present Continuous (Subject + BE + Verb-ing) untuk menyatakan aktivitas yang sedang terjadi serta kontras penggunaannya dengan Simple Present Tense.",
    status: "BELUM MULAI",
    isCompleted: false,
    date: ""
  },
  {
    sessionNumber: 10,
    level: "A1",
    title: "Kata Sifat Dasar & Kalimat Deskriptif (Basic Adjectives)",
    description: "Membangun kalimat deskripsi sederhana untuk menggambarkan penampilan fisik seseorang, objek di sekitar, cuaca, dan perasaan/kondisi emosi menggunakan kalimat nominal.",
    status: "BELUM MULAI",
    isCompleted: false,
    date: ""
  },
  {
    sessionNumber: 11,
    level: "A1",
    title: "Modal Auxiliary Dasar (Can / Can't) untuk Kemampuan & Izin",
    description: "Penggunaan kata bantu modal CAN dan CAN'T untuk menyatakan kemampuan (ability), ketidakmampuan, permohonan izin sederhana, serta permintaan tolong informal.",
    status: "BELUM MULAI",
    isCompleted: false,
    date: ""
  },
  {
    sessionNumber: 12,
    level: "A1",
    title: "Evaluasi Akhir Batch & Proyek Mini Speaking A1",
    description: "Evaluasi komprehensif seluruh materi A1 (Sesi 1–11), simulasi berbicara mandiri tanpa teks (menceritakan diri, rutinitas, dan lingkungan sekitar), serta pemetaan kesiapan naik ke jenjang CEFR A2.",
    status: "BELUM MULAI",
    isCompleted: false,
    date: ""
  }
]

export const CURRICULUM_PRESETS = {
  SEED: {
    tier: 'SEED',
    label: 'SEED — Foundation & Basic Communication',
    level: 'A1',
    defaultSessionsPerMonth: 4,
    defaultDurationMonths: 3,
    description: 'Fokus pada fondasi tata bahasa dasar, fonetik pengucapan alfabet, dan keberanian komunikasi kalimat sederhana.',
    sessions: CEFR_A1_PRESET
  },

  GROW: {
    tier: 'GROW',
    label: 'GROW — Elementary Grammar & Active Fluency',
    level: 'A2',
    defaultSessionsPerMonth: 4,
    defaultDurationMonths: 3,
    description: 'Pengembangan tata bahasa waktu (Past, Present Continuous, Future) dan percakapan kontekstual dua arah.',
    sessions: [
      {
        sessionNumber: 1,
        level: 'A2',
        title: 'Present Continuous & Dynamic vs Stative Verbs',
        description: 'Membedakan aktivitas yang sedang terjadi dengan kebiasaan serta mengenali kata kerja statif (love, know, understand).',
        status: 'COMPLETED',
        date: ''
      },
      {
        sessionNumber: 2,
        level: 'A2',
        title: 'Present Simple vs Present Continuous in Spoken Context',
        description: 'Latihan kontras situasi fakta permanen vs kejadian sementara dalam dialog interaktif sehari-hari.',
        status: 'COMPLETED',
        date: ''
      },
      {
        sessionNumber: 3,
        level: 'A2',
        title: 'Simple Past Tense: Regular Verbs & -ed Pronunciation Rules',
        description: 'Menguasai tiga pelafalan akhiran -ed (/t/, /d/, /id/) dan menyusun kalimat pengalaman waktu lampau.',
        status: 'IN_PROGRESS',
        date: ''
      },
      {
        sessionNumber: 4,
        level: 'A2',
        title: 'Irregular Past Verbs Mastery & Story Recount Drills',
        description: 'Menghafal dan mengaplikasikan 30+ kata kerja tak beraturan populer dalam menceritakan kronologi cerita.',
        status: 'LOCKED',
        date: ''
      },
      {
        sessionNumber: 5,
        level: 'A2',
        title: 'Past Continuous & Interrupted Actions with When / While',
        description: 'Menjelaskan peristiwa masa lalu yang sedang berlangsung saat kejadian lain terjadi (was/were + V-ing).',
        status: 'LOCKED',
        date: ''
      },
      {
        sessionNumber: 6,
        level: 'A2',
        title: 'Future Plans: Will vs Be Going To Contrast',
        description: 'Membedakan keputusan spontan (will) dengan rencana masa depan yang sudah diniatkan (be going to).',
        status: 'LOCKED',
        date: ''
      },
      {
        sessionNumber: 7,
        level: 'A2',
        title: 'Modal Verbs: Can, Could, May & Polite Requests',
        description: 'Mengungkapkan kemampuan, izin formal, dan permintaan bantuan yang sopan dalam percakapan nyata.',
        status: 'LOCKED',
        date: ''
      },
      {
        sessionNumber: 8,
        level: 'A2',
        title: 'Giving Directions, Spatial Maps & City Navigation',
        description: 'Memberi dan menanyakan petunjuk arah jalan (turn left, go straight, cross the street) dengan denah peta.',
        status: 'LOCKED',
        date: ''
      },
      {
        sessionNumber: 9,
        level: 'A2',
        title: 'Dining Out, Ordering Food & Restaurant Etiquette Dialogues',
        description: 'Simulasi memesan menu di restoran, menanyakan rekomendasi chef, hingga proses pembayaran tagihan.',
        status: 'LOCKED',
        date: ''
      },
      {
        sessionNumber: 10,
        level: 'A2',
        title: 'Shopping, Bargaining & Retail Transaction Expressions',
        description: 'Percakapan membeli pakaian, menanyakan ukuran/warna, perbandingan harga, dan prosedur transaksi toko.',
        status: 'LOCKED',
        date: ''
      },
      {
        sessionNumber: 11,
        level: 'A2',
        title: 'Travel, Weather & Vacation Storytelling Roleplay',
        description: 'Mendiskusikan prakiraan cuaca, rencana liburan ke luar kota, dan reservasi hotel secara mandiri.',
        status: 'LOCKED',
        date: ''
      },
      {
        sessionNumber: 12,
        level: 'A2',
        title: 'Comprehensive A2 Speaking Evaluation & Batch 1 Progress Review',
        description: 'Evaluasi performa lisan terpadu, pengukuran kelancaran speaking, serta penetapan target batch berikutnya.',
        status: 'LOCKED',
        date: ''
      }
    ]
  },

  BOOST: {
    tier: 'BOOST',
    label: 'BOOST — Intermediate Competency & Fluency Accelerator',
    level: 'B1',
    defaultSessionsPerMonth: 8,
    defaultDurationMonths: 3,
    description: 'Peningkatan kemampuan analisis teks, Present Perfect, Conditional Sentences, dan diskusi bertema opini.',
    sessions: [
      {
        sessionNumber: 1,
        level: 'B1',
        title: 'Present Perfect Tense & Life Experiences (Have/Has + V3)',
        description: 'Membahas pengalaman hidup dengan time signals: ever, never, already, yet, just, since, dan for.',
        status: 'COMPLETED',
        date: ''
      },
      {
        sessionNumber: 2,
        level: 'B1',
        title: 'Present Perfect vs Simple Past Critical Distinctions',
        description: 'Latihan mendalam membedakan kejadian yang masih berdampak di masa kini vs peristiwa lampau definitif.',
        status: 'COMPLETED',
        date: ''
      },
      {
        sessionNumber: 3,
        level: 'B1',
        title: 'Present Perfect Continuous: Duration & Ongoing Efforts',
        description: 'Menjelaskan aktivitas yang telah dan masih terus berlangsung hingga saat ini (have been + V-ing).',
        status: 'IN_PROGRESS',
        date: ''
      },
      {
        sessionNumber: 4,
        level: 'B1',
        title: 'Comparatives & Superlatives with Irregular Adjectives',
        description: 'Membandingkan objek, tempat, dan kualitas menggunakan as...as, -er/more, dan the most.',
        status: 'LOCKED',
        date: ''
      },
      {
        sessionNumber: 5,
        level: 'B1',
        title: 'Zero & First Conditional: Real Possibilities & Scientific Facts',
        description: 'Menyusun kalimat sebab-akibat nyata dan janji masa depan dengan klausa if + present simple.',
        status: 'LOCKED',
        date: ''
      },
      {
        sessionNumber: 6,
        level: 'B1',
        title: 'Second Conditional: Hypothetical Situations & Dreams',
        description: 'Mengungkapkan pengandaian imajinatif masa kini dan saran bijak (If I were you, I would...).',
        status: 'LOCKED',
        date: ''
      },
      {
        sessionNumber: 7,
        level: 'B1',
        title: 'Passive Voice in Present & Past Tenses',
        description: 'Mengubah fokus kalimat dari pelaku ke objek tindakan (be + V3) untuk kebutuhan teks laporan.',
        status: 'LOCKED',
        date: ''
      },
      {
        sessionNumber: 8,
        level: 'B1',
        title: 'Modal Verbs of Obligation, Deduction & Prohibition (Must, Should, Have to)',
        description: 'Menyatakan kewajiban mutlak, larangan keras, deduksi logis, dan anjuran sopan.',
        status: 'LOCKED',
        date: ''
      },
      {
        sessionNumber: 9,
        level: 'B1',
        title: 'Relative Clauses: Defining (Who, Which, That, Whose)',
        description: 'Menggabungkan dua kalimat menjadi satu kalimat informatif dan efisien tanpa pengulangan kata.',
        status: 'LOCKED',
        date: ''
      },
      {
        sessionNumber: 10,
        level: 'B1',
        title: 'Used to vs Be Used to vs Get Used to Adaptations',
        description: 'Membedakan kebiasaan masa lalu yang sudah berhenti vs adaptasi kebiasaan baru di masa sekarang.',
        status: 'LOCKED',
        date: ''
      },
      {
        sessionNumber: 11,
        level: 'B1',
        title: 'Thematic Debate: Expressing & Defending Opinions',
        description: 'Teknik menyatakan persetujuan, sanggahan santun, dan mempertahankan argumen dalam diskusi kelompok.',
        status: 'LOCKED',
        date: ''
      },
      {
        sessionNumber: 12,
        level: 'B1',
        title: 'Mid-Batch Intermediate Assessment & Fluency Checkpoint',
        description: 'Ujian komprehensif evaluasi tata bahasa B1 dan uji kelancaran berbicara dua arah.',
        status: 'LOCKED',
        date: ''
      }
    ]
  },

  MASTER: {
    tier: 'MASTER',
    label: 'MASTER — Advanced Academic Mentoring & Professional Communication',
    level: 'B2',
    defaultSessionsPerMonth: 8,
    defaultDurationMonths: 3,
    description: 'Program persiapan TOEFL/IELTS, presentasi profesional, analisis wacana kritis, dan retorika bahasa tingkat tinggi.',
    sessions: [
      {
        sessionNumber: 1,
        level: 'B2',
        title: 'Advanced Sentence Inversion & Emphatic Structures',
        description: 'Membangun gaya bahasa formal berbobot sastra/akademik menggunakan Rarely, Seldom, Not only did he...',
        status: 'COMPLETED',
        date: ''
      },
      {
        sessionNumber: 2,
        level: 'B2',
        title: 'Third Conditional & Mixed Conditionals in Regrets',
        description: 'Menganalisis pengandaian masa lalu dan dampaknya pada kondisi saat ini secara mendalam.',
        status: 'COMPLETED',
        date: ''
      },
      {
        sessionNumber: 3,
        level: 'B2',
        title: 'Subjunctive Mood & Formal Decision-Making Clauses',
        description: 'Struktur bahasa diplomasi dan rekomendasi institusional (It is crucial that he be present).',
        status: 'IN_PROGRESS',
        date: ''
      },
      {
        sessionNumber: 4,
        level: 'B2',
        title: 'Signposting Language for Executive Public Speaking',
        description: 'Teknik pemandu alur presentasi profesional, pengantar data, transisi ide, dan persuasi audiens.',
        status: 'LOCKED',
        date: ''
      },
      {
        sessionNumber: 5,
        level: 'B2',
        title: 'Academic Graph & Trend Analysis (IELTS Writing Task 1 Focus)',
        description: 'Diksi presisi untuk menggambarkan fluktuasi data, peningkatan drastis, perbandingan persentase.',
        status: 'LOCKED',
        date: ''
      },
      {
        sessionNumber: 6,
        level: 'B2',
        title: 'Critical Essay Structuring & Thesis Statement Defense',
        description: 'Menyusun argumen akademis berbasis fakta dengan paragraph transition yang kohesif dan koheren.',
        status: 'LOCKED',
        date: ''
      },
      {
        sessionNumber: 7,
        level: 'B2',
        title: 'Discourse Markers & Nuanced Conversational Flow',
        description: 'Menggunakan ungkapan penghubung alami (frankly speaking, nevertheless, as far as I am concerned).',
        status: 'LOCKED',
        date: ''
      },
      {
        sessionNumber: 8,
        level: 'B2',
        title: 'Standardized Speed Reading: Skimming & Scanning Drills',
        description: 'Strategi menjawab soal wacana panjang TOEFL/IELTS dalam batas waktu ketat tanpa kehilangan akurasi.',
        status: 'LOCKED',
        date: ''
      },
      {
        sessionNumber: 9,
        level: 'B2',
        title: 'Paraphrasing & Academic Synthesis without Plagiarism',
        description: 'Menulis ulang ide gagasan orang lain dengan struktur kalimat berbeda tanpa mengubah esensi makna.',
        status: 'LOCKED',
        date: ''
      },
      {
        sessionNumber: 10,
        level: 'B2',
        title: 'Advanced Idioms, Collocations & Phrasal Verbs in Context',
        description: 'Memperkaya ekspresi bahasa alami dengan 40+ kolokasi profesional dan ungkapan idiomatik tingkat tinggi.',
        status: 'LOCKED',
        date: ''
      },
      {
        sessionNumber: 11,
        level: 'B2',
        title: 'Mock Interview & Impromptu Speech Simulation',
        description: 'Latihan menjawab pertanyaan mendadak di hadapan panel penilai dengan struktur berpikir STAR.',
        status: 'LOCKED',
        date: ''
      },
      {
        sessionNumber: 12,
        level: 'B2',
        title: 'Capstone Defense & Final Academic Certification',
        description: 'Presentasi akhir proyek capstone bahasa Inggris dan penerbitan transkrip capaian Batch 1.',
        status: 'LOCKED',
        date: ''
      }
    ]
  }
}

/**
 * Generate a complete list of sessions tailored to student's sessionsPerMonth and durationMonths.
 * @param {string} tier 'SEED' | 'GROW' | 'BOOST' | 'MASTER'
 * @param {number} sessionsPerMonth e.g. 4
 * @param {number} durationMonths e.g. 3
 * @param {string|Date} startDate e.g. '2026-08-01'
 * @returns {Array} List of session objects
 */
export const generateBatchSessions = (
  tier = 'GROW',
  sessionsPerMonth = 4,
  durationMonths = 3,
  startDate = new Date()
) => {
  const selectedTier = CURRICULUM_PRESETS[tier] || CURRICULUM_PRESETS.GROW
  const totalNeeded = Math.max(1, Number(sessionsPerMonth || 4) * Number(durationMonths || 3))
  const pool = selectedTier.sessions || []

  const baseDate = startDate instanceof Date ? startDate : new Date(startDate || Date.now())
  const results = []

  for (let i = 0; i < totalNeeded; i++) {
    const template = pool[i % pool.length]
    const cycle = Math.floor(i / pool.length)
    const sessionDate = new Date(baseDate)
    sessionDate.setDate(baseDate.getDate() + (i * 7)) // 1 session every 7 days

    const yyyy = sessionDate.getFullYear()
    const mm = String(sessionDate.getMonth() + 1).padStart(2, '0')
    const dd = String(sessionDate.getDate()).padStart(2, '0')
    const dateStr = template.date || `${yyyy}-${mm}-${dd}`

    const titleSuffix = cycle > 0 ? ` (Part ${cycle + 1})` : ''

    results.push({
      id: `session-${String(i + 1).padStart(2, '0')}`,
      sessionNumber: i + 1,
      level: template.level || selectedTier.level,
      title: `${template.title}${titleSuffix}`,
      description: template.description || 'Fokus materi pembelajaran dan praktik aktif.',
      status: template.status || (i === 0 ? 'COMPLETED' : i === 1 ? 'IN_PROGRESS' : 'LOCKED'),
      isCompleted: template.isCompleted || template.status === 'COMPLETED' || template.status === 'SELESAI',
      date: dateStr,
      linkedModuleId: null
    })
  }

  return results
}
