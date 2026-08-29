import React from 'react'
import MilestoneNodeCard from './MilestoneNodeCard'
import { calculateMilestoneProgress } from '../../utils/roadmapCalculator'

export default function RoadmapMetroGraph({
  milestones = [],
  activeMilestoneId = null,
  onSelectMilestone = null,
  readOnly = false
}) {
  if (!Array.isArray(milestones) || milestones.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs">
        Belum ada milestone kurikulum yang ditentukan untuk roadmap ini.
      </div>
    )
  }

  return (
    <div className="relative py-4 select-none">
      {/* Vertical Metro Line Rail running down the left side */}
      <div className="absolute left-[27px] sm:left-[31px] top-6 bottom-6 w-1 bg-slate-200 rounded-full z-0 pointer-events-none" />

      {/* Milestones Stack */}
      <div className="space-y-4 relative z-10">
        {milestones.map((milestone, idx) => {
          const isCompleted = milestone.status === 'COMPLETED'
          const isInProgress = milestone.status === 'IN_PROGRESS'
          const isSelected = activeMilestoneId === milestone.id

          return (
            <div key={milestone.id || idx} className="relative flex items-start gap-3 sm:gap-4 pl-0.5 sm:pl-1">
              
              {/* Metro Connector Indicator on the track */}
              <div className="pt-4 relative flex flex-col items-center">
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm transition-all duration-200 ${
                    isCompleted
                      ? 'bg-emerald-500 ring-2 ring-emerald-200'
                      : isInProgress
                      ? 'bg-fluent-blue ring-4 ring-blue-200 animate-pulse'
                      : 'bg-slate-300'
                  }`}
                />
              </div>

              {/* Node Card Component */}
              <div className="flex-1">
                <MilestoneNodeCard
                  milestone={milestone}
                  index={idx}
                  isActive={isSelected}
                  readOnly={readOnly}
                  onClick={() => onSelectMilestone && onSelectMilestone(milestone)}
                />
              </div>

            </div>
          )
        })}
      </div>
    </div>
  )
}
