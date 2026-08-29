/**
 * Schedule & Session Manager Utility
 * Menghitung dan memvalidasi jadwal sesi bimbingan siswa berdasarkan kuota aktual,
 * tanggal mulai (startDate), durasi paket (durationMonths), dan slot mingguan.
 */

export const DAYS_INDONESIAN = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
export const DAYS_LIST_SENIN_FIRST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

export const TIME_SLOTS_LIST = [
  { id: '09.00', label: '09.00 WIB', subtitle: 'Jam 9 Pagi' },
  { id: '13.00', label: '13.00 WIB', subtitle: 'Jam 1 Siang' },
  { id: '15.00', label: '15.00 WIB', subtitle: 'Jam 3 Sore' }
]

/**
 * Format Date to ISO string YYYY-MM-DD in local time
 */
export const formatDateKey = (dateObj) => {
  if (!dateObj) return ''
  const d = new Date(dateObj)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Mendapatkan tanggal mulai paket siswa (startDate)
 */
export const getStudentStartDate = (student) => {
  if (!student) return new Date(2026, 7, 1) // Default 1 Agustus 2026

  if (student.startDate) {
    const d = new Date(student.startDate)
    if (!isNaN(d.getTime())) return d
  }

  // Fallback ke tanggal invoice pertama jika ada
  if (Array.isArray(student.invoices) && student.invoices.length > 0) {
    for (const inv of student.invoices) {
      if (inv && inv.invoiceDate) {
        const d = new Date(inv.invoiceDate)
        if (!isNaN(d.getTime())) return d
      }
    }
  }

  // Fallback ke registrationDate / createdAt
  if (student.registrationDate) {
    const d = new Date(student.registrationDate)
    if (!isNaN(d.getTime())) return d
  }

  // Default ke awal bulan Agustus 2026 (periode aktif Kavio Edu)
  return new Date(2026, 7, 1)
}

/**
 * Mengekstrak slot waktu mingguan terdaftar untuk seorang siswa
 */
export const getStudentSlots = (student) => {
  if (!student) return []
  let rawSlots = student.selectedSlots && Array.isArray(student.selectedSlots) ? [...student.selectedSlots] : []

  if (rawSlots.length === 0 && student.schedule) {
    DAYS_LIST_SENIN_FIRST.forEach(day => {
      TIME_SLOTS_LIST.forEach(slotObj => {
        if (student.schedule.includes(day) && student.schedule.includes(slotObj.id)) {
          rawSlots.push(`${day} ${slotObj.label}`)
        }
      })
    })
  }

  const structuredSlots = []

  rawSlots.forEach(slotStr => {
    if (typeof slotStr !== 'string') return

    // Cari hari
    let matchedDay = null
    let dayIndex = -1

    for (let i = 0; i < DAYS_INDONESIAN.length; i++) {
      if (slotStr.toLowerCase().includes(DAYS_INDONESIAN[i].toLowerCase())) {
        matchedDay = DAYS_INDONESIAN[i]
        dayIndex = i
        break
      }
    }

    if (matchedDay && dayIndex !== -1) {
      let timeLabel = ''
      TIME_SLOTS_LIST.forEach(ts => {
        if (slotStr.includes(ts.id) || slotStr.includes(ts.label)) {
          timeLabel = ts.label
        }
      })
      if (!timeLabel) {
        timeLabel = slotStr.replace(matchedDay, '').trim() || '09.00 WIB'
      }

      structuredSlots.push({
        slotStr,
        dayName: matchedDay,
        dayIndex, // 0 = Minggu, 1 = Senin, dst.
        timeLabel
      })
    }
  })

  return structuredSlots
}

/**
 * Generate seluruh sesi konkret untuk seorang siswa
 * DIBATASI KETAT oleh total kuota sesi (N Sesi) dan tanggal mulai (startDate)
 */
export const generateStudentSessions = (student) => {
  if (!student || !student.id) return []

  const slots = getStudentSlots(student)
  if (slots.length === 0) return []

  // Hitung total kuota sesi
  const sessionsPerMonth = Number(student.sessionsPerMonth) || 4
  const durationMonths = Number(student.durationMonths) || 1
  const totalQuota = Number(student.totalSessions) || (sessionsPerMonth * durationMonths)

  if (totalQuota <= 0) return []

  const startDate = getStudentStartDate(student)
  const studentSessions = []

  // Urutkan slot berdasarkan hari dalam sepekan (Senin -> Minggu) dan jam
  const sortedSlots = [...slots].sort((a, b) => {
    const dayOrderA = (a.dayIndex + 6) % 7 // Senin = 0, Minggu = 6
    const dayOrderB = (b.dayIndex + 6) % 7
    if (dayOrderA !== dayOrderB) return dayOrderA - dayOrderB
    return a.timeLabel.localeCompare(b.timeLabel)
  })

  // Iterasi hari demi hari mulai dari startDate untuk membuat tepat N sesi
  let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  let generatedCount = 0
  const maxIterations = 365 // Batas maksimum pencarian 1 tahun ke depan untuk keamanan

  let iteration = 0
  while (generatedCount < totalQuota && iteration < maxIterations) {
    const currentDayIndex = currentDate.getDay() // 0 = Minggu, 1 = Senin, dst.

    // Cek apakah ada slot siswa yang cocok dengan hari ini
    const matchingSlots = sortedSlots.filter(s => s.dayIndex === currentDayIndex)

    for (const slot of matchingSlots) {
      if (generatedCount >= totalQuota) break

      const sessionNum = generatedCount + 1
      const roadmapSession = student.roadmap?.sessions?.[generatedCount] || null

      // Status Sesi: Roadmap status -> Fallback berdasarkan riwayat
      let status = 'BELUM'
      if (roadmapSession && roadmapSession.status) {
        status = roadmapSession.status
      }

      studentSessions.push({
        id: `${student.id}-sess-${sessionNum}`,
        sessionNumber: sessionNum,
        dateObj: new Date(currentDate),
        dateKey: formatDateKey(currentDate),
        dayName: DAYS_INDONESIAN[currentDayIndex],
        timeLabel: slot.timeLabel,
        slotStr: slot.slotStr,
        studentId: student.id,
        studentName: student.name || 'Siswa',
        grade: student.grade || 'Umum',
        packageType: student.packageType || 'GROW',
        moduleTitle: roadmapSession?.title || student.roadmap?.moduleTitle || student.learningTarget || 'Bimbingan Private English',
        materials: roadmapSession?.materials || '',
        evaluation: roadmapSession?.evaluation || '',
        tasks: roadmapSession?.tasks || '',
        status,
        student
      })

      generatedCount++
    }

    // Maju ke hari berikutnya
    currentDate.setDate(currentDate.getDate() + 1)
    iteration++
  }

  return studentSessions
}

/**
 * Menghasilkan map agregasi sesi per tanggal YYYY-MM-DD untuk semua siswa
 */
export const getAggregatedSessionsMap = (studentsList) => {
  const sessionsMap = {}
  if (!Array.isArray(studentsList)) return sessionsMap

  studentsList.forEach(student => {
    const sessions = generateStudentSessions(student)
    sessions.forEach(sess => {
      if (!sessionsMap[sess.dateKey]) {
        sessionsMap[sess.dateKey] = []
      }
      sessionsMap[sess.dateKey].push(sess)
    })
  })

  // Urutkan tiap tanggal berdasarkan jam (09.00, 13.00, 15.00)
  Object.keys(sessionsMap).forEach(dateKey => {
    sessionsMap[dateKey].sort((a, b) => a.timeLabel.localeCompare(b.timeLabel))
  })

  return sessionsMap
}

/**
 * Mendapatkan daftar sesi pada tanggal spesifik
 */
export const getSessionsForDateFromMap = (sessionsMap, dateObj) => {
  if (!sessionsMap || !dateObj) return []
  const dateKey = formatDateKey(dateObj)
  return sessionsMap[dateKey] || []
}

/**
 * Menghitung sesi 3 hari ke depan (Hari Ini, Besok, Lusa) berdasarkan jadwal aktual
 */
export const getUpcomingSessions3DaysValidated = (studentsList, baseDate = new Date()) => {
  const monthNamesIndonesian = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const sessionsMap = getAggregatedSessionsMap(studentsList)
  const resultDays = []

  for (let i = 0; i < 3; i++) {
    const targetDate = new Date(baseDate)
    targetDate.setDate(baseDate.getDate() + i)

    const dateKey = formatDateKey(targetDate)
    const dayName = DAYS_INDONESIAN[targetDate.getDay()]
    const dayNum = targetDate.getDate()
    const monthName = monthNamesIndonesian[targetDate.getMonth()]
    const dateFormatted = `${dayName}, ${dayNum} ${monthName}`
    const dateLabel = i === 0 ? 'Hari Ini' : i === 1 ? 'Besok' : 'Lusa'

    const sessions = sessionsMap[dateKey] || []

    resultDays.push({
      dateObj: targetDate,
      dateKey,
      dayName,
      dateFormatted,
      dateLabel,
      sessions
    })
  }

  return resultDays
}
