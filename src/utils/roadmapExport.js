import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * High-definition PDF export for Roadmap Document (with multi-page support and font rendering fixes)
 * @param {string|HTMLElement} elementIdOrEl
 * @param {string} studentName
 * @param {string} batch
 */
export const exportRoadmapToPdf = async (
  elementIdOrEl = 'roadmap-export-canvas',
  studentName = 'Student',
  batch = 'Batch'
) => {
  const element = typeof elementIdOrEl === 'string'
    ? document.getElementById(elementIdOrEl) || document.getElementById('roadmap-export-canvas')
    : elementIdOrEl

  if (!element) {
    alert('Elemen roadmap tidak ditemukan.')
    return
  }

  try {
    // 1. Pastikan seluruh font sistem & web font telah selesai dimuat 100%
    if (document.fonts) {
      await document.fonts.ready
    }

    // 2. Capture canvas dengan resolusi terkunci (tanpa distorsi)
    const canvas = await html2canvas(element, {
      scale: 2, // Kualitas HD
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      windowWidth: 794,
      onclone: (clonedDoc) => {
        const target = (typeof elementIdOrEl === 'string' ? clonedDoc.getElementById(elementIdOrEl) : null) ||
                       clonedDoc.getElementById('roadmap-export-canvas') ||
                       clonedDoc.querySelector('[id*="roadmap"]')
        if (target) {
          // Matikan semua transform scale & kunci dimensi murni
          target.style.transform = 'none'
          target.style.webkitTransform = 'none'
          target.style.margin = '0'
          target.style.width = '794px'
          target.style.maxWidth = '794px'
          target.style.boxSizing = 'border-box'

          // Perbaiki masalah font spacing pada semua teks
          const allTexts = target.querySelectorAll('*')
          allTexts.forEach((el) => {
            el.style.letterSpacing = 'normal'
            el.style.wordSpacing = 'normal'
          })
        }
      }
    })

    const imgData = canvas.toDataURL('image/png', 1.0)

    // 3. Setup PDF dengan Aspect Ratio Murni (KUNCI AGAR TIDAK GEPENG)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pdfPageWidth = 210
    const pdfPageHeight = 297

    // Hitung tinggi proporsional berdasarkan rasio asli canvas
    const renderedImgHeight = (canvas.height * pdfPageWidth) / canvas.width

    // Jika konten lebih panjang dari 1 lembar A4 (12 sesi), buat halaman baru otomatis
    let heightLeft = renderedImgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, pdfPageWidth, renderedImgHeight, undefined, 'FAST')
    heightLeft -= pdfPageHeight

    while (heightLeft > 5) { // Toleransi 5mm
      position -= pdfPageHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, pdfPageWidth, renderedImgHeight, undefined, 'FAST')
      heightLeft -= pdfPageHeight
    }

    const sanitizedName = String(studentName || 'Siswa').replace(/[^a-zA-Z0-9]/g, '_')
    const sanitizedBatch = String(batch || 'Batch').replace(/[^a-zA-Z0-9]/g, '_')
    pdf.save(`Roadmap_KavioEdu_${sanitizedName}_${sanitizedBatch}.pdf`)
  } catch (error) {
    console.error('[PDF Export Error]:', error)
    alert('Terjadi kesalahan teknis saat membuat file PDF.')
  }
}

/**
 * High-definition PNG export for Roadmap Document
 * @param {string|HTMLElement} elementIdOrEl
 * @param {string} studentName
 * @param {string} batch
 */
export const exportRoadmapToPng = async (
  elementIdOrEl = 'roadmap-export-canvas',
  studentName = 'Student',
  batch = 'Batch'
) => {
  const element = typeof elementIdOrEl === 'string'
    ? document.getElementById(elementIdOrEl) || document.getElementById('roadmap-export-canvas')
    : elementIdOrEl

  if (!element) return

  try {
    if (document.fonts) {
      await document.fonts.ready
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      windowWidth: 794,
      onclone: (clonedDoc) => {
        const target = (typeof elementIdOrEl === 'string' ? clonedDoc.getElementById(elementIdOrEl) : null) ||
                       clonedDoc.getElementById('roadmap-export-canvas') ||
                       clonedDoc.querySelector('[id*="roadmap"]')
        if (target) {
          target.style.transform = 'none'
          target.style.webkitTransform = 'none'
          target.style.margin = '0'
          target.style.width = '794px'
          target.style.maxWidth = '794px'
          target.style.boxSizing = 'border-box'

          const allTexts = target.querySelectorAll('*')
          allTexts.forEach((el) => {
            el.style.letterSpacing = 'normal'
            el.style.wordSpacing = 'normal'
          })
        }
      }
    })

    const link = document.createElement('a')
    const sanitizedName = String(studentName || 'Siswa').replace(/[^a-zA-Z0-9]/g, '_')
    const sanitizedBatch = String(batch || 'Batch').replace(/[^a-zA-Z0-9]/g, '_')
    link.download = `Roadmap_KavioEdu_${sanitizedName}_${sanitizedBatch}.png`
    link.href = canvas.toDataURL('image/png', 1.0)
    link.click()
  } catch (error) {
    console.error('[PNG Export Error]:', error)
  }
}
