import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * High-definition PDF Export Engine for Kavio Edu Academic Report
 * Scales canvas by 2x for retina/print sharpness and formats directly onto standard A4 page (210mm x 297mm).
 *
 * @param {HTMLElement|string} targetElement DOM element or ID to render
 * @param {Object} reportMeta Metadata for naming and file tags
 * @returns {Promise<string>} Generated filename
 */
export const exportReportToPdf = async (targetElement, reportMeta = {}) => {
  const element = typeof targetElement === 'string'
    ? document.getElementById(targetElement)
    : targetElement

  if (!element) {
    throw new Error('Element target untuk ekspor PDF tidak ditemukan')
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#FFFFFF',
    windowWidth: 1200
  })

  const imgData = canvas.toDataURL('image/png', 1.0)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  })

  const pdfWidth = pdf.internal.pageSize.getWidth() // 210mm
  const pdfHeight = pdf.internal.pageSize.getHeight() // 297mm

  // Proportional height calculation based on canvas aspect ratio
  const imgHeight = (canvas.height * pdfWidth) / canvas.width
  const finalHeight = Math.min(imgHeight, pdfHeight)

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, finalHeight, undefined, 'FAST')

  const sanitizedStudent = (reportMeta.studentName || 'Siswa').replace(/[^a-zA-Z0-9]/g, '_')
  const sanitizedPeriod = (reportMeta.periodName || 'Periode').replace(/[^a-zA-Z0-9]/g, '_')
  const filename = `Rapor_KavioEdu_${sanitizedStudent}_${sanitizedPeriod}.pdf`

  pdf.save(filename)
  return filename
}

/**
 * High-definition PNG Image Export
 * @param {HTMLElement|string} targetElement
 * @param {Object} reportMeta
 * @returns {Promise<string>} Generated filename
 */
export const exportReportToPng = async (targetElement, reportMeta = {}) => {
  const element = typeof targetElement === 'string'
    ? document.getElementById(targetElement)
    : targetElement

  if (!element) {
    throw new Error('Element target untuk ekspor PNG tidak ditemukan')
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#FFFFFF'
  })

  const sanitizedStudent = (reportMeta.studentName || 'Siswa').replace(/[^a-zA-Z0-9]/g, '_')
  const sanitizedPeriod = (reportMeta.periodName || 'Periode').replace(/[^a-zA-Z0-9]/g, '_')
  const filename = `Rapor_KavioEdu_${sanitizedStudent}_${sanitizedPeriod}.png`

  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png', 1.0)
  link.click()

  return filename
}
