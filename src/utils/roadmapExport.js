import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Helper untuk membuat clone elemen yang bersih di luar layar (Off-Screen)
 * bebas dari efek transform scale, zoom, dan font subpixel glitch.
 */
const createCleanOffscreenClone = (element) => {
  const clone = element.cloneNode(true)
  
  // Container isolasi di luar layar
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.top = '0'
  container.style.left = '-10000px'
  container.style.width = '794px'
  container.style.zIndex = '-9999'
  container.style.opacity = '1'
  container.style.pointerEvents = 'none'

  // Paksa gaya standar bebas distorsi pada clone
  clone.style.transform = 'none'
  clone.style.webkitTransform = 'none'
  clone.style.margin = '0'
  clone.style.padding = '32px'
  clone.style.width = '794px'
  clone.style.maxWidth = '794px'
  clone.style.minHeight = 'auto'
  clone.style.height = 'auto'
  clone.style.boxSizing = 'border-box'
  clone.style.backgroundColor = '#ffffff'
  clone.style.fontFamily = 'Arial, Helvetica, sans-serif'

  // Normalisasi seluruh elemen teks di dalam clone
  const allElements = clone.querySelectorAll('*')
  allElements.forEach((el) => {
    el.style.letterSpacing = '0px'
    el.style.wordSpacing = 'normal'
    el.style.fontFamily = 'Arial, Helvetica, sans-serif'
    
    // Cegah pemotongan baris/huruf
    const computedStyle = window.getComputedStyle(el)
    if (computedStyle.display === 'inline') {
      el.style.display = 'inline-block'
    }
  })

  container.appendChild(clone)
  document.body.appendChild(container)

  return { container, targetElement: clone }
}

export const exportRoadmapToPdf = async (elementId = 'roadmap-export-canvas', studentName = 'Student', batch = 'Batch') => {
  const sourceElement = typeof elementId === 'string'
    ? document.getElementById(elementId) || document.getElementById('roadmap-export-canvas')
    : elementId

  if (!sourceElement) {
    alert('Elemen roadmap tidak ditemukan.')
    return
  }

  let offscreen = null
  try {
    if (document.fonts) {
      await document.fonts.ready
    }

    // 1. Buat clone bersih di luar viewport
    offscreen = createCleanOffscreenClone(sourceElement)

    // 2. Capture dari elemen clone murni
    const canvas = await html2canvas(offscreen.targetElement, {
      scale: 2, // Kualitas HD tajam
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      windowWidth: 794
    })

    const imgData = canvas.toDataURL('image/png', 1.0)

    // 3. Setup Custom Continuous Single Page PDF (1 Halaman Utuh)
    const pdfWidth = 210 // mm
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width // mm proporsional

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [pdfWidth, pdfHeight] // Kunci 1 halaman panjang tanpa page break
    })

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST')

    const sanitizedName = String(studentName || 'Student').replace(/[^a-zA-Z0-9]/g, '_')
    const sanitizedBatch = String(batch || 'Batch').replace(/[^a-zA-Z0-9]/g, '_')
    pdf.save(`Roadmap_KavioEdu_${sanitizedName}_${sanitizedBatch}.pdf`)
  } catch (error) {
    console.error('[PDF Export Fatal Error]:', error)
    alert('Terjadi kesalahan saat memproses file PDF.')
  } finally {
    // Bersihkan elemen clone dari DOM
    if (offscreen && offscreen.container) {
      document.body.removeChild(offscreen.container)
    }
  }
}

export const exportRoadmapToPng = async (elementId = 'roadmap-export-canvas', studentName = 'Student', batch = 'Batch') => {
  const sourceElement = typeof elementId === 'string'
    ? document.getElementById(elementId) || document.getElementById('roadmap-export-canvas')
    : elementId

  if (!sourceElement) return

  let offscreen = null
  try {
    if (document.fonts) {
      await document.fonts.ready
    }

    offscreen = createCleanOffscreenClone(sourceElement)

    const canvas = await html2canvas(offscreen.targetElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      windowWidth: 794
    })

    const link = document.createElement('a')
    const sanitizedName = String(studentName || 'Student').replace(/[^a-zA-Z0-9]/g, '_')
    const sanitizedBatch = String(batch || 'Batch').replace(/[^a-zA-Z0-9]/g, '_')
    link.download = `Roadmap_KavioEdu_${sanitizedName}_${sanitizedBatch}.png`
    link.href = canvas.toDataURL('image/png', 1.0)
    link.click()
  } catch (error) {
    console.error('[PNG Export Error]:', error)
  } finally {
    if (offscreen && offscreen.container) {
      document.body.removeChild(offscreen.container)
    }
  }
}
