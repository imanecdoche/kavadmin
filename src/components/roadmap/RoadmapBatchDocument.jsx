import React from 'react'
import { ShieldCheck, BookOpen, ChevronRight } from 'lucide-react'
import SessionCard from './SessionCard'
import { formatDateIndonesian } from '../../utils/dateFormatter'
import { logoSvg, logoBaruPng, stempelKavioEduPng, ttdFatihPng } from '../../assets'
import { INVOICE_CONFIG } from '../../config/stampConfig'
import { calculateOverallRoadmapProgress, getAcademicLevelBadge } from '../../utils/roadmapCalculator'
import { getPaperSizeConfig, paginateRoadmapSessions } from '../../utils/paperDimensions'

export default function RoadmapBatchDocument({
  roadmapData,
  previewRef,
  onSelectSession = null,
  readOnly = false,
  paperSize = null
}) {
  if (!roadmapData) return null

  const {
    id = 'ROA/KEEN/202608/0001',
    roadmapTitle = 'PETA ALUR BELAJAR MODULAR 1-BATCH',
    roadmapSubtitle = 'OFFICIAL 1-BATCH MODULAR LEARNING ROADMAP & SESSION MATRIX',
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

  const activePaperKey = paperSize || roadmapData.paperSize || 'a4'
  const paperConfig = getPaperSizeConfig(activePaperKey)

  const stats = calculateOverallRoadmapProgress(sessions)
  const totalSessions = sessions.length || (sessionsPerMonth * durationMonths)
  const levelBadge = getAcademicLevelBadge(level)

  // Sistem Pemotongan Halaman Pintar (Smart Page Break)
  const paginatedPages = paginateRoadmapSessions(sessions, activePaperKey)
  const totalPages = paginatedPages.length

  return (
    <div
      ref={previewRef}
      id="roadmap-export-canvas"
      className="flex flex-col gap-8 print:gap-0 select-text"
      style={{ width: `${paperConfig.widthPx}px` }}
    >
      {paginatedPages.map((pageSessions, pageIdx) => {
        const isFirstPage = pageIdx === 0
        const isLastPage = pageIdx === totalPages - 1
        const currentPageNumber = pageIdx + 1

        return (
          <div
            key={`page-${pageIdx}`}
            className="roadmap-page relative bg-white border border-slate-200 shadow-2xl p-8 sm:p-10 text-slate-900 font-sans print:shadow-none print:border-none print:p-0 flex flex-col justify-between overflow-hidden shrink-0"
            style={{
              width: `${paperConfig.widthPx}px`,
              minHeight: `${paperConfig.heightPx}px`,
              height: `${paperConfig.heightPx}px`,
              maxWidth: `${paperConfig.widthPx}px`,
              boxSizing: 'border-box',
              pageBreakAfter: isLastPage ? 'auto' : 'always',
              breakAfter: isLastPage ? 'auto' : 'page'
            }}
          >
            {/* Background Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 opacity-[0.025]">
              <span className="text-8xl font-black uppercase tracking-widest text-slate-900 -rotate-12 text-center max-w-lg leading-tight">
                KAVIO EDU
              </span>
            </div>

            {/* Content Container (Top & Middle) */}
            <div className="relative z-10 space-y-3.5 flex-1">
              
              {/* ========================================================================= */}
              {/* HEADER SECTION: FULL ON PAGE 1, COMPACT CONTINUATION ON PAGE 2+ */}
              {/* ========================================================================= */}
              {isFirstPage ? (
                <>
                  {/* Top Header Section */}
                  <div className="flex justify-between items-center pb-2.5">
                    <div className="flex items-center space-x-3.5">
                      <img src={logoSvg} alt="Kavio Edu Logo" className="h-10 w-auto object-contain" />
                      <div>
                        <h1 className="text-lg font-brand-header text-slate-900 leading-none">
                          KAVIO EDU
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

                  {/* Formal Document Title Banner */}
                  <div className="text-center py-1.5 border-y border-slate-300">
                    <h2 className="text-sm font-black tracking-widest text-slate-900 uppercase font-mono">
                      {roadmapTitle || 'PETA ALUR BELAJAR MODULAR 1-BATCH'}
                    </h2>
                    <p className="text-[10px] font-semibold text-slate-500 tracking-wide uppercase mt-0.5">
                      {roadmapSubtitle || 'OFFICIAL 1-BATCH MODULAR LEARNING ROADMAP & SESSION MATRIX'}
                    </p>
                  </div>

                  {/* Student Info & Batch Progress Strip */}
                  <div className="grid grid-cols-12 gap-4 pb-3 border-b border-slate-300 pt-1 text-xs items-center">
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

                  {/* Header boundary line */}
                  <div className="border-b-2 border-slate-800 my-2" />
                </>
              ) : (
                /* Continuation Header for Page 2+ */
                <div className="pb-2 border-b-2 border-slate-800">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-2.5">
                      <img src={logoSvg} alt="Kavio Edu Logo" className="h-6 w-auto object-contain" />
                      <div>
                        <span className="font-bold text-slate-900 tracking-tight font-brand-header text-sm">
                          KAVIO EDU
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium ml-2">
                          • Peta Alur Belajar (Lanjutan)
                        </span>
                      </div>
                    </div>
                    <div className="text-right font-mono text-[10px] text-slate-600">
                      <span>{id}</span> • <span className="font-semibold text-slate-900">{studentName}</span> ({batchName})
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* LIST OF GRANULAR SESSION CARDS (SMART NO-SPLIT) */}
              {/* ========================================================================= */}
              <div className="space-y-0">
                {pageSessions.map((session, sIdx) => {
                  const globalIdx = sessions.findIndex(s => s.id === session.id)
                  const isCardLastInDoc = isLastPage && sIdx === pageSessions.length - 1

                  return (
                    <SessionCard
                      key={session.id || sIdx}
                      session={session}
                      index={globalIdx >= 0 ? globalIdx : sIdx}
                      isLast={isCardLastInDoc}
                      onClick={onSelectSession}
                      readOnly={readOnly}
                    />
                  )
                })}
              </div>

            </div>

            {/* ========================================================================= */}
            {/* FOOTER SECTION: SIGNATURE & LEGAL ON LAST PAGE, CONTINUATION ON EARLIER */}
            {/* ========================================================================= */}
            {isLastPage ? (
              <div className="relative z-10 pt-2 shrink-0">
                {/* Boundary Line */}
                <div className="border-b-2 border-slate-800 mb-3" />

                {/* Legal Verification & Digital Signature */}
                <div className="border-t border-slate-300 pt-3 flex justify-between items-end text-xs">
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
                      Hash: {id.replace(/[^a-zA-Z0-9]/g, '')}-ROAD • Format: {paperConfig.name}
                    </div>
                  </div>

                  {/* Signature & Seal Block Right */}
                  <div className="text-right space-y-1 pr-2">
                    <p className="text-[10px] text-slate-500 pb-14 font-medium">
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

                {/* Page Number Indicator */}
                <div className="text-center pt-2 text-[10px] text-slate-400 font-mono">
                  Halaman {currentPageNumber} dari {totalPages} • Kavio Edu Academic Document ({paperConfig.name})
                </div>
              </div>
            ) : (
              /* Continuation Footer Note on Earlier Pages */
              <div className="relative z-10 pt-2 border-t border-slate-200 shrink-0">
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1 text-slate-600 font-semibold">
                    <span>Bersambung ke Halaman {currentPageNumber + 1}</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </span>
                  <span className="font-mono">
                    Halaman {currentPageNumber} dari {totalPages} • {paperConfig.name}
                  </span>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
