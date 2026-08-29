import React from 'react'
import { Award, ShieldCheck } from 'lucide-react'
import ReportRadarChart from './ReportRadarChart'
import { formatDateIndonesian } from '../../utils/dateFormatter'
import { logoBaruPng, stempelKavioEduPng, ttdFatihPng } from '../../assets'
import { INVOICE_CONFIG } from '../../config/stampConfig'

export default function ReportCardPreview({ reportData, previewRef }) {
  if (!reportData) return null

  const {
    id = 'REP/KEEN/202608/0000',
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
    if (s >= 85) return 'bg-emerald-500'
    if (s >= 75) return 'bg-fluent-blue'
    if (s >= 65) return 'bg-teal-500'
    return 'bg-amber-500'
  }

  return (
    <div
      ref={previewRef}
      id="report-card-canvas"
      className="w-[794px] min-h-[1123px] max-w-[794px] shrink-0 bg-white border border-slate-200 shadow-2xl rounded-sm p-8 sm:p-10 text-slate-900 font-sans print:shadow-none print:border-none print:p-0 relative overflow-hidden"
      style={{ width: '794px', minHeight: '1123px', maxWidth: '794px', boxSizing: 'border-box' }}
    >
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 opacity-[0.035]">
        <span className="text-7xl sm:text-8xl font-black uppercase tracking-widest text-slate-900 -rotate-12 text-center max-w-lg leading-tight">
          KAVIO EDU
        </span>
      </div>

      {/* Content Container (Above Watermark) */}
      <div className="relative z-10 space-y-6">
        
        {/* ========================================================================= */}
        {/* 1. TOP HEADER SECTION */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-slate-900 pb-5 gap-4">
          <div className="flex items-center space-x-3.5">
            <img src={logoBaruPng} alt="Kavio Edu Logo" className="h-12 w-auto object-contain" />
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-none uppercase">
                Kavio Edu
              </h1>
              <p className="text-[11px] font-semibold text-fluent-blue mt-0.5">
                Private English Class & Academic Mentoring
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">
                Official Academic Evaluation & Progress Report
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="inline-block bg-slate-900 text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded tracking-wider uppercase">
              {id}
            </div>
            <div className="text-xs font-semibold text-slate-700 mt-1">
              Tanggal Terbit: <span className="font-bold text-slate-900">{formatDateIndonesian(issueDate)}</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Program: <span className="font-bold text-fluent-blue">Paket {programTier}</span> | {periodName}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. STUDENT PROFILE & ATTENDANCE STRIP */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs items-center">
          <div className="sm:col-span-6 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Profil Siswa Terdaftar
            </div>
            <div className="text-sm sm:text-base font-bold text-slate-900">
              {studentName || 'Nama Siswa Belum Diisi'}
            </div>
            <div className="text-[11px] text-slate-600">
              Orang Tua / Wali: <span className="font-semibold text-slate-800">{guardianName || '-'}</span>
            </div>
          </div>

          <div className="sm:col-span-6 flex items-center justify-start sm:justify-end sm:border-l sm:border-slate-200 sm:pl-4 space-x-4">
            <div className="text-left sm:text-right">
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
            <div className="text-emerald-700 font-extrabold font-mono text-sm sm:text-base whitespace-nowrap pl-1">
              {attendance.attendanceRate}% Hadir
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. MULTI-AXIS PERFORMANCE VISUALIZATION & RUBRIC TABLE */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Left: Radar Chart Component */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              DIAGRAM RADAR KOMPETENSI
            </div>
            <ReportRadarChart
              competencies={competencies}
              size={240}
              accentColor="#0078D4"
            />
          </div>

          {/* Right: Detailed Competency Score Table */}
          <div className="lg:col-span-7 space-y-2">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between pb-1 border-b border-slate-200">
              <span>Rubrik & Indikator Capaian</span>
              <span className="text-[10px] font-semibold text-slate-500">Skor / 100</span>
            </div>

            <div className="space-y-2">
              {competencies.map((comp) => {
                const s = Number(comp.score) || 0
                return (
                  <div key={comp.key} className="bg-slate-50/70 p-2.5 rounded border border-slate-100 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <span>{(comp.key && INDONESIAN_LABEL_MAP[comp.key]) || comp.label}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({comp.weight}%)</span>
                      </div>
                      <span className="font-bold font-mono text-xs text-slate-900 min-w-[28px] text-right">
                        {s}
                      </span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
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
        {/* 4. SUMMARY ACHIEVEMENT HIGHLIGHTS BANNER */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-gradient-to-r from-blue-900 to-slate-900 text-white p-4 rounded-xl shadow-sm items-center">
          <div className="sm:col-span-4 flex items-center space-x-3 border-b sm:border-b-0 sm:border-r border-blue-700/50 pb-3 sm:pb-0 sm:pr-4">
            <Award className="w-8 h-8 text-amber-300 shrink-0" />
            <div>
              <div className="text-[10px] font-semibold text-blue-200 uppercase tracking-wider">
                Skor Komposit Akhir
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight leading-none text-white">
                {Number(compositeScore).toFixed(1)}
                <span className="text-xs font-normal text-blue-300 ml-1">/ 100</span>
              </div>
            </div>
          </div>

          <div className="sm:col-span-3 flex flex-col justify-center items-start sm:items-center border-b sm:border-b-0 sm:border-r border-blue-700/50 pb-3 sm:pb-0 sm:pr-4">
            <div className="text-[10px] font-semibold text-blue-200 uppercase tracking-wider">
              Predikat
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight leading-none mt-0.5 font-mono">
              {letterGrade}
            </div>
          </div>

          <div className="sm:col-span-5 space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded tracking-wide font-mono">
                {performanceCategory.label || 'PROFICIENT'}
              </span>
            </div>
            <p className="text-[11px] text-blue-100 leading-relaxed">
              {performanceCategory.description}
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. EVALUATOR'S QUALITATIVE FEEDBACK & NEXT TARGETS */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Evaluasi Kualitatif & Rekomendasi Mentor
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Key Strengths */}
            <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200/80 space-y-1">
              <div className="font-bold text-emerald-900 text-[11px] uppercase tracking-wide">
                Kekuatan & Capaian Unggulan
              </div>
              <p className="text-[11px] text-emerald-950 leading-relaxed">
                {qualitativeAssessment.keyStrengths || '-'}
              </p>
            </div>

            {/* Areas for Growth */}
            <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-200/80 space-y-1">
              <div className="font-bold text-amber-900 text-[11px] uppercase tracking-wide">
                Fokus Peningkatan Selanjutnya
              </div>
              <p className="text-[11px] text-amber-950 leading-relaxed">
                {qualitativeAssessment.areasForImprovement || '-'}
              </p>
            </div>
          </div>

          {/* Next Roadmap Target Banner */}
          <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-200 text-xs space-y-1">
            <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">
              Target Kurikulum & Sesi Berikutnya
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              {qualitativeAssessment.nextRoadmapTarget || 'Melanjutkan modul pembelajaran sesuai jenjang kurikulum.'}
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 6. LEGAL VERIFICATION & DIGITAL SIGNATURE FOOTER */}
        {/* ========================================================================= */}
        <div className="border-t border-slate-200 pt-5 flex justify-between items-end text-xs">
          {/* Verification Badge Left */}
          <div className="space-y-1.5 max-w-[260px]">
            <div className="flex items-center space-x-1.5 text-emerald-700 font-bold text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
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
    </div>
  )
}
