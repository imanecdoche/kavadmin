import React, { useRef, useState, useEffect } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X, Download, Printer, Copy, Check, Eye } from 'lucide-react'
import { exportElementToPdf } from '../../utils/documentExportEngine'
import { terbilangRupiah } from '../../utils/terbilang'
import { logoSvg, ttdFatihPng, qrisPng } from '../../assets'

/**
 * 🏛️ DocumentPreviewModal
 * Modal Pratinjau Formal Bank-Ledger WYSIWYG untuk Kuitansi dan Invoice Kavio Edu.
 * 
 * Standar Desain:
 * - Ukuran: Hampir memenuhi seluruh layar (w-[96vw] max-w-6xl h-[94vh]).
 * - Backdrop: Solid dim hitam tanpa blur (bg-black/80).
 * - Interaktivitas: Menggunakan Radix UI Dialog primitive agar tombol toolbar atas 100% responsif & bebas konflik modal trap.
 * - Font: 'JetBrains Mono' di seluruh lembaran dokumen.
 * - Logo Kavio: Diperbesar tegas (h-14 sm:h-16 lg:h-20).
 * - Pengesahan: Cap/stempel disembunyikan sementara; tanda tangan rapi terisolasi.
 * - Anti-Overlapping: Teks terbilang bersih (tanpa 'Rupiah Rupiah'), penataan wali & siswa terpisah.
 */
export default function DocumentPreviewModal({
  isOpen,
  onClose,
  type = 'receipt', // 'receipt' | 'invoice'
  data = {},
  student = null,
}) {
  const documentRef = useRef(null)
  const [isExporting, setIsExporting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [invoicePage, setInvoicePage] = useState(1) // 1 = Rincian Tagihan, 2 = Saluran & Metode Pembayaran

  // Pause Lenis smooth scroll while preview modal is open & reset page
  useEffect(() => {
    if (isOpen) {
      setInvoicePage(1)
      document.documentElement.classList.add('lenis-stopped')
    } else {
      document.documentElement.classList.remove('lenis-stopped')
    }
    return () => {
      document.documentElement.classList.remove('lenis-stopped')
    }
  }, [isOpen])

  // Normalisasi Data Gabungan
  const mergedStudent = student || {}
  const safeData = data || {}

  // Resolusi Nama & Kontak
  const rawParent = (safeData.parentName || mergedStudent.parentName || safeData.payerName || '').trim()
  const rawStudent = (safeData.studentName || mergedStudent.name || safeData.name || 'Siswa').trim()
  const rawPhone = (safeData.parentPhone || mergedStudent.parentPhone || safeData.studentPhone || mergedStudent.studentPhone || safeData.phone || '').trim()
  const address = (safeData.address || mergedStudent.address || mergedStudent.domicile || 'Pandeglang, Banten').trim()

  const resolvedPayer = rawParent || rawStudent
  const isPayerParent = Boolean(rawParent && rawParent !== rawStudent)

  // Data Spesifik Kuitansi
  const receiptNo = safeData.receiptNumber || safeData.receiptNo || `KW/KEEN/${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}/0001`
  const paymentDate = safeData.paymentDate || safeData.date || new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
  
  const amountPaid = Number(safeData.amountPaid || safeData.amount || safeData.paidAmount || mergedStudent.paid || 0)
  const totalBill = Number(safeData.totalBill || safeData.totalInvestment || (mergedStudent.valPerMonth || 200000) * (mergedStudent.durationMonths || 1) || 200000)
  
  // Sisa Tagihan (Outstanding)
  let remainingAmount = safeData.remainingOutstanding !== undefined
    ? Number(safeData.remainingOutstanding)
    : (safeData.remainingAmount !== undefined
      ? Number(safeData.remainingAmount)
      : Math.max(0, totalBill - amountPaid))

  const isLunas = remainingAmount <= 0
  const paymentMethod = (safeData.paymentMethod || mergedStudent.paymentMethod || 'Tunai / Cash').trim()
  const packageType = (safeData.packageType || mergedStudent.packageType || 'GROW').toUpperCase()
  const durationMonths = Number(safeData.durationMonths || mergedStudent.durationMonths || 1)
  const sessionsPerMonth = Number(safeData.sessionsPerMonth || mergedStudent.sessionsPerMonth || (packageType === 'SEED' ? 3 : packageType === 'BOOST' || packageType === 'MASTER' ? 8 : 4))
  const totalSessions = sessionsPerMonth * durationMonths
  const minutesPerSession = Number(mergedStudent.minutesPerSession || 60)

  // Data Spesifik Invoice
  const invoiceNo = safeData.invoiceNo || `INV/KEEN/${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '')}/${Math.floor(Math.random() * 899 + 100)}`
  const invoiceDate = safeData.invoiceDate || paymentDate
  const dueDate = safeData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })

  // Format Nilai Mata Uang
  const formatRp = (num) => `Rp ${Number(num || 0).toLocaleString('id-ID')}`

  // Terbilang (Sanitasi Anti Duplikasi "Rupiah Rupiah")
  const rawTerbilang = String(safeData.terbilang || terbilangRupiah(amountPaid)).trim()
  const terbilangText = rawTerbilang.toLowerCase().endsWith('rupiah')
    ? rawTerbilang
    : `${rawTerbilang} Rupiah`

  // Deskripsi Pembayaran Kuitansi
  const paymentDescription = safeData.description || safeData.notes || (
    isLunas && amountPaid >= totalBill
      ? `Pelunasan Penuh Paket Bimbingan Belajar ${packageType} (${durationMonths} Bulan - ${totalSessions} Sesi)`
      : `Pembayaran Uang Muka (DP) Paket Bimbingan Belajar ${packageType} (${durationMonths} Bulan - ${totalSessions} Sesi)`
  )

  // WhatsApp Message Generator
  const generateWhatsAppMessage = () => {
    if (type === 'receipt') {
      const recipientGreeting = isPayerParent ? `Yth. Bpk/Ibu ${rawParent}` : `Yth. ${rawStudent}`
      return `*KUITANSI PEMBAYARAN RESMI KAVIO EDU*
No. Bukti : ${receiptNo}
Tanggal   : ${paymentDate}

${recipientGreeting},
Terima kasih, pembayaran bimbingan belajar telah kami terima dengan rincian:

• Diterima Dari : ${resolvedPayer}${isPayerParent ? ` (Siswa: ${rawStudent})` : ''}
• Sejumlah      : ${formatRp(amountPaid)} ("${terbilangText}")
• Untuk         : ${paymentDescription}
• Metode Bayar  : ${paymentMethod}
• Total Tagihan : ${formatRp(totalBill)}
• Sisa Tagihan  : ${isLunas ? 'LUNAS (Nihil)' : formatRp(remainingAmount)}

Bukti transaksi sah yang diterbitkan resmi oleh sistem Kavio Edu.
Salam hangat,
*Kavio Edu Academic System*`
    } else {
      const recipientGreeting = isPayerParent ? `Yth. Bpk/Ibu ${rawParent}` : `Yth. ${rawStudent}`
      return `*FAKTUR TAGIHAN (INVOICE) KAVIO EDU*
No. Faktur : ${invoiceNo}
Tanggal    : ${invoiceDate}
Jatuh Tempo: ${dueDate}

${recipientGreeting},
Berikut rincian tagihan program bimbingan belajar:

• Siswa          : ${rawStudent}
• Program Paket  : Paket ${packageType} (${durationMonths} Bulan - ${totalSessions} Sesi)
• Total Tagihan  : ${formatRp(totalBill)}
• Sudah Terbayar : ${formatRp(amountPaid)}
• Sisa Tagihan   : ${isLunas ? 'LUNAS (Nihil)' : formatRp(remainingAmount)}

*Saluran & Rekening Pembayaran Resmi:*
• QRIS    : KAVIO GLOBAL CREATIVE (Semua Bank & E-Wallet)
• BCA     : 687 248 6204 a/n Fatih Farhat Asshidiq
• e-Wallet: 0821-1150-0190 (Dana, GoPay a/n Fatih Farhat Asshidiq)

Mohon konfirmasi dan kirimkan bukti transfer setelah pembayaran dilakukan.
Terima kasih atas kepercayaan Anda kepada Kavio Edu.
Salam hangat,
*Kavio Edu Academic System*`
    }
  }

  // Handle Cetak Dokumen
  const handlePrint = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    window.print()
  }

  // Handle Unduh PDF (jsPDF + html2canvas WYSIWYG)
  const handleDownloadPDF = async (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (!documentRef.current || isExporting) return
    setIsExporting(true)
    try {
      const rawNum = type === 'receipt' ? receiptNo : `${invoiceNo}_Hal${invoicePage}`
      const filename = `${type.toUpperCase()}_${rawNum.replace(/[^a-zA-Z0-9]/g, '_')}_KavioEdu`
      await exportElementToPdf(documentRef.current, filename, {
        format: type === 'receipt' ? 'a5' : 'a4',
        orientation: type === 'receipt' ? 'landscape' : 'portrait',
        scale: 2,
        backgroundColor: '#ffffff',
      })
    } catch (err) {
      console.error('Download PDF error:', err)
      alert('Gagal mengunduh dokumen PDF.')
    } finally {
      setIsExporting(false)
    }
  }

  // Handle Salin Teks WhatsApp
  const handleCopyWA = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    navigator.clipboard.writeText(generateWhatsAppMessage())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (onClose) onClose()
  }

  const modalTitle = type === 'receipt'
    ? 'Pratinjau Kuitansi Resmi'
    : (invoicePage === 1 ? 'Pratinjau Invoice (Hal 1: Rincian)' : 'Pratinjau Invoice (Hal 2: Metode Bayar)')
  const docSubtitle = type === 'receipt' ? receiptNo : `${invoiceNo} • Hal ${invoicePage}/2`

  return (
    <DialogPrimitive.Root open={Boolean(isOpen)} onOpenChange={(open) => !open && handleClose()}>
      <DialogPrimitive.Portal>
        
        {/* SOLID DIM BACKDROP (ZERO BLUR AS REQUESTED) */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/80 print:hidden animate-in fade-in-0 duration-200 pointer-events-auto" />

        {/* TOPMOST CONTENT CONTAINER */}
        <DialogPrimitive.Content
          data-lenis-prevent="true"
          onPointerDownOutside={(e) => {
            // Biarkan tombol dan klik di luar berfungsi wajar
          }}
          className="fixed inset-0 z-[101] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden pointer-events-auto outline-none print:static print:p-0 print:bg-white"
        >
          
          {/* MODAL WINDOW: ALMOST FULLSCREEN (w-[96vw] max-w-6xl h-[94vh]) */}
          <div
            data-lenis-prevent="true"
            className="w-[96vw] max-w-6xl h-[94vh] max-h-[96vh] bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl flex flex-col overflow-hidden text-white pointer-events-auto print:w-full print:h-auto print:max-w-none print:border-none print:shadow-none print:bg-white print:text-black"
          >
            
            {/* HEADER TOOLBAR (SCREEN ONLY) */}
            <div className="px-5 py-3.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between gap-4 text-white shrink-0 select-none print:hidden">
              <div className="flex items-center gap-3 truncate">
                <Eye className="w-4 h-4 text-neutral-400 shrink-0" />
                <div className="truncate">
                  <h3 className="text-xs sm:text-sm font-bold font-mono tracking-tight text-neutral-100 uppercase truncate">
                    {modalTitle}
                  </h3>
                  <p className="text-[11px] font-mono text-neutral-400 truncate">
                    {docSubtitle}
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS TOOLBAR (100% CLICKABLE) */}
              <div className="flex items-center gap-2.5 shrink-0 pointer-events-auto">
                {/* TOGGLE HALAMAN INVOICE (HAL 1 | HAL 2) */}
                {type === 'invoice' && (
                  <div className="flex items-center bg-neutral-800 p-0.5 rounded border border-neutral-700 text-xs font-mono mr-1">
                    <button
                      type="button"
                      onClick={() => setInvoicePage(1)}
                      className={`px-2.5 py-1 rounded transition-colors cursor-pointer select-none font-semibold ${
                        invoicePage === 1
                          ? 'bg-white text-neutral-900 shadow-xs'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                      title="Halaman 1: Rincian Tagihan"
                    >
                      Hal 1: Tagihan
                    </button>
                    <button
                      type="button"
                      onClick={() => setInvoicePage(2)}
                      className={`px-2.5 py-1 rounded transition-colors cursor-pointer select-none font-semibold ${
                        invoicePage === 2
                          ? 'bg-white text-neutral-900 shadow-xs'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                      title="Halaman 2: Metode Pembayaran (QRIS, BCA, e-Wallet)"
                    >
                      Hal 2: Metode Bayar
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleCopyWA}
                  className="h-9 px-3.5 text-xs font-mono font-semibold rounded-md bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-neutral-200 border-none flex items-center gap-2 transition-colors cursor-pointer select-none"
                  title="Salin Teks WhatsApp"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Salin WA'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="h-9 px-3.5 text-xs font-mono font-semibold rounded-md bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-neutral-200 border-none hidden sm:flex items-center gap-2 transition-colors cursor-pointer select-none"
                  title="Cetak Dokumen"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak</span>
                </button>

                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handleDownloadPDF}
                  className="h-9 px-4 text-xs font-mono font-bold rounded-md bg-white hover:bg-neutral-200 active:bg-neutral-300 text-neutral-900 border-none flex items-center gap-2 transition-colors cursor-pointer shadow-sm select-none disabled:opacity-50"
                  title="Unduh Dokumen PDF"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Memproses...' : 'Unduh PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="h-9 w-9 rounded-md bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-neutral-300 hover:text-white border-none flex items-center justify-center transition-colors cursor-pointer select-none ml-1"
                  aria-label="Tutup Pratinjau"
                  title="Tutup (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PAPER SCROLL VIEWPORT (LENIS-PREVENT & OVERSCROLL-CONTAIN) */}
            <div
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-8 md:p-10 flex justify-center items-start bg-neutral-950/90 print:bg-white print:p-0 print:overflow-visible touch-pan-y"
            >
              
              {/* THE PRINTABLE PAPER SHEET */}
              <div
                ref={documentRef}
                data-lenis-prevent="true"
                className={`w-full bg-white text-black p-8 sm:p-12 border border-neutral-300 shadow-xl select-text relative font-mono print:border-none print:shadow-none print:p-0 my-auto sm:my-2 ${
                  type === 'receipt' ? 'max-w-[880px]' : 'max-w-[820px]'
                }`}
                style={{
                  fontFamily: `'JetBrains Mono', monospace`,
                  boxSizing: 'border-box',
                }}
              >
                {/* ========================================================
                    1. DOKUMEN KUITANSI PEMBAYARAN RESMI (A5 Landscape Proportions)
                   ======================================================== */}
                {type === 'receipt' && (
                  <div className="space-y-5 sm:space-y-6 text-black">
                    
                    {/* HEADER: ENLARGED LOGO & OFFICIAL METADATA */}
                    <div className="flex justify-between items-start border-b border-black pb-4 gap-6">
                      <div className="space-y-1">
                        {/* Enlarged Rebranded Vector Logo */}
                        <img
                          src={logoSvg}
                          alt="Kavio Edu"
                          className="h-14 sm:h-16 lg:h-18 w-auto object-contain"
                        />
                        <p className="text-[11px] sm:text-xs font-mono text-neutral-600 uppercase tracking-wider font-semibold">
                          Private English Class & Academic Mentoring
                        </p>
                      </div>

                      <div className="text-right font-mono text-xs sm:text-[13px] space-y-1 pt-1 shrink-0">
                        <div className="font-bold text-black uppercase tracking-wider text-sm sm:text-base">
                          KUITANSI PEMBAYARAN RESMI
                        </div>
                        <div className="text-neutral-700">
                          No. Bukti : <span className="font-bold text-black">{receiptNo}</span>
                        </div>
                        <div className="text-neutral-700">
                          Tanggal   : {paymentDate}
                        </div>
                      </div>
                    </div>

                    {/* METADATA ROWS (ANTI-OVERLAPPING & ANTI-WRAPPING TABULAR) */}
                    <div className="space-y-3 text-xs sm:text-sm pt-1 leading-relaxed">
                      
                      {/* TELAH DITERIMA DARI */}
                      <div className="flex items-start">
                        <div className="w-40 sm:w-48 shrink-0 text-neutral-700 font-semibold">
                          Telah Diterima Dari
                        </div>
                        <div className="w-4 shrink-0 font-bold text-black">:</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-black text-sm sm:text-base uppercase tracking-wide">
                            {resolvedPayer}
                          </div>
                          {isPayerParent && (
                            <div className="text-xs text-neutral-600 font-medium mt-1">
                              Siswa : <span className="font-bold text-black">{rawStudent}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* UANG SEJUMLAH (TERBILANG) - CLEAN & NO REPEATED "RUPIAH" */}
                      <div className="flex items-start">
                        <div className="w-40 sm:w-48 shrink-0 text-neutral-700 font-semibold">
                          Uang Sejumlah
                        </div>
                        <div className="w-4 shrink-0 font-bold text-black">:</div>
                        <div className="flex-1 min-w-0 italic text-neutral-900 font-medium">
                          "{terbilangText}"
                        </div>
                      </div>

                      {/* UNTUK PEMBAYARAN */}
                      <div className="flex items-start">
                        <div className="w-40 sm:w-48 shrink-0 text-neutral-700 font-semibold">
                          Untuk Pembayaran
                        </div>
                        <div className="w-4 shrink-0 font-bold text-black">:</div>
                        <div className="flex-1 min-w-0 font-semibold text-black">
                          {paymentDescription}
                        </div>
                      </div>

                      {/* METODE PEMBAYARAN */}
                      <div className="flex items-start">
                        <div className="w-40 sm:w-48 shrink-0 text-neutral-700 font-semibold">
                          Metode Pembayaran
                        </div>
                        <div className="w-4 shrink-0 font-bold text-black">:</div>
                        <div className="flex-1 min-w-0 font-bold text-black uppercase">
                          {paymentMethod}
                        </div>
                      </div>

                    </div>

                    {/* FORMAL LEDGER AMOUNT BOX (HAIRLINE BORDERS, 0px RADIUS, NO UI CARDS) */}
                    <div className="border-t border-b border-black py-3 my-4 space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between items-baseline font-bold text-base sm:text-xl">
                        <span className="uppercase tracking-wider">JUMLAH DITERIMA</span>
                        <span className="font-bold font-mono tracking-tight">{formatRp(amountPaid)},-</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-neutral-700 pt-1.5 border-t border-neutral-300">
                        <span>Total Biaya Paket : {formatRp(totalBill)}</span>
                        <span>
                          Status :{' '}
                          <strong className="text-black">
                            {isLunas ? 'LUNAS (Nihil)' : `Sisa Tagihan: ${formatRp(remainingAmount)}`}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* FOOTER & OFFICIAL AUTHENTICATION (CAP DISEMBUNYIKAN, TTD RAPI) */}
                    <div className="pt-3 flex justify-between items-end gap-6 text-xs sm:text-[13px]">
                      
                      {/* Legal Notice */}
                      <div className="max-w-[320px] sm:max-w-[380px] text-[11px] sm:text-xs text-neutral-600 space-y-1.5 leading-snug">
                        <p className="font-bold text-black">Catatan Resmi Administrasi:</p>
                        <p>
                          Bukti pembayaran sah ini diterbitkan resmi secara elektronik oleh sistem administrasi akademik Kavio Edu dan diakui sebagai tanda pelunasan yang valid.
                        </p>
                      </div>

                      {/* Signature Section (Cap disembunyikan sesuai permintaan) */}
                      <div className="text-right shrink-0">
                        <p className="text-xs sm:text-[13px] text-neutral-700">
                          Pandeglang, {paymentDate}
                        </p>
                        
                        {/* Signature Container - Disesuaikan proporsional di atas garis */}
                        <div className="h-18 sm:h-20 w-52 sm:w-56 my-1 ml-auto flex items-end justify-end">
                          <img
                            src={ttdFatihPng}
                            alt="Tanda Tangan Direktur"
                            className="h-16 sm:h-18 w-auto max-w-full object-contain pointer-events-none select-none"
                          />
                        </div>

                        <div className="border-t border-black pt-1">
                          <p className="font-bold text-black text-xs sm:text-sm leading-tight">
                            Fatih Farhat Asshidiq
                          </p>
                          <p className="text-[11px] sm:text-xs text-neutral-600 leading-tight">
                            Founder & Academic Director
                          </p>
                        </div>
                      </div>

                    </div>

                  </div>
                )}

                {/* ========================================================
                    2. DOKUMEN FAKTUR TAGIHAN RESMI (A4 Portrait Proportions)
                   ======================================================== */}
                {type === 'invoice' && invoicePage === 1 && (
                  <div className="space-y-6 text-black">
                    
                    {/* HEADER: ENLARGED LOGO & INVOICE METADATA */}
                    <div className="flex justify-between items-start border-b border-black pb-4 gap-6">
                      <div className="space-y-1">
                        <img
                          src={logoSvg}
                          alt="Kavio Edu"
                          className="h-14 sm:h-16 lg:h-18 w-auto object-contain"
                        />
                        <p className="text-[11px] sm:text-xs font-mono text-neutral-600 uppercase tracking-wider font-semibold">
                          Private English Class & Academic Mentoring
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-neutral-500 font-mono">
                          Pandeglang, Banten • contact@kavioedu.id
                        </p>
                      </div>

                      <div className="text-right font-mono text-xs sm:text-[13px] space-y-1 pt-1 shrink-0">
                        <div className="font-bold text-black uppercase tracking-wider text-sm sm:text-base">
                          FAKTUR TAGIHAN (INVOICE)
                        </div>
                        <div className="text-neutral-700">
                          No. Faktur  : <span className="font-bold text-black">{invoiceNo}</span>
                        </div>
                        <div className="text-neutral-700">
                          Tanggal     : {invoiceDate}
                        </div>
                        <div className="text-neutral-700">
                          Jatuh Tempo : <span className="font-bold text-black">{dueDate}</span>
                        </div>
                        <div className="text-neutral-500 text-[11px] pt-0.5">
                          Halaman 1 dari 2
                        </div>
                      </div>
                    </div>

                    {/* BILL TO / TAGIHAN DITUJUKAN KEPADA */}
                    <div className="border-b border-black pb-4 text-xs sm:text-sm space-y-2 leading-relaxed">
                      <div className="font-bold text-black uppercase tracking-wider text-xs mb-2">
                        TAGIHAN DITUJUKAN KEPADA:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5">
                        <div>
                          <span className="text-neutral-600">Nama Penerima : </span>
                          <strong className="text-black uppercase">{resolvedPayer}</strong>
                          {isPayerParent && (
                            <div className="text-xs text-neutral-600 mt-0.5">
                              Siswa : <strong className="text-black">{rawStudent}</strong>
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="text-neutral-600">Nomor Telepon : </span>
                          <strong className="text-black">{rawPhone || '-'}</strong>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-neutral-600">Alamat / Kota : </span>
                          <span className="text-black">{address}</span>
                        </div>
                      </div>
                    </div>

                    {/* FORMAL TABULAR ITEM LEDGER TABLE */}
                    <div className="space-y-0 text-xs sm:text-sm">
                      <div className="font-bold uppercase tracking-wider text-xs mb-2">
                        RINCIAN INVESTASI PROGRAM BELAJAR:
                      </div>

                      <table className="w-full text-left border-collapse font-mono">
                        <thead>
                          <tr className="border-t border-b border-black text-xs uppercase font-bold">
                            <th className="py-2.5 px-2 w-12 text-center">No</th>
                            <th className="py-2.5 px-2">Deskripsi Program & Silabus</th>
                            <th className="py-2.5 px-2 text-center w-32">Durasi</th>
                            <th className="py-2.5 px-2 text-right w-36">Tarif/Bln</th>
                            <th className="py-2.5 px-2 text-right w-36">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                          <tr>
                            <td className="py-3.5 px-2 text-center font-bold align-top">1</td>
                            <td className="py-3.5 px-2 align-top">
                              <div className="font-bold text-black uppercase">
                                Paket Bimbingan Belajar {packageType}
                              </div>
                              <div className="text-xs text-neutral-600 mt-1">
                                {sessionsPerMonth} Sesi/Bulan ({minutesPerSession} Menit/Sesi) • Pembelajaran Intensif CEFR
                              </div>
                            </td>
                            <td className="py-3.5 px-2 text-center align-top whitespace-nowrap">
                              {durationMonths} Bulan
                              <div className="text-[11px] text-neutral-500">({totalSessions} Sesi)</div>
                            </td>
                            <td className="py-3.5 px-2 text-right align-top whitespace-nowrap">
                              {formatRp(safeData.valPerMonth || mergedStudent.valPerMonth || 200000)}
                            </td>
                            <td className="py-3.5 px-2 text-right align-top font-bold whitespace-nowrap">
                              {formatRp(totalBill)}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* LEDGER CALCULATION SUMMARY */}
                      <div className="border-t border-black pt-3.5 space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between items-center text-neutral-700">
                          <span>Subtotal Biaya Pendidikan</span>
                          <span className="font-mono">{formatRp(totalBill)}</span>
                        </div>
                        {amountPaid > 0 && (
                          <div className="flex justify-between items-center text-neutral-700">
                            <span>Telah Dibayarkan (Uang Muka / Cicilan)</span>
                            <span className="font-mono text-black font-semibold">- {formatRp(amountPaid)}</span>
                          </div>
                        )}
                        <div className="border-t border-b border-black py-2.5 flex justify-between items-baseline font-bold text-sm sm:text-base">
                          <span className="uppercase tracking-wider">
                            {isLunas ? 'STATUS PEMBAYARAN' : 'SISA TAGIHAN (OUTSTANDING)'}
                          </span>
                          <span className="font-bold font-mono">
                            {isLunas ? 'TELAH LUNAS (Nihil)' : `${formatRp(remainingAmount)},-`}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* PAYMENT REPOSITORIES / BANK DETAILS */}
                    <div className="border border-black p-3.5 text-xs sm:text-sm space-y-1.5 leading-relaxed">
                      <div className="font-bold uppercase tracking-wider text-xs">
                        INFORMASI REKENING PEMBAYARAN RESMI:
                      </div>
                      <p className="text-neutral-700">
                        Pembayaran dapat ditransfer melalui rekening resmi akademik Kavio Edu berikut:
                      </p>
                      <div className="font-bold text-black space-y-0.5 pt-1">
                        <div>Bank Central Asia (BCA) : <span className="tracking-wider">687 248 6204</span></div>
                        <div>Atas Nama                : Fatih Farhat Asshidiq</div>
                      </div>
                      <p className="text-[11px] text-neutral-600 pt-1">
                        * QRIS (KAVIO GLOBAL CREATIVE) & e-Wallet (0821-1150-0190) tersedia lengkap pada Halaman 2 dokumen ini.
                      </p>
                    </div>

                    {/* FOOTER & OFFICIAL AUTHENTICATION (CAP DISEMBUNYIKAN, TTD RAPI) */}
                    <div className="pt-3 flex justify-between items-end gap-6 text-xs sm:text-[13px]">
                      
                      <div className="max-w-[320px] sm:max-w-[380px] text-[11px] sm:text-xs text-neutral-600 space-y-1.5 leading-snug">
                        <p className="font-bold text-black">Ketentuan Faktur:</p>
                        <p>
                          Faktur ini merupakan tagihan resmi yang diterbitkan secara elektronik oleh Kavio Edu dan berlaku sah tanpa tanda tangan basah fisik.
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs sm:text-[13px] text-neutral-700">
                          Pandeglang, {invoiceDate}
                        </p>
                        
                        {/* Signature Container - Disesuaikan proporsional di atas garis */}
                        <div className="h-18 sm:h-20 w-52 sm:w-56 my-1 ml-auto flex items-end justify-end">
                          <img
                            src={ttdFatihPng}
                            alt="Tanda Tangan Direktur"
                            className="h-16 sm:h-18 w-auto max-w-full object-contain pointer-events-none select-none"
                          />
                        </div>

                        <div className="border-t border-black pt-1">
                          <p className="font-bold text-black text-xs sm:text-sm leading-tight">
                            Fatih Farhat Asshidiq
                          </p>
                          <p className="text-[11px] sm:text-xs text-neutral-600 leading-tight">
                            Founder & Academic Director
                          </p>
                        </div>
                      </div>

                    </div>

                  </div>
                )}

                {/* ========================================================
                    2.2 INVOICE HALAMAN 2: SALURAN & METODE PEMBAYARAN RESMI
                   ======================================================== */}
                {type === 'invoice' && invoicePage === 2 && (
                  <div className="space-y-6 text-black">
                    
                    {/* HEADER HALAMAN 2: LOGO & REFERENSI INVOICE */}
                    <div className="flex justify-between items-start border-b border-black pb-4 gap-6">
                      <div className="space-y-1">
                        <img
                          src={logoSvg}
                          alt="Kavio Edu"
                          className="h-14 sm:h-16 lg:h-18 w-auto object-contain"
                        />
                        <p className="text-[11px] sm:text-xs font-mono text-neutral-600 uppercase tracking-wider font-semibold">
                          Private English Class & Academic Mentoring
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-neutral-500 font-mono">
                          Pandeglang, Banten • contact@kavioedu.id
                        </p>
                      </div>

                      <div className="text-right font-mono text-xs sm:text-[13px] space-y-1 pt-1 shrink-0">
                        <div className="font-bold text-black uppercase tracking-wider text-sm sm:text-base">
                          SALURAN & METODE PEMBAYARAN
                        </div>
                        <div className="text-neutral-700">
                          Ref. Faktur : <span className="font-bold text-black">{invoiceNo}</span>
                        </div>
                        <div className="text-neutral-700">
                          Tanggal     : {invoiceDate}
                        </div>
                        <div className="text-neutral-500 text-[11px] pt-0.5">
                          Halaman 2 dari 2
                        </div>
                      </div>
                    </div>

                    {/* METODE 1: QRIS RESMI (KAVIO GLOBAL CREATIVE) */}
                    <div className="border border-black p-5 space-y-3">
                      <div className="border-b border-neutral-300 pb-2 flex justify-between items-baseline">
                        <div>
                          <div className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">
                            Metode Pembayaran Cepat (QRIS)
                          </div>
                          <div className="text-base sm:text-lg font-bold text-black mt-0.5">
                            QRIS : KAVIO GLOBAL CREATIVE
                          </div>
                        </div>
                        <div className="text-right font-mono text-xs text-neutral-600">
                          Mendukung Seluruh Bank & e-Wallet
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-2">
                        {/* QR CODE DISPLAY */}
                        <div className="shrink-0 flex flex-col items-center">
                          <div className="border-2 border-black p-2 bg-white shadow-xs">
                            <img
                              src={qrisPng}
                              alt="QRIS Kavio Global Creative"
                              className="w-52 h-52 sm:w-60 sm:h-60 object-contain"
                            />
                          </div>
                          <span className="text-[10px] font-bold tracking-widest text-neutral-600 uppercase mt-2">
                            SCAN UNTUK MEMBAYAR
                          </span>
                        </div>

                        {/* PANDUAN LANGKAH PEMBAYARAN QRIS */}
                        <div className="flex-1 min-w-0 space-y-3 text-xs sm:text-[13px] leading-relaxed">
                          <p className="font-bold text-black uppercase tracking-wider text-xs">
                            Panduan Pembayaran QRIS:
                          </p>
                          <ol className="list-decimal pl-4 space-y-2 text-neutral-700">
                            <li>Buka aplikasi Mobile Banking (BCA, Mandiri, BRI, BNI, CIMB Niaga, dll) atau e-Wallet (GoPay, OVO, Dana, ShopeePay, LinkAja).</li>
                            <li>Pilih menu <strong>Scan / Bayar QRIS</strong> lalu arahkan kamera ponsel ke kode QR di samping.</li>
                            <li>Pastikan nama merchant yang tertera adalah: <strong className="text-black">KAVIO GLOBAL CREATIVE</strong>.</li>
                            <li>
                              Masukkan nominal pembayaran sesuai tagihan:{' '}
                              <strong className="text-black font-mono bg-neutral-100 px-1 border border-neutral-300">
                                {isLunas ? `${formatRp(totalBill)},-` : `${formatRp(remainingAmount)},-`}
                              </strong>
                            </li>
                            <li>Selesaikan verifikasi transaksi (PIN/Biometrik) dan simpan bukti struk transfer.</li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    {/* METODE 2: TRANSFER BANK & DOMPET DIGITAL (E-WALLET) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* BANK BCA */}
                      <div className="border border-black p-4 space-y-2 text-xs sm:text-[13px]">
                        <div className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold border-b border-neutral-300 pb-1">
                          Transfer Bank (BCA)
                        </div>
                        <div className="space-y-1 font-mono pt-1">
                          <div className="text-neutral-600 text-xs">Nama Bank:</div>
                          <div className="font-bold text-sm text-black">Bank Central Asia (BCA)</div>
                          <div className="text-neutral-600 text-xs pt-1">Nomor Rekening:</div>
                          <div className="text-base sm:text-lg font-bold text-black tracking-wider bg-neutral-100 p-2 border border-neutral-300 inline-block w-full">
                            687 248 6204
                          </div>
                          <div className="text-neutral-600 text-xs pt-1">Atas Nama:</div>
                          <div className="font-bold text-black">Fatih Farhat Asshidiq</div>
                        </div>
                      </div>

                      {/* DOMPET DIGITAL E-WALLET */}
                      <div className="border border-black p-4 space-y-2 text-xs sm:text-[13px]">
                        <div className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold border-b border-neutral-300 pb-1">
                          Dompet Digital (e-Wallet)
                        </div>
                        <div className="space-y-1 font-mono pt-1">
                          <div className="text-neutral-600 text-xs">Layanan Didukung:</div>
                          <div className="font-bold text-sm text-black">Dana & GoPay</div>
                          <div className="text-neutral-600 text-xs pt-1">Nomor Akun / Ponsel:</div>
                          <div className="text-base sm:text-lg font-bold text-black tracking-wider bg-neutral-100 p-2 border border-neutral-300 inline-block w-full">
                            0821-1150-0190
                          </div>
                          <div className="text-neutral-600 text-xs pt-1">Atas Nama:</div>
                          <div className="font-bold text-black">Fatih Farhat Asshidiq</div>
                        </div>
                      </div>

                    </div>

                    {/* KONFIRMASI PEMBAYARAN RESMI */}
                    <div className="border border-black p-4 text-xs sm:text-[13px] space-y-1.5 leading-relaxed font-mono">
                      <div className="font-bold uppercase tracking-wider text-xs text-black">
                        KONFIRMASI PEMBAYARAN RESMI:
                      </div>
                      <p className="text-neutral-700">
                        Setelah melakukan transfer atau pembayaran via QRIS / e-Wallet, mohon kirimkan konfirmasi dan tangkapan layar bukti transfer ke saluran resmi administrasi:
                      </p>
                      <div className="font-bold text-black space-y-0.5 pt-1">
                        <div>WhatsApp Administrasi : <strong>+62 812-9270-5685</strong></div>
                        <div>WhatsApp Direktur     : <strong>+62 821-1150-0190</strong></div>
                      </div>
                      <p className="text-[11px] text-neutral-600 pt-1 border-t border-neutral-200 mt-2">
                        Kuitansi pembayaran resmi (KW/KEEN/...) akan segera diterbitkan secara otomatis setelah verifikasi sistem kas masuk selesai.
                      </p>
                    </div>

                    {/* FOOTER HALAMAN 2 */}
                    <div className="pt-2 border-t border-black flex justify-between items-center text-[11px] text-neutral-500 font-mono">
                      <span>Kavio Edu Academic System • Pandeglang, Banten</span>
                      <span>Halaman 2 dari 2</span>
                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>

        </DialogPrimitive.Content>

      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
