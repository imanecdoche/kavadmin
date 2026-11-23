import React, { useState, useEffect, useMemo, useRef } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import {
  Search,
  Plus,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  Printer,
  Download,
  ArrowLeftRight,
  User,
  Building,
  QrCode,
  FileText,
  Receipt
} from 'lucide-react'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { formatRupiah, parseRupiah, angkaKeTerbilang } from '@/lib/currencyUtils'
import { formatDateIndonesian } from '@/utils/dateFormatter'
import { exportElementToPdf } from '@/utils/documentExportEngine'
import ResponsiveDocumentWrapper from '@/components/common/ResponsiveDocumentWrapper'
import { logoSvg, ttdFatihPng, qrisPng } from '@/assets'

export default function DocumentStudio() {
  const canvasRef = useRef(null)
  const dropdownRef = useRef(null)

  // 1. Data Siswa Firestore (untuk opsi Pilih Siswa)
  const [students, setStudents] = useState([])
  const [studentSearch, setStudentSearch] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState('')

  // 2. Mode Penerima Tagihan: 'student' (dari DB) | 'custom' (bebas non-siswa / eksternal)
  const [clientMode, setClientMode] = useState('custom')
  const [customClientName, setCustomClientName] = useState('Bpk. Hendra Pratama')
  const [customParticipant, setCustomParticipant] = useState('')
  const [customPhone, setCustomPhone] = useState('0812-3456-7890')
  const [customAddress, setCustomAddress] = useState('Pandeglang, Banten')

  // 3. Metadata Dokumen
  const [docType, setDocType] = useState('invoice') // 'invoice' | 'receipt'
  const [invoicePage, setInvoicePage] = useState(1) // 1: Rincian | 2: Metode Bayar & QRIS

  const generateDocNo = (type) => {
    const today = new Date()
    const dd = String(today.getDate()).padStart(2, '0')
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const yy = String(today.getFullYear()).slice(-2)
    const ddmmyy = `${dd}${mm}${yy}`
    const randomNum = String(Math.floor(Math.random() * 900) + 100)
    const prefix = type === 'receipt' ? 'KW/KEEN' : 'INV/KEEN'
    return `${prefix}/${ddmmyy}/${randomNum}`
  }

  const getTodayStr = () => new Date().toISOString().split('T')[0]
  const getDefaultDueStr = () => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return d.toISOString().split('T')[0]
  }

  const [docNumber, setDocNumber] = useState(() => generateDocNo('invoice'))
  const [issueDate, setIssueDate] = useState(() => getTodayStr())
  const [dueDate, setDueDate] = useState(() => getDefaultDueStr())

  // 4. Multi-Item Tagihan Dinamis
  const [items, setItems] = useState([
    {
      id: 'item-1',
      description: 'Bimbingan Belajar Privat Bahasa Inggris Intensif',
      qty: 1,
      unit: 'Paket',
      unitPrice: 200000,
    }
  ])

  // 5. Diskon & Pembayaran
  const [discountType, setDiscountType] = useState('percent') // 'percent' | 'nominal'
  const [discountValue, setDiscountValue] = useState(0)
  const [paidAmount, setPaidAmount] = useState(200000)

  // 6. Action States
  const [isExporting, setIsExporting] = useState(false)
  const [copiedWA, setCopiedWA] = useState(false)

  // Load Siswa Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'students'), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setStudents(data)
    })
    return () => unsub()
  }, [])

  // Auto-close dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handler pergantian jenis dokumen
  const handleDocTypeChange = (type) => {
    setDocType(type)
    setDocNumber(generateDocNo(type))
    if (type === 'receipt') {
      setInvoicePage(1)
    }
  }

  // Siswa terpilih
  const currentStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || null
  }, [students, selectedStudentId])

  // Resolusi data penerima
  const resolvedPayer = useMemo(() => {
    if (clientMode === 'student' && currentStudent) {
      return currentStudent.parentName || currentStudent.name || '-'
    }
    return customClientName || '-'
  }, [clientMode, currentStudent, customClientName])

  const studentParticipant = useMemo(() => {
    if (clientMode === 'student' && currentStudent) {
      return currentStudent.parentName ? currentStudent.name : ''
    }
    return customParticipant || ''
  }, [clientMode, currentStudent, customParticipant])

  const resolvedPhone = useMemo(() => {
    if (clientMode === 'student' && currentStudent) {
      return currentStudent.phone || currentStudent.parentPhone || '-'
    }
    return customPhone || '-'
  }, [clientMode, currentStudent, customPhone])

  const resolvedAddress = useMemo(() => {
    if (clientMode === 'student' && currentStudent) {
      return currentStudent.address || 'Pandeglang, Banten'
    }
    return customAddress || 'Pandeglang, Banten'
  }, [clientMode, currentStudent, customAddress])

  // Multi-Item Handlers
  const handleAddItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      description: 'Layanan Pembelajaran / Modul Tambahan',
      qty: 1,
      unit: 'Sesi',
      unitPrice: 150000,
    }
    setItems((prev) => [...prev, newItem])
  }

  const handleUpdateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  const handleRemoveItem = (id) => {
    if (items.length <= 1) {
      alert('Dokumen minimal harus memiliki 1 rincian item.')
      return
    }
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  // Kalkulasi Keuangan
  const calculations = useMemo(() => {
    const subtotal = items.reduce((acc, it) => {
      const q = Number(it.qty) || 0
      const p = Number(it.unitPrice) || 0
      return acc + q * p
    }, 0)

    const discVal = Number(discountValue) || 0
    let discountAmount = 0
    if (discountType === 'percent') {
      discountAmount = Math.round((subtotal * Math.min(100, Math.max(0, discVal))) / 100)
    } else {
      discountAmount = Math.min(subtotal, Math.max(0, discVal))
    }

    const grandTotal = Math.max(0, subtotal - discountAmount)
    const paid = Number(paidAmount) || 0
    const remaining = Math.max(0, grandTotal - paid)
    const isLunas = paid >= grandTotal && grandTotal > 0

    return {
      subtotal,
      discountAmount,
      grandTotal,
      paid,
      remaining,
      isLunas,
      terbilang: angkaKeTerbilang(paid),
      grandTotalTerbilang: angkaKeTerbilang(grandTotal),
    }
  }, [items, discountType, discountValue, paidAmount])

  // Filter Siswa untuk Dropdown
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students
    const q = studentSearch.toLowerCase()
    return students.filter(
      (s) =>
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.parentName && s.parentName.toLowerCase().includes(q)) ||
        (s.batchName && s.batchName.toLowerCase().includes(q))
    )
  }, [students, studentSearch])

  // Handle Download PDF via html-to-image + jsPDF
  const handleDownloadPdf = async () => {
    if (!canvasRef.current) return
    setIsExporting(true)

    try {
      const safePayer = resolvedPayer.replace(/[^a-zA-Z0-9_-]/g, '_')
      const safeNo = docNumber.replace(/[^a-zA-Z0-9_-]/g, '_')
      const pageSuffix = docType === 'invoice' ? `_Hal${invoicePage}` : ''
      const filename = `${safeNo}_${safePayer}${pageSuffix}`

      await exportElementToPdf(canvasRef.current, filename, {
        mode: 'a4',
        orientation: 'portrait',
      })
    } catch (err) {
      console.error('Export PDF error:', err)
      alert('Gagal mengekspor PDF: ' + err.message)
    } finally {
      setIsExporting(false)
    }
  }

  // Handle Salin Pesan WhatsApp
  const handleCopyWhatsApp = () => {
    const greeting = 'Halo, salam hangat dari *Kavio Edu*.'
    let message = ''

    if (docType === 'invoice') {
      message =
        `${greeting}\n\n` +
        `Berikut kami sampaikan rincian tagihan resmi untuk *${resolvedPayer}*:\n\n` +
        `📄 *No. Faktur:* ${docNumber}\n` +
        `📅 *Tanggal:* ${formatDateIndonesian(issueDate)}\n` +
        `⏰ *Jatuh Tempo:* ${formatDateIndonesian(dueDate)}\n\n` +
        `📋 *Rincian Layanan & Program:*\n` +
        items
          .map(
            (it, idx) =>
              `  ${idx + 1}. ${it.description} (${it.qty} ${it.unit}) - Rp ${formatRupiah(
                it.qty * it.unitPrice
              )}`
          )
          .join('\n') +
        `\n\n💵 *Total Tagihan:* Rp ${formatRupiah(calculations.grandTotal)}` +
        (calculations.paid > 0
          ? `\n✅ *Sudah Dibayar:* Rp ${formatRupiah(calculations.paid)}`
          : '') +
        (!calculations.isLunas
          ? `\n⚠️ *Sisa Pembayaran:* Rp ${formatRupiah(calculations.remaining)}`
          : '\n🎉 *Status:* LUNAS') +
        `\n\n💳 *Saluran & Rekening Pembayaran Resmi:*\n` +
        `• *BCA:* 687 248 6204 a/n Fatih Farhat Asshidiq\n` +
        `• *e-Wallet (Dana / GoPay):* 0821-1150-0190 a/n Fatih Farhat Asshidiq\n` +
        `• *QRIS:* KAVIO GLOBAL CREATIVE (Tersedia pada halaman 2 faktur)\n\n` +
        `Mohon konfirmasikan bukti transfer setelah melakukan transaksi untuk validasi dan penerbitan kuitansi resmi. Terima kasih!`
    } else {
      message =
        `${greeting}\n\n` +
        `Tanda bukti pelunasan pembayaran resmi *Kavio Edu*:\n\n` +
        `🧾 *No. Kuitansi:* ${docNumber}\n` +
        `📅 *Tanggal:* ${formatDateIndonesian(issueDate)}\n` +
        `👤 *Telah Diterima Dari:* ${resolvedPayer}\n` +
        `💰 *Jumlah Pembayaran:* Rp ${formatRupiah(calculations.paid)},-\n` +
        `🔤 *Terbilang:* #${calculations.terbilang} Rupiah#\n\n` +
        `📋 *Untuk Pembayaran:*\n` +
        items.map((it, idx) => `  ${idx + 1}. ${it.description}`).join('\n') +
        `\n\n✅ *Status:* LUNAS / TERKONFIRMASI VALID\n\n` +
        `Dokumen kuitansi elektronik resmi telah diterbitkan. Terima kasih atas kepercayaan Anda!`
    }

    navigator.clipboard.writeText(message)
    setCopiedWA(true)
    setTimeout(() => setCopiedWA(false), 2000)
  }

  return (
    <div className="w-full max-w-[98%] xl:max-w-[96%] mx-auto px-2 sm:px-3 py-6 space-y-6">
      
      {/* ========================================================================= */}
      {/* TOP HEADER BAR */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-black tracking-tight flex items-center gap-2">
            <Building className="w-5 h-5 text-neutral-800" />
            Studio Dokumen Keuangan (Invoice & Kuitansi)
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Penerbitan Invoice Kustom (Non-Paket & Klien Eksternal) serta Kuitansi Formal Standar JetBrains Mono
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Jenis Dokumen */}
          <div className="flex bg-neutral-100 p-1 rounded-lg border border-neutral-200">
            <button
              onClick={() => handleDocTypeChange('invoice')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                docType === 'invoice'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              Faktur Invoice
            </button>
            <button
              onClick={() => handleDocTypeChange('receipt')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                docType === 'receipt'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              Kuitansi
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyWhatsApp}
            className="text-xs flex items-center gap-1.5 border-neutral-300 hover:bg-neutral-100"
          >
            {copiedWA ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-neutral-600" />}
            <span>{copiedWA ? 'Tersalin!' : 'Salin Pesan WA'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs flex items-center gap-1.5 border-neutral-300 hover:bg-neutral-100"
          >
            <Printer className="w-3.5 h-3.5 text-neutral-600" />
            <span>Cetak</span>
          </Button>

          <Button
            size="sm"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="text-xs flex items-center gap-1.5 bg-black text-white hover:bg-neutral-800 shadow-xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>{isExporting ? 'Mengekspor PDF...' : 'Download PDF (Retina Sharp)'}</span>
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN 2-COLUMN LAYOUT: FORM INPUT (KIRI) & WYSIWYG CANVAS PREVIEW (KANAN) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ======================================================================= */}
        {/* KOLOM KIRI: PARAMETER & FORM BUILDER */}
        {/* ======================================================================= */}
        <div className="lg:col-span-5 space-y-4 no-print">
          
          {/* KARTU 1: DATA PENERIMA TAGIHAN (MODE HYBRID) */}
          <Card className="border-neutral-200 shadow-none">
            <CardHeader className="pb-3 border-b border-neutral-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-black flex items-center gap-2">
                  <User className="w-4 h-4 text-neutral-700" />
                  <span>Data Penerima Tagihan</span>
                </CardTitle>
                
                {/* Switch Mode Hybrid */}
                <div className="flex bg-neutral-100 p-0.5 rounded border border-neutral-200 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setClientMode('custom')}
                    className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                      clientMode === 'custom' ? 'bg-white text-black shadow-2xs font-bold' : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    Klien Kustom
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientMode('student')}
                    className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                      clientMode === 'student' ? 'bg-white text-black shadow-2xs font-bold' : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    Dari Siswa
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-3.5 space-y-3">
              
              {clientMode === 'student' ? (
                /* DROPDOWN SISWA */
                <div className="relative" ref={dropdownRef}>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Pilih Siswa dari Database
                  </label>
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between border border-neutral-200 rounded-md px-3 py-2 text-xs bg-white cursor-pointer hover:border-neutral-300"
                  >
                    <span className="truncate font-medium text-neutral-900">
                      {currentStudent
                        ? `${currentStudent.name} (Wali: ${currentStudent.parentName || '-'})`
                        : 'Pilih siswa terdaftar...'}
                    </span>
                    <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-2" />
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 p-2 space-y-1">
                      <div className="flex items-center px-2 border-b border-neutral-100 pb-1.5 mb-1">
                        <Search className="w-3.5 h-3.5 text-neutral-400 mr-2" />
                        <input
                          type="text"
                          placeholder="Ketik nama siswa atau wali..."
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          className="w-full text-xs outline-none bg-transparent"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-44 overflow-y-auto space-y-0.5">
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map((s) => (
                            <div
                              key={s.id}
                              onClick={() => {
                                setSelectedStudentId(s.id)
                                setIsDropdownOpen(false)
                              }}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs cursor-pointer ${
                                s.id === selectedStudentId
                                  ? 'bg-neutral-100 font-bold text-black'
                                  : 'hover:bg-neutral-50 text-neutral-700'
                              }`}
                            >
                              <div className="truncate">
                                <p className="leading-tight">{s.name}</p>
                                <span className="text-[10px] text-neutral-400 font-normal">
                                  Wali: {s.parentName || '-'} • {s.batchName || 'Batch 1'}
                                </span>
                              </div>
                              {s.id === selectedStudentId && <Check className="w-3.5 h-3.5 text-black shrink-0" />}
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-[11px] text-neutral-400 py-3">Siswa tidak ditemukan</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* FORM KLIEN KUSTOM / EKSTERNAL */
                <div className="space-y-2.5">
                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1">
                      Nama Penerima / Klien / Lembaga <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Contoh: Bpk. Hendra Pratama / PT Ruang Kreatif"
                      value={customClientName}
                      onChange={(e) => setCustomClientName(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        Peserta / Siswa (Opsional)
                      </label>
                      <Input
                        placeholder="Nama Siswa"
                        value={customParticipant}
                        onChange={(e) => setCustomParticipant(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        Nomor WhatsApp / Telp
                      </label>
                      <Input
                        placeholder="0812-xxxx-xxxx"
                        value={customPhone}
                        onChange={(e) => setCustomPhone(e.target.value)}
                        className="text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1">
                      Alamat / Domisili
                    </label>
                    <Input
                      placeholder="Contoh: Pandeglang, Banten"
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>
              )}

            </CardContent>
          </Card>

          {/* KARTU 2: METADATA DOKUMEN */}
          <Card className="border-neutral-200 shadow-none">
            <CardHeader className="pb-3 border-b border-neutral-100">
              <CardTitle className="text-sm font-bold text-black flex items-center justify-between">
                <span>Metadata Dokumen</span>
                <button
                  type="button"
                  onClick={() => setDocNumber(generateDocNo(docType))}
                  className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-black font-semibold"
                >
                  <RefreshCw className="w-3 h-3" />
                  Acak Nomor
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3.5 space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Nomor {docType === 'receipt' ? 'Kuitansi' : 'Faktur'}
                </label>
                <Input
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="text-xs font-mono uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Tanggal Terbit
                  </label>
                  <Input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
                {docType === 'invoice' && (
                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1">
                      Jatuh Tempo (+7 Hari)
                    </label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="text-xs font-mono"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* KARTU 3: RINCIAN ITEM TAGIHAN DINAMIS (MULTI-ITEM) */}
          <Card className="border-neutral-200 shadow-none">
            <CardHeader className="pb-3 border-b border-neutral-100 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-black">
                Rincian Item Tagihan ({items.length})
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="text-xs h-7 px-2.5 flex items-center gap-1 border-neutral-300 hover:bg-neutral-100"
              >
                <Plus className="w-3 h-3 text-black" />
                Tambah Item
              </Button>
            </CardHeader>
            <CardContent className="pt-3.5 space-y-3">
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 bg-neutral-50/70 border border-neutral-200 rounded-lg space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-neutral-500 font-mono">
                        Item #{idx + 1}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                          title="Hapus Baris Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div>
                      <Input
                        placeholder="Deskripsi Layanan / Modul / Produk"
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                        className="text-xs bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-3">
                        <label className="text-[10px] text-neutral-500 block">Kuantitas</label>
                        <Input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) =>
                            handleUpdateItem(item.id, 'qty', Math.max(1, parseInt(e.target.value, 10) || 1))
                          }
                          className="text-xs font-mono bg-white"
                        />
                      </div>

                      <div className="col-span-4">
                        <label className="text-[10px] text-neutral-500 block">Satuan</label>
                        <Input
                          placeholder="Sesi / Bulan / Paket"
                          value={item.unit}
                          onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                          className="text-xs bg-white"
                        />
                      </div>

                      <div className="col-span-5">
                        <label className="text-[10px] text-neutral-500 block">Harga Satuan (Rp)</label>
                        <Input
                          type="text"
                          value={formatRupiah(item.unitPrice)}
                          onChange={(e) =>
                            handleUpdateItem(item.id, 'unitPrice', parseRupiah(e.target.value))
                          }
                          className="text-xs font-mono bg-white"
                        />
                      </div>
                    </div>

                    <div className="text-right text-[11px] font-mono text-neutral-600 border-t border-neutral-200/60 pt-1.5">
                      Subtotal Item: <strong className="text-black">Rp {formatRupiah(item.qty * item.unitPrice)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* KARTU 4: DISKON & PEMBAYARAN */}
          <Card className="border-neutral-200 shadow-none">
            <CardHeader className="pb-3 border-b border-neutral-100">
              <CardTitle className="text-sm font-bold text-black">
                Penyesuaian Biaya & Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3.5 space-y-3.5">
              
              {/* DISKON */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-neutral-700">Diskon Tagihan</label>
                  <button
                    type="button"
                    onClick={() => {
                      setDiscountType(discountType === 'percent' ? 'nominal' : 'percent')
                      setDiscountValue(0)
                    }}
                    className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-black font-semibold bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded transition-colors"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                    Mode: {discountType === 'percent' ? 'Persen (%)' : 'Nominal (Rp)'}
                  </button>
                </div>

                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400 pointer-events-none">
                    {discountType === 'percent' ? '%' : 'Rp'}
                  </span>
                  <Input
                    type="text"
                    value={discountType === 'percent' ? discountValue : formatRupiah(discountValue)}
                    onChange={(e) => {
                      if (discountType === 'percent') {
                        const val = Math.min(100, Math.max(0, parseInt(e.target.value.replace(/\D/g, ''), 10) || 0))
                        setDiscountValue(val)
                      } else {
                        setDiscountValue(parseRupiah(e.target.value))
                      }
                    }}
                    className="text-xs pl-8 font-mono"
                    placeholder={discountType === 'percent' ? '0 - 100' : '0'}
                  />
                </div>
              </div>

              {/* JUMLAH TERBAYAR */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-neutral-700">
                    Jumlah Terbayar
                  </label>
                  <div className="flex gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setPaidAmount(calculations.grandTotal)}
                      className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-700 font-semibold"
                    >
                      Lunasi 100%
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaidAmount(Math.round(calculations.grandTotal / 2))}
                      className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-700 font-semibold"
                    >
                      DP 50%
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaidAmount(0)}
                      className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-700 font-semibold"
                    >
                      Rp 0
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400 pointer-events-none">
                    Rp
                  </span>
                  <Input
                    type="text"
                    value={formatRupiah(paidAmount)}
                    onChange={(e) => setPaidAmount(parseRupiah(e.target.value))}
                    className="text-xs pl-8 font-mono font-bold text-black"
                  />
                </div>
              </div>

              {/* REKAPITULASI REALTIME */}
              <div className="pt-3 border-t border-neutral-100 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal:</span>
                  <span>Rp {formatRupiah(calculations.subtotal)}</span>
                </div>
                {calculations.discountAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Diskon:</span>
                    <span>- Rp {formatRupiah(calculations.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-black pt-1 border-t border-neutral-200">
                  <span>TOTAL TAGIHAN:</span>
                  <span className="text-sm">Rp {formatRupiah(calculations.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-700">
                  <span>Jumlah Terbayar:</span>
                  <span>Rp {formatRupiah(calculations.paid)}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-neutral-200">
                  <span>Status:</span>
                  <span className={calculations.isLunas ? 'text-black uppercase' : 'text-neutral-800'}>
                    {calculations.isLunas ? 'LUNAS (Rp 0)' : `Sisa Rp ${formatRupiah(calculations.remaining)}`}
                  </span>
                </div>
              </div>

            </CardContent>
          </Card>

        </div>

        {/* ======================================================================= */}
        {/* KOLOM KANAN: LIVE WYSIWYG A4 CANVAS (JETBRAINS MONO FORMAL LEDGER) */}
        {/* ======================================================================= */}
        <div className="lg:col-span-7 space-y-3">
          
          {/* TOOLBAR PRATINJAU */}
          <div className="bg-neutral-100 border border-neutral-200 rounded-lg p-2.5 flex items-center justify-between no-print">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-700">Pratinjau Dokumen:</span>
              {docType === 'invoice' ? (
                <div className="flex bg-white p-0.5 rounded border border-neutral-300 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setInvoicePage(1)}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      invoicePage === 1 ? 'bg-black text-white font-bold' : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    Hal 1: Rincian
                  </button>
                  <button
                    type="button"
                    onClick={() => setInvoicePage(2)}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      invoicePage === 2 ? 'bg-black text-white font-bold' : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    Hal 2: Metode Bayar & QRIS
                  </button>
                </div>
              ) : (
                <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-neutral-300 text-black font-semibold">
                  Kuitansi Tanda Terima Sah
                </span>
              )}
            </div>

            <div className="text-right text-[11px] text-neutral-500 font-mono">
              A4 Portrait (794 x 1123 px) • Retina 2x
            </div>
          </div>

          {/* DOKUMEN WRAPPER SCALER */}
          <div className="flex justify-center bg-neutral-200/60 p-3 sm:p-6 rounded-xl border border-neutral-300 overflow-x-auto min-h-[600px]">
            <ResponsiveDocumentWrapper baseWidth={794}>
              <div
                ref={canvasRef}
                id="document-studio-canvas"
                className="w-[794px] min-h-[1123px] max-w-[794px] shrink-0 bg-white border border-neutral-300 shadow-2xl p-10 sm:p-12 text-black font-mono relative overflow-hidden flex flex-col justify-between"
                style={{
                  width: '794px',
                  minHeight: '1123px',
                  boxSizing: 'border-box',
                  fontFamily: "'JetBrains Mono', 'Courier New', Courier, monospace",
                }}
              >
                
                {/* ================================================================= */}
                {/* 1. DOKUMEN INVOICE: HALAMAN 1 (RINCIAN TAGIHAN) */}
                {/* ================================================================= */}
                {docType === 'invoice' && invoicePage === 1 && (
                  <>
                    <div className="space-y-6">
                      
                      {/* HEADER FAKTUR RESMI */}
                      <div className="flex justify-between items-start border-b border-black pb-4 gap-6">
                        <div className="space-y-1">
                          <img
                            src={logoSvg}
                            alt="Kavio Academy"
                            className="h-14 sm:h-16 w-auto object-contain"
                          />
                          <p className="text-xs font-mono text-neutral-600 uppercase tracking-wider font-semibold">
                            Private English Class & Academic Mentoring
                          </p>
                          <p className="text-[10px] text-neutral-500 font-mono">
                            Pandeglang, Banten • contact@kavioedu.id • www.kavioedu.id
                          </p>
                        </div>

                        <div className="text-right font-mono text-xs space-y-1 pt-1 shrink-0">
                          <div className="font-bold text-black uppercase tracking-wider text-sm sm:text-base">
                            FAKTUR TAGIHAN (INVOICE)
                          </div>
                          <div className="text-neutral-700">
                            No. Faktur  : <span className="font-bold text-black">{docNumber}</span>
                          </div>
                          <div className="text-neutral-700">
                            Tanggal     : {formatDateIndonesian(issueDate)}
                          </div>
                          <div className="text-neutral-700">
                            Jatuh Tempo : <span className="font-bold text-black">{formatDateIndonesian(dueDate)}</span>
                          </div>
                          <div className="text-neutral-400 text-[10px] pt-0.5">
                            Halaman 1 dari 2
                          </div>
                        </div>
                      </div>

                      {/* DATA PENERIMA TAGIHAN */}
                      <div className="border-b border-black pb-4 text-xs space-y-2 leading-relaxed">
                        <div className="font-bold text-black uppercase tracking-wider text-xs mb-2">
                          TAGIHAN DITUJUKAN KEPADA:
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
                          <div>
                            <span className="text-neutral-600">Nama Penerima : </span>
                            <strong className="text-black uppercase">{resolvedPayer}</strong>
                            {studentParticipant && (
                              <div className="text-xs text-neutral-600 mt-0.5">
                                Peserta / Siswa : <strong className="text-black">{studentParticipant}</strong>
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="text-neutral-600">Kontak / No. WA : </span>
                            <strong className="text-black">{resolvedPhone}</strong>
                          </div>
                          <div className="col-span-2">
                            <span className="text-neutral-600">Alamat / Domisili : </span>
                            <span className="text-black">{resolvedAddress}</span>
                          </div>
                        </div>
                      </div>

                      {/* TABEL RINCIAN ITEM (MULTI-ITEM) */}
                      <div className="space-y-1">
                        <div className="font-bold uppercase tracking-wider text-xs mb-2">
                          RINCIAN TAGIHAN & LAYANAN PROGRAM:
                        </div>

                        <table className="w-full text-left border-collapse font-mono text-xs">
                          <thead>
                            <tr className="border-t border-b border-black uppercase font-bold text-[11px]">
                              <th className="py-2.5 px-2 w-10 text-center">No</th>
                              <th className="py-2.5 px-2">Deskripsi Layanan & Produk</th>
                              <th className="py-2.5 px-2 text-center w-28">Kuantitas</th>
                              <th className="py-2.5 px-2 text-right w-36">Tarif Satuan</th>
                              <th className="py-2.5 px-2 text-right w-36">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-200">
                            {items.map((item, idx) => (
                              <tr key={item.id || idx}>
                                <td className="py-3 px-2 text-center font-bold align-top">{idx + 1}</td>
                                <td className="py-3 px-2 align-top">
                                  <div className="font-bold text-black uppercase text-xs">
                                    {item.description}
                                  </div>
                                </td>
                                <td className="py-3 px-2 text-center align-top whitespace-nowrap text-neutral-700">
                                  {item.qty} {item.unit}
                                </td>
                                <td className="py-3 px-2 text-right align-top whitespace-nowrap text-neutral-700">
                                  Rp {formatRupiah(item.unitPrice)}
                                </td>
                                <td className="py-3 px-2 text-right align-top font-bold text-black whitespace-nowrap">
                                  Rp {formatRupiah(item.qty * item.unitPrice)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* REKAPITULASI PEMBAYARAN */}
                      <div className="border-t border-black pt-3 flex justify-end">
                        <div className="w-80 space-y-1.5 text-xs">
                          <div className="flex justify-between text-neutral-700">
                            <span>Subtotal Biaya</span>
                            <span>Rp {formatRupiah(calculations.subtotal)}</span>
                          </div>

                          {calculations.discountAmount > 0 && (
                            <div className="flex justify-between text-red-600">
                              <span>
                                Potongan Diskon {discountType === 'percent' ? `(${discountValue}%)` : ''}
                              </span>
                              <span>- Rp {formatRupiah(calculations.discountAmount)}</span>
                            </div>
                          )}

                          <div className="border-t border-black pt-1.5 flex justify-between font-bold text-sm text-black">
                            <span>TOTAL TAGIHAN</span>
                            <span>Rp {formatRupiah(calculations.grandTotal)}</span>
                          </div>

                          <div className="flex justify-between text-neutral-700 pt-1">
                            <span>Jumlah Terbayar</span>
                            <span>Rp {formatRupiah(calculations.paid)}</span>
                          </div>

                          <div className="border-t border-dashed border-neutral-300 pt-1 flex justify-between font-bold text-xs">
                            <span>{calculations.isLunas ? 'Status Pembayaran' : 'Sisa Tagihan'}</span>
                            <span className={calculations.isLunas ? 'text-black' : 'text-neutral-900'}>
                              {calculations.isLunas ? 'LUNAS' : `Rp ${formatRupiah(calculations.remaining)}`}
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* FOOTER & PENGESAHAN DOKUMEN */}
                    <div className="pt-6 border-t border-black flex justify-between items-end text-xs">
                      <div className="max-w-[340px] text-[10px] text-neutral-500 space-y-0.5 leading-snug">
                        <p className="font-bold text-black uppercase">Ketentuan Dokumen:</p>
                        <p>
                          Laporan tagihan sah diterbitkan resmi secara elektronik oleh sistem administrasi akademik Kavio Edu dan diakui sebagai faktur tagihan resmi.
                        </p>
                        <p className="text-neutral-400 font-mono text-[9px] pt-0.5">
                          Security Hash: {String(docNumber).replace(/[^a-zA-Z0-9]/g, '')}-KEEN
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs text-neutral-700">
                          Pandeglang, {formatDateIndonesian(issueDate)}
                        </p>
                        <div className="h-16 w-52 my-1 ml-auto flex items-end justify-end">
                          <img
                            src={ttdFatihPng}
                            alt="Tanda Tangan Direktur"
                            className="h-14 w-auto max-w-full object-contain pointer-events-none select-none"
                          />
                        </div>
                        <div className="border-t border-black pt-1">
                          <p className="font-bold text-black text-xs uppercase">
                            Fatih Farhat Asshidiq
                          </p>
                          <p className="text-[10px] text-neutral-600">
                            Founder & Academic Director
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ================================================================= */}
                {/* 2. DOKUMEN INVOICE: HALAMAN 2 (SALURAN & METODE BAYAR) */}
                {/* ================================================================= */}
                {docType === 'invoice' && invoicePage === 2 && (
                  <>
                    <div className="space-y-6">
                      
                      {/* HEADER HALAMAN 2 */}
                      <div className="flex justify-between items-start border-b border-black pb-4 gap-6">
                        <div className="space-y-1">
                          <img
                            src={logoSvg}
                            alt="Kavio Academy"
                            className="h-14 sm:h-16 w-auto object-contain"
                          />
                          <p className="text-xs font-mono text-neutral-600 uppercase tracking-wider font-semibold">
                            Private English Class & Academic Mentoring
                          </p>
                          <p className="text-[10px] text-neutral-500 font-mono">
                            Pandeglang, Banten • contact@kavioedu.id • www.kavioedu.id
                          </p>
                        </div>

                        <div className="text-right font-mono text-xs space-y-1 pt-1 shrink-0">
                          <div className="font-bold text-black uppercase tracking-wider text-sm sm:text-base">
                            SALURAN & METODE PEMBAYARAN
                          </div>
                          <div className="text-neutral-700">
                            Ref. Faktur : <span className="font-bold text-black">{docNumber}</span>
                          </div>
                          <div className="text-neutral-700">
                            Tanggal     : {formatDateIndonesian(issueDate)}
                          </div>
                          <div className="text-neutral-400 text-[10px] pt-0.5">
                            Halaman 2 dari 2
                          </div>
                        </div>
                      </div>

                      {/* KOTAK QRIS RESMI */}
                      <div className="border border-black p-5 space-y-3">
                        <div className="border-b border-neutral-300 pb-2 flex justify-between items-baseline">
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
                              Metode Pembayaran Cepat (QRIS Nasional)
                            </div>
                            <div className="text-base font-bold text-black mt-0.5">
                              QRIS : KAVIO GLOBAL CREATIVE
                            </div>
                          </div>
                          <div className="text-right font-mono text-[11px] text-neutral-600">
                            Semua Bank & e-Wallet
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-2">
                          <div className="shrink-0 flex flex-col items-center">
                            <div className="border-2 border-black p-2 bg-white shadow-xs">
                              <img
                                src={qrisPng}
                                alt="QRIS Kavio Global Creative"
                                className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                              />
                            </div>
                            <span className="text-[9px] font-bold tracking-widest text-neutral-600 uppercase mt-2">
                              SCAN UNTUK MEMBAYAR
                            </span>
                          </div>

                          <div className="flex-1 min-w-0 space-y-2.5 text-xs leading-relaxed">
                            <p className="font-bold text-black uppercase tracking-wider text-xs">
                              Panduan Langkah Pembayaran QRIS:
                            </p>
                            <ol className="list-decimal pl-4 space-y-1.5 text-neutral-700 text-xs">
                              <li>Buka aplikasi Mobile Banking (BCA, Mandiri, BRI, BNI, CIMB, dll) atau e-Wallet (GoPay, OVO, Dana, ShopeePay).</li>
                              <li>Pilih menu <strong>Scan / Bayar QRIS</strong> lalu arahkan kamera ke barcode di samping.</li>
                              <li>Pastikan merchant tujuan terverifikasi: <strong className="text-black">KAVIO GLOBAL CREATIVE</strong>.</li>
                              <li>
                                Masukkan nominal transfer:{' '}
                                <strong className="text-black font-mono bg-neutral-100 px-1 border border-neutral-300">
                                  Rp {formatRupiah(calculations.isLunas ? calculations.grandTotal : calculations.remaining)},-
                                </strong>
                              </li>
                              <li>Selesaikan otorisasi transaksi (PIN/Biometrik) dan simpan bukti resi pembayaran.</li>
                            </ol>
                          </div>
                        </div>
                      </div>

                      {/* TRANSFER BANK & E-WALLET RESMI */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border border-black p-3.5 space-y-1">
                          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                            Transfer Bank BCA
                          </span>
                          <div className="text-sm font-bold text-black tracking-wide">
                            687 248 6204
                          </div>
                          <div className="text-xs text-neutral-700">
                            a/n Fatih Farhat Asshidiq
                          </div>
                          <p className="text-[10px] text-neutral-500 pt-1">
                            Bank Central Asia (BCA Kantor Cabang Pandeglang)
                          </p>
                        </div>

                        <div className="border border-black p-3.5 space-y-1">
                          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                            e-Wallet (Dana & GoPay)
                          </span>
                          <div className="text-sm font-bold text-black tracking-wide">
                            0821-1150-0190
                          </div>
                          <div className="text-xs text-neutral-700">
                            a/n Fatih Farhat Asshidiq
                          </div>
                          <p className="text-[10px] text-neutral-500 pt-1">
                            Konfirmasi nama penerima saat transfer di aplikasi
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* FOOTER HALAMAN 2 */}
                    <div className="pt-4 border-t border-black text-xs text-neutral-600 flex justify-between items-center">
                      <p className="text-[10px]">
                        Konfirmasikan bukti transfer ke WhatsApp resmi: <strong>+62 821-1150-0190</strong>
                      </p>
                      <p className="text-[10px] font-bold text-black">
                        Kavio Edu Official Payment Channel
                      </p>
                    </div>
                  </>
                )}

                {/* ================================================================= */}
                {/* 3. DOKUMEN KUITANSI (RECEIPT RESMI) */}
                {/* ================================================================= */}
                {docType === 'receipt' && (
                  <>
                    <div className="space-y-6">
                      
                      {/* HEADER KUITANSI */}
                      <div className="flex justify-between items-start border-b border-black pb-4 gap-6">
                        <div className="space-y-1">
                          <img
                            src={logoSvg}
                            alt="Kavio Academy"
                            className="h-14 sm:h-16 w-auto object-contain"
                          />
                          <p className="text-xs font-mono text-neutral-600 uppercase tracking-wider font-semibold">
                            Private English Class & Academic Mentoring
                          </p>
                          <p className="text-[10px] text-neutral-500 font-mono">
                            Pandeglang, Banten • contact@kavioedu.id • www.kavioedu.id
                          </p>
                        </div>

                        <div className="text-right font-mono text-xs space-y-1 pt-1 shrink-0">
                          <div className="font-bold text-black uppercase tracking-wider text-sm sm:text-base">
                            TANDA BUKTI PEMBAYARAN (KUITANSI)
                          </div>
                          <div className="text-neutral-700">
                            No. Bukti   : <span className="font-bold text-black">{docNumber}</span>
                          </div>
                          <div className="text-neutral-700">
                            Tanggal     : {formatDateIndonesian(issueDate)}
                          </div>
                          <div className="text-neutral-400 text-[10px] pt-0.5">
                            Bukti Pembayaran Sah
                          </div>
                        </div>
                      </div>

                      {/* ISI KUITANSI FORMAL */}
                      <div className="border border-black p-5 space-y-4 text-xs leading-relaxed">
                        <div className="flex border-b border-neutral-200 pb-2.5">
                          <span className="w-44 text-neutral-600 uppercase font-bold shrink-0">Telah Diterima Dari</span>
                          <span className="w-4 font-bold shrink-0">:</span>
                          <div className="flex-1">
                            <strong className="text-sm font-bold text-black uppercase">{resolvedPayer}</strong>
                            {studentParticipant && (
                              <div className="text-neutral-600 text-xs mt-0.5">
                                Siswa / Peserta : <span className="text-black font-semibold">{studentParticipant}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex border-b border-neutral-200 pb-2.5">
                          <span className="w-44 text-neutral-600 uppercase font-bold shrink-0">Uang Sejumlah</span>
                          <span className="w-4 font-bold shrink-0">:</span>
                          <div className="flex-1">
                            <div className="text-xs italic bg-neutral-100 p-2 border border-neutral-300 font-bold text-black">
                              # {calculations.terbilang} Rupiah #
                            </div>
                          </div>
                        </div>

                        <div className="flex border-b border-neutral-200 pb-2.5">
                          <span className="w-44 text-neutral-600 uppercase font-bold shrink-0">Untuk Pembayaran</span>
                          <span className="w-4 font-bold shrink-0">:</span>
                          <div className="flex-1 space-y-1">
                            {items.map((it, idx) => (
                              <div key={it.id || idx} className="text-black">
                                • {it.description} ({it.qty} {it.unit})
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="border-2 border-black p-3 bg-neutral-50 text-base font-bold text-black">
                            Rp {formatRupiah(calculations.paid)},-
                          </div>
                          <div className="text-right text-xs">
                            <span className="text-neutral-500 block">Status Transaksi:</span>
                            <span className="font-bold text-black uppercase tracking-wider text-sm">
                              {calculations.isLunas ? 'LUNAS / DITERIMA PENUH' : 'PEMBAYARAN SEBAGIAN (DP)'}
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* PENGESAHAN KUITANSI */}
                    <div className="pt-6 border-t border-black flex justify-between items-end text-xs">
                      <div className="max-w-[340px] text-[10px] text-neutral-500 space-y-0.5 leading-snug">
                        <p className="font-bold text-black uppercase">Ketentuan Kuitansi:</p>
                        <p>
                          Bukti pembayaran sah ini diterbitkan resmi secara elektronik oleh sistem administrasi akademik Kavio Edu dan diakui sebagai tanda pelunasan yang valid.
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs text-neutral-700">
                          Pandeglang, {formatDateIndonesian(issueDate)}
                        </p>
                        <div className="h-16 w-52 my-1 ml-auto flex items-end justify-end">
                          <img
                            src={ttdFatihPng}
                            alt="Tanda Tangan Direktur"
                            className="h-14 w-auto max-w-full object-contain pointer-events-none select-none"
                          />
                        </div>
                        <div className="border-t border-black pt-1">
                          <p className="font-bold text-black text-xs uppercase">
                            Fatih Farhat Asshidiq
                          </p>
                          <p className="text-[10px] text-neutral-600">
                            Founder & Academic Director
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

              </div>
            </ResponsiveDocumentWrapper>
          </div>

        </div>

      </div>

    </div>
  )
}
