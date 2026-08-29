/**
 * 🧮 Roadmap Calculator & Progress Metrics for Kavio Edu
 * Granular batch session calculator, progress aggregator, and formatting helpers.
 */

/**
 * Calculates total sessions in a batch
 * @param {number} sessionsPerMonth
 * @param {number} durationMonths
 * @returns {number}
 */
export const calculateBatchSessionCount = (sessionsPerMonth = 4, durationMonths = 3) => {
  const s = Math.max(1, Number(sessionsPerMonth) || 4)
  const d = Math.max(1, Number(durationMonths) || 1)
  return s * d
}

/**
 * Formats a session number with leading zero, e.g. 1 -> "Sesi 01"
 * @param {number|string} num
 * @returns {string}
 */
export const formatSessionNumber = (num) => {
  const n = Number(num) || 1
  return `Sesi ${String(n).padStart(2, '0')}`
}

/**
 * Formats date into short Indonesian format: e.g. "12 Agu 2026"
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDateShortIndonesian = (date) => {
  if (!date) return '-'
  try {
    const d = date instanceof Date ? date : new Date(date)
    if (isNaN(d.getTime())) return String(date)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
  } catch (e) {
    return String(date)
  }
}

/**
 * Calculates overall roadmap progress across all session items
 * @param {Array} sessions List of session objects
 * @returns {Object} { percentage, totalSessions, completedCount, inProgressCount, lockedCount }
 */
export const calculateOverallRoadmapProgress = (sessions = []) => {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return {
      percentage: 0,
      averageMastery: 0,
      totalSessions: 0,
      completedCount: 0,
      inProgressCount: 0,
      lockedCount: 0
    }
  }

  const total = sessions.length
  let completedCount = 0
  let inProgressCount = 0
  let lockedCount = 0
  let totalMastery = 0

  sessions.forEach((s) => {
    const status = String(s.status || '').toUpperCase()
    const isCompleted = status === 'COMPLETED' || status === 'SELESAI'
    const masteryVal = typeof s.mastery === 'number'
      ? Math.min(100, Math.max(0, s.mastery))
      : (isCompleted ? 100 : 0)

    totalMastery += masteryVal

    if (isCompleted) {
      completedCount++
    } else if (status === 'IN_PROGRESS' || status === 'SEDANG BERJALAN') {
      inProgressCount++
    } else {
      lockedCount++
    }
  })

  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0
  const averageMastery = total > 0 ? Math.round(totalMastery / total) : 0

  return {
    percentage,
    averageMastery,
    totalSessions: total,
    completedCount,
    inProgressCount,
    lockedCount
  }
}

/**
 * Returns badge styling and color codes for CEFR Academic Levels
 * @param {string} level e.g. "A1", "A2", "B1", "B2", "C1"
 */
export const getAcademicLevelBadge = (level = 'A2') => {
  const cleanLevel = String(level || 'A2').trim().toUpperCase()

  if (cleanLevel.includes('A1')) {
    return {
      code: 'A1',
      label: 'A1 - Beginner',
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    }
  }
  if (cleanLevel.includes('A2')) {
    return {
      code: 'A2',
      label: 'A2 - Elementary',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300'
    }
  }
  if (cleanLevel.includes('B1')) {
    return {
      code: 'B1',
      label: 'B1 - Intermediate',
      color: 'text-indigo-700',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300'
    }
  }
  if (cleanLevel.includes('B2')) {
    return {
      code: 'B2',
      label: 'B2 - Upper Intermediate',
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-300'
    }
  }
  if (cleanLevel.includes('C1') || cleanLevel.includes('C2')) {
    return {
      code: 'C1/C2',
      label: 'C1/C2 - Advanced',
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300'
    }
  }

  return {
    code: 'GENERAL',
    label: level || 'General English',
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300'
  }
}

/**
 * Auto-advances roadmap session status:
 * When session i is set to COMPLETED, session i+1 (if currently LOCKED) becomes IN_PROGRESS.
 * @param {Array} sessions
 * @returns {Array} Updated sessions array
 */
export const autoAdvanceRoadmap = (sessions = []) => {
  if (!Array.isArray(sessions) || sessions.length === 0) return []

  const updated = JSON.parse(JSON.stringify(sessions))

  for (let i = 0; i < updated.length; i++) {
    const current = updated[i]
    const status = String(current.status || '').toUpperCase()

    if ((status === 'COMPLETED' || status === 'SELESAI') && i + 1 < updated.length) {
      const nextStatus = String(updated[i + 1].status || '').toUpperCase()
      if (nextStatus === 'LOCKED' || nextStatus === 'TERKUNCI' || nextStatus === 'BELUM MULAI') {
        updated[i + 1].status = 'SEDANG BERJALAN'
      }
    }
  }

  return updated
}

/**
 * Menghitung status sesi berdasarkan tanggal dan jam sesi presisi
 * @param {string} sessionDateStr - Format YYYY-MM-DD (misal: "2026-08-29")
 * @param {string} startTimeStr - Format HH:mm (misal: "16:00", default: "16:00")
 * @param {number} durationMinutes - Durasi belajar dalam menit (default: 90)
 * @returns {{ status: string, isCompleted: boolean }}
 */
export const resolveSessionStatusByDateTime = (
  sessionDateStr,
  startTimeStr = "16:00",
  durationMinutes = 90
) => {
  if (!sessionDateStr) {
    return { status: "BELUM MULAI", isCompleted: false }
  }

  const now = new Date()

  // Parsing waktu mulai sesi
  const [year, month, day] = String(sessionDateStr).split('-').map(Number)
  if (!year || !month || !day) {
    return { status: "BELUM MULAI", isCompleted: false }
  }

  const [startHour, startMinute] = String(startTimeStr || "16:00").split(':').map(Number)
  const safeHour = isNaN(startHour) ? 16 : startHour
  const safeMinute = isNaN(startMinute) ? 0 : startMinute
  const safeDuration = Number(durationMinutes) > 0 ? Number(durationMinutes) : 90

  const sessionStart = new Date(year, month - 1, day, safeHour, safeMinute, 0, 0)
  
  // Hitung waktu selesai sesi berdasarkan durasi
  const sessionEnd = new Date(sessionStart.getTime() + safeDuration * 60 * 1000)

  if (now.getTime() > sessionEnd.getTime()) {
    return { status: "SELESAI", isCompleted: true }
  } else if (now.getTime() >= sessionStart.getTime() && now.getTime() <= sessionEnd.getTime()) {
    return { status: "SEDANG BERJALAN", isCompleted: false }
  } else {
    return { status: "BELUM MULAI", isCompleted: false }
  }
}

/**
 * Menghitung status sesi otomatis (kompatibilitas backward)
 */
export const resolveSessionStatusByDate = (sessionDateStr, startTimeStr = "16:00", durationMinutes = 90) => {
  return resolveSessionStatusByDateTime(sessionDateStr, startTimeStr, durationMinutes)
}

/**
 * Menerapkan evaluasi status otomatis berbasis tanggal & jam presisi untuk seluruh daftar sesi
 * @param {Array} sessions
 * @param {string} defaultStartTime
 * @param {number} defaultDuration
 * @returns {Array} Updated sessions array
 */
export const applyDateBasedStatusToSessions = (sessions = [], defaultStartTime = "16:00", defaultDuration = 90) => {
  if (!Array.isArray(sessions) || sessions.length === 0) return []

  return sessions.map((session) => {
    if (!session.date) return session

    const sTime = session.time || session.startTime || defaultStartTime || "16:00"
    const sDuration = Number(session.duration || session.durationMinutes || defaultDuration || 90)

    const autoStatus = resolveSessionStatusByDateTime(session.date, sTime, sDuration)
    const currentMastery = typeof session.mastery === 'number' ? session.mastery : 0
    const masteryVal = autoStatus.status === 'SELESAI'
      ? (currentMastery > 0 ? currentMastery : 100)
      : currentMastery

    return {
      ...session,
      time: sTime,
      duration: sDuration,
      status: autoStatus.status,
      isCompleted: autoStatus.isCompleted,
      mastery: masteryVal
    }
  })
}

/**
 * Standar Slot Sesi Harian Kavio Edu
 */
export const KAVIO_TIME_SLOTS = {
  slot1: "09:00",
  slot2: "13:00",
  slot3: "15:00"
}

/**
 * Mengekstrak jam sesi belajar (format HH:mm) dari data profil siswa di Firestore / CRM
 * @param {Object} student - Objek data siswa
 * @returns {string} Format HH:mm (contoh: "09:00", "13:00", "15:00")
 */
export const extractStudentSlotTime = (student) => {
  if (!student) return KAVIO_TIME_SLOTS.slot3 // Default 15:00

  // 1. Direct field match
  if (student.sessionTime && typeof student.sessionTime === 'string') {
    return student.sessionTime.replace('.', ':').trim()
  }
  if (student.timeSlot && typeof student.timeSlot === 'string') {
    return student.timeSlot.replace('.', ':').trim()
  }
  if (student.preferredSlot && typeof student.preferredSlot === 'string') {
    return student.preferredSlot.replace('.', ':').trim()
  }

  // 2. Schedule object
  if (student.schedule && typeof student.schedule === 'object' && student.schedule.time) {
    return String(student.schedule.time).replace('.', ':').trim()
  }

  // 3. Numeric slot index (1, 2, 3)
  if (student.slot === 1 || student.slot === '1') return KAVIO_TIME_SLOTS.slot1 // 09:00
  if (student.slot === 2 || student.slot === '2') return KAVIO_TIME_SLOTS.slot2 // 13:00
  if (student.slot === 3 || student.slot === '3') return KAVIO_TIME_SLOTS.slot3 // 15:00

  // 4. Extract from selectedSlots array (e.g. ["Senin 15.00 WIB", "Kamis 15.00 WIB"])
  if (Array.isArray(student.selectedSlots) && student.selectedSlots.length > 0) {
    const firstSlot = String(student.selectedSlots[0])
    if (firstSlot.includes('09.00') || firstSlot.includes('09:00') || firstSlot.toLowerCase().includes('pagi')) {
      return KAVIO_TIME_SLOTS.slot1
    }
    if (firstSlot.includes('13.00') || firstSlot.includes('13:00') || firstSlot.toLowerCase().includes('siang')) {
      return KAVIO_TIME_SLOTS.slot2
    }
    if (firstSlot.includes('15.00') || firstSlot.includes('15:00') || firstSlot.toLowerCase().includes('sore')) {
      return KAVIO_TIME_SLOTS.slot3
    }
    const match = firstSlot.match(/(\d{1,2})[.:](\d{2})/)
    if (match) {
      return `${String(match[1]).padStart(2, '0')}:${match[2]}`
    }
  }

  // 5. Extract from schedule string (e.g. "Senin 15.00 WIB")
  if (typeof student.schedule === 'string' && student.schedule.trim()) {
    const s = student.schedule
    if (s.includes('09.00') || s.includes('09:00') || s.toLowerCase().includes('pagi')) {
      return KAVIO_TIME_SLOTS.slot1
    }
    if (s.includes('13.00') || s.includes('13:00') || s.toLowerCase().includes('siang')) {
      return KAVIO_TIME_SLOTS.slot2
    }
    if (s.includes('15.00') || s.includes('15:00') || s.toLowerCase().includes('sore')) {
      return KAVIO_TIME_SLOTS.slot3
    }
    const match = s.match(/(\d{1,2})[.:](\d{2})/)
    if (match) {
      return `${String(match[1]).padStart(2, '0')}:${match[2]}`
    }
  }

  return KAVIO_TIME_SLOTS.slot3 // 15:00
}
