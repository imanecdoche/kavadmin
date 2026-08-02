import React, { useRef, useState } from 'react'
import { Download, Printer, Check, Copy, FileText, ArrowLeft, MessageSquare } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function PublicInvoiceView({ invoiceData, onBackToApp }) {
  const invoiceRef = useRef(null)
  const [isExporting, setIsExporting] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  if (!invoiceData) return null

  const formatIDR = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount || 0)
  }

  // Handle Download PDF
  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return
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
      pdf.save(`${(invoiceData.invoiceNo || 'INV').replace(/\//g, '_')}_KavioEdu.pdf`)
    } catch (err) {
      console.error('Export PDF error:', err)
    } finally {
      setIsExporting(false)
    }
  }

  // Handle Download PNG
  const handleDownloadPNG = async () => {
    if (!invoiceRef.current) return
    setIsExporting(true)

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF'
      })

      const link = document.createElement('a')
      link.download = `${(invoiceData.invoiceNo || 'INV').replace(/\//g, '_')}_KavioEdu.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Export PNG error:', err)
    } finally {
      setIsExporting(false)
    }
  }

  const handleCopyCurrentLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleConfirmWA = () => {
    const text = `Halo Admin Kavio Edu, saya mengonfirmasi tagihan invoice ${invoiceData.invoiceNo || ''} a.n. ${invoiceData.studentName || ''}.`
    window.open(`https://wa.me/6282111500190?text=${encodeURIComponent(text)}`, '_blank')
  }

  const subtotal = invoiceData.subtotal || (invoiceData.valPerMonth * invoiceData.durationMonths) || invoiceData.totalInvestment || 0
  const discountAmount = invoiceData.discountAmount || 0
  const discountPercent = invoiceData.discountPercent || 0
  const totalInvestment = invoiceData.totalInvestment || (subtotal - discountAmount)
  const paidAmount = invoiceData.paidAmount || 0
  const outstandingBalance = invoiceData.outstandingBalance !== undefined ? invoiceData.outstandingBalance : Math.max(0, totalInvestment - paidAmount)

  let statusBadge = { label: invoiceData.status || 'OFFICIAL', text: 'text-emerald-600' }
  if (invoiceData.status && invoiceData.status.includes('DP')) {
    statusBadge = { label: invoiceData.status, text: 'text-amber-600' }
  } else if (invoiceData.status && invoiceData.status.includes('BELUM')) {
    statusBadge = { label: invoiceData.status, text: 'text-rose-600' }
  }

  return (
    <div className="min-h-screen bg-fluent-bg text-fluent-text font-sans flex flex-col antialiased">
      
      {/* Top Header Bar for Recipient Page */}
      <header className="bg-white border-b border-fluent-border py-3 px-4 sm:px-8 flex justify-between items-center shadow-xs no-print">
        <div className="flex items-center space-x-3">
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="px-2.5 py-1.5 border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded text-xs flex items-center space-x-1.5 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Buka Dashboard Admin</span>
            </button>
          )}
          <div>
            <h1 className="text-sm font-bold text-fluent-text">Invoice Resmi Kavio Edu</h1>
            <p className="text-[11px] text-fluent-textSecondary">Dokumen Penagihan Resmi Kursus Private English</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyCurrentLink}
            className="px-3 py-1.5 border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded text-xs font-medium flex items-center space-x-1.5"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Disalin' : 'Salin Link'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="hidden sm:flex px-3 py-1.5 border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded text-xs font-medium items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak</span>
          </button>
          <button
            onClick={handleDownloadPNG}
            disabled={isExporting}
            className="px-3 py-1.5 border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded text-xs font-medium flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-fluent-blue" />
            <span>Download PNG</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="px-3.5 py-1.5 bg-fluent-blue hover:bg-fluent-blueHover text-white rounded text-xs font-medium flex items-center space-x-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Memproses...' : 'Download PDF'}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8">
        
        {/* Rendered Invoice Paper Card */}
        <div
          ref={invoiceRef}
          className="bg-white p-8 sm:p-12 rounded-fluent border border-fluent-border shadow-fluent space-y-8 print:p-8 print:shadow-none print:border-none print:w-full"
        >
          {/* Header */}
          <div className="flex justify-between items-start border-b border-fluent-border pb-6">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-2xl tracking-wider text-fluent-text">KAVIO</span>
                <span className="font-light text-2xl tracking-widest text-fluent-blue">EDU</span>
              </div>
              <p className="text-xs text-fluent-textSecondary font-medium">
                Private Tutoring & Language Learning Center
              </p>
              <p className="text-[11px] text-fluent-textSecondary">
                Pandeglang, Banten | WhatsApp: 0821-1150-0190
              </p>
            </div>

            <div className="text-right space-y-1">
              <h2 className="text-xl font-bold text-fluent-blue tracking-tight">
                INVOICE RESMI
              </h2>
              <div className="text-xs font-mono font-semibold text-fluent-text">
                {invoiceData.invoiceNo || 'INV/KEEN/000'}
              </div>
              <div className="text-[11px] text-fluent-textSecondary">
                Tanggal Terbit: <span className="font-semibold text-fluent-text">{invoiceData.invoiceDate || '-'}</span>
              </div>
            </div>
          </div>

          {/* Student & Payment Info */}
          <div className="grid grid-cols-2 gap-6 bg-fluent-subtle/50 p-4 rounded-fluent border border-fluent-border text-xs">
            <div className="space-y-1">
              <span className="font-semibold text-fluent-textSecondary uppercase block mb-1">
                Ditujukan Kepada Siswa:
              </span>
              <div className="font-bold text-sm text-fluent-text">{invoiceData.studentName || '-'}</div>
              {invoiceData.parentName && (
                <div className="text-fluent-textSecondary">Wali: {invoiceData.parentName}</div>
              )}
            </div>

            <div className="text-right space-y-1">
              <span className="font-semibold text-fluent-textSecondary uppercase block mb-1">
                Status Pembayaran:
              </span>
              <span className={`font-bold text-sm ${statusBadge.text}`}>
                {statusBadge.label}
              </span>
            </div>
          </div>

          {/* Table Details */}
          <div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-fluent-subtle border-b border-t border-fluent-border font-semibold text-fluent-textSecondary">
                  <th className="py-2.5 px-3">Deskripsi Program</th>
                  <th className="py-2.5 px-3 text-center">Durasi</th>
                  <th className="py-2.5 px-3 text-center">Total Sesi</th>
                  <th className="py-2.5 px-3 text-right">Tarif / Bulan</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fluent-border">
                <tr>
                  <td className="py-3 px-3">
                    <div className="font-bold text-fluent-text">Paket {invoiceData.packageType || 'GROW'}</div>
                  </td>
                  <td className="py-3 px-3 text-center font-medium">{invoiceData.durationMonths || 1} Bulan</td>
                  <td className="py-3 px-3 text-center font-medium">{invoiceData.totalSessions || 4} Sesi</td>
                  <td className="py-3 px-3 text-right font-medium">{formatIDR(invoiceData.valPerMonth || 200000)}</td>
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

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount:</span>
                  <span>-{formatIDR(discountAmount)} ({discountPercent}%)</span>
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
                <span>Outstanding (Sisa):</span>
                <span className="text-amber-600">{formatIDR(outstandingBalance)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
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
              <p>{invoiceData.notes || 'Terima kasih atas kepercayaan Anda memilih Kavio Edu.'}</p>
            </div>
            <div className="text-right italic text-[10px]">
              Kavio Edu Management System
            </div>
          </div>

        </div>

        {/* Floating WA Confirmation Banner for Recipient */}
        <div className="mt-6 bg-white p-4 rounded-fluent border border-fluent-border shadow-fluent flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
          <div className="text-xs">
            <span className="font-bold text-fluent-text block">Butuh Bantuan / Konfirmasi Pembayaran?</span>
            <span className="text-fluent-textSecondary">Hubungi Admin Kavio Edu secara langsung via WhatsApp.</span>
          </div>
          <button
            onClick={handleConfirmWA}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center space-x-2 shadow-xs transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Konfirmasi Pembayaran via WA</span>
          </button>
        </div>

      </main>
    </div>
  )
}
