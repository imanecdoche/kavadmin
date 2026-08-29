/**
 * 🧮 Roadmap Calculator & Progress Metrics for Kavio Edu
 */

/**
 * Calculates individual milestone completion percentage based on checklist items or status
 * @param {Object} milestone
 * @returns {number} 0 - 100
 */
export const calculateMilestoneProgress = (milestone) => {
  if (!milestone) return 0
  if (milestone.status === 'COMPLETED') return 100
  if (milestone.status === 'LOCKED') return 0

  const checklists = Array.isArray(milestone.checklists) ? milestone.checklists : []
  if (checklists.length === 0) {
    return milestone.status === 'IN_PROGRESS' ? 50 : 0
  }

  const completedCount = checklists.filter(c => c.completed).length
  return Math.round((completedCount / checklists.length) * 100)
}

/**
 * Calculates overall roadmap progress across all milestones
 * @param {Array} milestones
 * @returns {Object} { percentage, totalMilestones, completedCount, inProgressCount, lockedCount }
 */
export const calculateOverallRoadmapProgress = (milestones = []) => {
  if (!Array.isArray(milestones) || milestones.length === 0) {
    return {
      percentage: 0,
      totalMilestones: 0,
      completedCount: 0,
      inProgressCount: 0,
      lockedCount: 0
    }
  }

  const total = milestones.length
  let completedCount = 0
  let inProgressCount = 0
  let lockedCount = 0
  let totalProgressSum = 0

  milestones.forEach((m) => {
    const p = calculateMilestoneProgress(m)
    totalProgressSum += p
    if (m.status === 'COMPLETED') completedCount++
    else if (m.status === 'IN_PROGRESS') inProgressCount++
    else lockedCount++
  })

  const percentage = Math.round(totalProgressSum / total)

  return {
    percentage,
    totalMilestones: total,
    completedCount,
    inProgressCount,
    lockedCount
  }
}

/**
 * Returns badge styling and color codes for CEFR Academic Levels
 * @param {string} level e.g. "A1", "A2", "B1", "B2", "C1"
 */
export const getAcademicLevelBadge = (level = 'A1') => {
  const cleanLevel = String(level || 'A1').trim().toUpperCase()

  if (cleanLevel.includes('A1')) {
    return {
      code: 'A1',
      label: 'Level A1 - Beginner',
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    }
  }
  if (cleanLevel.includes('A2')) {
    return {
      code: 'A2',
      label: 'Level A2 - Elementary',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300'
    }
  }
  if (cleanLevel.includes('B1')) {
    return {
      code: 'B1',
      label: 'Level B1 - Intermediate',
      color: 'text-indigo-700',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300'
    }
  }
  if (cleanLevel.includes('B2')) {
    return {
      code: 'B2',
      label: 'Level B2 - Upper Intermediate',
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-300'
    }
  }
  if (cleanLevel.includes('C1') || cleanLevel.includes('C2')) {
    return {
      code: 'C1/C2',
      label: 'Level C1/C2 - Advanced / Mastery',
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300'
    }
  }

  return {
    code: 'CUSTOM',
    label: level || 'General English',
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300'
  }
}

/**
 * Auto-advances roadmap milestone status:
 * When milestone i is set to COMPLETED, milestone i+1 (if currently LOCKED) becomes IN_PROGRESS.
 * @param {Array} milestones
 * @returns {Array} Updated milestones array
 */
export const autoAdvanceRoadmap = (milestones = []) => {
  if (!Array.isArray(milestones) || milestones.length === 0) return []

  const updated = JSON.parse(JSON.stringify(milestones))

  for (let i = 0; i < updated.length; i++) {
    const current = updated[i]
    const allChecklistsDone = Array.isArray(current.checklists) && current.checklists.length > 0
      ? current.checklists.every(c => c.completed)
      : false

    if (allChecklistsDone && current.status !== 'COMPLETED') {
      current.status = 'COMPLETED'
    }

    if (current.status === 'COMPLETED' && i + 1 < updated.length) {
      if (updated[i + 1].status === 'LOCKED') {
        updated[i + 1].status = 'IN_PROGRESS'
      }
    }
  }

  return updated
}
