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
        updated[i + 1].status = 'IN_PROGRESS'
      }
    }
  }

  return updated
}
