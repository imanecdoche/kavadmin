import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Check, BookOpen, Layers, Activity } from 'lucide-react'

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
  const [mastery, setMastery] = useState(0)
  const [linkedModuleId, setLinkedModuleId] = useState('')

  useEffect(() => {
    if (session) {
      setTitle(session.title || '')
      setLevel(session.level || 'A2')
      setDescription(session.description || '')
      setDate(session.date || new Date().toISOString().split('T')[0])
      const isCompleted = session.status === 'COMPLETED' || session.status === 'SELESAI'
      setMastery(typeof session.mastery === 'number' ? session.mastery : (isCompleted ? 100 : 0))
      setLinkedModuleId(session.linkedModuleId || '')
    } else {
      setTitle('')
      setLevel('A2')
      setDescription('')
      setDate(new Date().toISOString().split('T')[0])
      setMastery(0)
      setLinkedModuleId('')
    }
  }, [session, isOpen])

  if (!isOpen) return null

  const getMasteryBadgeClass = (val) => {
    if (val >= 85) return 'bg-emerald-100 text-emerald-800 border-emerald-300'
    if (val >= 70) return 'bg-blue-100 text-blue-800 border-blue-300'
    if (val >= 50) return 'bg-teal-100 text-teal-800 border-teal-300'
    if (val > 0) return 'bg-amber-100 text-amber-800 border-amber-300'
    return 'bg-slate-100 text-slate-600 border-slate-200'
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return

    const numMastery = Math.min(100, Math.max(0, Number(mastery) || 0))
    let nextStatus = session?.status || 'LOCKED'
    if (numMastery === 100) nextStatus = 'COMPLETED'
    else if (numMastery > 0 && (nextStatus === 'LOCKED' || nextStatus === 'BELUM MULAI')) nextStatus = 'IN_PROGRESS'

    const payload = {
      id: session?.id || `session-${Date.now()}`,
      sessionNumber: session?.sessionNumber || nextSessionNumber,
      level,
      title: title.trim(),
      description: description.trim(),
      date,
      mastery: numMastery,
      status: nextStatus,
      isCompleted: nextStatus === 'COMPLETED' || nextStatus === 'SELESAI',
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

            {/* Slider Penguasaan Materi (Mastery Rate) */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-fluent-blue" />
                  Tingkat Penguasaan Materi
                </label>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${getMasteryBadgeClass(mastery)}`}>
                  {mastery}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={mastery}
                onChange={(e) => setMastery(Number(e.target.value) || 0)}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-fluent-blue"
              />

              <div className="flex items-center justify-between pt-1">
                {[0, 50, 75, 85, 100].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setMastery(val)}
                    className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded border transition-colors ${
                      mastery === val
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {val}%
                  </button>
                ))}
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
