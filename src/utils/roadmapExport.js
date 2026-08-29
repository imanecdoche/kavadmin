import jsPDF from 'jspdf'
import { toPng } from 'html-to-image'

export const exportRoadmapToPdf = async (elementId = 'roadmap-export-canvas', studentName = 'Student', batch = 'Batch') => {
  const element = typeof elementId === 'string'
    ? document.getElementById(elementId) || document.getElementById('roadmap-export-canvas')
    : elementId

  if (!element) {
    alert('Elemen roadmap tidak ditemukan.')
    return
  }

  try {
    if (document.fonts) await document.fonts.ready

    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
    })

    const img = new Image()
    img.src = dataUrl
    await new Promise((resolve) => {
      img.onload = resolve
    })

    const pdfWidth = 210
    const pdfHeight = (img.height * pdfWidth) / img.width

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [pdfWidth, pdfHeight]
    })

    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST')

    const sanitizedName = String(studentName || 'Student').replace(/[^a-zA-Z0-9]/g, '_')
    const sanitizedBatch = String(batch || 'Batch').replace(/[^a-zA-Z0-9]/g, '_')
    pdf.save(`Roadmap_KavioEdu_${sanitizedName}_${sanitizedBatch}.pdf`)
  } catch (error) {
    console.error('[Export PDF Error]:', error)
    alert('Gagal mengekspor PDF.')
  }
}

export const exportRoadmapToPng = async (elementId = 'roadmap-export-canvas', studentName = 'Student', batch = 'Batch') => {
  const element = typeof elementId === 'string'
    ? document.getElementById(elementId) || document.getElementById('roadmap-export-canvas')
    : elementId

  if (!element) return

  try {
    if (document.fonts) await document.fonts.ready

    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
    })

    const link = document.createElement('a')
    const sanitizedName = String(studentName || 'Student').replace(/[^a-zA-Z0-9]/g, '_')
    const sanitizedBatch = String(batch || 'Batch').replace(/[^a-zA-Z0-9]/g, '_')
    link.download = `Roadmap_KavioEdu_${sanitizedName}_${sanitizedBatch}.png`
    link.href = dataUrl
    link.click()
  } catch (error) {
    console.error('[Export PNG Error]:', error)
  }
}
