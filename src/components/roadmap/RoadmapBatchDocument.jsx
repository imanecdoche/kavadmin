import React from 'react'
import { ShieldCheck } from 'lucide-react'
import SessionCard from './SessionCard'
import { formatDateIndonesian } from '../../utils/dateFormatter'
import { logoBaruPng, stempelKavioEduPng, ttdFatihPng } from '../../assets'
import { INVOICE_CONFIG } from '../../config/stampConfig'
import { calculateOverallRoadmapProgress, getAcademicLevelBadge } from '../../utils/roadmapCalculator'

export default function RoadmapBatchDocument({
  roadmapData,
  previewRef,
  onSelectSession = null,
  readOnly = false
}) {
  if (!roadmapData) return null

  const {
    id = 'ROA/KEEN/202608/0001',
    studentName = 'Nama Siswa',
    guardianName = '-',
    packageTier = 'GROW',
    batchName = 'BATCH 1',
    durationMonths = 3,
    sessionsPerMonth = 4,
    level = 'A2',
    moduleTitle = 'Kurikulum Bahasa Inggris Berjenjang',
    issueDate = new Date().toISOString().split('T')[0],
    sessions = [],
    evaluatorName = 'FATIH FARHAT ASSHIDIQ',
    evaluatorTitle = 'Founder & Academic Director',
    verification = { isSigned: true, isStamped: true }
  } = roadmapData

  const stats = calculateOverallRoadmapProgress(sessions)
  const totalSessions = sessions.length || (sessionsPerMonth * durationMonths)
  const levelBadge = getAcademicLevelBadge(level)

  return (
    <div
      ref={previewRef}
      id="roadmap-batch-canvas"
      className="w-[794px] min-h-[1123px] max-w-[794px] shrink-0 bg-white border border-slate-200 shadow-2xl p-8 sm:p-10 text-slate-900 font-sans print:shadow-none print:border-none print:p-0 relative overflow-hidden flex flex-col justify-between"
      style={{ width: '794px', minHeight: '1123px', maxWidth: '794px', boxSizing: 'border-box' }}
    >
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 opacity-[0.025]">
        <span className="text-8xl font-black uppercase tracking-widest text-slate-900 -rotate-12 text-center max-w-lg leading-tight">
          KAVIO EDU
        </span>
      </div>

      {/* Main Content (Above Watermark) */}
      <div className="relative z-10 space-y-4">
        
        {/* ========================================================================= */}
        {/* 1. TOP HEADER SECTION */}
        {/* ========================================================================= */}
        <div className="flex justify-between items-center pb-3">
          <div className="flex items-center space-x-3.5">
            <img src={logoBaruPng} alt="Kavio Edu Logo" className="h-12 w-auto object-contain" />
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase">
                Kavio Edu
              </h1>
              <p className="text-[11px] font-bold text-fluent-blue mt-0.5 leading-tight tracking-wide">
                Private English Class & Academic Mentoring
              </p>
              <p className="text-[10px] text-slate-500 font-medium leading-tight">
                Official 1-Batch Modular Learning Roadmap
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[11px] font-mono font-bold text-slate-800 tracking-wider">
              NO. DOKUMEN: {id}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              Program: <span className="font-bold text-fluent-blue">Paket {packageTier}</span> | Level <span className="font-bold text-slate-900">{level}</span>
            </p>
            <p className="text-xs text-slate-600">
              Periode: <span className="font-semibold text-slate-900">{batchName}</span> ({durationMonths} Bulan • {totalSessions} Sesi)
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. STUDENT INFO & BATCH PROGRESS STRIP */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-12 gap-4 pb-3 border-t border-slate-300 pt-3 text-xs items-center">
          <div className="col-span-6 space-y-0.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              PROFIL SISWA
            </div>
            <div className="text-base font-extrabold text-slate-900 tracking-tight">
              {studentName || 'Nama Siswa'}
            </div>
            <div className="text-[11px] text-slate-600">
              Orang Tua / Wali: <span className="font-semibold text-slate-800">{guardianName || '-'}</span>
            </div>
          </div>

          <div className="col-span-6 flex items-center justify-end border-l border-slate-300 pl-4 space-x-4">
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                CAPAIAN BATCH 1
              </div>
              <div className="text-xs font-bold text-slate-800 mt-0.5 whitespace-nowrap font-mono">
                {stats.completedCount} / {stats.totalSessions} Sesi Tuntas
              </div>
              <div className="text-[10px] text-slate-500 whitespace-nowrap">
                Sedang Berjalan: {stats.inProgressCount} Sesi
              </div>
            </div>
            <div className="text-emerald-700 font-black font-mono text-base whitespace-nowrap pl-1">
              {stats.percentage}% Tuntas
            </div>
          </div>
        </div>

        {/* [Divider Level 3]: Header boundary line */}
        <div className="border-b-2 border-slate-800 my-2" />

        {/* ========================================================================= */}
        {/* 3. LIST OF GRANULAR SESSION CARDS (FLAT & DIVIDER-BASED) */}
        {/* ========================================================================= */}
        <div className="space-y-0">
          {sessions.map((session, idx) => (
            <SessionCard
              key={session.id || idx}
              session={session}
              index={idx}
              isLast={idx === sessions.length - 1}
              onClick={onSelectSession}
              readOnly={readOnly}
            />
          ))}
        </div>

        {/* [Divider Level 3]: Footer boundary line */}
        <div className="border-b-2 border-slate-800 my-2" />

      </div>

      {/* ========================================================================= */}
      {/* 4. LEGAL VERIFICATION & DIGITAL SIGNATURE FOOTER */}
      {/* ========================================================================= */}
      <div className="relative z-10 border-t border-slate-300 pt-4 mt-2 flex justify-between items-end text-xs">
        {/* Verification Info Left */}
        <div className="space-y-1 max-w-[280px]">
          <div className="flex items-center space-x-1.5 text-emerald-700 font-bold text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Roadmap Resmi Terverifikasi</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Alur kurikulum disusun secara terstruktur oleh Kavio Edu Academic Board dan dipantau berkala per sesi.
          </p>
          <div className="font-mono text-[9px] text-slate-400">
            Security Hash: {id.replace(/[^a-zA-Z0-9]/g, '')}-ROAD
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
