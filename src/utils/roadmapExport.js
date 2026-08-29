import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * High-definition PNG export for Roadmap Document
 * @param {HTMLElement|string} target
 * @param {Object} roadmapMeta
 * @returns {Promise<string>} Filename
 */
export const exportRoadmapToPng = async (target, roadmapMeta = {}) => {
  try {
    const element = (typeof target === 'string' ? document.getElementById(target) : target) ||
                    document.getElementById('roadmap-export-canvas') ||
                    document.getElementById('roadmap-batch-canvas')

    if (!element) {
      console.error('Roadmap element not found for PNG export')
      return null
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      windowWidth: 1200,
      onclone: (clonedDoc) => {
        const clonedEl = clonedDoc.getElementById('roadmap-export-canvas') || clonedDoc.getElementById('roadmap-batch-canvas')
        if (clonedEl) {
          clonedEl.style.transform = 'none'
          clonedEl.style.margin = '0'
        }
      }
    })

    const studentName = (roadmapMeta.studentName || 'Siswa').replace(/[^a-zA-Z0-9]/g, '_')
    const batchName = (roadmapMeta.batchName || 'Batch1').replace(/[^a-zA-Z0-9]/g, '_')
    const filename = `Roadmap_KavioEdu_${studentName}_${batchName}.png`

    const link = document.createElement('a')
    link.download = filename
    link.href = canvas.toDataURL('image/png', 1.0)
    link.click()

    return filename
  } catch (err) {
    console.error('Failed to export roadmap to PNG:', err)
    throw err
  }
}

/**
 * High-definition PDF export for Roadmap Document
 * @param {HTMLElement|string} target
 * @param {Object} roadmapMeta
 * @returns {Promise<string>} Filename
 */
export const exportRoadmapToPdf = async (target, roadmapMeta = {}) => {
  try {
    const element = (typeof target === 'string' ? document.getElementById(target) : target) ||
                    document.getElementById('roadmap-export-canvas') ||
                    document.getElementById('roadmap-batch-canvas')

    if (!element) {
      console.error('Roadmap element not found for PDF export')
      return null
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      windowWidth: 1200,
      onclone: (clonedDoc) => {
        const clonedEl = clonedDoc.getElementById('roadmap-export-canvas') || clonedDoc.getElementById('roadmap-batch-canvas')
        if (clonedEl) {
          clonedEl.style.transform = 'none'
          clonedEl.style.margin = '0'
        }
      }
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
  } catch (err) {
    console.error('Failed to export roadmap to PDF:', err)
    throw err
  }
}
