import React from 'react'
import { 
  BookOpen, 
  Sparkles, 
  Plus, 
  Share2, 
  Download, 
  FileDown, 
  MessageCircle 
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const RoadmapHeader = ({
  onOpenPreset,
  onAddSession,
  onShare,
  onDownloadData,
  onExportPdf,
  onShareWhatsApp,
  isExportingPdf = false,
  isExportingPng = false,
  copiedLink = false,
  copiedWA = false,
  activePaperName = 'A4',
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-200 font-sans">
      {/* SISI KIRI: JUDUL & DESKRIPSI */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0 mt-0.5">
          <BookOpen className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 leading-tight">
            1-Batch Modular Learning Roadmap
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Peta alur kurikulum per sesi granular dalam 1 Batch pembelajaran siswa Kavio Edu.
          </p>
        </div>
      </div>

      {/* SISI KANAN: SEMUA ACTION BUTTONS */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenPreset}
          className="h-8 text-xs font-semibold gap-1.5 border-neutral-200 hover:bg-neutral-100 rounded-lg text-neutral-800"
        >
          <Sparkles className="w-3.5 h-3.5 text-neutral-600" />
          Preset Kurikulum
        </Button>

        <Button
          size="sm"
          onClick={onAddSession}
          className="h-8 text-xs font-semibold gap-1.5 bg-black text-white hover:bg-neutral-800 rounded-lg shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Sesi
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onShare}
          className="h-8 w-8 border-neutral-200 hover:bg-neutral-100 rounded-lg text-neutral-700"
          title={copiedLink ? 'Tautan Tersalin!' : 'Bagikan Roadmap'}
        >
          <Share2 className="w-3.5 h-3.5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onDownloadData}
          disabled={isExportingPng}
          className="h-8 w-8 border-neutral-200 hover:bg-neutral-100 rounded-lg text-neutral-700"
          title="Download PNG HD / Raw Data"
        >
          <Download className="w-3.5 h-3.5" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onExportPdf}
          disabled={isExportingPdf}
          className="h-8 text-xs font-semibold gap-1.5 border-neutral-200 hover:bg-neutral-100 rounded-lg text-neutral-900"
        >
          <FileDown className="w-3.5 h-3.5" />
          PDF ({activePaperName})
        </Button>

        <Button
          size="icon"
          onClick={onShareWhatsApp}
          className="h-8 w-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs"
          title={copiedWA ? 'Pesan WhatsApp Tersalin!' : 'Kirim ke WhatsApp'}
        >
          <MessageCircle className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default RoadmapHeader
