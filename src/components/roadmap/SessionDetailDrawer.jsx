import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, Clock, Lock, BookOpen, ExternalLink, Calendar, Layers, Activity } from 'lucide-react'
import { formatSessionNumber } from '../../utils/roadmapCalculator'

export default function SessionDetailDrawer({
  isOpen = false,
  session = null,
  modules = [],
  onClose = null,
  onUpdateSession = null,
  onOpenModule = null,
  readOnly = false
}) {
  const [formData, setFormData] = useState(null)

  useEffect(() => {
    if (session) {
      const isCompleted = session.status === 'COMPLETED' || session.status === 'SELESAI'
      const masteryVal = typeof session.mastery === 'number' ? session.mastery : (isCompleted ? 100 : 0)
      setFormData({
        ...session,
        mastery: masteryVal
      })
    }
  }, [session])

  if (!isOpen || !formData) return null

  const handleStatusChange = (status) => {
    if (readOnly) return
    let nextMastery = formData.mastery
    if (status === 'COMPLETED' && (!nextMastery || nextMastery === 0)) {
      nextMastery = 100
    } else if (status === 'LOCKED' && nextMastery === 100) {
      nextMastery = 0
    }

    const updated = {
      ...formData,
      status,
      mastery: nextMastery,
      isCompleted: status === 'COMPLETED' || status === 'SELESAI'
    }
    setFormData(updated)
    if (onUpdateSession) onUpdateSession(updated)
  }

  const handleMasteryChange = (val) => {
    if (readOnly) return
    const numeric = Math.min(100, Math.max(0, Number(val) || 0))
    let nextStatus = formData.status
    if (numeric === 100) {
      nextStatus = 'COMPLETED'
    } else if (numeric > 0 && nextStatus === 'LOCKED') {
      nextStatus = 'IN_PROGRESS'
    } else if (numeric === 0 && nextStatus === 'COMPLETED') {
      nextStatus = 'IN_PROGRESS'
    }

    const updated = {
      ...formData,
      mastery: numeric,
      status: nextStatus,
      isCompleted: nextStatus === 'COMPLETED' || nextStatus === 'SELESAI'
    }
    setFormData(updated)
    if (onUpdateSession) onUpdateSession(updated)
  }

  const handleChangeField = (field, val) => {
    if (readOnly) return
    const updated = { ...formData, [field]: val }
    setFormData(updated)
    if (onUpdateSession) onUpdateSession(updated)
  }

  const getMasteryBadgeClass = (val) => {
    if (val >= 85) return 'bg-emerald-100 text-emerald-800 border-emerald-300'
    if (val >= 70) return 'bg-blue-100 text-blue-800 border-blue-300'
    if (val >= 50) return 'bg-teal-100 text-teal-800 border-teal-300'
    if (val > 0) return 'bg-amber-100 text-amber-800 border-amber-300'
    return 'bg-slate-100 text-slate-600 border-slate-200'
  }

  const currentMastery = typeof formData.mastery === 'number' ? formData.mastery : 0

  return typeof document !== 'undefined' ? createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 top-0 left-0 w-screen h-screen z-50 bg-black/50 backdrop-blur-xs flex justify-end"
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 260 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-200 text-slate-900"
        >
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                  {formatSessionNumber(formData.sessionNumber)}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-fluent-blue">
                  Level {formData.level || 'A2'}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 mt-1 leading-snug">
                Detail Sesi Pembelajaran
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            
            {/* Status Sesi Switcher */}
            {!readOnly && (
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Status Sesi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange('LOCKED')}
                    className={`py-2 px-2 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      formData.status === 'LOCKED' || formData.status === 'TERKUNCI'
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Belum Mulai
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange('IN_PROGRESS')}
                    className={`py-2 px-2 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      formData.status === 'IN_PROGRESS' || formData.status === 'SEDANG BERJALAN'
                        ? 'bg-fluent-blue text-white border-fluent-blue'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Berjalan
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange('COMPLETED')}
                    className={`py-2 px-2 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      formData.status === 'COMPLETED' || formData.status === 'SELESAI'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Selesai
                  </button>
                </div>
              </div>
            )}

            {/* Slider Penguasaan Materi (Mastery Rate) */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-fluent-blue" />
                  Tingkat Penguasaan Materi
                </label>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${getMasteryBadgeClass(currentMastery)}`}>
                  {currentMastery}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="5"
                disabled={readOnly}
                value={currentMastery}
                onChange={(e) => handleMasteryChange(e.target.value)}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-fluent-blue"
              />

              {/* Preset Buttons */}
              {!readOnly && (
                <div className="flex items-center justify-between pt-1">
                  {[0, 50, 75, 85, 100].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleMasteryChange(val)}
                      className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded border transition-colors ${
                        currentMastery === val
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tanggal Sesi */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase">
                Tanggal Sesi
              </label>
              <input
                type="date"
                disabled={readOnly}
                value={formData.date || ''}
                onChange={(e) => handleChangeField('date', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-fluent-blue font-mono"
              />
            </div>

            {/* Judul Materi */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase">
                Judul Materi Sesi
              </label>
              <input
                type="text"
                disabled={readOnly}
                value={formData.title || ''}
                onChange={(e) => handleChangeField('title', e.target.value)}
                placeholder="Judul topik materi..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-fluent-blue font-semibold"
              />
            </div>

            {/* Level CEFR */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase">
                Level CEFR
              </label>
              <select
                disabled={readOnly}
                value={formData.level || 'A2'}
                onChange={(e) => handleChangeField('level', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-fluent-blue"
              >
                <option value="A1">Level A1 - Beginner</option>
                <option value="A2">Level A2 - Elementary</option>
                <option value="B1">Level B1 - Intermediate</option>
                <option value="B2">Level B2 - Upper Intermediate</option>
                <option value="C1">Level C1 - Advanced</option>
              </select>
            </div>

            {/* Deskripsi Materi */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase">
                Deskripsi Singkat Materi
              </label>
              <textarea
                rows="3"
                disabled={readOnly}
                value={formData.description || ''}
                onChange={(e) => handleChangeField('description', e.target.value)}
                placeholder="Penjelasan sasaran materi..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-fluent-blue leading-relaxed"
              />
            </div>

            {/* Tautkan Modul Pembelajaran */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="block text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-fluent-blue" />
                Tautkan Modul Tiptap
              </label>

              {!readOnly ? (
                <select
                  value={formData.linkedModuleId || ''}
                  onChange={(e) => handleChangeField('linkedModuleId', e.target.value || null)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-fluent-blue"
                >
                  <option value="">-- Belum Ditautkan ke Modul --</option>
                  {(modules || []).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.category || 'Materi'})
                    </option>
                  ))}
                </select>
              ) : null}

              {formData.linkedModuleId && onOpenModule && (
                <button
                  type="button"
                  onClick={() => onOpenModule(formData.linkedModuleId)}
                  className="w-full py-2 px-3 bg-blue-50 text-fluent-blue hover:bg-blue-100 border border-blue-200 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka Modul di Manager
                </button>
              )}
            </div>

          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors"
            >
              Simpan & Tutup
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  ) : null
}
