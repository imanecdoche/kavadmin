import jsPDF from 'jspdf'
import * as htmlToImage from 'html-to-image'
import { PAPER_SIZES, getPaperSizeConfig } from './paperDimensions'

/**
 * Ekspor dokumen Roadmap ke file PDF resmi berstandar cetak dengan sistem Smart Page Break
 * Menggunakan kombinasi resmi jsPDF + html2canvas.
 * Mendukung format A4, F4/Folio, US Legal, dan US Letter serta multi-halaman tanpa potong kartu.
 *
 * @param {string|HTMLElement} elementIdOrEl - ID atau elemen DOM kontainer roadmap
 * @param {string|Object} studentNameOrData - Nama siswa atau objek data roadmap
 * @param {string} batch - Nama batch pembelajaran
 * @param {string} paperSizeKey - Ukuran kertas ('a4', 'f4', 'legal', 'letter')
 */
export const exportRoadmapToPdf = async (
  elementIdOrEl = 'roadmap-export-canvas',
  studentNameOrData = 'Student',
  batch = 'Batch',
  paperSizeKey = 'a4'
) => {
  const container = typeof elementIdOrEl === 'string'
    ? document.getElementById(elementIdOrEl)
    : elementIdOrEl

  if (!container) {
    console.error('[Export Roadmap PDF Error]: Elemen tidak ditemukan.', elementIdOrEl)
    alert('Dokumen roadmap tidak ditemukan untuk diekspor.')
    return
  }

  // Handle jika argumen kedua adalah object data roadmap
  let studentName = 'Student'
  let batchName = 'Batch'
  let selectedPaperSize = paperSizeKey

  if (typeof studentNameOrData === 'object' && studentNameOrData !== null) {
    studentName = studentNameOrData.studentName || studentNameOrData.name || 'Student'
    batchName = studentNameOrData.batchName || studentNameOrData.batch || 'Batch'
    selectedPaperSize = studentNameOrData.paperSize || paperSizeKey || 'a4'
  } else {
    studentName = studentNameOrData || 'Student'
    batchName = batch || 'Batch'
  }

  const paperConfig = getPaperSizeConfig(selectedPaperSize)

  try {
    if (document.fonts) await document.fonts.ready

    // Cari seluruh halaman .roadmap-page dalam container (untuk multi-halaman)
    const pageElements = container.querySelectorAll('.roadmap-page')
    const pagesToExport = pageElements.length > 0 ? Array.from(pageElements) : [container]

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: paperConfig.pdfFormat
    })

    for (let i = 0; i < pagesToExport.length; i++) {
      const pageEl = pagesToExport[i]

      const dataUrl = await htmlToImage.toPng(pageEl, {
        pixelRatio: 2,
        quality: 0.98,
        backgroundColor: '#ffffff',
        cacheBust: true,
        style: {
          transform: 'none',
          margin: '0',
        }
      })

      if (i > 0) {
        pdf.addPage(paperConfig.pdfFormat, 'portrait')
      }

      pdf.addImage(
        dataUrl,
        'PNG',
        0,
        0,
        paperConfig.widthMm,
        paperConfig.heightMm,
        undefined,
        'FAST'
      )
    }

    const sanitizedName = String(studentName || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_')
    const sanitizedBatch = String(batchName || 'Batch').replace(/[^a-zA-Z0-9_-]/g, '_')
    const paperName = paperConfig.name.replace(/[^a-zA-Z0-9]/g, '_')
    const filename = `Roadmap_KavioEdu_${sanitizedName}_${sanitizedBatch}_${paperName}`

    pdf.save(`${filename}.pdf`)
  } catch (error) {
    console.error('[Export Roadmap PDF Exception]:', error)
    alert('Gagal membuat file PDF Roadmap. Silakan coba lagi.')
  }
}

/**
 * Ekspor dokumen Roadmap ke gambar PNG beresolusi tinggi menggunakan html2canvas
 * @param {string|HTMLElement} elementIdOrEl
 * @param {string|Object} studentNameOrData
 * @param {string} batch
 * @param {string} paperSizeKey
 */
export const exportRoadmapToPng = async (
  elementIdOrEl = 'roadmap-export-canvas',
  studentNameOrData = 'Student',
  batch = 'Batch',
  paperSizeKey = 'a4'
) => {
  const container = typeof elementIdOrEl === 'string'
    ? document.getElementById(elementIdOrEl)
    : elementIdOrEl

  if (!container) {
    console.error('[Export Roadmap PNG Error]: Elemen tidak ditemukan.', elementIdOrEl)
    return
  }

  let studentName = 'Student'
  let batchName = 'Batch'
  let selectedPaperSize = paperSizeKey

  if (typeof studentNameOrData === 'object' && studentNameOrData !== null) {
    studentName = studentNameOrData.studentName || studentNameOrData.name || 'Student'
    batchName = studentNameOrData.batchName || studentNameOrData.batch || 'Batch'
    selectedPaperSize = studentNameOrData.paperSize || paperSizeKey || 'a4'
  } else {
    studentName = studentNameOrData || 'Student'
    batchName = batch || 'Batch'
  }

  const paperConfig = getPaperSizeConfig(selectedPaperSize)

  try {
    if (document.fonts) await document.fonts.ready

    const pageElements = container.querySelectorAll('.roadmap-page')
    const pagesToExport = pageElements.length > 0 ? Array.from(pageElements) : [container]

    const sanitizedName = String(studentName || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_')
    const sanitizedBatch = String(batchName || 'Batch').replace(/[^a-zA-Z0-9_-]/g, '_')
    const paperName = paperConfig.name.replace(/[^a-zA-Z0-9]/g, '_')

    for (let i = 0; i < pagesToExport.length; i++) {
      const pageEl = pagesToExport[i]
      const dataUrl = await htmlToImage.toPng(pageEl, {
        pixelRatio: 2,
        quality: 0.98,
        backgroundColor: '#ffffff',
        cacheBust: true,
        style: {
          transform: 'none',
          margin: '0',
        }
      })

      const link = document.createElement('a')
      const pageSuffix = pagesToExport.length > 1 ? `_Hal_${i + 1}` : ''
      link.download = `Roadmap_KavioEdu_${sanitizedName}_${sanitizedBatch}_${paperName}${pageSuffix}.png`
      link.href = dataUrl
      link.click()
    }
  } catch (error) {
    console.error('[Export Roadmap PNG Exception]:', error)
  }
}
