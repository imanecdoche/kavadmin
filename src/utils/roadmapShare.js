import { calculateOverallRoadmapProgress, formatSessionNumber } from './roadmapCalculator'

/**
 * Encodes roadmap data into a shareable URL query string
 * @param {Object} roadmapData
 * @returns {string} Shareable URL
 */
export function generateRoadmapShareLink(roadmapData) {
  if (!roadmapData) return window.location.href

  try {
    const payload = {
      id: roadmapData.id || 'ROA/KEEN/202608/0001',
      studentId: roadmapData.studentId,
      studentName: roadmapData.studentName,
      guardianName: roadmapData.guardianName || roadmapData.parentName || '-',
      packageTier: roadmapData.packageTier || roadmapData.programTier || 'GROW',
      batchName: roadmapData.batchName || 'BATCH 1',
      durationMonths: roadmapData.durationMonths || 3,
      sessionsPerMonth: roadmapData.sessionsPerMonth || 4,
      level: roadmapData.level || 'A2',
      moduleTitle: roadmapData.moduleTitle || 'Kurikulum Bahasa Inggris',
      issueDate: roadmapData.issueDate || new Date().toISOString().split('T')[0],
      sessions: roadmapData.sessions || [],
      updatedAt: roadmapData.updatedAt || new Date().toISOString()
    }

    const jsonStr = JSON.stringify(payload)
    const base64 = btoa(encodeURIComponent(jsonStr))
    const baseUrl = window.location.origin + window.location.pathname

    return `${baseUrl}?road=${encodeURIComponent(roadmapData.studentName || '')}&roadData=${base64}`
  } catch (err) {
    console.error('Error generating roadmap share link:', err)
    return window.location.href
  }
}

/**
 * Parses and decodes roadmap data from URL query params
 * @returns {Object|null} Decoded roadmap payload or null
 */
export function parseRoadmapShareLink() {
  if (typeof window === 'undefined') return null

  const params = new URLSearchParams(window.location.search)
  const roadDataParam = params.get('roadData')

  if (!roadDataParam) return null

  try {
    const jsonStr = decodeURIComponent(atob(roadDataParam))
    return JSON.parse(jsonStr)
  } catch (err) {
    console.error('Error parsing roadmap share link data:', err)
    return null
  }
}

/**
 * Formats official WhatsApp message draft for Student Roadmap 1-Batch Progress
 * @param {Object} roadmapData
 * @param {string} customShareUrl
 * @returns {string} Formatted WhatsApp message
 */
export function generateRoadmapWhatsAppMessage(roadmapData, customShareUrl = null) {
  if (!roadmapData) return ''

  const {
    studentName = 'Siswa',
    guardianName = '',
    packageTier = 'GROW',
    batchName = 'BATCH 1',
    durationMonths = 3,
    level = 'A2',
    sessions = []
  } = roadmapData

  const stats = calculateOverallRoadmapProgress(sessions)
  const shareUrl = customShareUrl || generateRoadmapShareLink(roadmapData)
  const recipientName = guardianName && guardianName !== '-' ? `Bpk/Ibu ${guardianName}` : `Orang Tua/Wali dari ${studentName}`

  let msg = `*ROADMAP PEMBELAJARAN SESI 1-BATCH*\n`
  msg += `*KAVIO EDU — Private English Class & Academic Mentoring*\n`
  msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`
  msg += `Yth. ${recipientName},\n\n`
  msg += `Berikut kami sampaikan alur pembelajaran dan capaian sesi untuk ananda *${studentName}* (${batchName}):\n\n`
  msg += `🎯 *RINGKASAN BATCH 1:*\n`
  msg += `• Paket Program: *Paket ${packageTier}*\n`
  msg += `• Jenjang Level: *Level ${level}*\n`
  msg += `• Durasi & Alokasi: *${durationMonths} Bulan (${stats.totalSessions} Sesi)*\n`
  msg += `• Progres Capaian: *${stats.completedCount}/${stats.totalSessions} Sesi Tuntas (${stats.percentage}%)*\n\n`

  msg += `📍 *RINCIAN ALUR SESI:*\n`
  sessions.slice(0, 12).forEach((s, idx) => {
    const rawStatus = String(s.status || '').toUpperCase()
    let icon = '🔒'
    let statusText = 'Belum Mulai'

    if (rawStatus === 'COMPLETED' || rawStatus === 'SELESAI') {
      icon = '✅'
      statusText = 'Selesai'
    } else if (rawStatus === 'IN_PROGRESS' || rawStatus === 'SEDANG BERJALAN') {
      icon = '⏳'
      statusText = 'Berjalan'
    }

    msg += `${icon} *${formatSessionNumber(s.sessionNumber || idx + 1)}*: ${s.title} [${statusText}]\n`
  })

  if (sessions.length > 12) {
    msg += `   _...dan ${sessions.length - 12} sesi berikutnya._\n`
  }

  msg += `\n📄 *DOKUMEN LENGKAP & DETAIL MATERI:*
Dokumen resmi roadmap 1-Batch lengkap berstempel dan bertanda tangan Founder dapat dilihat melalui tautan berikut:
👉 ${shareUrl}

Terima kasih atas kerja sama dan kepercayaan Bapak/Ibu.

Salam hangat,
*Fatih Farhat Asshidiq*
Founder & Academic Director, Kavio Edu`

  return msg
}
