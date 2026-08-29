import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  CheckCircle2,
  Clock,
  Lock,
  Plus,
  Trash2,
  BookOpen,
  CheckSquare,
  MessageSquare,
  Sparkles,
  ExternalLink
} from 'lucide-react'
import { getAcademicLevelBadge, calculateMilestoneProgress } from '../../utils/roadmapCalculator'

export default function MilestoneDetailDrawer({
  isOpen = false,
  milestone = null,
  modules = [],
  onClose = null,
  onUpdateMilestone = null,
  onDeleteMilestone = null,
  onOpenModule = null,
  readOnly = false
}) {
  const [formData, setFormData] = useState(null)
  const [newChecklistText, setNewChecklistText] = useState('')

  useEffect(() => {
    if (milestone) {
      setFormData(JSON.parse(JSON.stringify(milestone)))
    }
  }, [milestone])

  if (!isOpen || !formData) return null

  const progress = calculateMilestoneProgress(formData)
  const levelBadge = getAcademicLevelBadge(formData.level)

  // Status Change Handler
  const handleStatusChange = (status) => {
    if (readOnly) return
    const updated = { ...formData, status }
    if (status === 'COMPLETED') {
      // Mark all checklists as completed
      updated.checklists = (updated.checklists || []).map(c => ({ ...c, completed: true }))
    }
    setFormData(updated)
    if (onUpdateMilestone) onUpdateMilestone(updated)
  }

  // Checklist Toggle Handler
  const handleToggleChecklist = (cId) => {
    if (readOnly) return
    const updatedChecklists = (formData.checklists || []).map(c => {
      if (c.id === cId) return { ...c, completed: !c.completed }
      return c
    })
    const allDone = updatedChecklists.length > 0 && updatedChecklists.every(c => c.completed)
    const updated = {
      ...formData,
      checklists: updatedChecklists,
      status: allDone ? 'COMPLETED' : formData.status === 'COMPLETED' ? 'IN_PROGRESS' : formData.status
    }
    setFormData(updated)
    if (onUpdateMilestone) onUpdateMilestone(updated)
  }

  // Add new checklist
  const handleAddChecklist = (e) => {
    e.preventDefault()
    if (!newChecklistText.trim() || readOnly) return
    const newItem = {
      id: `c-${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false
    }
    const updated = {
      ...formData,
      checklists: [...(formData.checklists || []), newItem]
    }
    setFormData(updated)
    setNewChecklistText('')
    if (onUpdateMilestone) onUpdateMilestone(updated)
  }

  // Remove checklist
  const handleRemoveChecklist = (cId) => {
    if (readOnly) return
    const updated = {
      ...formData,
      checklists: (formData.checklists || []).filter(c => c.id !== cId)
    }
    setFormData(updated)
    if (onUpdateMilestone) onUpdateMilestone(updated)
  }

  // Evaluation Notes change
  const handleNotesChange = (val) => {
    const updated = { ...formData, evaluationNotes: val }
    setFormData(updated)
    if (onUpdateMilestone) onUpdateMilestone(updated)
  }

  // Linked Module change
  const handleLinkedModuleChange = (modId) => {
    const updated = { ...formData, linkedModuleId: modId || null }
    setFormData(updated)
    if (onUpdateMilestone) onUpdateMilestone(updated)
  }

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
          {/* Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${levelBadge.badgeClass}`}>
                  {formData.level || 'A1'}
                </span>
                {formData.targetSessions && (
                  <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    {formData.targetSessions} Sesi Target
                  </span>
                )}
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {formData.title}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body Scroll */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
            
            {/* Status Selector */}
            {!readOnly && (
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Status Milestone
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange('LOCKED')}
                    className={`py-2 px-2 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      formData.status === 'LOCKED'
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Terkunci
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange('IN_PROGRESS')}
                    className={`py-2 px-2 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      formData.status === 'IN_PROGRESS'
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
                      formData.status === 'COMPLETED'
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

            {/* Description & Materials */}
            {formData.description && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                  Ringkasan Sasaran
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {formData.description}
                </p>
                {formData.materials && (
                  <div className="pt-2 mt-2 border-t border-slate-200 text-[10px] text-slate-500">
                    <span className="font-semibold text-slate-700">Materi: </span>
                    {formData.materials}
                  </div>
                )}
              </div>
            )}

            {/* Checklist Items */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5 text-fluent-blue" />
                  Target Capaian Pembelajaran
                </label>
                <span className="text-[11px] font-bold font-mono text-fluent-blue">
                  {progress}% Selesai
                </span>
              </div>

              {/* Checklists List */}
              <div className="space-y-1.5">
                {(formData.checklists || []).map((c) => (
                  <div
                    key={c.id}
                    className={`flex items-start justify-between p-2.5 rounded-lg border transition-colors ${
                      c.completed
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <label className="flex items-start space-x-2.5 cursor-pointer flex-1 select-none">
                      <input
                        type="checkbox"
                        disabled={readOnly}
                        checked={!!c.completed}
                        onChange={() => handleToggleChecklist(c.id)}
                        className="mt-0.5 rounded text-fluent-blue focus:ring-fluent-blue accent-fluent-blue"
                      />
                      <span className={`text-[11px] leading-snug ${c.completed ? 'line-through text-emerald-800/80 font-medium' : 'font-normal'}`}>
                        {c.text}
                      </span>
                    </label>

                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => handleRemoveChecklist(c.id)}
                        className="text-slate-300 hover:text-rose-600 p-0.5 ml-2 transition-colors"
                        title="Hapus checklist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Add new checklist form */}
                {!readOnly && (
                  <form onSubmit={handleAddChecklist} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newChecklistText}
                      onChange={(e) => setNewChecklistText(e.target.value)}
                      placeholder="+ Tambah indikator capaian..."
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-fluent-blue"
                    />
                    <button
                      type="submit"
                      disabled={!newChecklistText.trim()}
                      className="px-3 py-1.5 bg-fluent-blue text-white rounded-lg font-bold hover:bg-fluent-blueHover transition-colors disabled:opacity-40"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Linked Tiptap Module Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-fluent-blue" />
                Tautkan Modul Pembelajaran (Tiptap)
              </label>

              {!readOnly ? (
                <select
                  value={formData.linkedModuleId || ''}
                  onChange={(e) => handleLinkedModuleChange(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-fluent-blue"
                >
                  <option value="">-- Belum Ditautkan ke Modul --</option>
                  {(modules || []).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.category || 'Materi'})
                    </option>
                  ))}
                </select>
              ) : formData.linkedModuleId ? (
                <div className="text-xs text-fluent-blue font-semibold">
                  Modul Terhubung ID: {formData.linkedModuleId}
                </div>
              ) : null}

              {formData.linkedModuleId && onOpenModule && (
                <button
                  type="button"
                  onClick={() => onOpenModule(formData.linkedModuleId)}
                  className="w-full py-1.5 px-3 bg-blue-50 text-fluent-blue hover:bg-blue-100 border border-blue-200 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka Modul di Manager
                </button>
              )}
            </div>

            {/* Tutor Evaluation Notes */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-fluent-blue" />
                Catatan & Evaluasi Mentor
              </label>
              <textarea
                rows="3"
                disabled={readOnly}
                value={formData.evaluationNotes || ''}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Catatan perkembangan khusus siswa pada topik ini..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-fluent-blue disabled:bg-slate-50"
              />
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            {onDeleteMilestone && !readOnly ? (
              <button
                type="button"
                onClick={() => {
                  onDeleteMilestone(formData.id)
                  onClose()
                }}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Hapus Milestone"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors"
            >
              Selesai & Simpan
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  ) : null
}
