import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * High-definition PDF Export Engine for Kavio Edu Academic Report
 * Scales canvas by 2x for retina/print sharpness and formats directly onto standard A4 page (210mm x 297mm).
 *
 * @param {HTMLElement|string} target DOM element or ID to render
 * @param {string|Object} studentNameOrMeta Student name string or metadata object
 * @param {string} period Period string
 * @returns {Promise<string>} Generated filename
 */
export const exportReportToPdf = async (target, studentNameOrMeta = 'Student', period = 'Period') => {
  const element = typeof target === 'string'
    ? document.getElementById(target)
    : target

  if (!element) return

  // 1. Tangkap canvas dengan clone & scroll reset agar header atas tidak terpotong
  const canvas = await html2canvas(element, {
    scale: 2, // Retensi ketajaman cetak HD
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    scrollX: 0,
    scrollY: 0,
    windowWidth: 1200 // Pastikan viewport capture konsisten
  })

  const imgData = canvas.toDataURL('image/png', 1.0)

  // 2. Inisialisasi PDF A4 (210mm x 297mm)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  })

  const pageWidth = 210
  const pageHeight = 297

  // 3. Hitung tinggi proporsional berdasarkan rasio aspek canvas
  const imgWidth = pageWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  // Jika tinggi gambar melebihi 1 halaman A4, batasi ke 297mm secara proporsional
  const renderHeight = Math.min(imgHeight, pageHeight)

  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, renderHeight, undefined, 'FAST')

  let studentName = 'Student'
  let periodName = period

  if (typeof studentNameOrMeta === 'object' && studentNameOrMeta !== null) {
    studentName = studentNameOrMeta.studentName || 'Student'
    periodName = studentNameOrMeta.periodName || period
  } else if (typeof studentNameOrMeta === 'string') {
    studentName = studentNameOrMeta
  }

  const sanitizedName = studentName.replace(/\s+/g, '_')
  const sanitizedPeriod = periodName.replace(/\s+/g, '_')
  const filename = `Rapor_KavioEdu_${sanitizedName}_${sanitizedPeriod}.pdf`

  pdf.save(filename)
  return filename
}

/**
 * High-definition PNG Image Export
 * @param {HTMLElement|string} target
 * @param {string|Object} studentNameOrMeta
 * @param {string} period
 * @returns {Promise<string>} Generated filename
 */
export const exportReportToPng = async (target, studentNameOrMeta = 'Student', period = 'Period') => {
  const element = typeof target === 'string'
    ? document.getElementById(target)
    : target

  if (!element) return

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    scrollX: 0,
    scrollY: 0,
    windowWidth: 1200
  })

  let studentName = 'Student'
  let periodName = period

  if (typeof studentNameOrMeta === 'object' && studentNameOrMeta !== null) {
    studentName = studentNameOrMeta.studentName || 'Student'
    periodName = studentNameOrMeta.periodName || period
  } else if (typeof studentNameOrMeta === 'string') {
    studentName = studentNameOrMeta
  }

  const sanitizedName = studentName.replace(/\s+/g, '_')
  const sanitizedPeriod = periodName.replace(/\s+/g, '_')
  const filename = `Rapor_KavioEdu_${sanitizedName}_${sanitizedPeriod}.png`

  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png', 1.0)
  link.click()

  return filename
}
