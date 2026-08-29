import React, { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import DOMPurify from 'dompurify'
import {
  X,
  Printer,
  Copy,
  Check,
  Edit3,
  BookOpen,
  Calendar,
  Layers,
  Tag,
  Share2
} from 'lucide-react'
import { formatDateIndonesian } from '../../utils/dateFormatter'
import { logoSvg } from '../../assets'

export default function ModuleDetailModal({
  isOpen,
  moduleItem,
  onClose,
  onEdit
}) {
  const contentRef = useRef(null)
  const [copied, setCopied] = useState(false)

  // ESC shortcut and scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      document.documentElement.classList.add('lenis-stopped')
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      document.documentElement.classList.remove('lenis-stopped')
      document.body.classList.remove('printing-module')
    }
  }, [isOpen, onClose])

  // Cleanup printing class after print
  useEffect(() => {
    const handleAfterPrint = () => {
      document.body.classList.remove('printing-module')
    }
    window.addEventListener('afterprint', handleAfterPrint)
    return () => window.removeEventListener('afterprint', handleAfterPrint)
  }, [])

  if (!isOpen || !moduleItem) return null

  const handleCopyFormatted = () => {
    if (!contentRef.current) return
    const text = contentRef.current.innerText
    navigator.clipboard.writeText(`*${moduleItem.title}*\nKategori: ${moduleItem.category} | Level: ${moduleItem.level}\n\n${text}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    document.body.classList.add('printing-module')
    window.print()
    setTimeout(() => {
      document.body.classList.remove('printing-module')
    }, 1500)
  }

  const getLevelBadgeClass = (lvl) => {
    switch (lvl) {
      case 'Beginner':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Intermediate':
        return 'bg-blue-50 text-fluent-blue border-blue-200'
      case 'Advanced':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  const modalContent = (
    <AnimatePresence>
      <div
        id="module-print-portal"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        data-lenis-prevent="true"
      >
        {/* Backdrop Blur Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs no-print"
        />

        {/* macOS Elastic Spring Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.84, scaleY: 0.74, scaleX: 0.90, y: 40 }}
          animate={{ opacity: 1, scale: 1, scaleY: 1, scaleX: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.86, scaleY: 0.78, scaleX: 0.92, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280, mass: 0.85 }}
          style={{ transformOrigin: '50% 80%' }}
          className="module-modal-window relative bg-white rounded-xl border border-fluent-border shadow-fluent-modal max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden z-10 will-change-transform print:max-h-none print:shadow-none print:border-none print:p-0"
        >
          {/* Header Action Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-fluent-border bg-slate-50/70 no-print flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-fluent bg-blue-50 text-fluent-blue">
                <BookOpen className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                  {moduleItem.title}
                </h3>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                  <span>{moduleItem.category}</span>
                  <span>•</span>
                  <span className={`px-2 py-0.2 rounded text-[10px] font-bold border ${getLevelBadgeClass(moduleItem.level)}`}>
                    {moduleItem.level}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyFormatted}
                className="px-3 py-1.5 rounded-fluent text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-fluent-blue flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                title="Salin Konten Modul"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-fluent text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-fluent-blue flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                title="Cetak Dokumen Modul"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose()
                  if (onEdit) onEdit(moduleItem)
                }}
                className="px-3 py-1.5 rounded-fluent text-xs font-semibold bg-fluent-blue text-white hover:bg-blue-700 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                title="Edit Modul Ini"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors ml-1 cursor-pointer"
                title="Tutup (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Reader Body Content */}
          <div className="module-content-area flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 bg-white" ref={contentRef}>
            {/* Header Document Branding */}
            <div className="border-b-2 border-slate-900 pb-5 flex justify-between items-start">
              <div>
                <img
                  src={logoSvg}
                  alt="Kavio Edu Logo"
                  className="h-8 w-auto object-contain mb-2"
                />
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {moduleItem.title}
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Private English Class & Academic Mentoring • Kavio Edu
                </p>
              </div>

              <div className="text-right space-y-1 text-xs">
                <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  {moduleItem.category}
                </div>
                <div className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold border ${getLevelBadgeClass(moduleItem.level)}`}>
                  Level: {moduleItem.level}
                </div>
                <div className="text-[11px] text-slate-400">
                  Diperbarui: {formatDateIndonesian(moduleItem.updatedAt?.split('T')[0] || new Date().toISOString().split('T')[0])}
                </div>
              </div>
            </div>

            {/* Summary Box */}
            {moduleItem.summary && (
              <div className="bg-slate-50 border-l-4 border-fluent-blue p-4 rounded-r-fluent text-xs text-slate-700 italic">
                <span className="font-bold not-italic text-slate-900 block mb-0.5">Ringkasan Materi:</span>
                {moduleItem.summary}
              </div>
            )}

            {/* Rich Text Body Content with Custom CSS Styling (Sanitized) */}
            <div
              className="tiptap-content module-rich-content max-w-none text-slate-800 leading-relaxed min-h-0 p-0"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  moduleItem.content || '<p className="text-slate-400 italic">Belum ada isi konten modul.</p>',
                  { ADD_ATTR: ['target', 'rel'] }
                )
              }}
            />

            {/* Tags Footer */}
            {Array.isArray(moduleItem.tags) && moduleItem.tags.length > 0 && (
              <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center gap-1.5 no-print">
                <Tag className="w-3.5 h-3.5 text-slate-400 mr-1" />
                {moduleItem.tags.map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-medium">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
}
