import { formatDateIndonesian } from './dateFormatter'

/**
 * Encodes certificate data into a shareable URL query string
 * @param {Object} certData
 * @returns {string} Fully qualified shareable URL
 */
export function generateCertificateShareLink(certData) {
  if (!certData) return window.location.href

  try {
    const payload = {
      documentId: certData.documentId,
      studentName: certData.studentName,
      programName: certData.programName,
      batchName: certData.batchName,
      cefrLevel: certData.cefrLevel,
      totalSessions: certData.totalSessions,
      completionDate: certData.completionDate,
      predicate: certData.predicate,
      verificationHash: certData.verificationHash,
      signLocation: certData.signLocation,
      directorName: certData.directorName,
      directorTitle: certData.directorTitle,
      verification: certData.verification
    }

    const jsonStr = JSON.stringify(payload)
    const base64 = btoa(encodeURIComponent(jsonStr))
    const baseUrl = window.location.origin + window.location.pathname

    return `${baseUrl}?cert=${encodeURIComponent(certData.documentId || '')}&certData=${base64}`
  } catch (err) {
    console.error('Error generating certificate share link:', err)
    return window.location.href
  }
}

/**
 * Parses and decodes certificate data from URL query params
 * @returns {Object|null} Decoded certificate payload or null
 */
export function parseCertificateShareLink() {
  if (typeof window === 'undefined') return null

  const params = new URLSearchParams(window.location.search)
  const certDataParam = params.get('certData')

  if (!certDataParam) return null

  try {
    const jsonStr = decodeURIComponent(atob(certDataParam))
    return JSON.parse(jsonStr)
  } catch (err) {
    console.error('Error parsing certificate share link data:', err)
    return null
  }
}

/**
 * Generates formatted WhatsApp congratulation message for student certificate
 * @param {Object} certData
 * @returns {string}
 */
export function generateCertificateWhatsAppMessage(certData) {
  if (!certData) return ''

  const shareLink = generateCertificateShareLink(certData)

  return `🎓 *SERTIFIKAT KELULUSAN & PENCAPAIAN KAVIO EDU*
────────────────────────────
Halo *${certData.studentName || 'Siswa'}*, selamat atas keberhasilan menyelesaikan program pembelajaran di *Kavio Edu*! 🌟

📋 *Rincian Sertifikat:*
• No. Dokumen: *${certData.documentId || '-'}*
• Program: *${certData.programName || '-'}*
• Batch / Periode: *${certData.batchName || '-'}*
• Jenjang CEFR: *${certData.cefrLevel || '-'}*
• Total Sesi: *${certData.totalSessions || 12} Sesi Tuntas*
• Hasil Evaluasi: *${certData.predicate || 'SANGAT BAIK (EXCELLENT)'}*
• Tanggal Terbit: *${certData.completionDate || '-'}*

🔗 *Tautan Verifikasi Sertifikat Digital:*
${shareLink}

_Dokumen ini merupakan sertifikat pencapaian resmi yang diterbitkan secara sah oleh Kavio Edu Management._

Salam hangat & sukses selalu,
*${certData.directorName || 'Fatih Farhat Asshidiq'}*
${certData.directorTitle || 'Founder & Academic Director'}
Kavio Edu Management`
}
