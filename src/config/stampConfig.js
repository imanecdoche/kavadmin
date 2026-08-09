/**
 * KONFIGURASI STEMPEL & TANDA TANGAN DIGITAL (KAVIO EDU)
 * 
 * File ini dibuat khusus agar mudah diedit oleh siapapun (non-developer).
 * Pengaturan dipisah secara mandiri antara INVOICE dan KUITANSI (satu per satu).
 */

// =========================================================================
// 1. PENGATURAN STEMPEL & TANDA TANGAN KHUSUS PADA INVOICE (EDITOR & VIEW)
// =========================================================================
export const INVOICE_CONFIG = {
  // Stempel Resmi Kavio Edu (Ungu) pada Invoice
  kavioStamp: {
    opacity: 0.75,          // Transparansi stempel (0.1 = samar, 1.0 = pekat)
    sizeHeightPx: 100,     // Ukuran tinggi stempel dalam pixel
    rotationDeg: -12,       // Sudut kemiringan stempel (derajat)
  },

  // Tanda Tangan Digital Founder (Fatih Farhat Asshidiq) pada Invoice
  signature: {
    opacity: 0.95,          // Kejelasan / pekatnya garis tanda tangan (0.1 - 1.0)
    sizeHeightPx: 120,       // Ukuran tinggi tanda tangan dalam pixel
    offsetBottomPx: 5,     // Jarak ketinggian tanda tangan di atas garis nama (pixel)
  }
}

// =========================================================================
// 2. PENGATURAN STEMPEL & TANDA TANGAN KHUSUS PADA KUITANSI (RECEIPT MODAL)
// =========================================================================
export const RECEIPT_CONFIG = {
  // Stempel Resmi Kavio Edu (Kolom 1 Founder) pada Kuitansi
  kavioStamp: {
    opacity: 0.75,          // Transparansi stempel Kavio pada Kuitansi (0.1 - 1.0)
    sizeHeightPx: 100,      // Ukuran tinggi stempel Kavio pada Kuitansi (pixel)
    rotationDeg: -12,       // Sudut kemiringan stempel Kavio pada Kuitansi (derajat)
  },

  // Stempel LUNAS (Kolom 2 Bendahara) pada Kuitansi
  lunasStamp: {
    opacity: 0.75,          // Transparansi stempel LUNAS (0.1 - 1.0)
    sizeHeightPx: 100,     // Ukuran tinggi stempel LUNAS dalam pixel
    rotationDeg: -10,       // Sudut kemiringan stempel LUNAS dalam derajat
  },

  // Tanda Tangan Digital Founder (Fatih Farhat Asshidiq) pada Kuitansi
  signature: {
    opacity: 0.95,          // Kejelasan garis tanda tangan pada Kuitansi (0.1 - 1.0)
    sizeHeightPx: 175,   // Ukuran tinggi tanda tangan pada Kuitansi dalam pixel
    offsetBottomPx: -20,     // Jarak ketinggian tanda tangan di atas garis nama Kuitansi (pixel)
  }
}

// Compat alias for INVOICE_CONFIG
export const STAMP_CONFIG = INVOICE_CONFIG
