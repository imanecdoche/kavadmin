import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * High-definition PNG export for Roadmap Metro Graph
 * @param {HTMLElement|string} targetElement
 * @param {Object} roadmapMeta
 * @returns {Promise<string>} Filename
 */
export const exportRoadmapToPng = async (targetElement, roadmapMeta = {}) => {
  const element = typeof targetElement === 'string'
    ? document.getElementById(targetElement)
    : targetElement

  if (!element) {
    throw new Error('Element target untuk ekspor Roadmap PNG tidak ditemukan')
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#FFFFFF'
  })

  const studentName = (roadmapMeta.studentName || 'Siswa').replace(/[^a-zA-Z0-9]/g, '_')
  const filename = `Roadmap_KavioEdu_${studentName}.png`

  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png', 1.0)
  link.click()

  return filename
}

/**
 * High-definition PDF export for Roadmap Metro Graph
 * @param {HTMLElement|string} targetElement
 * @param {Object} roadmapMeta
 * @returns {Promise<string>} Filename
 */
export const exportRoadmapToPdf = async (targetElement, roadmapMeta = {}) => {
  const element = typeof targetElement === 'string'
    ? document.getElementById(targetElement)
    : targetElement

  if (!element) {
    throw new Error('Element target untuk ekspor Roadmap PDF tidak ditemukan')
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

  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()

  const imgHeight = (canvas.height * pdfWidth) / canvas.width
  const finalHeight = Math.min(imgHeight, pdfHeight)

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, finalHeight, undefined, 'FAST')

  const studentName = (roadmapMeta.studentName || 'Siswa').replace(/[^a-zA-Z0-9]/g, '_')
  const filename = `Roadmap_KavioEdu_${studentName}.pdf`

  pdf.save(filename)
  return filename
}
