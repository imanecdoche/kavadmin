import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  Building2,
  Calendar,
  MapPin,
  User,
  FileText,
  Copy,
  Check,
  Search,
  ArrowLeft,
  AlertCircle,
  GraduationCap,
  Sparkles,
  ExternalLink
} from 'lucide-react'
import { logoSvg, stempelKavioEduPng, ttdFatihPng } from '../../assets'
import { lookupCertificate } from '../../utils/verificationRegistry'

export default function PublicVerificationPage({ initialId = '', onBack = null }) {
  const [searchQuery, setSearchQuery] = useState(initialId || '')
  const [certData, setCertData] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [copied, setCopied] = useState(false)

  // Load certificate data on initial mount or when initialId changes
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

    // Update URL query string without reloading page
    const newUrl = `${window.location.origin}/verify?id=${encodeURIComponent(searchQuery.trim())}`
    window.history.pushState({ id: searchQuery.trim() }, '', newUrl)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header / Nav */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoSvg} alt="Kavio Academy Logo" className="h-8 md:h-9 w-auto object-contain" />
            <div className="hidden sm:block border-l border-slate-700 pl-3">
              <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
                Official Credential Verification
              </span>
              <p className="text-[10px] text-slate-500">
                PT Kavio Investama Global • NIB 2311260068864
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1.5 border border-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
            )}
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-all shadow-sm hover:shadow inline-flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tautan Disalin!' : 'Salin Tautan'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {/* Search Bar for Other Certificates */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Masukkan Verification ID (misal: REG-KAV-2026-081)..."
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs md:text-sm font-semibold rounded-lg transition-colors"
            >
              Cari Dokumen
            </button>
          </form>
        </div>

        {/* Verification Result Card */}
        {certData ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Status Banner */}
            <div className="bg-emerald-950/70 border-b border-emerald-800/40 p-4 sm:p-6 flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400 shadow-inner">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-slate-950">
                    Resmi Terverifikasi
                  </span>
                  <span className="text-xs text-emerald-400 font-mono">
                    ID: {certData.verificationId}
                  </span>
                </div>
                <h1 className="text-base sm:text-xl font-bold text-white mt-1">
                  Kredensial Sah Terdaftar
                </h1>
                <p className="text-xs text-emerald-300/80 mt-0.5 leading-relaxed">
                  Dokumen ini telah diverifikasi secara sah melalui basis data kurikulum dan akreditasi resmi Kavio Academy di bawah naungan PT Kavio Investama Global.
                </p>
              </div>
            </div>

            {/* Certificate Core Details */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Recipient Highlight */}
              <div className="text-center py-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
                <p className="text-[11px] uppercase tracking-widest text-slate-400 font-mono">
                  Nama Siswa / Penerima Sertifikat
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
                  {certData.studentName}
                </h2>
                <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-blue-950/60 border border-blue-800/50 rounded-full text-blue-300 text-xs font-semibold">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  <span>{certData.programName} ({certData.batchName})</span>
                </div>
              </div>

              {/* Matrix of Qualification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Kualifikasi Standar CEFR</span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-white">
                    {certData.cefrLevel}
                  </p>
                </div>

                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Hasil Evaluasi & Nilai Akhir</span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-emerald-400">
                    {certData.predicate} ({certData.score})
                  </p>
                  {certData.coreDistinction && (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Distinction: {certData.coreDistinction}
                    </p>
                  )}
                </div>

                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span>Nomor Seri Sertifikat</span>
                  </div>
                  <p className="text-xs sm:text-sm font-mono font-bold text-slate-200">
                    {certData.documentId}
                  </p>
                </div>

                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Calendar className="w-4 h-4 text-sky-400" />
                    <span>Tanggal & Tempat Penerbitan</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-200">
                    {certData.completionDate}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {certData.signLocation}
                  </p>
                </div>
              </div>

              {/* Key Distinctions Breakdown if available */}
              {certData.keyDistinctions && (
                <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/30">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-3">
                    Kompetensi Akademik yang Diverifikasi
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {certData.keyDistinctions.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                        <span className="text-slate-300 font-medium">{item.subject}</span>
                        <span className="text-emerald-400 font-mono font-bold ml-2 shrink-0">{item.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Institutional & Legal Authority */}
              <div className="border-t border-slate-800 pt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span>Legalitas & Lembaga Penyelenggara</span>
                </h3>

                <div className="bg-slate-950/60 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-slate-800/80">
                    <span className="text-xs text-slate-400">Entitas Badan Hukum:</span>
                    <span className="text-xs font-bold text-white">{certData.holdingCompany}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-slate-800/80">
                    <span className="text-xs text-slate-400">Lembaga Pendidikan:</span>
                    <span className="text-xs font-bold text-white">{certData.institutionName}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-slate-800/80">
                    <span className="text-xs text-slate-400">Nomor Induk Berusaha (NIB):</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{certData.nib}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-slate-800/80">
                    <span className="text-xs text-slate-400">Klasifikasi Bidang Usaha (KBLI):</span>
                    <span className="text-xs font-semibold text-slate-200">{certData.kbli}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-slate-800/80">
                    <span className="text-xs text-slate-400">Otoritas Perizinan:</span>
                    <span className="text-xs text-slate-300">{certData.licensingAuthority}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs text-slate-400">Penanggung Jawab / Formulator:</span>
                    <span className="text-xs font-bold text-white">
                      {certData.directorName} <span className="font-normal text-slate-400">({certData.directorTitle})</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Seal Note */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex items-center justify-between gap-4">
                <div className="text-xs text-slate-400">
                  <p className="font-semibold text-slate-300">Autentikasi Integritas Dokumen</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Dokumen ini terlindungi secara digital dan dijamin oleh register resmi Kavio Academy.
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <img src={stempelKavioEduPng} alt="Seal" className="h-10 w-10 object-contain opacity-80" />
                </div>
              </div>
            </div>
          </div>
        ) : hasSearched ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Dokumen Tidak Ditemukan</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nomor identifikasi <span className="font-mono font-bold text-slate-200">"{searchQuery}"</span> tidak terdaftar dalam basis data kredensial resmi Kavio Academy. Pastikan penulisan ID sudah benar.
            </p>
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 px-4 bg-slate-950 text-center text-xs text-slate-500 mt-auto">
        <p className="font-medium text-slate-400">
          Kavio Academy • Kavio English Education • PT Kavio Investama Global
        </p>
        <p className="text-[11px] text-slate-600 mt-1">
          Kantor Pusat: Jl. Raya Labuan, Kp. Bojong Canar, Ds. Dahu, Kec. Cikedal, Kab. Pandeglang, Banten 42266
        </p>
        <p className="text-[10px] text-slate-600 mt-2 font-mono">
          NIB: 2311260068864 • KBLI 85595 • All Rights Reserved © 2026
        </p>
      </footer>
    </div>
  )
}
