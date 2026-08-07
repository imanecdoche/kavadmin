import React, { useState, useRef, useEffect } from 'react'
import {
  Download,
  Copy,
  Check,
  FileText,
  Printer,
  Share2,
  Palette
} from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { PACKAGE_RATES } from './Dashboard'
import { generateInvoiceShareLink } from '../utils/invoiceShare'
import InvoiceThemerStudio, { BUILTIN_THEMES } from './InvoiceThemerStudio'

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

  const [invoiceNo, setInvoiceNo] = useState(generateInvoiceNo())
  const [invoiceDate, setInvoiceDate] = useState(getTodayDateStr())
  const [dueDate, setDueDate] = useState(getTodayDateStr())

  // Empty initial fields & Autocomplete States
  const [studentName, setStudentName] = useState('')
  const [parentName, setParentName] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isStudentLocked, setIsStudentLocked] = useState(false)

  const [packageType, setPackageType] = useState('GROW')
  const [customValPerMonth, setCustomValPerMonth] = useState('')
  const [customSessionsPerMonth, setCustomSessionsPerMonth] = useState('')
  const [durationMonths, setDurationMonths] = useState(1)
  const [discountPercent, setDiscountPercent] = useState(0)

  const [paymentType, setPaymentType] = useState('FULL') // FULL, DP50, CUSTOM
  const [customPaidAmount, setCustomPaidAmount] = useState('')
  const [notes, setNotes] = useState('')

  const [copied, setCopied] = useState(false)
  const [copiedShareLink, setCopiedShareLink] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

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

  const getInvoiceDataPayload = () => ({
    invoiceNo,
    invoiceDate,
    studentName,
    parentName,
    packageType,
    durationMonths,
    valPerMonth,
    totalSessions,
    subtotal,
    discountPercent,
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

  const pct = Math.max(0, Math.min(100, Number(discountPercent) || 0))
  const discountAmount = Math.round((subtotal * pct) / 100)
  const totalInvestment = Math.max(0, subtotal - discountAmount)

  let paidAmount = 0
  if (paymentType === 'FULL') {
    paidAmount = totalInvestment
  } else if (paymentType === 'DP50') {
    paidAmount = totalInvestment * 0.5
  } else {
    paidAmount = Number(customPaidAmount) || 0
  }

  const outstandingBalance = Math.max(0, totalInvestment - paidAmount)
  const paidPct = totalInvestment > 0 ? Math.min(100, Math.round((paidAmount / totalInvestment) * 100)) : 0

  // Status Text Logic
  let statusBadge = { label: 'BELUM BAYAR', text: 'text-rose-600' }
  if (paidAmount >= totalInvestment && totalInvestment > 0) {
    statusBadge = { label: 'LUNAS (100%)', text: 'text-emerald-600' }
  } else if (paidAmount > 0) {
    statusBadge = { label: `DP TERBAYAR (${paidPct}%)`, text: 'text-amber-600' }
  }

  const formatIDR = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount || 0)
  }

  // Format WhatsApp Message with Shareable Link
  const generateWhatsAppMessage = () => {
    const sName = studentName || '-'
    const studentText = parentName ? `${sName} (Anak dari ${parentName})` : sName
    const shareUrl = generateInvoiceShareLink(getInvoiceDataPayload())

    return `Yth. Bpk/Ibu ${parentName || sName},

Berikut kami sampaikan rincian INVOICE Kursus Private English Class Kavio Edu:

Nomor Invoice: ${invoiceNo}
Nama Siswa: ${studentText}
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
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`${invoiceNo.replace(/\//g, '_')}_KavioEdu.pdf`)
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
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF'
      })

      const link = document.createElement('a')
      link.download = `${invoiceNo.replace(/\//g, '_')}_KavioEdu.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
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
          <h1 className="text-2xl font-bold text-fluent-text tracking-tight">
            Invoice Generator
          </h1>
          <p className="text-sm text-fluent-textSecondary">
            Buat, cetak, dan ekspor invoice resmi untuk kursus private Kavio Edu.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Desktop Only Invoice Themer Toggle Button */}
          <button
            onClick={() => setIsThemerOpen(!isThemerOpen)}
            className={`hidden lg:flex items-center space-x-2 px-3 py-2 border text-sm font-semibold rounded-fluent transition-colors ${isThemerOpen
              ? 'bg-fluent-blue text-white border-fluent-blue shadow-xs'
              : 'border-fluent-border bg-white text-fluent-text hover:bg-fluent-subtle'
              }`}
            title="Buka Themer Studio untuk mendesain kustom template invoice"
          >
            <Palette className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopyShareLink}
            className="px-3 py-2 border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded-fluent text-sm font-medium flex items-center space-x-2"
            title="Salin link publik invoice untuk dibagikan ke siswa/wali"
          >
            {copiedShareLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-fluent-blue" />}
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-2 border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded-fluent text-sm font-medium flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownloadPNG}
            disabled={isExporting}
            className="px-3 py-2 border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded-fluent text-sm font-medium flex items-center space-x-2"
          >
            <Download className="w-4 h-4 text-fluent-blue" />
            <span>PNG</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="px-4 py-2 bg-fluent-blue hover:bg-fluent-blueHover text-white rounded-fluent text-sm font-medium flex items-center space-x-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Memproses...' : 'PDF'}</span>
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

          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                Tanggal Terbit
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nama Siswa Field with Autocomplete Dropdown */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-fluent-textSecondary">
                  Nama Siswa *
                </label>
                {isStudentLocked && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                    Terdaftar di Database
                  </span>
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
                    .map((st) => {
                      const pText = formatParentDisplayText(st)

                      return (
                        <button
                          key={st.id}
                          type="button"
                          onMouseDown={() => handleSelectStudent(st)}
                          className="w-full text-left px-3 py-2 hover:bg-fluent-subtle border-b border-slate-100 last:border-0 text-xs transition-colors flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-fluent-text block">{st.name}</span>
                            <span className="text-[11px] text-fluent-textSecondary">
                              Wali: {pText || 'Belum diisi'}
                            </span>
                          </div>
                          <span className="text-[10px] bg-fluent-subtle px-1.5 py-0.5 rounded text-fluent-blue font-semibold border border-fluent-border">
                            Paket {st.packageType || 'GROW'}
                          </span>
                        </button>
                      )
                    })}
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
              <select
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue bg-white"
              >
                <option value={1}>1 Bulan</option>
                <option value={3}>3 Bulan</option>
                <option value={6}>6 Bulan</option>
                <option value={12}>12 Bulan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                Diskon (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                placeholder="0"
                className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-bold text-emerald-700 bg-white"
              />
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
                onClick={() => setPaymentType('DP50')}
                className={`py-1.5 px-2 text-xs font-medium rounded-fluent border ${paymentType === 'DP50'
                  ? 'bg-amber-50 border-amber-500 text-amber-700 font-bold'
                  : 'border-fluent-border bg-white text-fluent-text'
                  }`}
              >
                DP 50%
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
                Nominal Yang Dibayar (Rp)
              </label>
              <input
                type="number"
                value={customPaidAmount}
                onChange={(e) => setCustomPaidAmount(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-1.5 text-sm border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
              />
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
          <div className="pt-2">
            <button
              onClick={handleCopyWA}
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-fluent font-medium text-xs flex items-center justify-center space-x-2 transition-colors shadow-sm"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Pesan WhatsApp Tersalin!' : 'Salin Pesan WhatsApp Invoice'}</span>
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
                <img src="/logo.svg" alt="Kavio Edu Logo" className="h-10 w-auto object-contain mb-2" />
                <p className="text-xs text-fluent-textSecondary font-semibold">
                  Private English Class & Academic Mentoring
                </p>
                <p className="text-xs text-fluent-textSecondary">
                  Founder: Fatih Farhat Asshidiq
                </p>
                <p className="text-[11px] text-fluent-textSecondary mt-1 max-w-xs leading-tight">
                  Kp. Bojong Canar, Ds. Dahu, Kec. Cikeda, Kab. Pandeglang, Banten - 42266
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
                <p className="text-xs text-fluent-textSecondary mt-1">
                  Tanggal: {invoiceDate}
                </p>
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
                <span className={`font-bold text-sm ${statusBadge.text}`}>
                  {statusBadge.label}
                </span>
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

            {/* Notes & Footer */}
            <div className="border-t border-fluent-border pt-3 text-[11px] text-fluent-textSecondary flex justify-between items-end">
              <div>
                <span className="font-semibold text-fluent-text block">Catatan:</span>
                <p>{notes || '-'}</p>
              </div>
              <div className="text-right italic text-[10px]">
                Kavio Edu Management System
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}
