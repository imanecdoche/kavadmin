import React from 'react'
import { CheckCircle2, Clock, Lock, Sparkles, BookOpen, ChevronRight, CheckSquare } from 'lucide-react'
import { calculateMilestoneProgress, getAcademicLevelBadge } from '../../utils/roadmapCalculator'

export default function MilestoneNodeCard({
  milestone,
  index = 0,
  isActive = false,
  onClick = null,
  readOnly = false
}) {
  if (!milestone) return null

  const progress = calculateMilestoneProgress(milestone)
  const levelBadge = getAcademicLevelBadge(milestone.level)
  const isCompleted = milestone.status === 'COMPLETED'
  const isInProgress = milestone.status === 'IN_PROGRESS'
  const isLocked = milestone.status === 'LOCKED'

  const checklists = Array.isArray(milestone.checklists) ? milestone.checklists : []
  const completedChecklistsCount = checklists.filter(c => c.completed).length

  // Status Styling Mappings
  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Selesai
        </span>
      )
    }
    if (isInProgress) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 animate-pulse">
          <Clock className="w-3 h-3 text-blue-600" />
          Sedang Berjalan
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300">
        <Lock className="w-3 h-3 text-slate-400" />
        Terkunci
      </span>
    )
  }

  // Node Indicator Dot
  const getNodeIndicator = () => {
    if (isCompleted) {
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-md border-2 border-white">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      )
    }
    if (isInProgress) {
      return (
        <div className="w-8 h-8 rounded-full bg-fluent-blue text-white flex items-center justify-center font-bold text-xs shadow-md border-2 border-white ring-4 ring-blue-100 animate-pulse">
          {index + 1}
        </div>
      )
    }
    return (
      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs border-2 border-white">
        <Lock className="w-3.5 h-3.5" />
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
        isActive
          ? 'bg-blue-50/50 border-fluent-blue shadow-md ring-2 ring-blue-200/60'
          : isCompleted
          ? 'bg-white border-emerald-200 hover:border-emerald-300 hover:shadow-sm'
          : isInProgress
          ? 'bg-white border-blue-200 hover:border-blue-300 hover:shadow-sm'
          : 'bg-slate-50/80 border-slate-200/80 opacity-75 hover:opacity-90'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        
        {/* Left: Node index + titles */}
        <div className="flex items-start space-x-3">
          {getNodeIndicator()}

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border font-mono ${levelBadge.badgeClass}`}>
                {milestone.level || 'A1'}
              </span>
              {milestone.targetSessions && (
                <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.2 rounded">
                  {milestone.targetSessions} Sesi
                </span>
              )}
              {getStatusBadge()}
            </div>

            <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug group-hover:text-fluent-blue transition-colors">
              {milestone.title}
            </h3>

            {milestone.description && (
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {milestone.description}
              </p>
            )}
          </div>
        </div>

        {/* Right Arrow */}
        <div className="hidden sm:flex items-center text-slate-400 group-hover:text-fluent-blue group-hover:translate-x-0.5 transition-all">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* Progress & Checklists Footer Strip */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs gap-3">
        
        {/* Checklists Summary */}
        <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 font-medium">
          <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
          <span>{completedChecklistsCount}/{checklists.length} Target</span>
          {milestone.linkedModuleId && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-fluent-blue bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100 ml-1">
              <BookOpen className="w-2.5 h-2.5" /> Modul
            </span>
          )}
        </div>

        {/* Progress Bar & Percentage */}
        <div className="flex items-center space-x-2 min-w-[100px]">
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isCompleted ? 'bg-emerald-500' : isInProgress ? 'bg-fluent-blue' : 'bg-slate-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-mono text-[10px] font-bold text-slate-700 min-w-[28px] text-right">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  )
}
