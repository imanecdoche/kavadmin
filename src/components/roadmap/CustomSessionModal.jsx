import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Check, BookOpen, Layers } from 'lucide-react'

export default function CustomSessionModal({
  isOpen = false,
  session = null,
  nextSessionNumber = 1,
  modules = [],
  onClose = null,
  onSave = null
}) {
  const [title, setTitle] = useState('')
  const [level, setLevel] = useState('A2')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [linkedModuleId, setLinkedModuleId] = useState('')

  useEffect(() => {
    if (session) {
      setTitle(session.title || '')
      setLevel(session.level || 'A2')
      setDescription(session.description || '')
      setDate(session.date || new Date().toISOString().split('T')[0])
      setLinkedModuleId(session.linkedModuleId || '')
    } else {
      setTitle('')
      setLevel('A2')
      setDescription('')
      setDate(new Date().toISOString().split('T')[0])
      setLinkedModuleId('')
    }
  }, [session, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return

    const payload = {
      id: session?.id || `session-${Date.now()}`,
      sessionNumber: session?.sessionNumber || nextSessionNumber,
      level,
      title: title.trim(),
      description: description.trim(),
      date,
      status: session?.status || 'LOCKED',
      linkedModuleId: linkedModuleId || null
    }

    if (onSave) onSave(payload)
    onClose()
  }

  return typeof document !== 'undefined' ? createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 top-0 left-0 w-screen h-screen z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-fluent-blue" />
              {session ? 'Edit Sesi Pembelajaran' : 'Tambah Sesi Baru ke Batch'}
            </h2>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
            {/* Title */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Judul Materi Sesi *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Past Continuous & Interrupted Actions..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-fluent-blue font-semibold"
              />
            </div>

            {/* Level & Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Jenjang / Level CEFR
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-fluent-blue"
                >
                  <option value="A1">Level A1 - Beginner</option>
                  <option value="A2">Level A2 - Elementary</option>
                  <option value="B1">Level B1 - Intermediate</option>
                  <option value="B2">Level B2 - Upper Intermediate</option>
                  <option value="C1">Level C1 - Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Tanggal Pelaksanaan Sesi
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-fluent-blue font-mono"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Deskripsi Singkat Materi
              </label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Sasaran pembelajaran dan topik pembahasan pada sesi ini..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-fluent-blue leading-relaxed"
              />
            </div>

            {/* Linked Module */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-fluent-blue" />
                Tautkan Modul Pembelajaran (Tiptap)
              </label>
              <select
                value={linkedModuleId}
                onChange={(e) => setLinkedModuleId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-fluent-blue"
              >
                <option value="">-- Tidak Ditautkan --</option>
                {(modules || []).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-fluent-blue hover:bg-fluent-blueHover text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-4 h-4" />
                Simpan Sesi
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  ) : null
}
