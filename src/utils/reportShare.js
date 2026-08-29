import { formatDateIndonesian } from './dateFormatter'

/**
 * Encodes report data into a shareable URL query string
 * @param {Object} reportData
 * @returns {string} Fully qualified shareable URL
 */
export function generateReportShareLink(reportData) {
  if (!reportData) return window.location.href

  try {
    const payload = {
      id: reportData.id,
      studentName: reportData.studentName,
      guardianName: reportData.guardianName,
      programTier: reportData.programTier,
      periodName: reportData.periodName,
      issueDate: reportData.issueDate,
      attendance: reportData.attendance,
      competencies: reportData.competencies,
      compositeScore: reportData.compositeScore,
      letterGrade: reportData.letterGrade,
      performanceCategory: reportData.performanceCategory,
      qualitativeAssessment: reportData.qualitativeAssessment,
      evaluatorName: reportData.evaluatorName,
      evaluatorTitle: reportData.evaluatorTitle,
      verification: reportData.verification
    }

    const jsonStr = JSON.stringify(payload)
    const base64 = btoa(encodeURIComponent(jsonStr))
    const baseUrl = window.location.origin + window.location.pathname

    return `${baseUrl}?rep=${encodeURIComponent(reportData.id || '')}&repData=${base64}`
  } catch (err) {
    console.error('Error generating report share link:', err)
    return window.location.href
  }
}

/**
 * Parses and decodes report data from URL query params
 * @returns {Object|null} Decoded report payload or null
 */
export function parseReportShareLink() {
  if (typeof window === 'undefined') return null

  const params = new URLSearchParams(window.location.search)
  const repDataParam = params.get('repData')

  if (!repDataParam) return null

  try {
    const jsonStr = decodeURIComponent(atob(repDataParam))
    return JSON.parse(jsonStr)
  } catch (err) {
    console.error('Error parsing report share link data:', err)
    return null
  }
}

/**
 * Formats official WhatsApp message draft for Academic Report
 * @param {Object} reportData
 * @param {string} shareUrl
 * @returns {string} WhatsApp formatted text
 */
export function generateReportWhatsAppMessage(reportData, customShareUrl = null) {
  if (!reportData) return ''

  const {
    studentName = 'Siswa',
    guardianName = '',
    periodName = 'Periode Belajar',
    compositeScore = 0,
    letterGrade = 'A',
    attendance = { attendedSessions: 8, totalSessions: 8, attendanceRate: 100 },
    qualitativeAssessment = {}
  } = reportData

  const shareUrl = customShareUrl || generateReportShareLink(reportData)
  const recipientName = guardianName ? `Bpk/Ibu ${guardianName}` : `Orang Tua/Wali dari ${studentName}`

  return `*LAPORAN PERKEMBANGAN BELAJAR SISWA (ACADEMIC PROGRESS REPORT)*
*KAVIO EDU — Private English Class & Academic Mentoring*
━━━━━━━━━━━━━━━━━━━━━

Yth. ${recipientName},

Berikut kami sampaikan rincian evaluasi capaian belajar berkala untuk ananda *${studentName}* pada periode *${periodName}*:

📊 *RINGKASAN CAPAIAN AKADEMIK:*
• Skor Akhir Komposit: *${Number(compositeScore).toFixed(1)} / 100*
• Predikat Capaian: *${letterGrade}* (${performanceCategory.label || 'PROFICIENT'})
• Kehadiran Sesi: *${attendance.attendedSessions}/${attendance.totalSessions} Sesi (${attendance.attendanceRate}%)*

🌟 *Sorotan Kemajuan & Keunggulan:*
"${qualitativeAssessment.keyStrengths || 'Menunjukkan kemajuan yang sangat positif.'}"

🎯 *Fokus Pengembangan Selanjutnya:*
"${qualitativeAssessment.areasForImprovement || 'Terus tingkatkan latihan mandiri.'}"

📄 *DOKUMEN RESMI & GRAFIK RADAR:*
Laporan digital resmi berstempel dan bertanda tangan Founder dapat dilihat dan diunduh langsung melalui tautan berikut:
👉 ${shareUrl}

Terima kasih banyak atas kepercayaan dan kerja sama Bapak/Ibu dalam mendukung proses belajar ananda ${studentName}.

Salam hangat,
*Fatih Farhat Asshidiq*
Founder & Academic Director, Kavio Edu`
}
