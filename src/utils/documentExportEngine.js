import jsPDF from 'jspdf'
import * as htmlToImage from 'html-to-image'

/**
 * 🚀 Document Export Engine
 * Mesin render ekspor dokumen HTML ke PDF dan PNG resolusi tinggi menggunakan jsPDF + html-to-image.
 * 
 * Keunggulan arsitektur:
 * - Native Browser SVG foreignObject: Menghilangkan 100% bug teks dobel/overlapping glyphs yang dialami html2canvas.
 * - Retina Sharp 2x: Kualitas cetak sangat tajam dan presisi.
 * - Anti-Transform Corruption: Me-reset transform CSS saat rendering agar elemen di dalam wrapper tetap 100% akurat.
 * 
 * @param {string|HTMLElement} elementIdOrEl - ID atribut elemen DOM atau node HTML yang ingin dicetak
 * @param {string} filename - Nama file output tanpa ekstensi
 * @param {Object} options - Opsi format ('a4', 'a5', 'continuous', orientation, scale)
 */
export const exportElementToPdf = async (
  elementIdOrEl,
  filename = 'Dokumen_KavioEdu',
  options = { mode: 'a4', orientation: 'portrait', scale: 2 }
) => {
  const element = typeof elementIdOrEl === 'string'
    ? document.getElementById(elementIdOrEl)
    : elementIdOrEl

  if (!element) {
    console.error(`[Export PDF Error]: Elemen tidak ditemukan.`, elementIdOrEl)
    alert('Dokumen tidak ditemukan untuk diekspor.')
    return
  }

  try {
    if (document.fonts) await document.fonts.ready

    const pixelRatio = options.scale || 2
    const imgData = await htmlToImage.toPng(element, {
      pixelRatio,
      quality: 0.98,
      backgroundColor: options.backgroundColor || '#ffffff',
      cacheBust: true,
      style: {
        transform: 'none',
        margin: '0',
        boxShadow: 'none',
        ...(options.style || {})
      }
    })

    // Dapatkan rasio aspek dimensi natural dari gambar render
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = imgData
    })

    const naturalWidth = img.naturalWidth || img.width || (element.offsetWidth * pixelRatio)
    const naturalHeight = img.naturalHeight || img.height || (element.offsetHeight * pixelRatio)

    const isLandscape = (options.orientation || 'portrait') === 'landscape'
    const format = String(options.format || 'a4').toLowerCase()
    let pageWidth = 210
    let pageHeight = 297

    if (format === 'a5') {
      pageWidth = isLandscape ? 210 : 148
      pageHeight = isLandscape ? 148 : 210
    } else {
      // Default A4
      pageWidth = isLandscape ? 297 : 210
      pageHeight = isLandscape ? 210 : 297
    }

    let pdf
    if (options.mode === 'continuous') {
      // 1 Halaman panjang utuh proporsional (Roadmap panjang)
      const renderHeight = (naturalHeight * pageWidth) / naturalWidth
      pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pageWidth, renderHeight],
      })
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, renderHeight, undefined, 'FAST')
    } else {
      // Standar Fixed 1 Halaman Pas Edge-to-Edge (100% Memenuhi Kertas A4/A5 tanpa ruang sisa)
      pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: format === 'a5' ? 'a5' : 'a4',
      })

      if (options.fit === 'contain') {
        let renderWidth = pageWidth
        let renderHeight = (naturalHeight * pageWidth) / naturalWidth

        if (renderHeight > pageHeight) {
          const scaleFactor = pageHeight / renderHeight
          renderWidth = pageWidth * scaleFactor
          renderHeight = pageHeight
        }

        const xOffset = (pageWidth - renderWidth) / 2
        const yOffset = (pageHeight - renderHeight) / 2
        pdf.addImage(imgData, 'PNG', xOffset, yOffset, renderWidth, renderHeight, undefined, 'FAST')
      } else {
        // Default: Pas 100% Edge-to-Edge (0, 0, pageWidth, pageHeight) tanpa sisa ruang / letterboxing
        pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST')
      }
    }

    const sanitizedFilename = String(filename || 'Dokumen_KavioEdu').replace(/[^a-zA-Z0-9_-]/g, '_')
    pdf.save(`${sanitizedFilename}.pdf`)
  } catch (error) {
    console.error('[Export PDF Exception]:', error)
    alert('Gagal membuat file PDF. Silakan coba lagi.')
  }
}

/**
 * Ekspor elemen HTML ke gambar PNG resolusi tinggi menggunakan html-to-image
 * @param {string|HTMLElement} elementIdOrEl
 * @param {string} filename
 * @param {Object} options
 */
export const exportElementToPng = async (
  elementIdOrEl,
  filename = 'Dokumen_KavioEdu',
  options = { scale: 2 }
) => {
  const element = typeof elementIdOrEl === 'string'
    ? document.getElementById(elementIdOrEl)
    : elementIdOrEl

  if (!element) {
    console.error(`[Export PNG Error]: Elemen tidak ditemukan.`, elementIdOrEl)
    return
  }

  try {
    if (document.fonts) await document.fonts.ready

    const dataUrl = await htmlToImage.toPng(element, {
      pixelRatio: options.scale || 2,
      quality: 0.98,
      backgroundColor: options.backgroundColor || '#ffffff',
      cacheBust: true,
      style: {
        transform: 'none',
        margin: '0',
      }
    })

    const link = document.createElement('a')
    const sanitizedFilename = String(filename || 'Dokumen_KavioEdu').replace(/[^a-zA-Z0-9_-]/g, '_')
    link.download = `${sanitizedFilename}.png`
    link.href = dataUrl
    link.click()
  } catch (error) {
    console.error('[Export PNG Exception]:', error)
    alert('Gagal mengunduh gambar PNG.')
  }
}
