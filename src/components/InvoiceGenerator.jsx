import React, { useState, useRef, useEffect } from 'react'
import {
  Download,
  Copy,
  Check,
  FileText,
  Printer,
  Share2,
  Palette,
  Receipt,
  ArrowLeftRight
} from 'lucide-react'
import { exportElementToPdf, exportElementToPng } from '../utils/documentExportEngine'
import { PACKAGE_RATES } from './Dashboard'
import { generateInvoiceShareLink } from '../utils/invoiceShare'
import { formatDateIndonesian } from '../utils/dateFormatter'
import InvoiceThemerStudio, { BUILTIN_THEMES } from './InvoiceThemerStudio'
import ReceiptModal from './ReceiptModal'
import { INVOICE_CONFIG } from '../config/stampConfig'
import { logoSvg, ttdFatihPng, stempelKavioEduPng } from '../assets'

export default function InvoiceGenerator({ students = [], selectedStudent, onSaveInvoiceToHistory, onSaveToDashboard }) {
  const invoiceRef = useRef(null)

  // Auto-generate Invoice Number with pattern: INV/KEEN/ddmmyy/nomoracakunik
  const generateInvoiceNo = () => {
    const today = new Date()
    const dd = String(today.getDate()).padStart(2, '0')
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const yy = String(today.getFullYear()).slice(-2)
    const ddmmyy = `${dd}${mm}${yy}`
    const randomNum = String(Math.floor(Math.random() * 900) + 100)
    return `INV/KEEN/${ddmmyy}/${randomNum}`
  }

  // Today's local date string YYYY-MM-DD (realtime system date)
  const getTodayDateStr = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Helper to add default 7 days due date
  const getDefaultDueDateStr = (fromDateStr) => {
    try {
      const d = fromDateStr ? new Date(fromDateStr) : new Date()
      d.setDate(d.getDate() + 7)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    } catch (e) {
      return fromDateStr
    }
  }

  const [invoiceNo, setInvoiceNo] = useState(generateInvoiceNo())
  const [invoiceDate, setInvoiceDate] = useState(getTodayDateStr())
  const [dueDate, setDueDate] = useState(() => getDefaultDueDateStr(getTodayDateStr()))

  // Empty initial fields & Autocomplete States
  const [studentName, setStudentName] = useState('')
  const [parentName, setParentName] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [studentPhone, setStudentPhone] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isStudentLocked, setIsStudentLocked] = useState(false)

  const [packageType, setPackageType] = useState('GROW')
  const [customValPerMonth, setCustomValPerMonth] = useState('')
  const [customSessionsPerMonth, setCustomSessionsPerMonth] = useState('')
  const [durationMonths, setDurationMonths] = useState(1)
  const [discountType, setDiscountType] = useState('PERCENT') // 'PERCENT' or 'FIXED'
  const [discountValue, setDiscountValue] = useState(0)

  const [paymentType, setPaymentType] = useState('FULL') // FULL, DP50, CUSTOM
  const [customPaidAmount, setCustomPaidAmount] = useState('')
  const [notes, setNotes] = useState('')

  const [copied, setCopied] = useState(false)
  const [copiedShareLink, setCopiedShareLink] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)

  // Invoice Themer State (Desktop Only)
  const [isThemerOpen, setIsThemerOpen] = useState(false)
  const [currentTheme, setCurrentTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('kavio_active_invoice_theme')
      if (saved) return JSON.parse(saved)
    } catch (e) { }
    return BUILTIN_THEMES[0]
  })

  const handleApplyTheme = (themeObj) => {
    setCurrentTheme(themeObj)
    try {
      localStorage.setItem('kavio_active_invoice_theme', JSON.stringify(themeObj))
    } catch (e) { }
  }

  const prevSelectedIdRef = useRef(null)
  const durationInputRef = useRef(null)

  useEffect(() => {
    const el = durationInputRef.current
    if (!el) return

    const handleWheel = (e) => {
      e.preventDefault()
      e.stopPropagation()
      const delta = e.deltaY < 0 ? 1 : -1
      setDurationMonths((prev) => Math.max(1, (Number(prev) || 0) + delta))
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', handleWheel)
    }
  }, [])

  const getInvoiceDataPayload = () => ({
    invoiceNo,
    invoiceDate,
    dueDate,
    studentName,
    parentName,
    parentPhone,
    studentPhone,
    packageType,
    durationMonths,
    valPerMonth,
    totalSessions,
    subtotal,
    discountPercent: pct,
    discountAmount,
    totalInvestment,
    paidAmount,
    outstandingBalance,
    status: statusBadge?.label || 'LUNAS',
    notes
  })

  const handleCopyShareLink = () => {
    const link = generateInvoiceShareLink(getInvoiceDataPayload())
    navigator.clipboard.writeText(link)
    setCopiedShareLink(true)
    setTimeout(() => setCopiedShareLink(false), 2000)
  }

  // Helper to format parent text: "Nama Wali (08123456789)"
  const formatParentDisplayText = (st) => {
    if (!st) return ''
    const pName = st.parentName || ''
    const pPhone = st.parentPhone || ''
    if (pName && pPhone) return `${pName} (${pPhone})`
    if (pName) return pName
    if (pPhone) return pPhone
    return ''
  }

  // Select student from suggestions or selection
  const handleSelectStudent = (st) => {
    if (!st) return
    setStudentName(st.name || '')
    const parentText = formatParentDisplayText(st)
    setParentName(parentText)
    setParentPhone(st.parentPhone || '')
    setStudentPhone(st.studentPhone || '')
    setIsStudentLocked(true)
    setShowSuggestions(false)

    // Auto-populate Package Type & Duration from Validated Student Data
    if (st.packageType) setPackageType(st.packageType)
    if (st.durationMonths) setDurationMonths(Number(st.durationMonths) || 1)
    if (st.packageType === 'CUSTOM') {
      setCustomValPerMonth(st.valPerMonth || '')
      setCustomSessionsPerMonth(st.sessionsPerMonth || '')
    }

    // Auto-populate Payment Type & Amount
    const totalInv = (st.valPerMonth || 0) * (st.durationMonths || 1)
    if (st.paid >= totalInv && totalInv > 0) {
      setPaymentType('FULL')
    } else if (st.paid > 0) {
      setPaymentType('DP50')
      setCustomPaidAmount(st.paid || '')
    } else {
      setPaymentType('CUSTOM')
      setCustomPaidAmount(st.paid || '')
    }
  }

  // Handle typing in studentName input
  const handleStudentNameChange = (e) => {
    const val = e.target.value
    setStudentName(val)
    setShowSuggestions(true)

    const safeList = Array.isArray(students) ? students : []
    const matched = safeList.find(s => (s.name || '').toLowerCase() === val.toLowerCase().trim())

    if (matched) {
      handleSelectStudent(matched)
    } else {
      setIsStudentLocked(false)
    }
  }

  // Populate from Dashboard selection only when selectedStudent actually changes
  useEffect(() => {
    if (selectedStudent && selectedStudent.id !== prevSelectedIdRef.current) {
      prevSelectedIdRef.current = selectedStudent.id
      handleSelectStudent(selectedStudent)

      const totalInv = (selectedStudent.valPerMonth || 0) * (selectedStudent.durationMonths || 1)
      if (selectedStudent.paid >= totalInv && totalInv > 0) {
        setPaymentType('FULL')
      } else if (selectedStudent.paid > 0) {
        setPaymentType('DP50')
        setCustomPaidAmount(selectedStudent.paid || '')
      } else {
        setPaymentType('CUSTOM')
        setCustomPaidAmount(selectedStudent.paid || '')
      }

      setNotes(selectedStudent.notes || '')
    }
  }, [selectedStudent])

  // Calculation Logic
  let valPerMonth = 0
  let sessionsPerMonth = 0

  if (packageType === 'CUSTOM') {
    valPerMonth = Number(customValPerMonth) || 0
    sessionsPerMonth = Number(customSessionsPerMonth) || 0
  } else {
    const rate = PACKAGE_RATES[packageType] || PACKAGE_RATES.GROW
    valPerMonth = rate.valPerMonth
    sessionsPerMonth = rate.sessionsPerMonth
  }

  const subtotal = valPerMonth * Number(durationMonths)
  const totalSessions = sessionsPerMonth * Number(durationMonths)

  let discountAmount = 0
  let pct = 0
  if (discountType === 'PERCENT') {
    pct = Math.max(0, Math.min(100, Number(discountValue) || 0))
    discountAmount = Math.round((subtotal * pct) / 100)
  } else {
    discountAmount = Math.max(0, Math.min(subtotal, Number(discountValue) || 0))
    pct = subtotal > 0 ? Math.round((discountAmount / subtotal) * 100) : 0
  }
  const totalInvestment = Math.max(0, subtotal - discountAmount)

  const toggleDiscountType = () => {
    if (discountType === 'PERCENT') {
      const nominal = Math.round((subtotal * (Number(discountValue) || 0)) / 100)
      setDiscountType('FIXED')
      setDiscountValue(nominal > 0 ? nominal : '')
    } else {
      const percent = subtotal > 0 ? Math.min(100, Math.round(((Number(discountValue) || 0) / subtotal) * 100)) : 0
      setDiscountType('PERCENT')
      setDiscountValue(percent > 0 ? percent : '')
    }
  }

  let paidAmount = 0
  if (paymentType === 'FULL') {
    paidAmount = totalInvestment
  } else if (paymentType === 'DP50') {
    if (customPaidAmount !== '' && Number(customPaidAmount) > 0 && Number(customPaidAmount) < totalInvestment) {
      paidAmount = Number(customPaidAmount)
    } else {
      paidAmount = totalInvestment * 0.5
    }
  } else {
    paidAmount = Number(customPaidAmount) || 0
  }

  const outstandingBalance = Math.max(0, totalInvestment - paidAmount)
  const paidPct = totalInvestment > 0 ? Math.min(100, Math.round((paidAmount / totalInvestment) * 100)) : 0
  const dpPercentValue = totalInvestment > 0 && paidAmount > 0 && paidAmount < totalInvestment
    ? Math.round((paidAmount / totalInvestment) * 100)
    : 50

  // Status Text Logic
  const isLunas = paidAmount >= totalInvestment && totalInvestment > 0
  let statusBadge = { label: 'BELUM BAYAR', text: 'text-rose-600' }
  if (isLunas) {
    statusBadge = { label: 'LUNAS (100%)', text: 'text-emerald-600' }
  } else if (paidAmount > 0) {
    statusBadge = { label: `TERBAYAR (${paidPct}%)`, text: 'text-amber-600' }
  }

  const formatIDR = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount || 0)
  }

  const formatNumberWithDots = (val) => {
    if (val === '' || val === null || val === undefined) return ''
    const clean = String(val).replace(/\D/g, '')
    if (!clean) return ''
    return new Intl.NumberFormat('id-ID').format(Number(clean))
  }

  // Format WhatsApp Message with Shareable Link
  const generateWhatsAppMessage = () => {
    const sName = studentName || '-'
    const studentText = parentName ? `${sName} (Anak dari ${parentName})` : sName
    const shareUrl = generateInvoiceShareLink(getInvoiceDataPayload())
    const dueDateLine = isLunas ? '' : `Jatuh Tempo: ${formatDateIndonesian(dueDate)}\n`

    return `Yth. Bpk/Ibu ${parentName || sName},

Berikut kami sampaikan rincian INVOICE Kursus Private English Class Kavio Edu:

Nomor Invoice: ${invoiceNo}
Tanggal Terbit: ${formatDateIndonesian(invoiceDate)}
${dueDateLine}Nama Siswa: ${studentText}
Paket Belajar: ${packageType} (${durationMonths} Bulan / Total ${totalSessions} Sesi)
Total Investasi: ${formatIDR(totalInvestment)}
Jumlah Terbayar: ${formatIDR(paidAmount)}
Outstanding: ${formatIDR(outstandingBalance)}
Status: ${statusBadge.label}

Link Resmi Invoice (Bisa dibuka di browser & didownload PDF/PNG):
${shareUrl}

Metode Pembayaran Resmi Kavio Edu:
1. BCA: 6872486204 a.n. FATIH FARHAT ASSHIDIQ
2. Blu by BCA: 007187161271 a.n. FATIH FARHAT ASSHIDIQ
3. E-Wallet (GoPay/DANA/ShopeePay): 082111500190

Catatan: ${notes || 'Terima kasih atas kepercayaan Anda memilih Kavio Edu.'}

Hormat kami,
Kavio Edu Management`
  }

  // Trigger saving invoice history to student record
  const saveInvoiceHistory = () => {
    if (onSaveInvoiceToHistory && studentName) {
      onSaveInvoiceToHistory({
        invoiceNo,
        invoiceDate,
        dueDate,
        studentName,
        totalInvestment,
        paidAmount,
        status: statusBadge.label
      })
    }
  }

  // Handle Copy WA
  const handleCopyWA = () => {
    saveInvoiceHistory()
    navigator.clipboard.writeText(generateWhatsAppMessage())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Handle Download PDF
  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return
    saveInvoiceHistory()
    setIsExporting(true)

    try {
      const filename = `${invoiceNo.replace(/\//g, '_')}_KavioEdu`
      await exportElementToPdf(invoiceRef.current, filename, { mode: 'a4', orientation: 'portrait' })
    } catch (err) {
      console.error('Export PDF error:', err)
    } finally {
      setIsExporting(false)
    }
  }

  // Handle Download PNG
  const handleDownloadPNG = async () => {
    if (!invoiceRef.current) return
    saveInvoiceHistory()
    setIsExporting(true)

    try {
      const filename = `${invoiceNo.replace(/\//g, '_')}_KavioEdu`
      await exportElementToPng(invoiceRef.current, filename)
    } catch (err) {
      console.error('Export PNG error:', err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-fluent-text tracking-tight">
            Invoice Generator
          </h1>
          <p className="text-xs text-fluent-textSecondary mt-0.5">
            Buat dan kelola dokumen invoice resmi Kavio Edu.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Desktop Only Invoice Themer Toggle Button */}
          <button
            onClick={() => setIsThemerOpen(!isThemerOpen)}
            className={`hidden lg:flex items-center justify-center p-2.5 border rounded-fluent transition-colors ${isThemerOpen
              ? 'bg-fluent-blue text-white border-fluent-blue shadow-xs'
              : 'border-fluent-border bg-white text-fluent-text hover:bg-fluent-subtle'
              }`}
            title="Studio Desain Tema Invoice"
            aria-label="Studio Desain Tema Invoice"
          >
            <Palette className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopyShareLink}
            className="p-2.5 border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded-fluent transition-colors flex items-center justify-center"
            title="Salin Link Berbagi Publik"
            aria-label="Salin Link Berbagi Publik"
          >
            {copiedShareLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-fluent-blue" />}
          </button>
          <button
            onClick={() => window.print()}
            className="p-2.5 border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded-fluent transition-colors flex items-center justify-center"
            title="Cetak Invoice"
            aria-label="Cetak Invoice"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownloadPNG}
            disabled={isExporting}
            className="p-2.5 border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded-fluent transition-colors flex items-center justify-center disabled:opacity-50"
            title="Download Gambar PNG"
            aria-label="Download Gambar PNG"
          >
            <Download className="w-4 h-4 text-fluent-blue" />
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="p-2.5 bg-fluent-blue hover:bg-fluent-blueHover text-white rounded-fluent transition-colors flex items-center justify-center shadow-xs disabled:opacity-50"
            title="Download PDF"
            aria-label="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsReceiptModalOpen(true)}
            className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-fluent flex items-center justify-center transition-colors shadow-2xs"
            title="Cetak Kwitansi Pembayaran Resmi"
            aria-label="Cetak Kwitansi Pembayaran Resmi"
          >
            <Receipt className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      </div>

      {/* Invoice Themer Studio Panel (Desktop Only) */}
      {isThemerOpen && (
        <InvoiceThemerStudio
          currentTheme={currentTheme}
          onApplyTheme={handleApplyTheme}
          onSaveThemeToLibrary={(newTheme) => {
            handleApplyTheme(newTheme)
          }}
        />
      )}

      {/* Main 2-Column Grid: Form & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 bg-white p-5 rounded-fluent border border-fluent-border shadow-fluent space-y-4 no-print">
          <h2 className="text-base font-bold text-fluent-text border-b border-fluent-border pb-3 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-fluent-blue" />
            <span>Form Input Invoice</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
              Nomor Invoice
            </label>
            <input
              type="text"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
            />
          </div>

          <div className={isLunas ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-2 gap-3'}>
            <div>
              <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                Tanggal Terbit
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => {
                  const newDate = e.target.value
                  setInvoiceDate(newDate)
                  setDueDate(getDefaultDueDateStr(newDate))
                }}
                className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
              />
            </div>
            {!isLunas && (
              <div>
                <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                  Tanggal Jatuh Tempo
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-amber-300 rounded-fluent focus:outline-none focus:border-amber-500 font-medium text-amber-900 bg-amber-50/60"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nama Siswa Field with Autocomplete Dropdown */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-fluent-textSecondary">
                  Nama Siswa *
                </label>
                {isStudentLocked && (
                  <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
                )}
              </div>
              <input
                type="text"
                required
                value={studentName}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onChange={handleStudentNameChange}
                placeholder="Contoh: Han / ketik nama..."
                className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-medium"
              />

              {/* Autosuggestions Dropdown Menu */}
              {showSuggestions && studentName.trim().length > 0 && (
                <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white border border-fluent-border rounded-fluent shadow-lg max-h-48 overflow-y-auto">
                  {(Array.isArray(students) ? students : [])
                    .filter(st => (st.name || '').toLowerCase().includes(studentName.toLowerCase().trim()))
                    .map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onMouseDown={() => handleSelectStudent(st)}
                        className="w-full text-left px-3 py-2 hover:bg-fluent-subtle border-b border-slate-100 last:border-0 text-xs transition-colors flex items-center justify-between"
                      >
                        <span className="font-semibold text-fluent-text">{st.name}</span>
                        <span className="text-[11px] font-semibold text-fluent-blue">
                          {st.packageType || 'GROW'}
                        </span>
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Nama Wali Field (Locked when student is registered) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-fluent-textSecondary">
                  Nama Wali & No. HP
                </label>
                {isStudentLocked && (
                  <button
                    type="button"
                    onClick={() => setIsStudentLocked(false)}
                    className="text-[10px] text-fluent-blue hover:underline font-semibold"
                    title="Klik untuk mengedit Wali secara manual"
                  >
                    Ubah Manual
                  </button>
                )}
              </div>
              <input
                type="text"
                value={parentName}
                readOnly={isStudentLocked}
                onChange={(e) => !isStudentLocked && setParentName(e.target.value)}
                placeholder="Ibu Eli (08123456789)"
                className={`w-full px-3 py-1.5 text-xs border rounded-fluent transition-colors ${isStudentLocked
                  ? 'bg-slate-100 border-slate-300 text-slate-700 cursor-not-allowed font-medium'
                  : 'border-fluent-border bg-white text-fluent-text focus:outline-none focus:border-fluent-blue'
                  }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                Pilihan Paket
              </label>
              <select
                value={packageType}
                onChange={(e) => setPackageType(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue bg-white"
              >
                <option value="SEED">SEED (Rp 150.000 / 3 Sesi)</option>
                <option value="GROW">GROW (Rp 200.000 / 4 Sesi)</option>
                <option value="BOOST">BOOST (Rp 400.000 / 8 Sesi)</option>
                <option value="MASTER">MASTER (Rp 500.000 / 8 Sesi)</option>
                <option value="CUSTOM">CUSTOM</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                Durasi (Bulan)
              </label>
              <input
                ref={durationInputRef}
                type="number"
                min="1"
                data-lenis-prevent
                value={durationMonths}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10) || 1)
                  setDurationMonths(val)
                }}
                onBlur={() => {
                  if (!durationMonths || Number(durationMonths) < 1) {
                    setDurationMonths(1)
                  }
                }}
                placeholder="1"
                className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue bg-white overscroll-contain [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                Diskon ({discountType === 'PERCENT' ? '%' : 'Rp'})
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max={discountType === 'PERCENT' ? 100 : subtotal}
                  value={discountValue}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === '') {
                      setDiscountValue('')
                    } else if (discountType === 'PERCENT') {
                      setDiscountValue(Math.max(0, Math.min(100, Number(val) || 0)))
                    } else {
                      setDiscountValue(Math.max(0, Math.min(subtotal, Number(val) || 0)))
                    }
                  }}
                  placeholder="0"
                  className="w-full pl-3 pr-7 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-bold text-emerald-700 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={toggleDiscountType}
                  title={discountType === 'PERCENT' ? 'Ganti ke Diskon Nominal (Rp)' : 'Ganti ke Diskon Persentase (%)'}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-fluent-blue hover:bg-slate-100 rounded transition-colors flex items-center justify-center"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {packageType === 'CUSTOM' && (
            <div className="grid grid-cols-2 gap-3 bg-fluent-subtle p-3 rounded border border-fluent-border">
              <div>
                <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                  Harga/Bulan (Rp)
                </label>
                <input
                  type="number"
                  value={customValPerMonth}
                  onChange={(e) => setCustomValPerMonth(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-1 text-xs border border-fluent-border rounded focus:outline-none focus:border-fluent-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                  Sesi/Bulan
                </label>
                <input
                  type="number"
                  value={customSessionsPerMonth}
                  onChange={(e) => setCustomSessionsPerMonth(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-1 text-xs border border-fluent-border rounded focus:outline-none focus:border-fluent-blue"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
              Tipe Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentType('FULL')}
                className={`py-1.5 px-2 text-xs font-medium rounded-fluent border ${paymentType === 'FULL'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold'
                  : 'border-fluent-border bg-white text-fluent-text'
                  }`}
              >
                LUNAS (100%)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentType('DP50')
                  if (!customPaidAmount || Number(customPaidAmount) <= 0 || Number(customPaidAmount) >= totalInvestment) {
                    setCustomPaidAmount(totalInvestment * 0.5)
                  }
                }}
                className={`py-1.5 px-2 text-xs font-medium rounded-fluent border ${paymentType === 'DP50'
                  ? 'bg-amber-50 border-amber-500 text-amber-700 font-bold'
                  : 'border-fluent-border bg-white text-fluent-text'
                  }`}
              >
                DP ({dpPercentValue}%)
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('CUSTOM')}
                className={`py-1.5 px-2 text-xs font-medium rounded-fluent border ${paymentType === 'CUSTOM'
                  ? 'bg-fluent-blue/10 border-fluent-blue text-fluent-blue font-bold'
                  : 'border-fluent-border bg-white text-fluent-text'
                  }`}
              >
                Kustom Nominal
              </button>
            </div>
          </div>

          {paymentType === 'CUSTOM' && (
            <div>
              <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                Terbayar
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-semibold text-fluent-textSecondary pointer-events-none select-none">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatNumberWithDots(customPaidAmount)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '')
                    setCustomPaidAmount(raw === '' ? '' : Number(raw))
                  }}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-1.5 text-sm border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-medium"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
              Catatan / Terms Khusus
            </label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan pembayaran..."
              className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
            ></textarea>
          </div>

          {/* Quick Copy WhatsApp Prompt */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleCopyWA}
              title={copied ? 'Pesan WhatsApp Tersalin!' : 'Salin Pesan WhatsApp Invoice'}
              aria-label="Salin Pesan WhatsApp Invoice"
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-fluent flex items-center justify-center transition-colors shadow-xs"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Right Column: Live Printable Invoice Preview */}
        <div className="lg:col-span-7 flex flex-col items-center">

          <div
            ref={invoiceRef}
            className={`w-full bg-white border border-fluent-border rounded-fluent p-8 shadow-fluent space-y-6 text-fluent-text print:shadow-none print:border-none print:p-0 relative overflow-hidden ${currentTheme?.fontFamily || 'font-sans'}`}
            style={{ minHeight: '600px', color: currentTheme?.textColor || '#1b1b1b' }}
          >
            {/* Background Watermark */}
            {currentTheme?.watermarkText && (
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
                style={{ opacity: (currentTheme.watermarkOpacity || 5) / 100 }}
              >
                <span className="text-6xl sm:text-7xl font-extrabold uppercase tracking-widest text-slate-900 -rotate-12 text-center max-w-lg leading-tight">
                  {currentTheme.watermarkText}
                </span>
              </div>
            )}

            {/* Invoice Header with Kavio Edu Logo & Address */}
            <div className={`flex justify-between items-start border-b border-fluent-border pb-6 relative z-10 ${currentTheme?.logoPosition === 'center'
              ? 'flex-col items-center text-center space-y-4 sm:space-y-0 sm:flex-row sm:text-left'
              : currentTheme?.logoPosition === 'right'
                ? 'flex-row-reverse text-left'
                : ''
              }`}>
              <div>
                <img src={logoSvg} alt="Kavio Edu Logo" className="h-10 w-auto object-contain mb-2" />
                <p className="text-xs text-fluent-textSecondary font-semibold">
                  Private English Class & Academic Mentoring
                </p>
                <p className="text-xs text-fluent-textSecondary">
                  Founder: Fatih Farhat Asshidiq
                </p>
                <p className="text-[11px] text-fluent-textSecondary mt-1 max-w-xs leading-tight">
                  Kp. Bojong Canar, Ds. Dahu, Kec. Cikedal, Kab. Pandeglang, Banten - 42266
                </p>
              </div>

              <div className={currentTheme?.logoPosition === 'right' ? 'text-left' : 'text-right'}>
                <h2
                  className={`${currentTheme?.headerSize || 'text-xl'} font-bold tracking-tight uppercase`}
                  style={{ color: currentTheme?.primaryColor || '#0078d4' }}
                >
                  INVOICE
                </h2>
                <p className="text-xs font-mono font-semibold text-fluent-text mt-1">
                  {invoiceNo}
                </p>
                <div className="text-xs text-fluent-textSecondary mt-1 space-y-1">
                  <div>Tanggal Terbit: <span className="font-semibold text-fluent-text">{formatDateIndonesian(invoiceDate)}</span></div>
                  {!isLunas && (
                    <div className="text-sm font-semibold text-amber-700 mt-1">
                      Jatuh Tempo: <span className="font-mono text-fluent-text font-bold">{formatDateIndonesian(dueDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Student & Payment Info */}
            <div className="grid grid-cols-2 gap-6 bg-fluent-subtle p-4 rounded-fluent border border-fluent-border text-xs">
              <div>
                <span className="font-semibold text-fluent-textSecondary uppercase block mb-1">
                  Ditujukan Kepada:
                </span>
                <p className="font-bold text-sm text-fluent-text">
                  {studentName || '-'}
                </p>
                {parentName && (
                  <p className="text-fluent-textSecondary">Orang Tua: {parentName}</p>
                )}
              </div>

              <div className="text-right">
                <span className="font-semibold text-fluent-textSecondary uppercase block mb-1">
                  Status Pembayaran:
                </span>
                <div className={`font-bold text-sm ${statusBadge.text}`}>
                  {statusBadge.label}
                </div>
              </div>
            </div>

            {/* Course & Package Details Table */}
            <div>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-fluent-subtle border-b border-t border-fluent-border font-semibold text-fluent-textSecondary">
                    <th className="py-2.5 px-3">Deskripsi Program</th>
                    <th className="py-2.5 px-3 text-center">Durasi</th>
                    <th className="py-2.5 px-3 text-center">Total Sesi</th>
                    <th className="py-2.5 px-3 text-right">Tarif / Bulan</th>
                    <th className="py-2.5 px-3 text-right">Total Investasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fluent-border">
                  <tr>
                    <td className="py-3 px-3">
                      <div className="font-bold text-fluent-text">Paket {packageType}</div>
                      {/* <div className="text-[11px] text-fluent-textSecondary">
                        Modul Pembelajaran Interaktif Private English
                      </div> */}
                    </td>
                    <td className="py-3 px-3 text-center font-medium">{durationMonths} Bulan</td>
                    <td className="py-3 px-3 text-center font-medium">{totalSessions} Sesi</td>
                    <td className="py-3 px-3 text-right font-medium">{formatIDR(valPerMonth)}</td>
                    <td className="py-3 px-3 text-right font-bold">{formatIDR(subtotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary Totals */}
            <div className="flex justify-end border-t border-fluent-border pt-4">
              <div className="w-72 space-y-2 text-xs">
                <div className="flex justify-between text-fluent-textSecondary">
                  <span>Subtotal Investasi:</span>
                  <span className="font-medium text-fluent-text">{formatIDR(subtotal)}</span>
                </div>

                {pct > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount:</span>
                    <span>-{formatIDR(discountAmount)} ({pct}%)</span>
                  </div>
                )}

                <div className="flex justify-between border-t border-slate-200 pt-1 text-xs font-bold text-fluent-text">
                  <span>Total Investasi:</span>
                  <span className="text-fluent-blue">{formatIDR(totalInvestment)}</span>
                </div>

                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Jumlah Terbayar (Paid):</span>
                  <span>{formatIDR(paidAmount)}</span>
                </div>

                <div className="flex justify-between border-t border-fluent-border pt-2 text-sm font-bold text-fluent-text">
                  <span>Outstanding:</span>
                  <span className="text-amber-600">{formatIDR(outstandingBalance)}</span>
                </div>
              </div>
            </div>

            {/* Bank Transfer Payment Info */}
            <div className="border-t border-fluent-border pt-4 text-xs space-y-2">
              <p className="font-bold text-fluent-text uppercase tracking-wider text-[11px]">
                Rekening Resmi Pembayaran (Kavio Edu):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-fluent-textSecondary">
                <div className="bg-white p-2 border border-fluent-border rounded">
                  <div className="font-bold text-fluent-text">Bank BCA</div>
                  <div className="font-mono text-fluent-blue font-semibold">6872486204</div>
                  <div className="text-[10px]">a.n. FATIH FARHAT ASSHIDIQ</div>
                </div>
                <div className="bg-white p-2 border border-fluent-border rounded">
                  <div className="font-bold text-fluent-text">Blu by BCA Digital</div>
                  <div className="font-mono text-fluent-blue font-semibold">007187161271</div>
                  <div className="text-[10px]">a.n. FATIH FARHAT ASSHIDIQ</div>
                </div>
                <div className="bg-white p-2 border border-fluent-border rounded">
                  <div className="font-bold text-fluent-text">E-Wallet (GoPay/DANA)</div>
                  <div className="font-mono text-fluent-blue font-semibold">082111500190</div>
                  <div className="text-[10px]">a.n. FATIH FARHAT ASSHIDIQ</div>
                </div>
              </div>
            </div>

            {/* Signature & Official Stamp Section */}
            <div className="border-t border-fluent-border pt-4 flex justify-between items-end text-xs">
              <div className="text-fluent-textSecondary text-[11px]">
                <span className="font-semibold text-fluent-text block">Catatan:</span>
                <p>{notes || '-'}</p>
              </div>

              <div className="text-right space-y-1 pr-2">
                <p className="text-[10px] text-slate-500 pb-16">Pandeglang, {formatDateIndonesian(invoiceDate)}</p>

                <div className="relative inline-block">
                  {/* Founder Digital Signature (Tanda Tangan) */}
                  <img
                    src={ttdFatihPng}
                    alt="Tanda Tangan Founder Kavio"
                    style={{
                      height: `${INVOICE_CONFIG.signature.sizeHeightPx}px`,
                      opacity: INVOICE_CONFIG.signature.opacity,
                      bottom: `${INVOICE_CONFIG.signature.offsetBottomPx}px`
                    }}
                    className="absolute right-0 w-auto object-contain pointer-events-none z-20"
                  />

                  {/* Official Kavio Edu Stamp Overlay (Stempel Ungu) */}
                  <img
                    src={stempelKavioEduPng}
                    alt="Stempel Resmi Kavio Edu"
                    style={{
                      height: `${INVOICE_CONFIG.kavioStamp.sizeHeightPx}px`,
                      opacity: INVOICE_CONFIG.kavioStamp.opacity,
                      transform: `rotate(${INVOICE_CONFIG.kavioStamp.rotationDeg}deg)`
                    }}
                    className="absolute -right-3 bottom-0 w-auto object-contain pointer-events-none z-10"
                  />

                  <p className="text-xs font-bold text-slate-900 border-b border-slate-400 pb-0.5 relative z-30">
                    FATIH FARHAT ASSHIDIQ
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 block relative z-30">Founder Kavio Edu</p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Kwitansi Pembayaran Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        data={getInvoiceDataPayload()}
      />

    </div>
  )
}
