import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, X, AlertTriangle } from 'lucide-react'

export default function ExitConfirmModal({ isOpen, onClose, onConfirm }) {
  // ESC shortcut and background scroll locking
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
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4"
          data-lenis-prevent="true"
        >
        {/* Backdrop Blur Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        />

        {/* macOS Elastic Spring Dialog Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.84, scaleY: 0.74, scaleX: 0.90, y: 36 }}
          animate={{ opacity: 1, scale: 1, scaleY: 1, scaleX: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.86, scaleY: 0.78, scaleX: 0.92, y: 24 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280, mass: 0.85 }}
          style={{ transformOrigin: '50% 80%' }}
          className="relative bg-white rounded-2xl border border-fluent-border shadow-2xl max-w-sm w-full p-6 text-center overflow-hidden z-10 will-change-transform"
        >
          {/* Close button icon */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            title="Batal"
            aria-label="Tutup Dialog"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Warning / Exit Icon */}
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-2xs">
            <LogOut className="w-6 h-6 ml-0.5" />
          </div>

          {/* Dialog Title */}
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Tutup Aplikasi?
          </h2>

          {/* Dialog Description */}
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Apakah Anda yakin ingin keluar dari aplikasi Kavio Edu? Pastikan perubahan data penting Anda telah tersimpan.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-6">
            {/* Kembali Button (Biru) */}
            <button
              onClick={onClose}
              type="button"
              className="flex-1 px-4 py-2.5 rounded-fluent bg-fluent-blue hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              Kembali
            </button>

            {/* Tutup Button (Merah) */}
            <button
              onClick={onConfirm}
              type="button"
              className="flex-1 px-4 py-2.5 rounded-fluent bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  )
}
