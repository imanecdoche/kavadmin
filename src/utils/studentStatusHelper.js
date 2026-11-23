/**
 * 🎓 Student Session & Completion Status Helper
 * Menghitung status siswa secara presisi berdasarkan kuota, penyelesaian sesi aktual,
 * dan masa kedaluwarsa durasi paket belajar (startDate + durationMonths).
 * 
 * Aturan Mutlak:
 * - Siswa Aktif: Masih memiliki sisa sesi bimbingan belajar (completedSessions < totalSessions / remainingSessions > 0)
 *   dan masa durasi paket belum berakhir.
 * - Siswa Selesai: Seluruh kuota sesi bimbingan belajar telah tuntas dijalani (completedSessions >= totalSessions / remainingSessions === 0)
 *   ATAU masa durasi paket belajar telah melampaui tanggal akhir (misal: 1 Agustus + 3 bulan berakhir di akhir Oktober,
 *   sehingga di bulan November sudah otomatis SELESAI).
 */

/**
 * Menghitung batas akhir masa paket bimbingan belajar berdasarkan tanggal mulai dan durasi bulan
 * @param {string} startDateStr Format 'YYYY-MM-DD'
 * @param {number} durationMonths Durasi paket dalam bulan (default: 1)
 * @returns {Date|null} Objek Date batas akhir paket (23:59:59 di hari terakhir paket)
 */
export const getPackageExpirationDate = (startDateStr, durationMonths = 1) => {
  if (!startDateStr) return null
  const parts = String(startDateStr).split('-').map(Number)
  if (parts.length < 3) return null
  const [year, month, day] = parts
  if (!year || !month || !day) return null

  const dur = Number(durationMonths) > 0 ? Number(durationMonths) : 1

  // Jika siswa mulai tepat tanggal 1, akhir periode adalah hari terakhir di bulan ke-(month + dur - 1)
  // Contoh: Mulai 1 Agustus 2026 (month=8), durasi 3 bulan:
  // Agustus (1), September (2), Oktober (3) -> Berakhir pada 31 Oktober 2026 23:59:59.
  if (day === 1) {
    return new Date(year, (month - 1) + dur, 0, 23, 59, 59, 999)
  }

  // Jika mulai pada tanggal selain tanggal 1 (misal 15 Agustus 2026):
  const endDate = new Date(year, month - 1, day, 23, 59, 59, 999)
  endDate.setMonth(endDate.getMonth() + dur)
  return endDate
}

/**
 * Mengevaluasi apakah suatu sesi tertentu sudah selesai dijalani
 * (baik berdasarkan status eksplisit maupun perbandingan waktu nyata/aktual)
 * @param {Object} session Objek sesi
 * @param {Date} now Waktu sekarang (default: new Date())
 * @returns {boolean}
 */
export const isSessionPassedOrCompleted = (session, now = new Date()) => {
  if (!session) return false
  const st = String(session.status || '').toUpperCase()
  if (st === 'SELESAI' || st === 'COMPLETED' || session.isCompleted === true) {
    return true
  }

  // Evaluasi dinamis berbasis tanggal dan jam sesi jika ada
  if (session.date) {
    const parts = String(session.date).split('-').map(Number)
    if (parts.length >= 3) {
      const [year, month, day] = parts
      const sTime = String(session.time || session.startTime || '16:00')
      const [startHour, startMinute] = sTime.split(':').map(Number)
      const h = isNaN(startHour) ? 16 : startHour
      const m = isNaN(startMinute) ? 0 : startMinute
      const durationMin = Number(session.duration || session.durationMinutes || 60)

      const sessionEnd = new Date(year, month - 1, day, h, m + durationMin, 0, 0)
      if (now.getTime() >= sessionEnd.getTime()) {
        return true
      }
    }
  }

  return false
}

/**
 * Menghitung detail kuota, sisa sesi, dan status kelulusan siswa secara akurat
 */
export const getStudentSessionStatus = (student) => {
  if (!student) {
    return {
      status: 'SELESAI',
      isCompleted: true,
      isActive: false,
      completedSessions: 0,
      totalSessions: 0,
      remainingSessions: 0,
      completionPct: 100,
    }
  }

  const now = new Date()

  // 1. Hitung total kuota sesi paket
  const sessionsPerMonth = Number(student.sessionsPerMonth) || 
    (student.packageType === 'SEED' ? 3 : student.packageType === 'BOOST' || student.packageType === 'MASTER' ? 8 : 4)
  const durationMonths = Number(student.durationMonths) || 1
  const defaultTotalSessions = Number(student.totalSessions) || (sessionsPerMonth * durationMonths)

  let completedCount = 0
  let totalSessions = defaultTotalSessions

  // 2. Cek apakah masa berlaku durasi paket telah habis (misal: 1 Agustus 2026 + 3 bulan berakhir 31 Oktober 2026)
  const packageExpirationDate = getPackageExpirationDate(student.startDate || student.registrationDate, durationMonths)
  const isPackageExpired = packageExpirationDate ? (now.getTime() > packageExpirationDate.getTime()) : false

  // 3. Evaluasi sesi dari roadmap jika tersedia
  if (student.roadmap?.sessions && Array.isArray(student.roadmap.sessions) && student.roadmap.sessions.length > 0) {
    const rSessions = student.roadmap.sessions
    totalSessions = Math.max(defaultTotalSessions, rSessions.length)
    
    // Hitung sesi yang tuntas atau tanggalnya sudah terlewati di masa lampau
    completedCount = rSessions.filter((s) => isSessionPassedOrCompleted(s, now)).length

    // Jika masa paket sudah kedaluwarsa secara kalender, seluruh sesi bimbingan belajar dianggap tuntas
    if (isPackageExpired && completedCount < totalSessions) {
      completedCount = totalSessions
    }
  } else if (isPackageExpired || student.status === 'SELESAI' || student.isActive === false) {
    completedCount = totalSessions
  } else if (typeof student.completedSessions === 'number') {
    completedCount = student.completedSessions
  } else {
    completedCount = 0
  }

  // Jaga batasan
  completedCount = Math.min(totalSessions, Math.max(0, completedCount))
  const remainingSessions = Math.max(0, totalSessions - completedCount)

  // Selesai jika:
  // a. Kuota sesi tuntas (remainingSessions === 0), ATAU
  // b. Masa berlaku paket telah berakhir (isPackageExpired), ATAU
  // c. Status eksplisit diset SELESAI / isActive === false
  const isCompleted = (totalSessions > 0 && remainingSessions === 0) || isPackageExpired || student.status === 'SELESAI' || student.isActive === false
  const isActive = !isCompleted

  const completionPct = totalSessions > 0 ? Math.min(100, Math.round((completedCount / totalSessions) * 100)) : (isCompleted ? 100 : 0)

  return {
    status: isCompleted ? 'SELESAI' : 'AKTIF',
    isCompleted,
    isActive,
    completedSessions: isCompleted ? totalSessions : completedCount,
    totalSessions,
    remainingSessions: isCompleted ? 0 : remainingSessions,
    completionPct,
  }
}

/**
 * Helper ringkas boolean: apakah siswa masih aktif (memiliki sisa sesi dan masa paket belum berakhir)
 */
export const isStudentActive = (student) => {
  return getStudentSessionStatus(student).isActive
}

/**
 * Helper ringkas boolean: apakah siswa sudah selesai (seluruh sesi tuntas atau masa paket telah berakhir)
 */
export const isStudentCompleted = (student) => {
  return getStudentSessionStatus(student).isCompleted
}
