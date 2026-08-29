import React, { useRef, useState, useEffect } from 'react'
import { Download, Printer, Share2, Check, ArrowLeft, ShieldCheck, Award } from 'lucide-react'
import CertificatePreview from './CertificatePreview'
import { parseCertificateShareLink } from '../../utils/certificateShare'
import { exportElementToPdf, exportElementToPng } from '../../utils/documentExportEngine'

export default function PublicCertificateViewer({ certificateData: propData, onBack = null }) {
  const previewRef = useRef(null)
  const [data, setData] = useState(propData || null)
  const [copied, setCopied] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const [isExportingPng, setIsExportingPng] = useState(false)

  useEffect(() => {
    if (!propData) {
      const parsed = parseCertificateShareLink()
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

  const handleDownloadPdf = async () => {
    if (data) {
      setIsExportingPdf(true)
      try {
        await exportElementToPdf('certificate-export-canvas', `Sertifikat_${(data.studentName || 'Siswa').replace(/\s+/g, '_')}_${data.batchName || 'Batch'}`, {
          mode: 'a4',
          orientation: 'portrait'
        })
      } catch (err) {
        console.error('Export PDF error:', err)
      } finally {
        setIsExportingPdf(false)
      }
    }
  }

  const handleDownloadPng = async () => {
    if (data) {
      setIsExportingPng(true)
      try {
        await exportElementToPng('certificate-export-canvas', `Sertifikat_${(data.studentName || 'Siswa').replace(/\s+/g, '_')}_${data.batchName || 'Batch'}`)
      } catch (err) {
        console.error('Export PNG error:', err)
      } finally {
        setIsExportingPng(false)
      }
    }
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 text-center max-w-md space-y-4">
          <Award className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Sertifikat Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500">
            Tautan sertifikat digital tidak valid atau data sertifikat belum lengkap.
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Dashboard</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 py-6 px-4 sm:px-6 flex flex-col items-center">
      {/* Floating Action Bar */}
      <div className="w-full max-w-[794px] mb-6 flex flex-wrap items-center justify-between gap-4 bg-slate-800/90 backdrop-blur border border-slate-700/80 p-3.5 rounded-xl shadow-xl">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
          )}
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold px-2.5 py-1 bg-emerald-950/60 border border-emerald-800/50 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sertifikat Resmi Terverifikasi</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin!' : 'Bagikan'}</span>
          </button>

          <button
            onClick={handleDownloadPng}
            disabled={isExportingPng}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingPng ? 'PNG...' : 'PNG'}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-md disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingPdf ? 'Mengunduh...' : 'PDF A4'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            title="Cetak Dokumen"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Render Document */}
      <div className="w-full flex justify-center overflow-x-auto pb-12">
        <CertificatePreview
          previewRef={previewRef}
          certificateData={data}
        />
      </div>
    </div>
  )
}
