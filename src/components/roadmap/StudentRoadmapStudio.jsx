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
  Calendar,
  Layers,
  Clock,
  User,
  MessageCircle,
  Save,
  RotateCcw,
  Sliders,
  Trash2,
  Edit3
} from 'lucide-react'
import RoadmapBatchDocument from './RoadmapBatchDocument'
import SessionDetailDrawer from './SessionDetailDrawer'
import RoadmapPresetSelector from './RoadmapPresetSelector'
import CustomSessionModal from './CustomSessionModal'
import { CURRICULUM_PRESETS, generateBatchSessions, getPresetByCefr } from '../../utils/curriculumPresets'
import {
  calculateOverallRoadmapProgress,
  calculateBatchSessionCount,
  autoAdvanceRoadmap,
  formatSessionNumber,
  resolveSessionStatusByDate,
  resolveSessionStatusByDateTime,
  applyDateBasedStatusToSessions
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
  const previewRef = useRef(null)

  // Find active student
  const activeStudent = useMemo(() => {
    if (!Array.isArray(students) || students.length === 0) return null
    if (selectedStudentId) {
      const matched = students.find(s => s.id === selectedStudentId)
      if (matched) return matched
    }
    return students[0]
  }, [students, selectedStudentId])

  // Roadmap Document Meta State
  const [docId, setDocId] = useState('ROA/KEEN/202608/0001')
  const [roadmapTitle, setRoadmapTitle] = useState('PETA ALUR BELAJAR MODULAR 1-BATCH')
  const [roadmapSubtitle, setRoadmapSubtitle] = useState('OFFICIAL 1-BATCH MODULAR LEARNING ROADMAP & SESSION MATRIX')
  const [batchName, setBatchName] = useState('BATCH 1')
  const [sessionsPerMonth, setSessionsPerMonth] = useState(4)
  const [durationMonths, setDurationMonths] = useState(3)
  const [level, setLevel] = useState('A2')
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0])
  const [defaultStartTime, setDefaultStartTime] = useState('16:00')
  const [defaultDuration, setDefaultDuration] = useState(90)
  const [startSessionNumber, setStartSessionNumber] = useState(1)
  const [sessions, setSessions] = useState([])

  // Modals & Drawers
  const [activeSession, setActiveSession] = useState(null)
  const [showPresetModal, setShowPresetModal] = useState(false)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [editingSession, setEditingSession] = useState(null)

  // Feedback State
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedWA, setCopiedWA] = useState(false)
  const [isExportingPng, setIsExportingPng] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  // Load student's roadmap on active student change
  useEffect(() => {
    if (activeStudent) {
      const tier = activeStudent.packageType || 'GROW'
      const sPerM = Number(activeStudent.sessionsPerMonth) || 4
      const durM = Number(activeStudent.durationMonths) || 3

      setSessionsPerMonth(sPerM)
      setDurationMonths(durM)

      if (activeStudent.roadmap && Array.isArray(activeStudent.roadmap.sessions) && activeStudent.roadmap.sessions.length > 0) {
        setDocId(activeStudent.roadmap.id || `ROA/KEEN/${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2, '0')}/${Math.floor(Math.random()*9000)+1000}`)
        setRoadmapTitle(activeStudent.roadmap.roadmapTitle || 'PETA ALUR BELAJAR MODULAR 1-BATCH')
        setRoadmapSubtitle(activeStudent.roadmap.roadmapSubtitle || 'OFFICIAL 1-BATCH MODULAR LEARNING ROADMAP & SESSION MATRIX')
        setBatchName(activeStudent.roadmap.batchName || 'BATCH 1')
        setLevel(activeStudent.roadmap.level || (CURRICULUM_PRESETS[tier]?.level || 'A2'))
        setStartSessionNumber(Number(activeStudent.roadmap.startSessionNumber) || 1)
        const sTime = activeStudent.roadmap.defaultStartTime || '16:00'
        const sDur = Number(activeStudent.roadmap.defaultDuration) || 90
        setDefaultStartTime(sTime)
        setDefaultDuration(sDur)
        const dateSynced = applyDateBasedStatusToSessions(activeStudent.roadmap.sessions, sTime, sDur)
        setSessions(dateSynced)
      } else {
        // Generate initial sessions from preset based on (sessionsPerMonth * durationMonths)
        const initialList = generateBatchSessions(tier, sPerM, durM, startDate, 1, defaultStartTime, defaultDuration)
        setSessions(initialList)
        setRoadmapTitle('PETA ALUR BELAJAR MODULAR 1-BATCH')
        setRoadmapSubtitle('OFFICIAL 1-BATCH MODULAR LEARNING ROADMAP & SESSION MATRIX')
        setBatchName('BATCH 1')
        setLevel(CURRICULUM_PRESETS[tier]?.level || 'A2')
        setStartSessionNumber(1)
      }
    }
  }, [activeStudent?.id])

  // Calculated Progress & Total Sessions
  const totalCalculatedSessions = calculateBatchSessionCount(sessionsPerMonth, durationMonths)
  const stats = useMemo(() => calculateOverallRoadmapProgress(sessions), [sessions])

  // Assembled Roadmap Payload
  const roadmapPayload = {
    id: docId,
    roadmapTitle: roadmapTitle || 'PETA ALUR BELAJAR MODULAR 1-BATCH',
    roadmapSubtitle: roadmapSubtitle || 'OFFICIAL 1-BATCH MODULAR LEARNING ROADMAP & SESSION MATRIX',
    studentId: activeStudent?.id || '',
    studentName: activeStudent?.name || 'Nama Siswa',
    guardianName: activeStudent?.parentName || '-',
    packageTier: activeStudent?.packageType || 'GROW',
    batchName,
    durationMonths,
    sessionsPerMonth,
    level,
    startDate,
    defaultStartTime,
    defaultDuration,
    startSessionNumber,
    sessions,
    updatedAt: new Date().toISOString()
  }

  // Update session handler
  const handleUpdateSession = (updatedS) => {
    const updatedList = sessions.map(s => s.id === updatedS.id ? updatedS : s)
    const autoAdvanced = autoAdvanceRoadmap(updatedList)
    setSessions(autoAdvanced)
    saveChanges(autoAdvanced)
  }

  // Delete session handler
  const handleDeleteSession = (sessionId) => {
    const filtered = sessions.filter(s => s.id !== sessionId)
    // Re-index session numbers starting from startSessionNumber
    const reindexed = filtered.map((s, idx) => ({ ...s, sessionNumber: startSessionNumber + idx }))
    setSessions(reindexed)
    saveChanges(reindexed)
  }

  // Save custom session
  const handleSaveCustomSession = (newOrUpdatedS) => {
    let nextList = []
    const exists = sessions.some(s => s.id === newOrUpdatedS.id)
    if (exists) {
      nextList = sessions.map(s => s.id === newOrUpdatedS.id ? newOrUpdatedS : s)
    } else {
      nextList = [...sessions, { ...newOrUpdatedS, sessionNumber: startSessionNumber + sessions.length }]
    }
    const autoAdvanced = autoAdvanceRoadmap(nextList)
    setSessions(autoAdvanced)
    saveChanges(autoAdvanced)
  }

  // Handle start date change and auto-sync session dates with 7-day interval and automatic status
  const handleStartDateChange = (newDate) => {
    setStartDate(newDate)
    if (!newDate) return

    const base = new Date(newDate)
    if (isNaN(base.getTime())) return

    const updated = sessions.map((s, idx) => {
      const d = new Date(base)
      d.setDate(base.getDate() + (idx * 7))
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const dateStr = `${yyyy}-${mm}-${dd}`
      const sTime = s.time || defaultStartTime || '16:00'
      const sDur = Number(s.duration || defaultDuration || 90)
      const autoStatus = resolveSessionStatusByDateTime(dateStr, sTime, sDur)
      const currentMastery = typeof s.mastery === 'number' ? s.mastery : 0
      const masteryVal = autoStatus.status === 'SELESAI'
        ? (currentMastery > 0 ? currentMastery : 100)
        : currentMastery

      return {
        ...s,
        date: dateStr,
        time: sTime,
        duration: sDur,
        status: autoStatus.status,
        isCompleted: autoStatus.isCompleted,
        mastery: masteryVal
      }
    })

    setSessions(updated)
    saveChanges(updated)
  }

  // Handle start time change
  const handleStartTimeChange = (newTime) => {
    setDefaultStartTime(newTime)
    const updated = sessions.map(s => {
      const sDate = s.date || startDate
      const sDur = Number(s.duration || defaultDuration || 90)
      const autoStatus = resolveSessionStatusByDateTime(sDate, newTime, sDur)
      const currentMastery = typeof s.mastery === 'number' ? s.mastery : 0
      const masteryVal = autoStatus.status === 'SELESAI'
        ? (currentMastery > 0 ? currentMastery : 100)
        : currentMastery

      return {
        ...s,
        time: newTime,
        status: autoStatus.status,
        isCompleted: autoStatus.isCompleted,
        mastery: masteryVal
      }
    })
    setSessions(updated)
    saveChanges(updated)
  }

  // Handle default duration change
  const handleDefaultDurationChange = (newDur) => {
    const durNum = Number(newDur) || 90
    setDefaultDuration(durNum)
    const updated = sessions.map(s => {
      const sDate = s.date || startDate
      const sTime = s.time || defaultStartTime || '16:00'
      const autoStatus = resolveSessionStatusByDateTime(sDate, sTime, durNum)
      const currentMastery = typeof s.mastery === 'number' ? s.mastery : 0
      const masteryVal = autoStatus.status === 'SELESAI'
        ? (currentMastery > 0 ? currentMastery : 100)
        : currentMastery

      return {
        ...s,
        duration: durNum,
        status: autoStatus.status,
        isCompleted: autoStatus.isCompleted,
        mastery: masteryVal
      }
    })
    setSessions(updated)
    saveChanges(updated)
  }

  // Handle starting session number change
  const handleStartSessionChange = (newStartNum) => {
    const validNum = Math.max(1, Number(newStartNum) || 1)
    setStartSessionNumber(validNum)
    const totalCount = Math.max(1, Number(sessionsPerMonth || 4) * Number(durationMonths || 3))
    const generated = getPresetByCefr(level, totalCount, startDate, validNum, defaultStartTime, defaultDuration)
    setSessions(generated)
    saveChanges(generated, validNum)
  }

  // Regenerate sessions based on current duration, sessionsPerMonth, selected CEFR level, and startSessionNumber
  const handleRegenerateSessions = () => {
    const totalCount = Math.max(1, Number(sessionsPerMonth || 4) * Number(durationMonths || 3))
    const generated = getPresetByCefr(level, totalCount, startDate, startSessionNumber, defaultStartTime, defaultDuration)
    setSessions(generated)
    saveChanges(generated)
  }

  // Apply Preset
  const handleApplyPreset = (preset) => {
    if (!preset) return
    const totalCount = Math.max(1, Number(sessionsPerMonth || 4) * Number(durationMonths || 3))
    const generated = getPresetByCefr(preset.level || preset.tier, totalCount, startDate, startSessionNumber, defaultStartTime, defaultDuration)
    setSessions(generated)
    setLevel(preset.level || 'A1')
    saveChanges(generated)
  }

  // Save changes helper
  const saveChanges = (latestSessions = sessions, curStartNum = startSessionNumber) => {
    if (!activeStudent) return
    const updatedRoadmap = {
      ...roadmapPayload,
      startSessionNumber: curStartNum,
      sessions: latestSessions,
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

  // Actions
  const handleCopyLink = () => {
    const link = generateRoadmapShareLink(roadmapPayload)
    navigator.clipboard.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleCopyWA = () => {
    const text = generateRoadmapWhatsAppMessage(roadmapPayload)
    navigator.clipboard.writeText(text)
    setCopiedWA(true)
    setTimeout(() => setCopiedWA(false), 2000)
  }

  const handleDownloadPng = async () => {
    setIsExportingPng(true)
    try {
      await exportRoadmapToPng('roadmap-export-canvas', roadmapPayload.studentName, roadmapPayload.batchName)
    } catch (err) {
      console.error('Export PNG error:', err)
    } finally {
      setIsExportingPng(false)
    }
  }

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true)
    try {
      await exportRoadmapToPdf('roadmap-export-canvas', roadmapPayload.studentName, roadmapPayload.batchName)
    } catch (err) {
      console.error('Export PDF error:', err)
    } finally {
      setIsExportingPdf(false)
    }
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-fluent-text tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-fluent-blue" />
            <span>1-Batch Modular Learning Roadmap</span>
          </h1>
          <p className="text-xs text-fluent-textSecondary mt-0.5">
            Peta alur kurikulum per sesi granular dalam 1 Batch pembelajaran siswa Kavio Edu.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowPresetModal(true)}
            className="px-3 py-2 bg-white border border-fluent-border hover:bg-fluent-subtle text-fluent-text text-xs font-semibold rounded-fluent transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-fluent-blue" />
            <span>Preset Kurikulum</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingSession(null)
              setShowCustomModal(true)
            }}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-fluent transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Sesi</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="p-2 border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded-fluent transition-colors flex items-center justify-center"
            title="Salin Tautan Berbagi Publik"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-fluent-blue" />}
          </button>

          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={isExportingPng}
            className="p-2 border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded-fluent transition-colors flex items-center justify-center disabled:opacity-50"
            title="Download PNG HD"
          >
            <Download className="w-4 h-4 text-fluent-blue" />
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="p-2 bg-fluent-blue hover:bg-fluent-blueHover text-white rounded-fluent transition-colors flex items-center justify-center shadow-xs disabled:opacity-50"
            title="Download PDF A4 Resmi"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleCopyWA}
            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-fluent flex items-center justify-center transition-colors shadow-xs"
            title={copiedWA ? "Pesan WhatsApp Tersalin!" : "Salin Pesan WhatsApp"}
          >
            {copiedWA ? <Check className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Studio Split-Screen Container */}
      <div className="flex flex-col lg:flex-row w-full gap-6 items-start">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: CONTROL & BATCH SESSION MANAGER (Fixed Width) */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-[420px] xl:w-[460px] shrink-0 bg-white p-5 rounded-fluent border border-fluent-border shadow-fluent space-y-5 text-fluent-text">
          
          {/* Section: Student Selector */}
          <div className="space-y-2 pb-3 border-b border-fluent-border">
            <label className="block text-xs font-bold text-fluent-textSecondary uppercase tracking-wider">
              Pilih Siswa Terdaftar
            </label>
            <select
              value={activeStudent?.id || ''}
              onChange={(e) => {
                const matched = students.find(s => s.id === e.target.value)
                if (matched && onSelectStudent) onSelectStudent(matched)
              }}
              className="w-full px-3 py-2 text-xs font-bold text-fluent-text border border-fluent-border rounded-fluent bg-white focus:outline-none focus:border-fluent-blue"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} — Paket {st.packageType || 'GROW'} ({st.parentName ? `Wali: ${st.parentName}` : '-'})
                </option>
              ))}
            </select>
          </div>

          {/* Section: Batch Parameters Form */}
          <div className="space-y-3 pb-3 border-b border-fluent-border">
            <h2 className="text-xs font-bold uppercase tracking-wider text-fluent-text flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-fluent-blue" />
              Parameter 1-Batch Pembelajaran
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                  Nama Batch / Periode
                </label>
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                  Jenjang CEFR
                </label>
                <select
                  value={level}
                  onChange={(e) => {
                    const newLevel = e.target.value
                    setLevel(newLevel)
                    const totalCount = Math.max(1, Number(sessionsPerMonth || 4) * Number(durationMonths || 3))
                    const generated = getPresetByCefr(newLevel, totalCount, startDate)
                    setSessions(generated)
                    saveChanges(generated)
                  }}
                  className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent bg-white focus:outline-none focus:border-fluent-blue font-bold"
                >
                  <option value="A1">Level A1 - Beginner</option>
                  <option value="A2">Level A2 - Elementary</option>
                  <option value="B1">Level B1 - Intermediate</option>
                  <option value="B2">Level B2 - Upper Intermediate</option>
                  <option value="C1">Level C1 - Advanced</option>
                </select>
              </div>
            </div>

            {/* Tanggal Mulai Batch & Mulai dari Sesi */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-fluent-blue" />
                  Tanggal Mulai Batch
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-mono font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                  Mulai dari Sesi Ke-
                </label>
                <input
                  type="number"
                  min="1"
                  value={startSessionNumber}
                  onChange={(e) => handleStartSessionChange(Number(e.target.value) || 1)}
                  className="w-full px-2.5 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-bold text-center"
                />
              </div>
            </div>

            {/* Jam Mulai Sesi & Durasi Sesi Default */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-fluent-blue" />
                  Jam Mulai Sesi
                </label>
                <input
                  type="time"
                  value={defaultStartTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-mono font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                  Durasi Sesi
                </label>
                <select
                  value={defaultDuration}
                  onChange={(e) => handleDefaultDurationChange(Number(e.target.value) || 90)}
                  className="w-full px-2.5 py-1.5 text-xs border border-fluent-border rounded-fluent bg-white focus:outline-none focus:border-fluent-blue font-medium"
                >
                  <option value={45}>45 Menit</option>
                  <option value={60}>60 Menit (1 Jam)</option>
                  <option value={90}>90 Menit (1.5 Jam)</option>
                  <option value={120}>120 Menit (2 Jam)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                  Sesi / Bulan
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={sessionsPerMonth}
                  onChange={(e) => setSessionsPerMonth(Number(e.target.value) || 4)}
                  className="w-full px-2.5 py-1 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                  Durasi (Bln)
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value) || 3)}
                  className="w-full px-2.5 py-1 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                  Total Sesi
                </label>
                <div className="w-full py-1 text-xs bg-blue-50 border border-blue-200 text-fluent-blue font-extrabold rounded-fluent text-center font-mono">
                  {totalCalculatedSessions} Sesi
                </div>
              </div>
            </div>

            {/* Judul Dokumen Roadmap */}
            <div className="pt-1">
              <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                Judul Dokumen Roadmap
              </label>
              <input
                type="text"
                value={roadmapTitle}
                onChange={(e) => setRoadmapTitle(e.target.value)}
                placeholder="PETA ALUR BELAJAR MODULAR 1-BATCH"
                className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-medium"
              />
            </div>

            <button
              type="button"
              onClick={handleRegenerateSessions}
              className="w-full mt-2 py-1.5 px-3 bg-fluent-subtle hover:bg-slate-200 text-slate-700 rounded-fluent text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Sesuaikan Ulang Daftar {totalCalculatedSessions} Sesi
            </button>
          </div>

          {/* Section: List of Sessions in Studio Manager */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-fluent-text flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-fluent-blue" />
                Daftar Sesi Granular ({sessions.length})
              </h2>
              <span className="text-xs font-mono font-bold text-emerald-700">
                {stats.completedCount} Tuntas ({stats.percentage}%)
              </span>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {sessions.map((s, idx) => {
                const rawStatus = String(s.status || '').toUpperCase()
                const isDone = rawStatus === 'COMPLETED' || rawStatus === 'SELESAI'
                const isRun = rawStatus === 'IN_PROGRESS' || rawStatus === 'SEDANG BERJALAN'

                return (
                  <div
                    key={s.id || idx}
                    onClick={() => setActiveSession(s)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      isDone
                        ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                        : isRun
                        ? 'bg-blue-50/40 border-blue-200 hover:border-blue-300'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-0.5 max-w-[280px]">
                      <div className="flex items-center space-x-2 text-[10px]">
                        <span className="font-bold text-slate-900 font-mono">
                          {formatSessionNumber(s.sessionNumber || idx + 1)}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="font-semibold text-slate-600">
                          {s.level || 'A2'}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className={isDone ? 'text-emerald-700 font-bold' : isRun ? 'text-blue-700 font-bold' : 'text-slate-400'}>
                          {isDone ? 'SELESAI' : isRun ? 'BERJALAN' : 'BELUM'}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {s.title}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveSession(s)
                        }}
                        className="p-1.5 text-slate-400 hover:text-fluent-blue transition-colors"
                        title="Edit Sesi"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteSession(s.id)
                        }}
                        className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors"
                        title="Hapus Sesi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: LIVE A4 PRINTABLE DOCUMENT PREVIEW (Flexible & Responsive) */}
        {/* ========================================================================= */}
        <div className="flex-1 min-w-0 bg-slate-100/70 p-4 lg:p-6 rounded-fluent border border-fluent-border overflow-x-auto flex justify-start xl:justify-center items-start">
          {/* Wrapper Pembungkus Dokumen dengan Transform Scale Responsif */}
          <div className="shrink-0 my-auto py-2 transition-transform origin-top scale-[0.75] sm:scale-[0.85] md:scale-[0.9] 2xl:scale-100">
            <RoadmapBatchDocument
              roadmapData={roadmapPayload}
              previewRef={previewRef}
              onSelectSession={setActiveSession}
            />
          </div>
        </div>

      </div>

      {/* Drawers & Modals */}
      <SessionDetailDrawer
        isOpen={!!activeSession}
        session={activeSession}
        modules={modules}
        onClose={() => setActiveSession(null)}
        onUpdateSession={handleUpdateSession}
        onOpenModule={onOpenModule}
      />

      <RoadmapPresetSelector
        isOpen={showPresetModal}
        onClose={() => setShowPresetModal(false)}
        onSelectPreset={handleApplyPreset}
        currentTier={activeStudent?.packageType || 'GROW'}
      />

      <CustomSessionModal
        isOpen={showCustomModal}
        session={editingSession}
        nextSessionNumber={sessions.length + 1}
        modules={modules}
        onClose={() => {
          setShowCustomModal(false)
          setEditingSession(null)
        }}
        onSave={handleSaveCustomSession}
      />
    </div>
  )
}
