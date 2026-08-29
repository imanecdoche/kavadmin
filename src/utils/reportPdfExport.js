import { exportElementToPdf, exportElementToPng } from './documentExportEngine'

/**
 * High-definition PDF Export Engine for Kavio Edu Academic Report (Native SVG foreignObject)
 * @param {HTMLElement|string} target
 * @param {string|Object} studentNameOrMeta
 * @param {string} period
 */
export const exportReportToPdf = async (target, studentNameOrMeta = 'Student', period = 'Period') => {
  let studentName = 'Student'
  let periodName = period

  if (typeof studentNameOrMeta === 'object' && studentNameOrMeta !== null) {
    studentName = studentNameOrMeta.studentName || 'Student'
    periodName = studentNameOrMeta.periodName || period
  } else if (typeof studentNameOrMeta === 'string') {
    studentName = studentNameOrMeta
  }

  const sanitizedName = String(studentName).replace(/\s+/g, '_')
  const sanitizedPeriod = String(periodName).replace(/\s+/g, '_')
  const filename = `Rapor_KavioEdu_${sanitizedName}_${sanitizedPeriod}`

  return exportElementToPdf(target, filename, { mode: 'a4', orientation: 'portrait' })
}

/**
 * High-definition PNG Image Export
 * @param {HTMLElement|string} target
 * @param {string|Object} studentNameOrMeta
 * @param {string} period
 */
export const exportReportToPng = async (target, studentNameOrMeta = 'Student', period = 'Period') => {
  let studentName = 'Student'
  let periodName = period

  if (typeof studentNameOrMeta === 'object' && studentNameOrMeta !== null) {
    studentName = studentNameOrMeta.studentName || 'Student'
    periodName = studentNameOrMeta.periodName || period
  } else if (typeof studentNameOrMeta === 'string') {
    studentName = studentNameOrMeta
  }

  const sanitizedName = String(studentName).replace(/\s+/g, '_')
  const sanitizedPeriod = String(periodName).replace(/\s+/g, '_')
  const filename = `Rapor_KavioEdu_${sanitizedName}_${sanitizedPeriod}`

  return exportElementToPng(target, filename)
}
