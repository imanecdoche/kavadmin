import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * High-definition PNG export for Roadmap Document
 * @param {HTMLElement|string} target
 * @param {Object} roadmapMeta
 * @returns {Promise<string>} Filename
 */
export const exportRoadmapToPng = async (target, roadmapMeta = {}) => {
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

  const studentName = (roadmapMeta.studentName || 'Siswa').replace(/[^a-zA-Z0-9]/g, '_')
  const batchName = (roadmapMeta.batchName || 'Batch1').replace(/[^a-zA-Z0-9]/g, '_')
  const filename = `Roadmap_KavioEdu_${studentName}_${batchName}.png`

  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png', 1.0)
  link.click()

  return filename
}

/**
 * High-definition PDF export for Roadmap Document
 * @param {HTMLElement|string} target
 * @param {Object} roadmapMeta
 * @returns {Promise<string>} Filename
 */
export const exportRoadmapToPdf = async (target, roadmapMeta = {}) => {
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

  const imgData = canvas.toDataURL('image/png', 1.0)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  })

  const pdfWidth = pdf.internal.pageSize.getWidth() // 210mm
  const pdfHeight = pdf.internal.pageSize.getHeight() // 297mm

  const imgHeight = (canvas.height * pdfWidth) / canvas.width
  const renderHeight = Math.min(imgHeight, pdfHeight)

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, renderHeight, undefined, 'FAST')

  const studentName = (roadmapMeta.studentName || 'Siswa').replace(/[^a-zA-Z0-9]/g, '_')
  const batchName = (roadmapMeta.batchName || 'Batch1').replace(/[^a-zA-Z0-9]/g, '_')
  const filename = `Roadmap_KavioEdu_${studentName}_${batchName}.pdf`

  pdf.save(filename)
  return filename
}
