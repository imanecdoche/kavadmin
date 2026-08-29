import { calculateOverallRoadmapProgress, calculateMilestoneProgress } from './roadmapCalculator'

/**
 * Encodes roadmap data into a shareable URL query string
 * @param {Object} roadmapData
 * @returns {string} Shareable URL
 */
export function generateRoadmapShareLink(roadmapData) {
  if (!roadmapData) return window.location.href

  try {
    const payload = {
      studentId: roadmapData.studentId,
      studentName: roadmapData.studentName,
      parentName: roadmapData.parentName,
      packageTier: roadmapData.packageTier || roadmapData.programTier || 'GROW',
      targetDuration: roadmapData.targetDuration,
      level: roadmapData.level,
      moduleTitle: roadmapData.moduleTitle,
      milestones: roadmapData.milestones,
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
 * Formats official WhatsApp message draft for Student Roadmap & Milestone Progress
 * @param {Object} roadmapData
 * @param {string} customShareUrl
 * @returns {string} Formatted WhatsApp message
 */
export function generateRoadmapWhatsAppMessage(roadmapData, customShareUrl = null) {
  if (!roadmapData) return ''

  const {
    studentName = 'Siswa',
    parentName = '',
    packageTier = 'GROW',
    level = 'Level A1 - Elementary',
    moduleTitle = 'Kurikulum Bahasa Inggris',
    milestones = []
  } = roadmapData

  const stats = calculateOverallRoadmapProgress(milestones)
  const shareUrl = customShareUrl || generateRoadmapShareLink(roadmapData)
  const recipientName = parentName ? `Bpk/Ibu ${parentName}` : `Orang Tua/Wali dari ${studentName}`

  let msg = `*ROADMAP KURIKULUM & PROGRES BELAJAR SISWA*\n`
  msg += `*KAVIO EDU — Private English Class & Academic Mentoring*\n`
  msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`
  msg += `Yth. ${recipientName},\n\n`
  msg += `Berikut kami sampaikan pembaruan capaian roadmap pembelajaran ananda *${studentName}*:\n\n`
  msg += `🎯 *RINGKASAN TARGET KURIKULUM:*\n`
  msg += `• Paket Program: *Paket ${packageTier}*\n`
  msg += `• Jenjang Akademik: *${level}*\n`
  msg += `• Modul Utama: *${moduleTitle}*\n`
  msg += `• Progres Capaian: *${stats.completedCount}/${stats.totalMilestones} Milestone Selesai (${stats.percentage}%)*\n\n`

  msg += `📍 *STATUS TAHAPAN MILESTONE:*\n`
  milestones.forEach((m, idx) => {
    let icon = '🔒'
    if (m.status === 'COMPLETED') icon = '✅'
    else if (m.status === 'IN_PROGRESS') icon = '⏳'

    const progress = calculateMilestoneProgress(m)
    msg += `${icon} *Milestone ${idx + 1}: ${m.title}* [${m.status === 'COMPLETED' ? 'SELESAI' : m.status === 'IN_PROGRESS' ? 'BERJALAN' : 'TERKUNCI'}] (${progress}%)\n`
    if (m.description) {
      msg += `   └ _${m.description}_\n`
    }
  })

  msg += `\n🌐 *METRO-LINE ROADMAP INTERAKTIF:*
Bagan visualisasi metro-line interaktif dan rincian modul dapat diakses langsung melalui tautan berikut:
👉 ${shareUrl}

Terima kasih atas kerja sama dan dukungan Bapak/Ibu.

Salam hangat,
*Fatih Farhat Asshidiq*
Founder & Academic Director, Kavio Edu`

  return msg
}
