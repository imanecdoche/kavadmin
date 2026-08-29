/**
 * Utilities & Default Generator for Kavio Edu Student Roadmaps
 */

export const SESSION_STATUS = {
  BELUM: 'BELUM',
  PROSES: 'PROSES',
  SELESAI: 'SELESAI'
}

export const STATUS_CONFIG = {
  BELUM: {
    label: 'BELUM',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-300',
    border: 'border-slate-200',
    text: 'text-slate-600',
    dot: 'bg-slate-400'
  },
  PROSES: {
    label: 'PROSES',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-300',
    border: 'border-amber-300',
    text: 'text-amber-700',
    dot: 'bg-amber-500'
  },
  SELESAI: {
    label: 'SELESAI',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    border: 'border-emerald-300',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500'
  }
}

// Sample curriculum session topics for auto-fill
const CURRICULUM_TOPIC_TEMPLATES = [
  {
    title: 'Auxiliary Verb BE (Am/Is/Are) vs DO/Does & Subject-Verb Agreement',
    materials: 'Konsep dasar to be (am/is/are) dalam kalimat nominal, penggunaan Do/Does dalam kalimat tanya & negatif, serta Subject-Verb Agreement.',
    evaluation: 'Pemahaman konsep dasar to be dan DO/Does, kelancaran menyusun kalimat tanya sederhana.',
    tasks: 'Latihan 10 soal exercise pembentukan kalimat nominal & verbal.'
  },
  {
    title: 'Simple Present Tense & Daily Routine Speaking',
    materials: 'Struktur Simple Present Tense, aturan penambahan -s/-es pada verb 3rd person singular, adverbs of frequency, dan praktik mendeskripsikan rutinitas harian.',
    evaluation: 'Kefasihan dalam mendeskripsikan aktivitas harian, ketepatan penggunaan akhiran -s/-es.',
    tasks: 'Membuat rekaman suara/catatan 5 kalimat tentang jadwal harian.'
  },
  {
    title: 'Present Continuous Tense & Stative vs Dynamic Verbs',
    materials: 'Penggunaan Present Continuous Tense (V-ing), perbedaan dengan Simple Present, serta pengenalan kata kerja statif (stative verbs) yang tidak lazim berakhiran -ing.',
    evaluation: 'Ketepatan membedakan aktivitas yang sedang berlangsung dengan rutinitas.',
    tasks: 'Mini quiz identifikasi stative verbs vs action verbs.'
  },
  {
    title: 'Simple Past Tense: Regular & Irregular Verbs + Storytelling',
    materials: 'Bentuk Past Tense (V2), regular verbs (-ed endings) & common irregular verbs, serta latihan menceritakan pengalaman liburan atau kejadian di masa lalu.',
    evaluation: 'Penguasaan bentuk verb kedua dan kemampuan menyusun kronologi cerita singkat.',
    tasks: 'Menulis 1 paragraf singkat (5-7 kalimat) tentang pengalaman kemarin/akhir pekan.'
  },
  {
    title: 'Future Tense: Will vs Be Going To & Making Plans',
    materials: 'Perbedaan penggunaan Will (spontaneous decision/prediction) dan Be Going To (prior plan/evidence), modal verbs untuk janji dan rencana masa depan.',
    evaluation: 'Kemampuan memilih will vs be going to sesuai konteks situasi percakapan.',
    tasks: 'Menyusun dialog pendek tentang rencana liburan mendatang.'
  },
  {
    title: 'Conversational Speaking & Situational Roleplay',
    materials: 'Ungkapan praktis (greetings, asking for help, giving opinions, making suggestions), intonasi bicara alami, dan roleplay situasi nyata (restoran, bandara, wawancara).',
    evaluation: 'Kepercayaan diri, kelancaran berbicara, intonasi, dan respons spontan.',
    tasks: 'Praktik roleplay dialog spontan 2 arah.'
  },
  {
    title: 'Vocabulary Building & Sentence Structure Mastery',
    materials: 'Pengayaan 50+ kosakata esensial, penggunaan conjunctions (because, although, however, therefore), serta teknik menyusun compound & complex sentences.',
    evaluation: 'Kekayaan kosakata dan kemampuan menghubungkan dua klausa dengan konjungsi yang tepat.',
    tasks: 'Membuat 5 compound sentences menggunakan konjungsi yang dipelajari.'
  },
  {
    title: 'Comprehensive Evaluation & Student Progress Assessment',
    materials: 'Review komprehensif seluruh materi modul, tes lisan (oral assessment), dan evaluasi lembar kerja tertulis.',
    evaluation: 'Laporan capaian belajar siswa, identifikasi poin kekuatan dan area yang perlu ditingkatkan.',
    tasks: 'Review mandiri materi modul yang telah dipelajari.'
  },
  {
    title: 'Present Perfect Tense: Experience & Unfinished Actions (Have/Has + V3)',
    materials: 'Penggunaan Present Perfect Tense, past participle (V3), time markers (ever, never, already, yet, since, for).',
    evaluation: 'Pemahaman keterkaitan masa lalu dengan saat ini dan ketepatan pemakaian since vs for.',
    tasks: 'Menulis 5 hal yang pernah dan belum pernah dilakukan (experiences).'
  },
  {
    title: 'Modals of Ability, Obligation & Permission (Can, Must, Should, May)',
    materials: 'Penggunaan modal auxiliary verbs: can/could, must/have to, should, may/might untuk menyatakan kemampuan, keharusan, saran, dan izin.',
    evaluation: 'Ketepatan pemilihan modal verb sesuai derajat kesopanan dan kebutuhan situasi.',
    tasks: 'Latihan membuat aturan kelas/rumah menggunakan modal verbs.'
  },
  {
    title: 'Reading Comprehension & Critical Analysis Strategies',
    materials: 'Teknik membaca skimming & scanning, mengidentifikasi main idea, supporting details, serta menarik kesimpulan dari teks berbahasa Inggris.',
    evaluation: 'Kecepatan membaca dan ketepatan menjawab pertanyaan pemahaman bacaan.',
    tasks: 'Membaca artikel 300 kata dan menjawab 5 pertanyaan pemahaman.'
  },
  {
    title: 'Academic Writing: Paragraph Development & Essay Basics',
    materials: 'Struktur paragraf standar (Topic Sentence, Supporting Sentences, Concluding Sentence), kohesi & koherensi, serta penulisan mini essay.',
    evaluation: 'Kerapian alur ide, variasi tata bahasa, dan kejelasan pesan tertulis.',
    tasks: 'Menyusun mini essay 2 paragraf dengan topik pilihan.'
  }
]

/**
 * Generate default session title & placeholder content based on index and student
 */
export const getDefaultSessionTemplate = (sessionNumber, student = null) => {
  const templateIdx = (sessionNumber - 1) % CURRICULUM_TOPIC_TEMPLATES.length
  const template = CURRICULUM_TOPIC_TEMPLATES[templateIdx]

  return {
    id: `sesi-${Date.now()}-${sessionNumber}-${Math.random().toString(36).substr(2, 5)}`,
    sessionNumber,
    title: template.title,
    materials: template.materials,
    evaluation: template.evaluation,
    tasks: template.tasks,
    status: SESSION_STATUS.BELUM
  }
}

/**
 * Calculate total quota sessions for a student
 */
export const getStudentSessionQuota = (student) => {
  if (!student) return 4
  const sessionsPerMonth = Number(student.sessionsPerMonth) || 4
  const durationMonths = Number(student.durationMonths) || 1
  return (sessionsPerMonth * durationMonths) || Number(student.totalSessions) || 4
}

/**
 * Create default roadmap structure for a student
 */
export const createDefaultRoadmap = (student) => {
  const quotaSessions = getStudentSessionQuota(student)
  const durationMonths = student?.durationMonths || 1

  let defaultLevel = 'Level A1 - Elementary'
  if (student?.grade) {
    defaultLevel = `Jenjang ${student.grade} (General English & Speaking)`
  }

  let defaultModule = 'Grammar & Conversational English Mastery'
  if (student?.learningTarget) {
    defaultModule = `Modul Kurikulum: ${student.learningTarget}`
  }

  const sessions = []
  for (let i = 1; i <= Math.max(1, quotaSessions); i++) {
    sessions.push(getDefaultSessionTemplate(i, student))
  }

  return {
    studentId: student?.id || '',
    studentName: student?.name || 'Siswa Kavio Edu',
    level: defaultLevel,
    moduleTitle: defaultModule,
    targetDuration: `${durationMonths} Bulan (${quotaSessions} Sesi)`,
    customNotes: student?.notes || '',
    sessions,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

/**
 * Normalize and migrate roadmap from student object (handles legacy format smoothly)
 */
export const normalizeStudentRoadmap = (student) => {
  if (!student) return null

  if (student.roadmap && Array.isArray(student.roadmap.sessions) && student.roadmap.sessions.length > 0) {
    // Ensure all sessions have all required fields & correct numbering
    const normalizedSessions = student.roadmap.sessions.map((s, idx) => {
      let rawStatus = (s.status || 'BELUM').toUpperCase()
      if (rawStatus === 'SELESAI' || rawStatus === 'DONE' || rawStatus === 'COMPLETED') rawStatus = SESSION_STATUS.SELESAI
      else if (rawStatus === 'PROSES' || rawStatus === 'IN_PROGRESS' || rawStatus === 'PROCESS') rawStatus = SESSION_STATUS.PROSES
      else rawStatus = SESSION_STATUS.BELUM

      return {
        id: s.id || `sesi-${Date.now()}-${idx + 1}-${Math.random().toString(36).substr(2, 5)}`,
        sessionNumber: Number(s.sessionNumber) || (idx + 1),
        title: s.title || s.name || `Sesi ${idx + 1}`,
        materials: s.materials || '',
        evaluation: s.evaluation || '',
        tasks: s.tasks || '',
        status: rawStatus
      }
    })

    return {
      studentId: student.id,
      studentName: student.name,
      level: student.roadmap.level || (student.grade ? `Jenjang ${student.grade}` : 'Level A1 (Beginner to Elementary)'),
      moduleTitle: student.roadmap.moduleTitle || (student.learningTarget ? `Modul: ${student.learningTarget}` : 'Grammar & Speaking Module'),
      targetDuration: student.roadmap.targetDuration || `${student.durationMonths || 1} Bulan (${getStudentSessionQuota(student)} Sesi)`,
      customNotes: student.roadmap.customNotes || student.notes || '',
      sessions: normalizedSessions,
      createdAt: student.roadmap.createdAt || new Date().toISOString(),
      updatedAt: student.roadmap.updatedAt || new Date().toISOString()
    }
  }

  // Check legacy topics array if stored under student.topics or student.roadmap.topics
  const legacyTopics = student.topics || (student.roadmap && student.roadmap.topics)
  if (Array.isArray(legacyTopics) && legacyTopics.length > 0) {
    const convertedSessions = legacyTopics.map((t, idx) => {
      let rawStatus = (t.status || 'BELUM').toUpperCase()
      if (rawStatus === 'SELESAI') rawStatus = SESSION_STATUS.SELESAI
      else if (rawStatus === 'PROSES') rawStatus = SESSION_STATUS.PROSES
      else rawStatus = SESSION_STATUS.BELUM

      const cleanTitle = (t.name || '').replace(/^Sesi\s*\d+\s*:\s*/i, '').trim() || t.name || `Sesi ${idx + 1}`

      return {
        id: t.id || `sesi-${idx + 1}`,
        sessionNumber: idx + 1,
        title: cleanTitle,
        materials: t.materials || `Materi bimbingan sesi ${idx + 1}`,
        evaluation: t.evaluation || '',
        tasks: t.tasks || '',
        status: rawStatus
      }
    })

    return {
      studentId: student.id,
      studentName: student.name,
      level: student.grade ? `Jenjang ${student.grade}` : 'Level A1 (Beginner to Elementary)',
      moduleTitle: student.learningTarget ? `Modul: ${student.learningTarget}` : 'Grammar & Speaking Module',
      targetDuration: `${student.durationMonths || 1} Bulan (${getStudentSessionQuota(student)} Sesi)`,
      customNotes: student.notes || '',
      sessions: convertedSessions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  // If no existing roadmap, generate default based on student's package & duration
  return createDefaultRoadmap(student)
}

/**
 * Calculate roadmap statistics (counts, percentages)
 */
export const calculateRoadmapStats = (sessions = []) => {
  const total = sessions.length
  let selesaiCount = 0
  let prosesCount = 0
  let belumCount = 0

  sessions.forEach(s => {
    if (s.status === SESSION_STATUS.SELESAI) selesaiCount++
    else if (s.status === SESSION_STATUS.PROSES) prosesCount++
    else belumCount++
  })

  const percentComplete = total > 0 ? Math.round((selesaiCount / total) * 100) : 0

  return {
    total,
    selesaiCount,
    prosesCount,
    belumCount,
    percentComplete
  }
}

/**
 * Generate formatted WhatsApp message / Markdown summary
 */
export const generateRoadmapMarkdown = (roadmap, student = null) => {
  if (!roadmap) return ''
  const stats = calculateRoadmapStats(roadmap.sessions)

  let text = `*ROADMAP KURIKULUM & PROGRES BELAJAR KAVIO EDU*\n`
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  text += `👤 *Siswa:* ${roadmap.studentName || student?.name || '-'}\n`
  if (student?.parentName) text += `👨‍👩‍👧 *Wali:* ${student.parentName}\n`
  if (student?.packageType) text += `📦 *Paket:* ${student.packageType} (${roadmap.targetDuration})\n`
  text += `🎯 *Level:* ${roadmap.level || '-'}\n`
  text += `📚 *Modul:* ${roadmap.moduleTitle || '-'}\n`
  text += `📊 *Progres:* ${stats.selesaiCount}/${stats.total} Sesi Selesai (${stats.percentComplete}%)\n`
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
  text += `*RINCIAN SESI & MATERI PEMBELAJARAN:*\n`

  roadmap.sessions.forEach((s) => {
    let icon = '⚪'
    if (s.status === SESSION_STATUS.SELESAI) icon = '✅'
    else if (s.status === SESSION_STATUS.PROSES) icon = '⏳'

    text += `\n${icon} *Sesi ${s.sessionNumber}: ${s.title}* [${s.status}]\n`
    if (s.materials) {
      text += `   📖 *Materi:* ${s.materials}\n`
    }
    if (s.evaluation) {
      text += `   📝 *Catatan/Evaluasi:* ${s.evaluation}\n`
    }
    if (s.tasks) {
      text += `   📌 *Tugas/PR:* ${s.tasks}\n`
    }
  })

  text += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  text += `_Diterbitkan secara resmi oleh Kavio Edu Academic Management_\n`
  text += `_Founder & Mentor: Fatih Farhat Asshidiq_`

  return text
}
