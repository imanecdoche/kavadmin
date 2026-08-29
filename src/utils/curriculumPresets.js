/**
 * 📚 Granular Curriculum Presets Library for Kavio Edu
 * Pre-configured 1-Batch session-by-session curriculum roadmaps (SEED, GROW, BOOST, MASTER).
 */

export const CURRICULUM_PRESETS = {
  SEED: {
    tier: 'SEED',
    label: 'SEED — Foundation & Basic Communication',
    level: 'A1',
    defaultSessionsPerMonth: 4,
    defaultDurationMonths: 3,
    description: 'Fokus pada fondasi tata bahasa dasar, fonetik pengucapan alfabet, dan keberanian komunikasi kalimat sederhana.',
    sessions: [
      {
        sessionNumber: 1,
        level: 'A1',
        title: 'Alphabet, Phonics & Clear Pronunciation Drill',
        description: 'Mengenal fonetik vokal dan konsonan bahasa Inggris, artikulasi bunyi, serta latihan pelafalan kata dasar.',
        status: 'COMPLETED',
        date: '2026-08-01'
      },
      {
        sessionNumber: 2,
        level: 'A1',
        title: 'Personal Pronouns & Self-Introduction Mastery',
        description: 'Menyusun kalimat perkenalan diri (nama, usia, asal, hobi) dengan subject pronouns (I, You, They, We, He, She, It).',
        status: 'COMPLETED',
        date: '2026-08-08'
      },
      {
        sessionNumber: 3,
        level: 'A1',
        title: 'Auxiliary Verb BE (Am, Is, Are) in Present Sentences',
        description: 'Pemahaman tuntas kalimat nominal positif, negatif, dan tanya menggunakan to be (am/is/are).',
        status: 'IN_PROGRESS',
        date: '2026-08-15'
      },
      {
        sessionNumber: 4,
        level: 'A1',
        title: 'Singular vs Plural Nouns & Article Usage (A / An / The)',
        description: 'Aturan penambahan -s/-es pada kata benda jamak, kata benda tak beraturan, dan penggunaan artikel yang tepat.',
        status: 'LOCKED',
        date: '2026-08-22'
      },
      {
        sessionNumber: 5,
        level: 'A1',
        title: 'Demonstrative Pronouns (This, That, These, Those) in Objects',
        description: 'Menunjukkan benda di sekitar dengan kata tunjuk jarak dekat/jauh serta kepemilikan sederhana (Possessive Adjectives).',
        status: 'LOCKED',
        date: '2026-08-29'
      },
      {
        sessionNumber: 6,
        level: 'A1',
        title: 'Numbers, Telling Time & Calendar Dates',
        description: 'Menyebutkan angka cardinal/ordinal, membaca jam analog/digital (quarter past/to, half past), dan penanggalan.',
        status: 'LOCKED',
        date: '2026-09-05'
      },
      {
        sessionNumber: 7,
        level: 'A1',
        title: 'Simple Present Tense: Action Verbs & Subject Rules',
        description: 'Membentuk kalimat verbal kegiatan harian dengan aturan kata kerja -s/-es pada subjek He/She/It.',
        status: 'LOCKED',
        date: '2026-09-12'
      },
      {
        sessionNumber: 8,
        level: 'A1',
        title: 'Daily Routine Speaking & Adverbs of Frequency',
        description: 'Menceritakan jadwal kegiatan dari pagi hingga malam menggunakan always, usually, often, sometimes, never.',
        status: 'LOCKED',
        date: '2026-09-19'
      },
      {
        sessionNumber: 9,
        level: 'A1',
        title: 'Expressing Likes, Dislikes & Favorite Activities',
        description: 'Mengungkapkan kesukaan dan preferensi (like, love, enjoy, prefer) diikuti kata benda atau gerund (V-ing).',
        status: 'LOCKED',
        date: '2026-09-26'
      },
      {
        sessionNumber: 10,
        level: 'A1',
        title: 'Basic WH-Questions & Interactive Information Gathering',
        description: 'Membentuk kalimat tanya mendalam menggunakan What, Where, When, Who, Why, dan How beserta intonasi tanya.',
        status: 'LOCKED',
        date: '2026-10-03'
      },
      {
        sessionNumber: 11,
        level: 'A1',
        title: 'There is / There are & Prepositions of Place in Room Setup',
        description: 'Mendeskripsikan ruangan dan posisi letak benda menggunakan in, on, under, next to, between, in front of.',
        status: 'LOCKED',
        date: '2026-10-10'
      },
      {
        sessionNumber: 12,
        level: 'A1',
        title: 'Integrated Speaking Simulation & Batch 1 Review',
        description: 'Simulasi percakapan dua arah komprehensif merangkum seluruh materi dasar tingkat Beginner A1.',
        status: 'LOCKED',
        date: '2026-10-17'
      }
    ]
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
        date: '2026-08-01'
      },
      {
        sessionNumber: 2,
        level: 'A2',
        title: 'Present Simple vs Present Continuous in Spoken Context',
        description: 'Latihan kontras situasi fakta permanen vs kejadian sementara dalam dialog interaktif sehari-hari.',
        status: 'COMPLETED',
        date: '2026-08-08'
      },
      {
        sessionNumber: 3,
        level: 'A2',
        title: 'Simple Past Tense: Regular Verbs & -ed Pronunciation Rules',
        description: 'Menguasai tiga pelafalan akhiran -ed (/t/, /d/, /id/) dan menyusun kalimat pengalaman waktu lampau.',
        status: 'IN_PROGRESS',
        date: '2026-08-15'
      },
      {
        sessionNumber: 4,
        level: 'A2',
        title: 'Irregular Past Verbs Mastery & Story Recount Drills',
        description: 'Menghafal dan mengaplikasikan 30+ kata kerja tak beraturan populer dalam menceritakan kronologi cerita.',
        status: 'LOCKED',
        date: '2026-08-22'
      },
      {
        sessionNumber: 5,
        level: 'A2',
        title: 'Past Continuous & Interrupted Actions with When / While',
        description: 'Menjelaskan peristiwa masa lalu yang sedang berlangsung saat kejadian lain terjadi (was/were + V-ing).',
        status: 'LOCKED',
        date: '2026-08-29'
      },
      {
        sessionNumber: 6,
        level: 'A2',
        title: 'Future Plans: Will vs Be Going To Contrast',
        description: 'Membedakan keputusan spontan (will) dengan rencana masa depan yang sudah diniatkan (be going to).',
        status: 'LOCKED',
        date: '2026-09-05'
      },
      {
        sessionNumber: 7,
        level: 'A2',
        title: 'Modal Verbs: Can, Could, May & Polite Requests',
        description: 'Mengungkapkan kemampuan, izin formal, dan permintaan bantuan yang sopan dalam percakapan nyata.',
        status: 'LOCKED',
        date: '2026-09-12'
      },
      {
        sessionNumber: 8,
        level: 'A2',
        title: 'Giving Directions, Spatial Maps & City Navigation',
        description: 'Memberi dan menanyakan petunjuk arah jalan (turn left, go straight, cross the street) dengan denah peta.',
        status: 'LOCKED',
        date: '2026-09-19'
      },
      {
        sessionNumber: 9,
        level: 'A2',
        title: 'Dining Out, Ordering Food & Restaurant Etiquette Dialogues',
        description: 'Simulasi memesan menu di restoran, menanyakan rekomendasi chef, hingga proses pembayaran tagihan.',
        status: 'LOCKED',
        date: '2026-09-26'
      },
      {
        sessionNumber: 10,
        level: 'A2',
        title: 'Shopping, Bargaining & Retail Transaction Expressions',
        description: 'Percakapan membeli pakaian, menanyakan ukuran/warna, perbandingan harga, dan prosedur transaksi toko.',
        status: 'LOCKED',
        date: '2026-10-03'
      },
      {
        sessionNumber: 11,
        level: 'A2',
        title: 'Travel, Weather & Vacation Storytelling Roleplay',
        description: 'Mendiskusikan prakiraan cuaca, rencana liburan ke luar kota, dan reservasi hotel secara mandiri.',
        status: 'LOCKED',
        date: '2026-10-10'
      },
      {
        sessionNumber: 12,
        level: 'A2',
        title: 'Comprehensive A2 Speaking Evaluation & Batch 1 Progress Review',
        description: 'Evaluasi performa lisan terpadu, pengukuran kelancaran speaking, serta penetapan target batch berikutnya.',
        status: 'LOCKED',
        date: '2026-10-17'
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
        date: '2026-08-01'
      },
      {
        sessionNumber: 2,
        level: 'B1',
        title: 'Present Perfect vs Simple Past Critical Distinctions',
        description: 'Latihan mendalam membedakan kejadian yang masih berdampak di masa kini vs peristiwa lampau definitif.',
        status: 'COMPLETED',
        date: '2026-08-05'
      },
      {
        sessionNumber: 3,
        level: 'B1',
        title: 'Present Perfect Continuous: Duration & Ongoing Efforts',
        description: 'Menjelaskan aktivitas yang telah dan masih terus berlangsung hingga saat ini (have been + V-ing).',
        status: 'IN_PROGRESS',
        date: '2026-08-08'
      },
      {
        sessionNumber: 4,
        level: 'B1',
        title: 'Comparatives & Superlatives with Irregular Adjectives',
        description: 'Membandingkan objek, tempat, dan kualitas menggunakan as...as, -er/more, dan the most.',
        status: 'LOCKED',
        date: '2026-08-12'
      },
      {
        sessionNumber: 5,
        level: 'B1',
        title: 'Zero & First Conditional: Real Possibilities & Scientific Facts',
        description: 'Menyusun kalimat sebab-akibat nyata dan janji masa depan dengan klausa if + present simple.',
        status: 'LOCKED',
        date: '2026-08-15'
      },
      {
        sessionNumber: 6,
        level: 'B1',
        title: 'Second Conditional: Hypothetical Situations & Dreams',
        description: 'Mengungkapkan pengandaian imajinatif masa kini dan saran bijak (If I were you, I would...).',
        status: 'LOCKED',
        date: '2026-08-19'
      },
      {
        sessionNumber: 7,
        level: 'B1',
        title: 'Passive Voice in Present & Past Tenses',
        description: 'Mengubah fokus kalimat dari pelaku ke objek tindakan (be + V3) untuk kebutuhan teks laporan.',
        status: 'LOCKED',
        date: '2026-08-22'
      },
      {
        sessionNumber: 8,
        level: 'B1',
        title: 'Modal Verbs of Obligation, Deduction & Prohibition (Must, Should, Have to)',
        description: 'Menyatakan kewajiban mutlak, larangan keras, deduksi logis, dan anjuran sopan.',
        status: 'LOCKED',
        date: '2026-08-26'
      },
      {
        sessionNumber: 9,
        level: 'B1',
        title: 'Relative Clauses: Defining (Who, Which, That, Whose)',
        description: 'Menggabungkan dua kalimat menjadi satu kalimat informatif dan efisien tanpa pengulangan kata.',
        status: 'LOCKED',
        date: '2026-08-29'
      },
      {
        sessionNumber: 10,
        level: 'B1',
        title: 'Used to vs Be Used to vs Get Used to Adaptations',
        description: 'Membedakan kebiasaan masa lalu yang sudah berhenti vs adaptasi kebiasaan baru di masa sekarang.',
        status: 'LOCKED',
        date: '2026-09-02'
      },
      {
        sessionNumber: 11,
        level: 'B1',
        title: 'Thematic Debate: Expressing & Defending Opinions',
        description: 'Teknik menyatakan persetujuan, sanggahan santun, dan mempertahankan argumen dalam diskusi kelompok.',
        status: 'LOCKED',
        date: '2026-09-05'
      },
      {
        sessionNumber: 12,
        level: 'B1',
        title: 'Mid-Batch Intermediate Assessment & Fluency Checkpoint',
        description: 'Ujian komprehensif evaluasi tata bahasa B1 dan uji kelancaran berbicara dua arah.',
        status: 'LOCKED',
        date: '2026-09-09'
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
        date: '2026-08-01'
      },
      {
        sessionNumber: 2,
        level: 'B2',
        title: 'Third Conditional & Mixed Conditionals in Regrets',
        description: 'Menganalisis pengandaian masa lalu dan dampaknya pada kondisi saat ini secara mendalam.',
        status: 'COMPLETED',
        date: '2026-08-05'
      },
      {
        sessionNumber: 3,
        level: 'B2',
        title: 'Subjunctive Mood & Formal Decision-Making Clauses',
        description: 'Struktur bahasa diplomasi dan rekomendasi institusional (It is crucial that he be present).',
        status: 'IN_PROGRESS',
        date: '2026-08-08'
      },
      {
        sessionNumber: 4,
        level: 'B2',
        title: 'Signposting Language for Executive Public Speaking',
        description: 'Teknik pemandu alur presentasi profesional, pengantar data, transisi ide, dan persuasi audiens.',
        status: 'LOCKED',
        date: '2026-08-12'
      },
      {
        sessionNumber: 5,
        level: 'B2',
        title: 'Academic Graph & Trend Analysis (IELTS Writing Task 1 Focus)',
        description: 'Diksi presisi untuk menggambarkan fluktuasi data, peningkatan drastis, perbandingan persentase.',
        status: 'LOCKED',
        date: '2026-08-15'
      },
      {
        sessionNumber: 6,
        level: 'B2',
        title: 'Critical Essay Structuring & Thesis Statement Defense',
        description: 'Menyusun argumen akademis berbasis fakta dengan paragraph transition yang kohesif dan koheren.',
        status: 'LOCKED',
        date: '2026-08-19'
      },
      {
        sessionNumber: 7,
        level: 'B2',
        title: 'Discourse Markers & Nuanced Conversational Flow',
        description: 'Menggunakan ungkapan penghubung alami (frankly speaking, nevertheless, as far as I am concerned).',
        status: 'LOCKED',
        date: '2026-08-22'
      },
      {
        sessionNumber: 8,
        level: 'B2',
        title: 'Standardized Speed Reading: Skimming & Scanning Drills',
        description: 'Strategi menjawab soal wacana panjang TOEFL/IELTS dalam batas waktu ketat tanpa kehilangan akurasi.',
        status: 'LOCKED',
        date: '2026-08-26'
      },
      {
        sessionNumber: 9,
        level: 'B2',
        title: 'Paraphrasing & Academic Synthesis without Plagiarism',
        description: 'Menulis ulang ide gagasan orang lain dengan struktur kalimat berbeda tanpa mengubah esensi makna.',
        status: 'LOCKED',
        date: '2026-08-29'
      },
      {
        sessionNumber: 10,
        level: 'B2',
        title: 'Advanced Idioms, Collocations & Phrasal Verbs in Context',
        description: 'Memperkaya ekspresi bahasa alami dengan 40+ kolokasi profesional dan ungkapan idiomatik tingkat tinggi.',
        status: 'LOCKED',
        date: '2026-09-02'
      },
      {
        sessionNumber: 11,
        level: 'B2',
        title: 'Mock Interview & Impromptu Speech Simulation',
        description: 'Latihan menjawab pertanyaan mendadak di hadapan panel penilai dengan struktur berpikir STAR.',
        status: 'LOCKED',
        date: '2026-09-05'
      },
      {
        sessionNumber: 12,
        level: 'B2',
        title: 'Capstone Defense & Final Academic Certification',
        description: 'Presentasi akhir proyek capstone bahasa Inggris dan penerbitan transkrip capaian Batch 1.',
        status: 'LOCKED',
        date: '2026-09-09'
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
    const dateStr = `${yyyy}-${mm}-${dd}`

    const titleSuffix = cycle > 0 ? ` (Part ${cycle + 1})` : ''

    results.push({
      id: `session-${String(i + 1).padStart(2, '0')}`,
      sessionNumber: i + 1,
      level: template.level || selectedTier.level,
      title: `${template.title}${titleSuffix}`,
      description: template.description || 'Fokus materi pembelajaran dan praktik aktif.',
      status: i === 0 ? 'COMPLETED' : i === 1 ? 'IN_PROGRESS' : 'LOCKED',
      date: dateStr,
      linkedModuleId: null
    })
  }

  return results
}
