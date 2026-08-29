import React, { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Printer, Check, Copy, Award } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { formatDateIndonesian } from '../utils/dateFormatter'
import { terbilangRupiah } from '../utils/terbilang'
import { RECEIPT_CONFIG } from '../config/stampConfig'
import { logoBaruPng, ttdFatihPng, stempelKavioEduPng, stempelLunasPng } from '../assets'

export default function ReceiptModal({ isOpen, onClose, data }) {
  const receiptRef = useRef(null)
  const [isExporting, setIsExporting] = useState(false)
  const [copiedText, setCopiedText] = useState(false)

  // ESC shortcut and body scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      document.documentElement.classList.add('lenis-stopped')
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      document.documentElement.classList.remove('lenis-stopped')
    }
  }, [isOpen, onClose])

  if (!isOpen || !data) return null

  const receiptNo = data.receiptNo || `KWT/KEEN/${(data.invoiceNo || '000').replace(/[^0-9]/g, '').slice(-6)}`
  const paymentDate = data.paymentDate || data.invoiceDate || new Date().toISOString().split('T')[0]

  // Format Telah Diterima Dari: Nama Wali (Nama Siswa) (No HP)
  const formatReceivedFrom = () => {
    let waliName = (data.parentName || '').trim()
    let siswaName = (data.studentName || '').trim()
    let phoneNum = (data.parentPhone || data.studentPhone || data.phone || '').trim()

    if (waliName.includes('(') && waliName.includes(')')) {
      const matchPhone = waliName.match(/\(([^)]+)\)/)
      if (matchPhone && matchPhone[1] && (matchPhone[1].includes('+62') || matchPhone[1].match(/[0-9]/))) {
        if (!phoneNum) phoneNum = matchPhone[1].trim()
        waliName = waliName.replace(/\([^)]+\)/, '').trim()
      }
    }

    let result = ''
    if (waliName && siswaName) {
      result = `${waliName} (${siswaName})`
    } else if (waliName) {
      result = waliName
    } else if (siswaName) {
      result = siswaName
    } else {
      result = 'Orang Tua / Wali Siswa'
    }

    if (phoneNum) {
      result += ` (${phoneNum})`
    }

    return result
  }

  const receivedFrom = formatReceivedFrom()
  const amount = data.amountPaid || data.paid || data.totalAmount || 0
  const invoiceNo = data.invoiceNo || '-'
  const description = data.description || `Pembayaran Biaya Bimbingan Belajar Paket ${data.packageType || 'GROW'}`

  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0)
  }

  // Handle Download PDF
  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return
    setIsExporting(true)
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a5'
      })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Kuitansi_${(data.studentName || 'Siswa').replace(/\s+/g, '_')}_${receiptNo.replace(/\//g, '-')}.pdf`)
    } catch (err) {
      console.error('Error generating PDF:', err)
    } finally {
      setIsExporting(false)
    }
  }

  // Handle Download PNG Image
  const handleDownloadPNG = async () => {
    if (!receiptRef.current) return
    setIsExporting(true)
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
      const link = document.createElement('a')
      link.download = `Kuitansi_${(data.studentName || 'Siswa').replace(/\s+/g, '_')}_${receiptNo.replace(/\//g, '-')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Error generating PNG:', err)
    } finally {
      setIsExporting(false)
    }
  }

  // Handle Print
  const handlePrint = () => {
    window.print()
  }

  // Handle Copy Receipt Text for WhatsApp
  const handleCopyText = () => {
    const text = `*KUITANSI PEMBAYARAN RESMI KAVIO EDU*
No. Kuitansi: ${receiptNo}
No. Invoice: ${invoiceNo}
Tanggal: ${formatDateIndonesian(paymentDate)}

Sudah Terima Dari: ${receivedFrom}
Uang Sebesar: ===== ${terbilangRupiah(amount)} =====

Untuk Pembayaran: ${description}
Jumlah Diterima: ${formatIDR(amount)}

_Keterangan: Dokumen ini merupakan bukti pembayaran resmi yang sah dari Kavio Edu._`

    navigator.clipboard.writeText(text)
    setCopiedText(true)
    setTimeout(() => setCopiedText(false), 2500)
  }

  return typeof document !== 'undefined' ? createPortal(
    <AnimatePresence>
      <motion.div
        data-lenis-prevent="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={onClose}
        className="fixed inset-0 top-0 left-0 w-screen h-screen z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-jetbrains"
      >
        <motion.div
          data-lenis-prevent="true"
          initial={{ opacity: 0, scale: 0.82, scaleY: 0.72, scaleX: 0.90, y: 48 }}
          animate={{ opacity: 1, scale: 1, scaleY: 1, scaleX: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.84, scaleY: 0.74, scaleX: 0.92, y: 38 }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 280,
            mass: 0.85,
            opacity: { duration: 0.22, ease: 'easeOut' }
          }}
          style={{ transformOrigin: '50% 85%' }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-none border border-slate-300 shadow-fluent-modal w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] my-auto font-jetbrains will-change-transform"
        >

          {/* Modal Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center flex-shrink-0 font-jetbrains">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-slate-700" />
              <h2 className="font-bold text-base text-slate-900">
                Kuitansi Pembayaran Resmi
              </h2>
            </div>
            <button onClick={onClose} title="Tutup" aria-label="Tutup" className="p-1 text-slate-500 hover:text-slate-900">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Toolbar Actions */}
          <div className="p-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs flex-shrink-0 font-jetbrains">
            <div className="flex items-center space-x-1.5">
              <button
                onClick={handleDownloadPDF}
                disabled={isExporting}
                title="Download PDF"
                aria-label="Download PDF"
                className="p-2 bg-slate-800 hover:bg-slate-900 text-white flex items-center justify-center transition-colors rounded disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownloadPNG}
                disabled={isExporting}
                title="Download PNG"
                aria-label="Download PNG"
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 flex items-center justify-center transition-colors rounded disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={handlePrint}
                title="Cetak Kuitansi"
                aria-label="Cetak Kuitansi"
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 hidden sm:flex items-center justify-center transition-colors rounded"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleCopyText}
              title={copiedText ? 'Teks Kuitansi Tersalin!' : 'Salin Teks WhatsApp'}
              aria-label="Salin Teks WhatsApp"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 flex items-center justify-center transition-colors rounded"
            >
              {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-700" />}
            </button>
          </div>

          {/* Printable Kuitansi Content Area (JetBrains Mono & Perfectly Aligned Signatures) */}
          <div className="p-6 overflow-y-auto flex-1 bg-slate-200 font-jetbrains">
            <div
              ref={receiptRef}
              className="bg-white p-8 sm:p-10 border-2 border-slate-900 max-w-2xl mx-auto space-y-6 text-slate-900 font-jetbrains relative rounded-none shadow-none"
              style={{
                backgroundImage: `linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)`,
                backgroundSize: '16px 16px'
              }}
            >
              {/* Header: Institution Info (Left) & Fiscal Metadata (Right) */}
              <div className="flex justify-between items-start text-xs font-jetbrains border-b border-slate-300 pb-4">
                <div className="flex items-center space-x-3">
                  <img src={logoBaruPng} alt="Kavio Edu" className="h-12 w-auto object-contain flex-shrink-0" />
                  <div>
                    <h1 className="font-bold text-sm text-slate-900 tracking-tight leading-snug uppercase">
                      KAVIO EDU MANAGEMENT
                    </h1>
                    <p className="text-[10px] font-semibold text-slate-700 leading-tight uppercase">
                      PRIVATE ENGLISH CLASS & ACADEMIC MENTORING
                    </p>
                  </div>
                </div>

                <div className="text-right text-[11px] font-jetbrains space-y-0.5">
                  <div className="flex justify-end space-x-2">
                    <span className="font-semibold text-slate-700">BEBAN MAK</span>
                    <span>: -</span>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <span className="font-semibold text-slate-700">BUKTI KAS / NO.</span>
                    <span>: {receiptNo}</span>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <span className="font-semibold text-slate-700">TAHUN ANGGARAN</span>
                    <span>: {new Date(paymentDate).getFullYear() || 2026}</span>
                  </div>
                </div>
              </div>

              {/* Title: Centered, Bold, Underlined */}
              <div className="text-center pt-1">
                <h2 className="text-xl font-bold text-slate-900 uppercase tracking-widest inline-block border-b-2 border-slate-900 pb-0.5">
                  KUITANSI
                </h2>
              </div>

              {/* Fields Table */}
              <div className="space-y-4 text-xs font-jetbrains pt-1">

                {/* Sudah terima dari */}
                <div className="grid grid-cols-12 gap-2 items-start">
                  <span className="col-span-4 sm:col-span-3 font-semibold text-slate-800">Sudah terima dari</span>
                  <span className="col-span-1 text-center font-bold text-slate-900">:</span>
                  <span className="col-span-7 sm:col-span-8 font-bold text-slate-900 uppercase tracking-wide leading-relaxed">
                    {receivedFrom}
                  </span>
                </div>

                {/* Uang sebesar (dengan huruf) */}
                <div className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-4 sm:col-span-3">
                    <span className="font-semibold text-slate-800 block">Uang sebesar</span>
                    <span className="text-[9px] text-slate-500 italic block">(dengan huruf)</span>
                  </div>
                  <span className="col-span-1 text-center font-bold text-slate-900">:</span>
                  <div className="col-span-7 sm:col-span-8 font-bold text-slate-900 leading-relaxed">
                    ===== {terbilangRupiah(amount)} =====
                  </div>
                </div>

                {/* Untuk pembayaran */}
                <div className="grid grid-cols-12 gap-2 items-start">
                  <span className="col-span-4 sm:col-span-3 font-semibold text-slate-800">Untuk pembayaran</span>
                  <span className="col-span-1 text-center font-bold text-slate-900">:</span>
                  <div className="col-span-7 sm:col-span-8 space-y-2 text-slate-900 leading-relaxed">
                    <p className="font-medium">{description}, dengan perincian sebagai berikut :</p>

                    {/* Itemized Breakdown Table */}
                    <div className="pl-4 sm:pl-6 space-y-1 text-[11px] pt-1">
                      <div className="flex justify-between max-w-xs">
                        <span>Biaya Investasi Kursus</span>
                        <span>: Rp. {formatIDR(data.subtotal || data.totalInvestment || amount).replace('Rp', '').trim()}</span>
                      </div>
                      {data.discountAmount > 0 && (
                        <div className="flex justify-between max-w-xs text-slate-700">
                          <span>Potongan / Diskon</span>
                          <span>: Rp. {formatIDR(data.discountAmount).replace('Rp', '').trim()}</span>
                        </div>
                      )}
                      <div className="flex justify-between max-w-xs font-bold border-t border-slate-400 pt-0.5">
                        <span>Jumlah yang diterima</span>
                        <span>: Rp. {formatIDR(amount).replace('Rp', '').trim()}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Section: Nominal Box & 3 Signatory Columns (Strictly Aligned Horizontal Baseline) */}
              <div className="pt-4 space-y-6">

                {/* 3 Signatory Headers Row */}
                <div className="grid grid-cols-3 gap-2 text-[11px] font-jetbrains text-slate-900 pt-2 items-start">
                  {/* Column 1 Header */}
                  <div className="space-y-1 text-left">
                    <p className="font-bold text-slate-900 uppercase">SETUJU DIBAYAR</p>
                    <p className="text-[10px] text-slate-700 leading-tight">
                      a.n. Management Kavio Edu<br />
                      Founder / Direktur,
                    </p>
                  </div>

                  {/* Column 2 Header */}
                  <div className="space-y-1 text-left">
                    <p className="font-semibold text-slate-900">
                      Lunas dibayar pada Tgl :<br />
                      <span className="font-bold">{formatDateIndonesian(paymentDate)}</span>
                    </p>
                    <p className="text-[10px] text-slate-700">Bendahara / Admin</p>
                  </div>

                  {/* Column 3 Header */}
                  <div className="space-y-1 text-right">
                    <p className="font-bold text-slate-900">Yang Menerima</p>
                  </div>
                </div>

                {/* 3 Signatory Names Baseline Row (Perfect Horizontal Alignment) */}
                <div className="grid grid-cols-3 gap-2 text-[11px] font-jetbrains text-slate-900 pt-16 items-end relative">
                  {/* Column 1 Name (Founder Fatih + TTD + Stempel Kavio) */}
                  <div className="text-left relative">
                    <div className="relative inline-block">
                      {/* TTD Founder Khusus Kuitansi */}
                      <img
                        src={ttdFatihPng}
                        alt="Tanda Tangan Fatih"
                        style={{
                          height: `${RECEIPT_CONFIG.signature.sizeHeightPx}px`,
                          opacity: RECEIPT_CONFIG.signature.opacity,
                          bottom: `${RECEIPT_CONFIG.signature.offsetBottomPx}px`
                        }}
                        className="absolute left-0 w-auto object-contain pointer-events-none z-20"
                      />
                      {/* Stempel Kavio Edu Khusus Kuitansi */}
                      <img
                        src={stempelKavioEduPng}
                        alt="Stempel Resmi Kavio Edu"
                        style={{
                          height: `${RECEIPT_CONFIG.kavioStamp.sizeHeightPx}px`,
                          opacity: RECEIPT_CONFIG.kavioStamp.opacity,
                          transform: `rotate(${RECEIPT_CONFIG.kavioStamp.rotationDeg}deg)`
                        }}
                        className="absolute -left-3 bottom-0 w-auto object-contain pointer-events-none z-10"
                      />
                      <p className="font-bold text-slate-900 border-b border-slate-900 pb-0.5 relative z-30">
                        Fatih Farhat Asshidiq
                      </p>
                    </div>
                    <p className="text-[9px] text-slate-600 block mt-0.5">ID: KEEN-2026-01</p>
                  </div>

                  {/* Column 2 Name (Bendahara + Stempel Lunas Khusus Kuitansi) */}
                  <div className="text-left relative">
                    <div className="relative inline-block">
                      <img
                        src={stempelLunasPng}
                        alt="Stempel Lunas"
                        style={{
                          height: `${RECEIPT_CONFIG.lunasStamp.sizeHeightPx}px`,
                          opacity: RECEIPT_CONFIG.lunasStamp.opacity,
                          transform: `rotate(${RECEIPT_CONFIG.lunasStamp.rotationDeg}deg)`
                        }}
                        className="absolute -left-3 bottom-0 w-auto object-contain pointer-events-none z-10"
                      />
                      <p className="font-bold text-slate-900 border-b border-slate-900 pb-0.5 relative z-20">
                        Admin Finance Kavio Edu
                      </p>
                    </div>
                  </div>

                  {/* Column 3 Name */}
                  <div className="text-right">
                    <p className="font-bold text-slate-900 border-b border-slate-900 inline-block pb-0.5">
                      {receivedFrom.split('(')[0].trim() || 'Wali Siswa'}
                    </p>
                  </div>
                </div>

                {/* Nominal Box (Double Horizontal Line Box Matching Reference) */}
                <div className="pt-2">
                  <div className="inline-block border-t-2 border-b-2 border-slate-900 py-1.5 px-4 text-left font-jetbrains">
                    <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      Rp. {formatIDR(amount).replace('Rp', '').trim()}
                    </span>
                  </div>
                </div>

              </div>

              {/* Kwitansi Footer Note */}
              <div className="text-[9px] text-slate-500 border-t border-slate-300 pt-2 flex justify-between items-center font-jetbrains">
                <span>Dokumen ini merupakan bukti kas / kuitansi resmi yang sah dari Kavio Edu.</span>
                <span className="font-semibold text-slate-700">kavioedu.com</span>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end flex-shrink-0 font-jetbrains">
            <button
              onClick={onClose}
              className="px-4 py-1.5 border border-slate-300 hover:bg-white text-slate-800 rounded-none text-xs font-semibold"
            >
              Tutup
            </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  ) : null
}
