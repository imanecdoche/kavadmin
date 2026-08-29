import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Check, BookOpen, Layers } from 'lucide-react'

export default function CustomMilestoneModal({
  isOpen = false,
  milestone = null,
  modules = [],
  onClose = null,
  onSave = null
}) {
  const [title, setTitle] = useState('')
  const [level, setLevel] = useState('A1')
  const [targetSessions, setTargetSessions] = useState(3)
  const [description, setDescription] = useState('')
  const [materials, setMaterials] = useState('')
  const [linkedModuleId, setLinkedModuleId] = useState('')
  const [checklists, setChecklists] = useState([])
  const [newChecklistText, setNewChecklistText] = useState('')

  useEffect(() => {
    if (milestone) {
      setTitle(milestone.title || '')
      setLevel(milestone.level || 'A1')
      setTargetSessions(milestone.targetSessions || 3)
      setDescription(milestone.description || '')
      setMaterials(milestone.materials || '')
      setLinkedModuleId(milestone.linkedModuleId || '')
      setChecklists(Array.isArray(milestone.checklists) ? JSON.parse(JSON.stringify(milestone.checklists)) : [])
    } else {
      setTitle('')
      setLevel('A1')
      setTargetSessions(3)
      setDescription('')
      setMaterials('')
      setLinkedModuleId('')
      setChecklists([
        { id: `c-${Date.now()}-1`, text: 'Pemahaman konsep dasar materi', completed: false },
        { id: `c-${Date.now()}-2`, text: 'Praktik latihan speaking & tugas tertulis', completed: false }
      ])
    }
  }, [milestone, isOpen])

  if (!isOpen) return null

  const handleAddChecklist = (e) => {
    e.preventDefault()
    if (!newChecklistText.trim()) return
    setChecklists(prev => [
      ...prev,
      { id: `c-${Date.now()}-${Math.random()}`, text: newChecklistText.trim(), completed: false }
    ])
    setNewChecklistText('')
  }

  const handleRemoveChecklist = (id) => {
    setChecklists(prev => prev.filter(c => c.id !== id))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return

    const payload = {
      id: milestone?.id || `milestone-${Date.now()}`,
      milestoneNumber: milestone?.milestoneNumber || 1,
      title: title.trim(),
      level,
      targetSessions: Number(targetSessions) || 3,
      description: description.trim(),
      materials: materials.trim(),
      linkedModuleId: linkedModuleId || null,
      checklists,
      status: milestone?.status || 'LOCKED',
      evaluationNotes: milestone?.evaluationNotes || ''
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
              {milestone ? 'Edit Milestone Kurikulum' : 'Buat Milestone Kustom Baru'}
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
                Judul Milestone / Topik Utama *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Past Tense & Storytelling..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-fluent-blue font-semibold"
              />
            </div>

            {/* Level & Target Sessions */}
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
                  Alokasi Target Sesi
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={targetSessions}
                  onChange={(e) => setTargetSessions(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-fluent-blue font-bold text-center"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Deskripsi Sasaran Belajar
              </label>
              <textarea
                rows="2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tujuan yang diharapkan dicapai siswa..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-fluent-blue"
              />
            </div>

            {/* Materials */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Materi & Sumber Belajar
              </label>
              <input
                type="text"
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                placeholder="Daftar rumus, vocab, atau referensi teks..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-fluent-blue"
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

            {/* Checklists */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="block text-[11px] font-bold text-slate-700 uppercase">
                Indikator Capaian (Checklist Items)
              </label>

              <div className="space-y-1.5">
                {checklists.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[11px] text-slate-700">{c.text}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklist(c.id)}
                      className="text-slate-400 hover:text-rose-600 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    placeholder="+ Tambah indikator target..."
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-fluent-blue"
                  />
                  <button
                    type="button"
                    onClick={handleAddChecklist}
                    disabled={!newChecklistText.trim()}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
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
                Simpan Milestone
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  ) : null
}
