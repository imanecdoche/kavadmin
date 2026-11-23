import React from 'react'
import { Award, Share2, Printer, Download, MessageCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function ReportCardHeader({
  compositeScore = 0,
  letterGrade = 'N/A',
  onCopyLink,
  copiedLink = false,
  onPrint,
  onDownloadPng,
  isExportingPng = false,
  onDownloadPdf,
  isExportingPdf = false,
  onCopyWhatsApp,
  copiedWA = false
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 pb-4">
      {/* Left: Title and Subtitle */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 border border-neutral-200/60">
          <Award className="w-5 h-5 text-neutral-900" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Digital Report Card Studio
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Evaluasi berkala capaian belajar siswa & penerbitan rapor resmi Kavio Edu.
          </p>
        </div>
      </div>

      {/* Right: Score Metrics & Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Score & Grade Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-neutral-200 bg-neutral-50/50 shadow-2xs">
          <span className="text-xs font-medium text-neutral-500">Score:</span>
          <span className="text-xs font-mono font-bold text-neutral-900">
            {Number(compositeScore).toFixed(1)}
          </span>
          <span className="text-neutral-300 mx-0.5">|</span>
          <span className="text-xs font-mono font-bold text-neutral-900">
            Grade:
          </span>
          <Badge variant="outline" className="font-mono font-bold text-[11px] px-1.5 py-0 h-5 bg-white border-neutral-300">
            {letterGrade}
          </Badge>
        </div>

        {/* Share Link */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onCopyLink}
          className="h-8 w-8 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 border-neutral-200"
          title="Salin Tautan Berbagi Publik Rapor"
        >
          {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
        </Button>

        {/* Print A4 */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onPrint}
          className="h-8 w-8 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 border-neutral-200"
          title="Cetak Rapor A4"
        >
          <Printer className="w-4 h-4" />
        </Button>

        {/* Download Data / PNG */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onDownloadPng}
          disabled={isExportingPng}
          className="h-8 w-8 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 border-neutral-200 disabled:opacity-50"
          title="Download Gambar PNG HD"
        >
          <Download className="w-4 h-4" />
        </Button>

        {/* Export PDF (Primary Action) */}
        <Button
          type="button"
          size="sm"
          onClick={onDownloadPdf}
          disabled={isExportingPdf}
          className="h-8 px-3 bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50 text-xs font-medium gap-1.5 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isExportingPdf ? 'Mengekspor...' : 'Export PDF'}</span>
        </Button>

        {/* WhatsApp Share (Emerald Solid) */}
        <Button
          type="button"
          size="sm"
          onClick={onCopyWhatsApp}
          className="h-8 px-3 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-medium gap-1.5 shadow-sm"
        >
          {copiedWA ? <Check className="w-3.5 h-3.5" /> : <MessageCircle className="w-3.5 h-3.5" />}
          <span>{copiedWA ? 'Tersalin!' : 'WhatsApp'}</span>
        </Button>
      </div>
    </div>
  )
}
