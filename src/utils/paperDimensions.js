/**
 * Definisi Standar Dimensi Kertas & Utility Smart Page Break
 * Digunakan untuk modul Roadmap, Invoice, Rapor, dan Sertifikat di Kavio Edu
 */

export const PAPER_SIZES = {
  a4: {
    name: "A4",
    widthMm: 210,
    heightMm: 297,
    widthPx: 794,
    heightPx: 1123,
    pdfFormat: 'a4',
    description: '210 × 297 mm (Standar Internasional)'
  },
  f4: {
    name: "F4 / Folio",
    widthMm: 215,
    heightMm: 330,
    widthPx: 813,
    heightPx: 1247,
    pdfFormat: [215, 330],
    description: '215 × 330 mm (Standar Administrasi Indonesia)'
  },
  legal: {
    name: "US Legal",
    widthMm: 215.9,
    heightMm: 355.6,
    widthPx: 816,
    heightPx: 1344,
    pdfFormat: 'legal',
    description: '215.9 × 355.6 mm (Format Panjang US)'
  },
  letter: {
    name: "US Letter",
    widthMm: 215.9,
    heightMm: 279.4,
    widthPx: 816,
    heightPx: 1056,
    pdfFormat: 'letter',
    description: '215.9 × 279.4 mm (Format Ringkas US)'
  }
}

export const DEFAULT_PAPER_SIZE = 'a4'

/**
 * Mendapatkan konfigurasi dimensi kertas dengan fallback ke A4
 */
export const getPaperSizeConfig = (sizeKey = 'a4') => {
  const normalizedKey = String(sizeKey || 'a4').toLowerCase()
  return PAPER_SIZES[normalizedKey] || PAPER_SIZES.a4
}

/**
 * Estimasi tinggi komponen SessionCard (dalam pixel) untuk perhitungan page break
 */
export const estimateSessionCardHeight = (session) => {
  // Base card height: metadata row (~16px) + title row (~20px) + progress bar (~14px) + dividers & paddings (~32px)
  let height = 82

  if (session && session.description && typeof session.description === 'string') {
    const desc = session.description.trim()
    if (desc.length > 0) {
      // Rata-rata ~60 karakter per baris pada font text-xs (line-height ~17px)
      const lines = Math.max(1, Math.ceil(desc.length / 60))
      height += (lines * 17) + 6
    }
  }

  return height
}

/**
 * Sistem Pemotongan Halaman Pintar (Smart Page Break):
 * Membagi daftar session cards ke dalam beberapa halaman secara deterministik
 * sehingga tidak ada sessionCard yang terbelah/terpotong di batas bawah halaman.
 *
 * @param {Array} sessions - Daftar sesi roadmap
 * @param {string} paperSizeKey - Kunci ukuran kertas ('a4', 'f4', 'legal', 'letter')
 * @returns {Array<Array>} Array of session arrays (satu array per halaman)
 */
export const paginateRoadmapSessions = (sessions = [], paperSizeKey = 'a4') => {
  const paper = getPaperSizeConfig(paperSizeKey)
  const pageHeight = paper.heightPx
  const paddingVertical = 70 // padding vertikal (p-8 / p-10)

  // Konstanta tinggi elemen statis
  const PAGE1_HEADER_HEIGHT = 270 // Header utama + Title Banner + Student Profile Strip + Dividers
  const CONTINUATION_HEADER_HEIGHT = 65 // Sub-header halaman lanjutan
  const FOOTER_HEIGHT = 175 // Blok tanda tangan, stempel, & verifikasi legal
  const PAGE_NUMBER_HEIGHT = 25 // Baris nomor halaman di footer

  if (!Array.isArray(sessions) || sessions.length === 0) {
    return [[]]
  }

  // Hitung total estimasi tinggi seluruh kartu
  const totalCardsHeight = sessions.reduce((acc, s) => acc + estimateSessionCardHeight(s), 0)

  // Cek apakah muat dalam 1 halaman utuh
  const singlePageNeeded = paddingVertical + PAGE1_HEADER_HEIGHT + totalCardsHeight + FOOTER_HEIGHT + PAGE_NUMBER_HEIGHT
  if (singlePageNeeded <= pageHeight) {
    return [sessions]
  }

  // Multi-halaman: hitung ruang efektif yang tersedia
  const pages = []
  let currentPageSessions = []
  let currentUsedHeight = 0
  let isFirstPage = true

  // Ruang maksimal untuk kartu di halaman 1 (tanpa footer tanda tangan)
  const page1MaxHeight = pageHeight - paddingVertical - PAGE1_HEADER_HEIGHT - PAGE_NUMBER_HEIGHT - 20
  // Ruang maksimal untuk kartu di halaman tengah
  const middlePageMaxHeight = pageHeight - paddingVertical - CONTINUATION_HEADER_HEIGHT - PAGE_NUMBER_HEIGHT - 20
  // Ruang maksimal untuk kartu di halaman terakhir (harus muat footer tanda tangan)
  const lastPageMaxHeight = pageHeight - paddingVertical - CONTINUATION_HEADER_HEIGHT - FOOTER_HEIGHT - PAGE_NUMBER_HEIGHT - 20

  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i]
    const cardHeight = estimateSessionCardHeight(session)
    const maxAllowed = isFirstPage ? page1MaxHeight : middlePageMaxHeight

    if (currentPageSessions.length > 0 && (currentUsedHeight + cardHeight > maxAllowed)) {
      pages.push(currentPageSessions)
      currentPageSessions = [session]
      currentUsedHeight = cardHeight
      isFirstPage = false
    } else {
      currentPageSessions.push(session)
      currentUsedHeight += cardHeight
    }
  }

  if (currentPageSessions.length > 0) {
    // Jika halaman terakhir terlalu padat bersama footer tanda tangan, pisahkan dengan rapi
    if (pages.length > 0 && currentUsedHeight > lastPageMaxHeight && currentPageSessions.length > 1) {
      const movedSession = currentPageSessions.pop()
      pages.push(currentPageSessions)
      pages.push([movedSession])
    } else {
      pages.push(currentPageSessions)
    }
  }

  return pages.length > 0 ? pages : [[]]
}
