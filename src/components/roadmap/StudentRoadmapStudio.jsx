import React, { useState, useRef, useEffect, useMemo } from 'react'
import {
  BookOpen,
  Sparkles,
  Plus,
  Share2,
  Download,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Layers,
  Award,
  ChevronDown,
  User,
  MessageCircle,
  Save,
  Trash2
} from 'lucide-react'
import RoadmapMetroGraph from './RoadmapMetroGraph'
import MilestoneDetailDrawer from './MilestoneDetailDrawer'
import RoadmapPresetSelector from './RoadmapPresetSelector'
import CustomMilestoneModal from './CustomMilestoneModal'
import { CURRICULUM_PRESETS } from '../../utils/curriculumPresets'
import {
  calculateOverallRoadmapProgress,
  autoAdvanceRoadmap,
  getAcademicLevelBadge
} from '../../utils/roadmapCalculator'
import { generateRoadmapShareLink, generateRoadmapWhatsAppMessage } from '../../utils/roadmapShare'
import { exportRoadmapToPng, exportRoadmapToPdf } from '../../utils/roadmapExport'

export default function StudentRoadmapStudio({
  students = [],
  selectedStudentId = null,
  onSelectStudent = null,
  onUpdateStudent = null,
  modules = [],
  onOpenModule = null,
  onSaveRoadmap = null
}) {
  const roadmapContainerRef = useRef(null)

  // Find active student
  const activeStudent = useMemo(() => {
    if (!Array.isArray(students) || students.length === 0) return null
    if (selectedStudentId) {
      const matched = students.find(s => s.id === selectedStudentId)
      if (matched) return matched
    }
    return students[0]
  }, [students, selectedStudentId])

  // Roadmap State for active student
  const [milestones, setMilestones] = useState([])
  const [activeLevel, setActiveLevel] = useState('Level A1 - Beginner')
  const [moduleTitle, setModuleTitle] = useState('Kurikulum Bahasa Inggris')
  const [targetDuration, setTargetDuration] = useState('3 Bulan')

  // Modals & Drawers state
  const [activeMilestone, setActiveMilestone] = useState(null)
  const [showPresetModal, setShowPresetModal] = useState(false)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState(null)

  // Feedback states
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedWA, setCopiedWA] = useState(false)
  const [isExportingPng, setIsExportingPng] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  // Load student's roadmap on student change
  useEffect(() => {
    if (activeStudent) {
      const tier = activeStudent.packageType || 'GROW'
      const defaultPreset = CURRICULUM_PRESETS[tier] || CURRICULUM_PRESETS.GROW

      if (activeStudent.roadmap && Array.isArray(activeStudent.roadmap.milestones) && activeStudent.roadmap.milestones.length > 0) {
        setMilestones(activeStudent.roadmap.milestones)
        setActiveLevel(activeStudent.roadmap.level || defaultPreset.level)
        setModuleTitle(activeStudent.roadmap.moduleTitle || defaultPreset.label)
        setTargetDuration(activeStudent.roadmap.targetDuration || defaultPreset.targetDuration)
      } else {
        // Initialize from preset
        setMilestones(JSON.parse(JSON.stringify(defaultPreset.milestones)))
        setActiveLevel(defaultPreset.level)
        setModuleTitle(defaultPreset.label)
        setTargetDuration(defaultPreset.targetDuration)
      }
    }
  }, [activeStudent?.id])

  // Calculated Progress
  const stats = useMemo(() => calculateOverallRoadmapProgress(milestones), [milestones])
  const levelBadge = useMemo(() => getAcademicLevelBadge(activeLevel), [activeLevel])

  // Assembled Roadmap Object
  const currentRoadmapData = {
    studentId: activeStudent?.id || '',
    studentName: activeStudent?.name || 'Siswa',
    parentName: activeStudent?.parentName || '',
    packageTier: activeStudent?.packageType || 'GROW',
    targetDuration,
    level: activeLevel,
    moduleTitle,
    milestones,
    updatedAt: new Date().toISOString()
  }

  // Update Milestone Handler
  const handleUpdateMilestone = (updatedM) => {
    const updatedList = milestones.map(m => m.id === updatedM.id ? updatedM : m)
    const autoAdvanced = autoAdvanceRoadmap(updatedList)
    setMilestones(autoAdvanced)
    saveChanges(autoAdvanced)
  }

  // Delete Milestone Handler
  const handleDeleteMilestone = (mId) => {
    const filtered = milestones.filter(m => m.id !== mId)
    setMilestones(filtered)
    saveChanges(filtered)
  }

  // Save Custom Milestone from Modal
  const handleSaveCustomMilestone = (newOrUpdatedM) => {
    let nextMilestones = []
    const exists = milestones.some(m => m.id === newOrUpdatedM.id)
    if (exists) {
      nextMilestones = milestones.map(m => m.id === newOrUpdatedM.id ? newOrUpdatedM : m)
    } else {
      nextMilestones = [...milestones, { ...newOrUpdatedM, milestoneNumber: milestones.length + 1 }]
    }
    const autoAdvanced = autoAdvanceRoadmap(nextMilestones)
    setMilestones(autoAdvanced)
    saveChanges(autoAdvanced)
  }

  // Apply Preset Handler
  const handleApplyPreset = (preset) => {
    if (!preset) return
    const clonedMilestones = JSON.parse(JSON.stringify(preset.milestones))
    setMilestones(clonedMilestones)
    setActiveLevel(preset.level)
    setModuleTitle(preset.label)
    setTargetDuration(preset.targetDuration)

    const updatedRoadmap = {
      studentId: activeStudent?.id || '',
      studentName: activeStudent?.name || '',
      level: preset.level,
      moduleTitle: preset.label,
      targetDuration: preset.targetDuration,
      milestones: clonedMilestones,
      updatedAt: new Date().toISOString()
    }

    if (activeStudent && onUpdateStudent) {
      onUpdateStudent({
        ...activeStudent,
        roadmap: updatedRoadmap
      })
    }
    if (onSaveRoadmap) onSaveRoadmap(updatedRoadmap)
  }

  // Save to student record helper
  const saveChanges = (latestMilestones = milestones) => {
    if (!activeStudent) return
    const updatedRoadmap = {
      ...currentRoadmapData,
      milestones: latestMilestones,
      updatedAt: new Date().toISOString()
    }
    if (onUpdateStudent) {
      onUpdateStudent({
        ...activeStudent,
        roadmap: updatedRoadmap
      })
    }
    if (onSaveRoadmap) onSaveRoadmap(updatedRoadmap)
  }

  // Copy Link Action
  const handleCopyLink = () => {
    const link = generateRoadmapShareLink(currentRoadmapData)
    navigator.clipboard.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // Copy WhatsApp Action
  const handleCopyWA = () => {
    const text = generateRoadmapWhatsAppMessage(currentRoadmapData)
    navigator.clipboard.writeText(text)
    setCopiedWA(true)
    setTimeout(() => setCopiedWA(false), 2000)
  }

  // Download PNG
  const handleDownloadPng = async () => {
    if (roadmapContainerRef.current) {
      setIsExportingPng(true)
      try {
        await exportRoadmapToPng(roadmapContainerRef.current, currentRoadmapData)
      } catch (err) {
        console.error('Export PNG error:', err)
      } finally {
        setIsExportingPng(false)
      }
    }
  }

  // Download PDF
  const handleDownloadPdf = async () => {
    if (roadmapContainerRef.current) {
      setIsExportingPdf(true)
      try {
        await exportRoadmapToPdf(roadmapContainerRef.current, currentRoadmapData)
      } catch (err) {
        console.error('Export PDF error:', err)
      } finally {
        setIsExportingPdf(false)
      }
    }
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-fluent-text tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-fluent-blue" />
            <span>Interactive Roadmap Studio</span>
          </h1>
          <p className="text-xs text-fluent-textSecondary mt-0.5">
            Peta jalur kurikulum modular & pelacak capaian kompetensi siswa Kavio Edu.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Preset Kurikulum */}
          <button
            type="button"
            onClick={() => setShowPresetModal(true)}
            className="px-3 py-2 bg-white border border-fluent-border hover:bg-fluent-subtle text-fluent-text text-xs font-semibold rounded-fluent transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-fluent-blue" />
            <span>Preset Kurikulum</span>
          </button>

          {/* Tambah Milestone Kustom */}
          <button
            type="button"
            onClick={() => {
              setEditingMilestone(null)
              setShowCustomModal(true)
            }}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-fluent transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Milestone</span>
          </button>

          {/* Copy Share Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-2 border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded-fluent transition-colors flex items-center justify-center"
            title="Salin Tautan Berbagi Publik Roadmap"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-fluent-blue" />}
          </button>

          {/* Download PNG */}
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={isExportingPng}
            className="p-2 border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded-fluent transition-colors flex items-center justify-center disabled:opacity-50"
            title="Download Bagan Roadmap PNG HD"
          >
            <Download className="w-4 h-4 text-fluent-blue" />
          </button>

          {/* Download PDF */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="p-2 bg-fluent-blue hover:bg-fluent-blueHover text-white rounded-fluent transition-colors flex items-center justify-center shadow-xs disabled:opacity-50"
            title="Download Roadmap PDF Resmi"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Copy WhatsApp Draft */}
          <button
            type="button"
            onClick={handleCopyWA}
            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-fluent flex items-center justify-center transition-colors shadow-xs"
            title={copiedWA ? "Pesan WhatsApp Tersalin!" : "Salin Pesan WhatsApp Update Roadmap"}
          >
            {copiedWA ? <Check className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Student Selector & Progress Highlights Bar */}
      <div className="bg-white p-5 rounded-fluent border border-fluent-border shadow-fluent space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-fluent-border pb-4">
          
          {/* Student Selector Combobox */}
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
              <User className="w-5 h-5 text-fluent-blue" />
            </div>
            <div className="flex-1 sm:flex-none">
              <label className="block text-[10px] font-bold text-fluent-textSecondary uppercase tracking-wider">
                Pilih Siswa Terdaftar
              </label>
              <select
                value={activeStudent?.id || ''}
                onChange={(e) => {
                  const matched = students.find(s => s.id === e.target.value)
                  if (matched && onSelectStudent) onSelectStudent(matched)
                }}
                className="mt-0.5 px-2.5 py-1 text-xs font-bold text-fluent-text border border-fluent-border rounded-fluent bg-white focus:outline-none focus:border-fluent-blue min-w-[200px]"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} — Paket {st.packageType || 'GROW'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Academic Level & Tier Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-900 text-white font-mono uppercase">
              Paket {activeStudent?.packageType || 'GROW'}
            </span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded border uppercase font-mono ${levelBadge.badgeClass}`}>
              {activeLevel}
            </span>
          </div>
        </div>

        {/* Progress Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-fluent-subtle rounded-lg border border-fluent-border space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Milestone
            </span>
            <div className="text-base sm:text-lg font-extrabold font-mono text-slate-800">
              {stats.totalMilestones} Tahapan
            </div>
          </div>

          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200 space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              Selesai (Completed)
            </span>
            <div className="text-base sm:text-lg font-extrabold font-mono text-emerald-700">
              {stats.completedCount} Milestone
            </div>
          </div>

          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200 space-y-1">
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
              Sedang Berjalan
            </span>
            <div className="text-base sm:text-lg font-extrabold font-mono text-fluent-blue">
              {stats.inProgressCount} Milestone
            </div>
          </div>

          <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200 space-y-1">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
              Persentase Kurikulum
            </span>
            <div className="text-base sm:text-lg font-extrabold font-mono text-amber-700">
              {stats.percentage}% Tuntas
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1 pt-1">
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-fluent-blue to-emerald-500 transition-all duration-500"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Roadmap Canvas / Metro Graph */}
      <div
        ref={roadmapContainerRef}
        id="roadmap-graph-canvas"
        className="bg-white p-6 sm:p-8 rounded-fluent border border-fluent-border shadow-fluent"
      >
        <div className="border-b border-slate-200 pb-4 mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {moduleTitle}
            </h2>
            <p className="text-xs text-slate-500">
              Target Durasi: <span className="font-semibold text-slate-700">{targetDuration}</span> | Siswa: <span className="font-bold text-fluent-blue">{activeStudent?.name}</span>
            </p>
          </div>

          <div className="text-[11px] text-slate-400 italic">
            *Klik salah satu milestone untuk memeriksa checklist & modul belajar.
          </div>
        </div>

        {/* Metro-Line Component */}
        <RoadmapMetroGraph
          milestones={milestones}
          activeMilestoneId={activeMilestone?.id}
          onSelectMilestone={setActiveMilestone}
        />
      </div>

      {/* Modals & Drawers */}
      <MilestoneDetailDrawer
        isOpen={!!activeMilestone}
        milestone={activeMilestone}
        modules={modules}
        onClose={() => setActiveMilestone(null)}
        onUpdateMilestone={handleUpdateMilestone}
        onDeleteMilestone={handleDeleteMilestone}
        onOpenModule={onOpenModule}
      />

      <RoadmapPresetSelector
        isOpen={showPresetModal}
        onClose={() => setShowPresetModal(false)}
        onSelectPreset={handleApplyPreset}
        currentTier={activeStudent?.packageType || 'GROW'}
      />

      <CustomMilestoneModal
        isOpen={showCustomModal}
        milestone={editingMilestone}
        modules={modules}
        onClose={() => {
          setShowCustomModal(false)
          setEditingMilestone(null)
        }}
        onSave={handleSaveCustomMilestone}
      />
    </div>
  )
}
