import React from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Check, BookOpen, Layers, Clock } from 'lucide-react'
import { CURRICULUM_PRESETS } from '../../utils/curriculumPresets'

export default function RoadmapPresetSelector({
  isOpen = false,
  onClose = null,
  onSelectPreset = null,
  currentTier = 'GROW'
}) {
  if (!isOpen) return null

  const presetList = Object.values(CURRICULUM_PRESETS)

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
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Modal Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-fluent-blue" />
                Pilih Preset Kurikulum Standar Kavio Edu
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih template struktur tahapan belajar berbobot akademik yang sesuai dengan program siswa.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Preset Cards Grid */}
          <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
            {presetList.map((preset) => {
              const isMatchCurrent = preset.tier === currentTier
              const milestonesCount = preset.milestones.length

              return (
                <div
                  key={preset.tier}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isMatchCurrent
                      ? 'bg-blue-50/40 border-fluent-blue ring-2 ring-blue-100'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-white font-mono">
                        {preset.tier}
                      </span>
                      <span className="text-[10px] font-semibold text-fluent-blue bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                        {preset.level}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">
                      {preset.label}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {preset.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        {milestonesCount} Milestone
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {preset.targetDuration}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectPreset) onSelectPreset(preset)
                      onClose()
                    }}
                    className={`mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs ${
                      isMatchCurrent
                        ? 'bg-fluent-blue text-white hover:bg-fluent-blueHover'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Terapkan Kurikulum {preset.tier}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-white text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  ) : null
}
