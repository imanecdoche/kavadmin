import React from 'react'
import { formatSessionNumber, formatDateShortIndonesian } from '../../utils/roadmapCalculator'

export default function SessionCard({
  session,
  index = 0,
  isLast = false,
  onClick = null,
  readOnly = false
}) {
  if (!session) return null

  const sNumber = session.sessionNumber || index + 1
  const sessionLabel = formatSessionNumber(sNumber)
  const cefrLevel = session.level || 'A2'
  const rawStatus = String(session.status || 'LOCKED').toUpperCase()
  
  const isCompleted = rawStatus === 'COMPLETED' || rawStatus === 'SELESAI'
  const isInProgress = rawStatus === 'IN_PROGRESS' || rawStatus === 'SEDANG BERJALAN'

  const statusText = isCompleted
    ? 'SELESAI'
    : isInProgress
    ? 'SEDANG BERJALAN'
    : 'BELUM MULAI'

  const statusClass = isCompleted
    ? 'text-emerald-600 font-bold'
    : isInProgress
    ? 'text-sky-600 font-bold'
    : 'text-slate-400 font-normal'

  const formattedDate = formatDateShortIndonesian(session.date)

  return (
    <div
      onClick={() => !readOnly && onClick && onClick(session)}
      className={`group text-left transition-colors ${!readOnly ? 'cursor-pointer hover:bg-slate-50/50 p-1 -m-1 rounded' : ''}`}
    >
      {/* Row 1: Metadata Sesi */}
      <div className="flex items-center space-x-2 text-xs leading-none whitespace-nowrap overflow-hidden">
        <span className="font-bold text-slate-900 tracking-tight">
          {sessionLabel}
        </span>
        <span className="text-slate-400">•</span>
        <span className="font-medium text-slate-600">
          {cefrLevel}
        </span>
        <span className="text-slate-400">•</span>
        <span className={statusClass}>
          {statusText}
        </span>
        <span className="text-slate-400">•</span>
        <span className="text-slate-500 font-mono text-[11px]">
          {formattedDate}
        </span>
      </div>

      {/* Row 2: Judul Materi Sesi */}
      <div className="mt-1.5">
        <h3 className="font-bold text-sm text-slate-900 tracking-tight truncate leading-snug">
          {session.title || 'Materi Sesi Pembelajaran'}
        </h3>
      </div>

      {/* Row 3: Deskripsi Singkat Materi */}
      {session.description && (
        <p className="text-slate-700 text-xs leading-relaxed mt-1">
          {session.description}
        </p>
      )}

      {/* [Divider Level 1]: Garis pemisah horizontal sangat tipis sebelum progress bar */}
      <div className="border-b border-slate-100 my-1.5" />

      {/* Row 4: Progress Bar & Persentase Samping */}
      <div className="flex items-center gap-3">
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isCompleted ? 'bg-emerald-500 w-full' : 'w-0'
            }`}
          />
        </div>
        <span className="text-[11px] font-mono font-bold text-slate-700 shrink-0 min-w-[32px] text-right">
          {isCompleted ? '100%' : '0%'}
        </span>
      </div>

      {/* [Divider Level 2]: Garis pembatas horizontal antar sessionCard */}
      {!isLast && (
        <div className="border-b border-slate-300 my-3" />
      )}
    </div>
  )
}
