import React, { useRef, useState, useEffect } from 'react'
import { Download, Printer, Share2, Check, ArrowLeft, BookOpen, Layers, Clock, ShieldCheck } from 'lucide-react'
import RoadmapMetroGraph from './RoadmapMetroGraph'
import { parseRoadmapShareLink } from '../../utils/roadmapShare'
import { calculateOverallRoadmapProgress, getAcademicLevelBadge } from '../../utils/roadmapCalculator'
import { exportRoadmapToPng, exportRoadmapToPdf } from '../../utils/roadmapExport'

export default function PublicRoadmapViewer({ roadmapData: propData, onBack = null }) {
  const containerRef = useRef(null)
  const [data, setData] = useState(propData || null)
  const [copied, setCopied] = useState(false)
  const [isExportingPng, setIsExportingPng] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  useEffect(() => {
    if (!propData) {
      const parsed = parseRoadmapShareLink()
      if (parsed) {
        setData(parsed)
      }
    }
  }, [propData])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadPng = async () => {
    if (containerRef.current && data) {
      setIsExportingPng(true)
      try {
        await exportRoadmapToPng(containerRef.current, data)
      } catch (err) {
        console.error('Export PNG error:', err)
      } finally {
        setIsExportingPng(false)
      }
    }
  }

  const handleDownloadPdf = async () => {
    if (containerRef.current && data) {
      setIsExportingPdf(true)
      try {
        await exportRoadmapToPdf(containerRef.current, data)
      } catch (err) {
        console.error('Export PDF error:', err)
      } finally {
        setIsExportingPdf(false)
      }
    }
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 text-center max-w-md space-y-4">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Roadmap Belajar Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500">
            Tautan roadmap kurikulum tidak valid atau telah kedaluwarsa. Silakan hubungi admin Kavio Edu untuk tautan terbaru.
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-fluent-blue text-white text-xs font-semibold rounded-fluent hover:bg-fluent-blueHover transition-colors"
            >
              Kembali ke Aplikasi
            </button>
          )}
        </div>
      </div>
    )
  }

  const milestones = Array.isArray(data.milestones) ? data.milestones : []
  const stats = calculateOverallRoadmapProgress(milestones)
  const levelBadge = getAcademicLevelBadge(data.level)

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-3 sm:px-6 flex flex-col items-center">
      {/* Top Navbar Toolbar */}
      <div className="w-full max-w-3xl bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
        <div className="flex items-center space-x-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors mr-1"
              title="Kembali"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <ShieldCheck className="w-5 h-5 text-fluent-blue" />
          <div>
            <div className="text-xs font-bold text-slate-900">
              Peta Kurikulum & Capaian Belajar Siswa
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              Kavio Edu Academic Mentoring
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-fluent transition-colors flex items-center gap-1.5 shadow-2xs"
            title="Salin Tautan"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
            <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Bagikan'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-fluent transition-colors flex items-center gap-1.5 shadow-2xs"
            title="Cetak Dokumen"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Cetak</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={isExportingPng}
            className="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-fluent transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            title="Download PNG"
          >
            <Download className="w-3.5 h-3.5 text-fluent-blue" />
            <span className="hidden sm:inline">PNG</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="px-3.5 py-1.5 text-xs font-bold bg-fluent-blue hover:bg-fluent-blueHover text-white rounded-fluent transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            title="Download PDF Resmi"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingPdf ? 'Membuat PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Main Roadmap Document */}
      <div
        ref={containerRef}
        className="w-full max-w-3xl bg-white p-6 sm:p-8 rounded-xl shadow-md border border-slate-200 space-y-6 pb-12"
      >
        {/* Header Profile */}
        <div className="border-b border-slate-200 pb-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-black uppercase px-2.5 py-1 rounded bg-slate-900 text-white font-mono">
              Paket {data.packageTier || 'GROW'}
            </span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded border uppercase font-mono ${levelBadge.badgeClass}`}>
              {data.level || 'Level A1'}
            </span>
          </div>

          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">
              {data.studentName}
            </h1>
            <p className="text-xs text-fluent-blue font-semibold mt-0.5">
              {data.moduleTitle || 'Kurikulum Bahasa Inggris'}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Milestone</span>
              <span className="font-extrabold text-slate-800 text-sm">{stats.totalMilestones} Tahapan</span>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
              <span className="text-[10px] text-emerald-700 font-bold uppercase block">Selesai</span>
              <span className="font-extrabold text-emerald-800 text-sm">{stats.completedCount} Milestone</span>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200 text-center">
              <span className="text-[10px] text-fluent-blue font-bold uppercase block">Progres</span>
              <span className="font-extrabold text-blue-900 text-sm">{stats.percentage}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-fluent-blue to-emerald-500"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>

        {/* Metro-Line Graph */}
        <RoadmapMetroGraph
          milestones={milestones}
          readOnly={true}
        />

        {/* Footer */}
        <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
          <p>© 2026 Kavio Edu — Private English Class & Academic Mentoring</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Founder & Academic Director: Fatih Farhat Asshidiq</p>
        </div>
      </div>
    </div>
  )
}
