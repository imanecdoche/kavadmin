import { exportElementToPdf, exportElementToPng } from './documentExportEngine'

export const exportRoadmapToPdf = async (
  elementId = 'roadmap-export-canvas',
  studentName = 'Student',
  batch = 'Batch'
) => {
  const sanitizedName = String(studentName || 'Student').replace(/[^a-zA-Z0-9]/g, '_')
  const sanitizedBatch = String(batch || 'Batch').replace(/[^a-zA-Z0-9]/g, '_')
  const filename = `Roadmap_KavioEdu_${sanitizedName}_${sanitizedBatch}`
  return exportElementToPdf(elementId, filename, { mode: 'continuous', orientation: 'portrait' })
}

export const exportRoadmapToPng = async (
  elementId = 'roadmap-export-canvas',
  studentName = 'Student',
  batch = 'Batch'
) => {
  const sanitizedName = String(studentName || 'Student').replace(/[^a-zA-Z0-9]/g, '_')
  const sanitizedBatch = String(batch || 'Batch').replace(/[^a-zA-Z0-9]/g, '_')
  const filename = `Roadmap_KavioEdu_${sanitizedName}_${sanitizedBatch}`
  return exportElementToPng(elementId, filename)
}
