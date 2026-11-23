import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Award,
  Building2,
  Calendar,
  FileText,
  Copy,
  Check,
  Search,
  ArrowLeft,
  AlertCircle,
  Printer
} from 'lucide-react'
import { logoSvg, stempelKavioEduPng, ttdFatihPng } from '../../assets'
import { lookupCertificate } from '../../utils/verificationRegistry'

export default function PublicVerificationPage({ initialId = '', onBack = null }) {
  const [searchQuery, setSearchQuery] = useState(initialId || '')
  const [certData, setCertData] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const idToLookup = initialId || new URLSearchParams(window.location.search).get('id') || 'REG-KAV-2026-081'
    if (idToLookup) {
      setSearchQuery(idToLookup)
      const found = lookupCertificate(idToLookup)
      setCertData(found)
      setHasSearched(true)
    }
  }, [initialId])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    const found = lookupCertificate(searchQuery.trim())
    setCertData(found)
    setHasSearched(true)

    const newUrl = `${window.location.origin}/verify?id=${encodeURIComponent(searchQuery.trim())}`
    window.history.pushState({ id: searchQuery.trim() }, '', newUrl)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-300 py-3 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoSvg} alt="Kavio Academy" className="h-9 w-auto object-contain" />
            <div className="hidden sm:block border-l border-slate-300 pl-3">
              <span className="text-xs font-bold text-slate-900 tracking-wider uppercase block">
                Portal Verifikasi Kredensial Resmi
              </span>
              <span className="text-[11px] text-slate-600 block">
                PT Kavio Investama Global • NIB: 2311260068864
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Cetak Halaman Verifikasi"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-300 transition-colors inline-flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
            <button
              onClick={handleCopyLink}
              title={copied ? "Tautan berhasil disalin" : "Salin Tautan"}
              aria-label="Salin Tautan"
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 transition-colors inline-flex items-center justify-center"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-700" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8">
        {/* Search Bar */}
        <div className="mb-6 bg-white p-3 rounded border border-slate-300 shadow-sm print:hidden">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Masukkan Nomor Verifikasi (Contoh: REG-KAV-2026-081)..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-600 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded transition-colors"
            >
              Cari
            </button>
          </form>
        </div>

        {/* Verification Result */}
        {certData ? (
          <div className="bg-white border border-slate-300 rounded shadow-sm divide-y divide-slate-200">
            {/* Status Header */}
            <div className="p-4 sm:p-5 bg-emerald-50/70 border-b border-emerald-200 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                    Status: Valid dan Sah Terverifikasi
                  </span>
                  <span className="text-[11px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                    ID: {certData.verificationId}
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  Dokumen kredensial ini telah divalidasi secara resmi melalui pangkalan data akademik Kavio Academy dan terdaftar di bawah naungan badan hukum PT Kavio Investama Global.
                </p>
              </div>
            </div>

            {/* Section 1: Recipient Identity */}
            <div className="p-5 sm:p-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                1. Identitas Penerima Kredensial
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded border border-slate-200">
                <div>
                  <span className="block text-[11px] font-medium text-slate-500 uppercase">Nama Lengkap Siswa</span>
                  <span className="text-base sm:text-lg font-bold text-slate-900">{certData.studentName}</span>
                </div>
                <div>
                  <span className="block text-[11px] font-medium text-slate-500 uppercase">Program Pembelajaran</span>
                  <span className="text-sm font-bold text-slate-800">{certData.programName} ({certData.batchName})</span>
                </div>
                <div>
                  <span className="block text-[11px] font-medium text-slate-500 uppercase">Jenjang Kualifikasi CEFR</span>
                  <span className="text-sm font-bold text-slate-900">{certData.cefrLevel}</span>
                </div>
                <div>
                  <span className="block text-[11px] font-medium text-slate-500 uppercase">Hasil Evaluasi / Predikat</span>
                  <span className="text-sm font-bold text-emerald-700">{certData.predicate} ({certData.score})</span>
                </div>
                {certData.coreDistinction && (
                  <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                    <span className="block text-[11px] font-medium text-slate-500 uppercase">Distingsi Penguasaan Inti</span>
                    <span className="text-xs font-semibold text-slate-800">{certData.coreDistinction}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Document Credential Details */}
            <div className="p-5 sm:p-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                2. Detail Administrasi Sertifikat
              </h2>
              <table className="w-full text-xs text-left border-collapse border border-slate-200">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="w-1/3 p-2.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Nomor Seri Sertifikat</td>
                    <td className="p-2.5 font-mono font-bold text-slate-900">{certData.documentId}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Verification ID</td>
                    <td className="p-2.5 font-mono font-bold text-slate-900">{certData.verificationId}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Tanggal Penerbitan</td>
                    <td className="p-2.5 text-slate-800">{certData.completionDate}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Tempat Penerbitan</td>
                    <td className="p-2.5 text-slate-800">{certData.signLocation}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Total Durasi Pembelajaran</td>
                    <td className="p-2.5 text-slate-800">{certData.totalSessions} Sesi Terstruktur (Evaluasi Tuntas)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 3: Legal Authority */}
            <div className="p-5 sm:p-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                3. Legalitas Lembaga Penyelenggara
              </h2>
              <table className="w-full text-xs text-left border-collapse border border-slate-200">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="w-1/3 p-2.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Badan Hukum Induk</td>
                    <td className="p-2.5 font-bold text-slate-900">{certData.holdingCompany}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Unit Pendidikan & Bimbingan</td>
                    <td className="p-2.5 font-semibold text-slate-800">{certData.institutionName}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Nomor Induk Berusaha (NIB)</td>
                    <td className="p-2.5 font-mono font-bold text-slate-900">{certData.nib}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Klasifikasi Bidang Usaha (KBLI)</td>
                    <td className="p-2.5 text-slate-800">{certData.kbli}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Otoritas Perizinan Resmi</td>
                    <td className="p-2.5 text-slate-800">{certData.licensingAuthority}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Penanggung Jawab / Formulator</td>
                    <td className="p-2.5 text-slate-900">
                      <span className="font-bold">{certData.directorName}</span> ({certData.directorTitle})
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Alamat Kantor Resmi</td>
                    <td className="p-2.5 text-slate-800">{certData.officeAddress}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 4: Validation Seal & Signature */}
            <div className="p-6 bg-slate-50 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-8 border-t border-slate-200">
              {/* Stempel di atas label */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <img
                  src={stempelKavioEduPng}
                  alt="Cap Stempel Resmi"
                  className="h-20 w-20 object-contain mb-2"
                />
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-slate-900 block">Stempel Pengesahan Resmi</span>
                  <span className="block text-[11px] text-slate-600">Kavio Academy • PT Kavio Investama Global</span>
                  <span className="block text-[11px] font-mono text-slate-500">Tersertifikasi NIB 2311260068864</span>
                </div>
              </div>

              {/* TTD di atas nama Fatih */}
              <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
                <img
                  src={ttdFatihPng}
                  alt="Tanda Tangan Formulator"
                  className="h-20 w-auto object-contain mb-1"
                />
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-slate-900 text-sm block">{certData.directorName}</span>
                  <span className="block text-[11px] text-slate-500">{certData.directorTitle}</span>
                </div>
              </div>
            </div>
          </div>
        ) : hasSearched ? (
          <div className="bg-white border border-slate-300 rounded p-8 text-center max-w-md mx-auto space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 uppercase">Dokumen Tidak Ditemukan</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Nomor identifikasi <span className="font-mono font-bold text-slate-900">"{searchQuery}"</span> tidak terdaftar dalam pangkalan data resmi Kavio Academy.
            </p>
          </div>
        ) : null}
      </main>

      {/* Formal Footer */}
      <footer className="border-t border-slate-300 py-4 px-4 bg-white text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-700">
          Kavio Academy • Kavio English Education • PT Kavio Investama Global
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Kantor Pusat: Jl. Raya Labuan, Kp. Bojong Canar, Ds. Dahu, Kec. Cikedal, Kab. Pandeglang, Banten 42266
        </p>
        <p className="text-[10px] text-slate-400 mt-1 font-mono">
          NIB: 2311260068864 • KBLI: 85595 • Hak Cipta Dilindungi Undang-Undang © 2026
        </p>
      </footer>
    </div>
  )
}
