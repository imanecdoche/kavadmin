import React, { useRef, useState, useEffect } from 'react'
import { Download, Printer, Share2, Check, ArrowLeft, BookOpen, ShieldCheck } from 'lucide-react'
import RoadmapBatchDocument from './RoadmapBatchDocument'
import { parseRoadmapShareLink } from '../../utils/roadmapShare'
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

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-3 sm:px-6 flex flex-col items-center">
      {/* Top Navbar Toolbar */}
      <div className="w-full max-w-[820px] bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
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
              Peta Kurikulum & Capaian Belajar Siswa (1-Batch)
            </div>
            <div className="text-[10px] text-slate-500 font-medium font-mono">
              ID: {data.id || 'ROA/KEEN'}
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

      {/* Main A4 Printable Roadmap Document */}
      <div className="w-full overflow-x-auto flex justify-center pb-12">
        <RoadmapBatchDocument
          roadmapData={data}
          previewRef={containerRef}
          readOnly={true}
        />
      </div>
    </div>
  )
}
