import React from 'react'
import { ShieldCheck } from 'lucide-react'
import ReportRadarChart from './ReportRadarChart'
import { formatDateIndonesian } from '../../utils/dateFormatter'
import { logoBaruPng, stempelKavioEduPng, ttdFatihPng } from '../../assets'
import { INVOICE_CONFIG } from '../../config/stampConfig'

export default function ReportCardPreview({ reportData, previewRef }) {
  if (!reportData) return null

  const {
    id = 'REP/KEEN/202608/0000',
    documentTitle = 'LAPORAN PERKEMBANGAN BELAJAR RESMI',
    documentSubtitle = 'Official Academic Progress & Competency Evaluation',
    studentName = '-',
    guardianName = '-',
    programTier = 'GROW',
    periodName = 'Periode Belajar',
    issueDate = new Date().toISOString().split('T')[0],
    attendance = { totalSessions: 8, attendedSessions: 8, attendanceRate: 100, punctualityRate: 100 },
    competencies = [],
    compositeScore = 85.0,
    letterGrade = 'A',
    performanceCategory = {
      label: 'PROFICIENT',
      description: 'Pemahaman materi sangat solid, komunikasi aktif & minim kesalahan mendasar.',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300'
    },
    qualitativeAssessment = {
      keyStrengths: 'Siswa menunjukkan antusiasme tinggi dan pemahaman konsep yang cepat.',
      areasForImprovement: 'Perlu memperluas variasi kosakata formal dalam sesi speaking.',
      generalNotes: 'Progres belajar sangat memuaskan.',
      nextRoadmapTarget: 'Modul Grammar Tingkat Menengah & Percakapan Tematik.'
    },
    evaluatorName = 'FATIH FARHAT ASSHIDIQ',
    evaluatorTitle = 'Founder & Academic Director',
    verification = { isSigned: true, isStamped: true }
  } = reportData

  const INDONESIAN_LABEL_MAP = {
    grammar: 'Tata Bahasa & Struktur Kalimat',
    vocabulary: 'Kosakata & Penguasaan Idiom',
    speaking: 'Kelancaran Berbicara & Pelafalan',
    listening: 'Pemahaman Mendengar & Simakan',
    discipline: 'Kedisiplinan & Tugas Mandiri'
  }

  // Color mapper for individual progress bars
  const getScoreBarColor = (score) => {
    const s = Number(score) || 0
    if (s >= 85) return 'bg-emerald-600'
    if (s >= 75) return 'bg-fluent-blue'
    if (s >= 65) return 'bg-teal-600'
    return 'bg-amber-600'
  }

  return (
    <div
      ref={previewRef}
      id="report-card-canvas"
      className="w-[794px] min-h-[1123px] max-w-[794px] shrink-0 bg-white border border-slate-200 shadow-2xl p-8 sm:p-10 text-slate-900 font-sans print:shadow-none print:border-none print:p-0 relative overflow-hidden flex flex-col justify-between"
      style={{ width: '794px', minHeight: '1123px', maxWidth: '794px', boxSizing: 'border-box' }}
    >
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 opacity-[0.03]">
        <span className="text-8xl font-black uppercase tracking-widest text-slate-900 -rotate-12 text-center max-w-lg leading-tight">
          KAVIO EDU
        </span>
      </div>

      {/* Main Content Sections (Above Watermark) */}
      <div className="relative z-10 space-y-5">
        
        {/* ========================================================================= */}
        {/* 1. TOP HEADER SECTION */}
        {/* ========================================================================= */}
        <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4">
          <div className="flex items-center space-x-3.5">
            <img src={logoBaruPng} alt="Kavio Edu Logo" className="h-12 w-auto object-contain" />
            <div>
              <h1 className="text-lg font-brand-header text-slate-900 leading-none">
                KAVIO EDU
              </h1>
              <p className="text-[11px] font-bold text-fluent-blue mt-0.5 leading-tight tracking-wide">
                Private English Class & Academic Mentoring
              </p>
              <p className="text-[10px] text-slate-500 font-medium leading-tight">
                Official Academic Evaluation & Progress Report
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[11px] font-mono font-bold text-slate-800 tracking-wider">
              NO. DOKUMEN: {id}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              Tanggal Terbit: <span className="font-semibold text-slate-900">{formatDateIndonesian(issueDate)}</span>
            </p>
            <p className="text-xs text-slate-600">
              Program: <span className="font-bold text-fluent-blue">Paket {programTier}</span> | {periodName}
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1.5 FORMAL DOCUMENT TITLE BANNER */}
        {/* ========================================================================= */}
        <div className="text-center py-1.5 border-b border-slate-300">
          <h2 className="text-sm font-black tracking-widest text-slate-900 uppercase font-mono">
            {documentTitle || 'LAPORAN PERKEMBANGAN BELAJAR RESMI'}
          </h2>
          <p className="text-[10px] font-semibold text-slate-500 tracking-wide uppercase mt-0.5">
            {documentSubtitle || 'Official Academic Progress & Competency Evaluation'}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 2. STUDENT PROFILE & ATTENDANCE (FLAT & DIVIDER-BASED) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-12 gap-4 pb-4 border-b border-slate-300 text-xs items-center">
          <div className="col-span-7 space-y-0.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              PROFIL SISWA
            </div>
            <div className="text-base font-extrabold text-slate-900 tracking-tight">
              {studentName || 'Nama Siswa Belum Diisi'}
            </div>
            <div className="text-[11px] text-slate-600">
              Orang Tua / Wali: <span className="font-semibold text-slate-800">{guardianName || '-'}</span>
            </div>
          </div>

          <div className="col-span-5 flex items-center justify-end border-l border-slate-300 pl-4 space-x-4">
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                PRESENSI & KEHADIRAN
              </div>
              <div className="text-xs font-bold text-slate-800 mt-0.5 whitespace-nowrap font-mono">
                {attendance.attendedSessions} / {attendance.totalSessions} Sesi
              </div>
              <div className="text-[10px] text-slate-500 whitespace-nowrap">
                Ketepatan: {attendance.punctualityRate || 100}%
              </div>
            </div>
            <div className="text-emerald-700 font-black font-mono text-base whitespace-nowrap pl-1">
              {attendance.attendanceRate}% Hadir
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. MULTI-AXIS PERFORMANCE VISUALIZATION & RUBRIC TABLE (FLAT) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-12 gap-6 items-center">
          {/* Left: Radar Chart */}
          <div className="col-span-5 flex flex-col items-center justify-center">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 text-center">
              DIAGRAM RADAR KOMPETENSI
            </div>
            <ReportRadarChart
              competencies={competencies}
              size={240}
              accentColor="#0078D4"
            />
          </div>

          {/* Right: Detailed Competency List */}
          <div className="col-span-7 space-y-2">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between pb-1.5 border-b border-slate-300">
              <span>Rubrik & Indikator Capaian</span>
              <span className="text-[10px] font-semibold text-slate-500">Skor / 100</span>
            </div>

            <div className="divide-y divide-slate-100">
              {competencies.map((comp) => {
                const s = Number(comp.score) || 0
                return (
                  <div key={comp.key} className="py-2 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <span>{(comp.key && INDONESIAN_LABEL_MAP[comp.key]) || comp.label}</span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal">({comp.weight}%)</span>
                      </div>
                      <span className="font-bold font-mono text-xs text-slate-900 min-w-[28px] text-right">
                        {s}
                      </span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${getScoreBarColor(s)}`}
                        style={{ width: `${s}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. SUMMARY ACHIEVEMENT HIGHLIGHTS (FLAT DIVIDER-BASED) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-12 gap-4 border-y-2 border-slate-900 py-3.5 items-center">
          {/* Kolom 1: Skor Komposit */}
          <div className="col-span-4 border-r border-slate-300 pr-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              SKOR KOMPOSIT AKHIR
            </div>
            <div className="text-3xl font-black font-mono tracking-tight leading-none text-slate-900 mt-1 flex items-baseline">
              {Number(compositeScore).toFixed(1)}
              <span className="text-xs font-semibold text-slate-400 ml-1">/ 100</span>
            </div>
          </div>

          {/* Kolom 2: Predikat Huruf */}
          <div className="col-span-3 border-r border-slate-300 pr-3 text-center sm:text-left">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              PREDIKAT
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight leading-none font-mono mt-1">
              {letterGrade}
            </div>
          </div>

          {/* Kolom 3: Kategori Kinerja & Deskripsi */}
          <div className="col-span-5 space-y-0.5">
            <div className="text-xs font-black uppercase text-fluent-blue font-mono tracking-wide">
              {performanceCategory.label || 'PROFICIENT'}
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              {performanceCategory.description}
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. EVALUATOR'S QUALITATIVE FEEDBACK (FLAT & MINIMALIST) */}
        {/* ========================================================================= */}
        <div className="space-y-3 pt-1">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1">
            Evaluasi Kualitatif & Rekomendasi Mentor
          </div>

          <div className="grid grid-cols-2 gap-5 text-xs">
            {/* Key Strengths */}
            <div className="space-y-1">
              <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                Kekuatan & Capaian Unggulan
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {qualitativeAssessment.keyStrengths || '-'}
              </p>
            </div>

            {/* Areas for Growth */}
            <div className="space-y-1">
              <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                Fokus Peningkatan Selanjutnya
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {qualitativeAssessment.areasForImprovement || '-'}
              </p>
            </div>
          </div>

          {/* Next Roadmap Target */}
          <div className="pt-2 border-t border-slate-200 text-xs space-y-0.5">
            <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">
              Target Kurikulum & Sesi Berikutnya:
            </span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              {qualitativeAssessment.nextRoadmapTarget || 'Melanjutkan modul pembelajaran sesuai jenjang kurikulum.'}
            </p>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 6. LEGAL VERIFICATION & DIGITAL SIGNATURE FOOTER */}
      {/* ========================================================================= */}
      <div className="relative z-10 border-t-2 border-slate-900 pt-5 mt-4 flex justify-between items-end text-xs">
        {/* Verification Badge Left */}
        <div className="space-y-1 max-w-[280px]">
          <div className="flex items-center space-x-1.5 text-emerald-700 font-bold text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Dokumen Resmi Terverifikasi</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Laporan diterbitkan secara sah oleh Kavio Edu Management. Keaslian dokumen dapat diverifikasi secara daring.
          </p>
          <div className="font-mono text-[9px] text-slate-400">
            Security Hash: {id.replace(/[^a-zA-Z0-9]/g, '')}-KEEN
          </div>
        </div>

        {/* Signature & Seal Block Right */}
        <div className="text-right space-y-1 pr-2">
          <p className="text-[10px] text-slate-500 pb-16 font-medium">
            Pandeglang, {formatDateIndonesian(issueDate)}
          </p>

          <div className="relative inline-block">
            {/* Digital Signature Overlay */}
            {verification.isSigned && (
              <img
                src={ttdFatihPng}
                alt="Tanda Tangan Founder Kavio"
                style={{
                  height: `${INVOICE_CONFIG.signature.sizeHeightPx || 120}px`,
                  opacity: INVOICE_CONFIG.signature.opacity || 0.95,
                  bottom: `${INVOICE_CONFIG.signature.offsetBottomPx || 5}px`
                }}
                className="absolute right-0 w-auto object-contain pointer-events-none z-20"
              />
            )}

            {/* Official Stamp Overlay */}
            {verification.isStamped && (
              <img
                src={stempelKavioEduPng}
                alt="Stempel Resmi Kavio Edu"
                style={{
                  height: `${INVOICE_CONFIG.kavioStamp.sizeHeightPx || 100}px`,
                  opacity: INVOICE_CONFIG.kavioStamp.opacity || 0.75,
                  transform: `rotate(${INVOICE_CONFIG.kavioStamp.rotationDeg || -12}deg)`
                }}
                className="absolute -right-4 bottom-0 w-auto object-contain pointer-events-none z-10"
              />
            )}

            <p className="text-xs font-bold text-slate-900 border-b border-slate-400 pb-0.5 relative z-30 tracking-tight">
              {evaluatorName}
            </p>
          </div>

          <p className="text-[10px] text-slate-500 block relative z-30 font-semibold">
            {evaluatorTitle}
          </p>
        </div>
      </div>
    </div>
  )
}
