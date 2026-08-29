import jsPDF from 'jspdf'
import { toPng } from 'html-to-image'

/**
 * Ekspor elemen HTML ke PDF dengan penyesuaian dimensi otomatis
 * @param {string|HTMLElement} elementIdOrEl - ID atribut elemen DOM atau node HTML yang ingin dicetak
 * @param {string} filename - Nama file output tanpa ekstensi
 * @param {Object} options - Opsi format ('a4' untuk standar 210x297mm atau 'continuous' untuk 1 halaman panjang)
 */
export const exportElementToPdf = async (
  elementIdOrEl,
  filename = 'Dokumen_KavioEdu',
  options = { mode: 'a4', orientation: 'portrait' }
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

    const pdfWidth = 210 // Standar lebar A4 (mm)
    let pdfHeight = 297  // Default tinggi A4 (mm)

    let pdf
    if (options.mode === 'continuous') {
      // 1 Halaman panjang utuh proporsional (cocok untuk Roadmap & Log panjang)
      pdfHeight = (img.height * pdfWidth) / img.width
      pdf = new jsPDF({
        orientation: options.orientation || 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      })
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST')
    } else {
      // Standar Fixed A4 1 Halaman Pas (cocok untuk Invoice, Kwitansi, Rapor)
      pdf = new jsPDF({
        orientation: options.orientation || 'portrait',
        unit: 'mm',
        format: 'a4',
      })
      const imgHeight = (img.height * pdfWidth) / img.width
      const renderHeight = Math.min(imgHeight, 297)
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, renderHeight, undefined, 'FAST')
    }

    const sanitizedFilename = String(filename || 'Dokumen_KavioEdu').replace(/[^a-zA-Z0-9_-]/g, '_')
    pdf.save(`${sanitizedFilename}.pdf`)
  } catch (error) {
    console.error('[Export PDF Exception]:', error)
    alert('Gagal membuat file PDF. Silakan coba lagi.')
  }
}

/**
 * Ekspor elemen HTML ke gambar PNG resolusi tinggi
 * @param {string|HTMLElement} elementIdOrEl
 * @param {string} filename
 */
export const exportElementToPng = async (elementIdOrEl, filename = 'Dokumen_KavioEdu') => {
  const element = typeof elementIdOrEl === 'string'
    ? document.getElementById(elementIdOrEl)
    : elementIdOrEl

  if (!element) {
    console.error(`[Export PNG Error]: Elemen tidak ditemukan.`, elementIdOrEl)
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

    const link = document.createElement('a')
    const sanitizedFilename = String(filename || 'Dokumen_KavioEdu').replace(/[^a-zA-Z0-9_-]/g, '_')
    link.download = `${sanitizedFilename}.png`
    link.href = dataUrl
    link.click()
  } catch (error) {
    console.error('[Export PNG Exception]:', error)
  }
}
