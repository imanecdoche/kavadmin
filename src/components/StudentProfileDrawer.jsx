import React from 'react'
import {
  X,
  User,
  Phone,
  MapPin,
  Target,
  Clock,
  DollarSign,
  Calendar,
  FileText,
  ExternalLink,
  MessageSquare,
  Award,
  BookOpen
} from 'lucide-react'

export default function StudentProfileDrawer({ student, onClose, onGenerateInvoice }) {
  if (!student) return null

  // Calculation parameters
  const totalInvestment = (student.valPerMonth || 0) * (student.durationMonths || 1)
  const paid = student.paid || 0
  const outstanding = Math.max(0, totalInvestment - paid)

  const totalSessions = (student.sessionsPerMonth || 0) * (student.durationMonths || 1)
  const minutesPerSession = student.minutesPerSession || 60
  const totalStudyMinutes = totalSessions * minutesPerSession
  const totalHours = (totalStudyMinutes / 60).toFixed(1)

  const paidPct = totalInvestment > 0 ? Math.min(100, Math.round((paid / totalInvestment) * 100)) : 0

  // Status Badge Logic
  let statusBadge = { label: 'PENDING', bg: 'bg-rose-50 text-rose-700 border-rose-200' }
  if (paid >= totalInvestment && totalInvestment > 0) {
    statusBadge = { label: 'LUNAS', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  } else if (paid > 0) {
    statusBadge = { label: `DP TERBAYAR (${paidPct}%)`, bg: 'bg-amber-50 text-amber-700 border-amber-200' }
  }

  const formatIDR = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount || 0)
  }

  // Open Direct WhatsApp Link
  const openWhatsApp = (phone, defaultText = '') => {
    if (!phone) return
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(defaultText)}`
    window.open(url, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-xl bg-white h-full shadow-fluent-modal border-l border-fluent-border flex flex-col justify-between overflow-y-auto animate-slideLeft">

        {/* Header */}
        <div>
          <div className="p-6 border-b border-fluent-border bg-fluent-subtle flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 text-xs font-bold bg-fluent-blue text-white rounded-fluent">
                  Paket {student.packageType}
                </span>
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${statusBadge.bg}`}>
                  {statusBadge.label}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-fluent-text mt-2">
                {student.name}
              </h2>
              {student.parentName && (
                <p className="text-xs text-fluent-textSecondary mt-0.5">
                  Wali / Orang Tua: {student.parentName}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-fluent-textSecondary hover:bg-fluent-border rounded-fluent transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Summary Cards */}
          <div className="p-6 grid grid-cols-3 gap-3 border-b border-fluent-border bg-white">
            <div className="p-3 bg-fluent-subtle rounded border border-fluent-border">
              <span className="text-[10px] font-bold text-fluent-textSecondary uppercase block">
                Total Jam Belajar
              </span>
              <p className="text-sm font-bold text-fluent-blue mt-1">
                {totalHours} Jam
              </p>
              <p className="text-[10px] text-fluent-textSecondary">
                ({totalStudyMinutes} Mins / {totalSessions} Sesi)
              </p>
            </div>

            <div className="p-3 bg-fluent-subtle rounded border border-fluent-border">
              <span className="text-[10px] font-bold text-fluent-textSecondary uppercase block">
                Terbayar (Paid)
              </span>
              <p className="text-sm font-bold text-emerald-600 mt-1">
                {formatIDR(paid)}
              </p>
              <p className="text-[10px] text-fluent-textSecondary">
                Total: {formatIDR(totalInvestment)}
              </p>
            </div>

            <div className="p-3 bg-fluent-subtle rounded border border-fluent-border">
              <span className="text-[10px] font-bold text-fluent-textSecondary uppercase block">
                Outstanding
              </span>
              <p className="text-sm font-bold text-amber-600 mt-1">
                {formatIDR(outstanding)}
              </p>
              <p className="text-[10px] text-fluent-textSecondary">
                Sisa Tagihan
              </p>
            </div>
          </div>

          {/* Detailed Info Sections */}
          <div className="p-6 space-y-6">

            {/* Direct WhatsApp Contact Buttons */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-fluent-textSecondary uppercase tracking-wider">
                Kontak Langsung WhatsApp
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {student.parentPhone ? (
                  <button
                    onClick={() => openWhatsApp(student.parentPhone, `Halo Bpk/Ibu ${student.parentName || ''}, ini dari Kavio Edu mengenai bimbingan ${student.name}.`)}
                    className="flex items-center space-x-2 p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded border border-emerald-200 text-xs font-medium transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <div className="text-left">
                      <div className="font-semibold">WhatsApp Wali ({student.parentName || 'Orang Tua'})</div>
                      <div className="text-[10px] text-emerald-700">{student.parentPhone}</div>
                    </div>
                  </button>
                ) : (
                  <div className="p-2.5 bg-fluent-subtle text-fluent-textSecondary rounded border border-fluent-border text-xs">
                    No. HP Wali Belum Diisi
                  </div>
                )}

                {student.studentPhone ? (
                  <button
                    onClick={() => openWhatsApp(student.studentPhone, `Halo ${student.name}, ini dari Kak Fatih Kavio Edu.`)}
                    className="flex items-center space-x-2 p-2.5 bg-blue-50 hover:bg-blue-100 text-fluent-blue rounded border border-blue-200 text-xs font-medium transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-fluent-blue" />
                    <div className="text-left">
                      <div className="font-semibold">WhatsApp Siswa ({student.name})</div>
                      <div className="text-[10px] text-blue-700">{student.studentPhone}</div>
                    </div>
                  </button>
                ) : (
                  <div className="p-2.5 bg-fluent-subtle text-fluent-textSecondary rounded border border-fluent-border text-xs">
                    No. HP Siswa Belum Diisi
                  </div>
                )}
              </div>
            </div>

            {/* Demographics & Personal Profile */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-fluent-textSecondary uppercase tracking-wider border-b border-fluent-border pb-1">
                Profil & Demografi Siswa
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-fluent-textSecondary block">Jenis Kelamin:</span>
                  <span className="font-semibold text-fluent-text">{student.gender || '-'}</span>
                </div>
                <div>
                  <span className="text-fluent-textSecondary block">Usia:</span>
                  <span className="font-semibold text-fluent-text">{student.age ? `${student.age} Tahun` : '-'}</span>
                </div>
                <div>
                  <span className="text-fluent-textSecondary block">Jenjang / Kelas:</span>
                  <span className="font-semibold text-fluent-text">{student.grade || '-'}</span>
                </div>
                <div>
                  <span className="text-fluent-textSecondary block">Domisili / Alamat:</span>
                  <span className="font-semibold text-fluent-text">{student.address || '-'}</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-fluent-textSecondary block">Target Belajar Siswa:</span>
                <p className="text-xs font-medium text-fluent-text mt-0.5 bg-fluent-subtle p-2 rounded border border-fluent-border">
                  {student.learningTarget || 'Belum ditentukan'}
                </p>
              </div>
            </div>

            {/* Course & Schedule Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-fluent-textSecondary uppercase tracking-wider border-b border-fluent-border pb-1">
                Bimbingan & Jadwal
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-fluent-textSecondary block">Paket Kursus:</span>
                  <span className="font-semibold text-fluent-text">{student.packageType}</span>
                </div>
                <div>
                  <span className="text-fluent-textSecondary block">Durasi Kursus:</span>
                  <span className="font-semibold text-fluent-text">{student.durationMonths || 1} Bulan</span>
                </div>
                <div>
                  <span className="text-fluent-textSecondary block">Sesi & Menit Belajar:</span>
                  <span className="font-semibold text-fluent-text">
                    {student.sessionsPerMonth || 4} Sesi/Bln ({student.minutesPerSession || 60} Menit/Sesi)
                  </span>
                </div>
                <div>
                  <span className="text-fluent-textSecondary block">Jadwal Kelas:</span>
                  <span className="font-semibold text-fluent-blue">{student.schedule || '-'}</span>
                </div>
              </div>
            </div>

            {/* Linked Invoices History */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-fluent-textSecondary uppercase tracking-wider border-b border-fluent-border pb-1">
                Riwayat Invoice Terkait
              </h3>
              {student.invoices && student.invoices.length > 0 ? (
                <div className="space-y-2">
                  {student.invoices.map((inv, idx) => (
                    <div key={idx} className="p-3 bg-fluent-subtle rounded border border-fluent-border flex items-center justify-between text-xs">
                      <div>
                        <div className="font-mono font-bold text-fluent-text">{inv.invoiceNo}</div>
                        <div className="text-[10px] text-fluent-textSecondary">Tanggal: {inv.invoiceDate}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-fluent-text">{formatIDR(inv.totalInvestment)}</div>
                        <span className="text-[10px] font-bold text-emerald-600">{inv.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-fluent-textSecondary italic bg-fluent-subtle p-3 rounded border border-fluent-border">
                  Belum ada riwayat invoice tersimpan untuk siswa ini.
                </p>
              )}
            </div>

          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-fluent-border bg-fluent-subtle flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onGenerateInvoice(student)
              onClose()
            }}
            className="flex-1 py-2 px-4 bg-fluent-blue hover:bg-fluent-blueHover text-white rounded-fluent font-medium text-xs flex items-center justify-center space-x-2 transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Invoice Direct</span>
          </button>
          <button
            onClick={onClose}
            className="py-2 px-4 border border-fluent-border hover:bg-white text-fluent-text rounded-fluent font-medium text-xs"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  )
}
