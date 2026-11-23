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
  Edit3,
  FileText
} from 'lucide-react'
import RoadmapBatchDocument from './RoadmapBatchDocument'
import ResponsiveDocumentWrapper from '../common/ResponsiveDocumentWrapper'
import SessionDetailDrawer from './SessionDetailDrawer'
import RoadmapPresetSelector from './RoadmapPresetSelector'
import CustomSessionModal from './CustomSessionModal'
import RoadmapHeader from './RoadmapHeader'
import RoadmapParameterSidebar from './RoadmapParameterSidebar'
import { CURRICULUM_PRESETS, generateBatchSessions, getPresetByCefr } from '../../utils/curriculumPresets'
import {
  calculateOverallRoadmapProgress,
  calculateBatchSessionCount,
  autoAdvanceRoadmap,
  formatSessionNumber,
  resolveSessionStatusByDate,
  resolveSessionStatusByDateTime,
  applyDateBasedStatusToSessions,
  extractStudentSlotTime,
  KAVIO_TIME_SLOTS
} from '../../utils/roadmapCalculator'
import { generateRoadmapShareLink, generateRoadmapWhatsAppMessage } from '../../utils/roadmapShare'
import { exportRoadmapToPng, exportRoadmapToPdf } from '../../utils/roadmapExport'
import { PAPER_SIZES, DEFAULT_PAPER_SIZE, getPaperSizeConfig } from '../../utils/paperDimensions'

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
  const [paperSize, setPaperSize] = useState(DEFAULT_PAPER_SIZE)
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
      const studentSlotTime = extractStudentSlotTime(activeStudent)

      setSessionsPerMonth(sPerM)
      setDurationMonths(durM)

      if (activeStudent.roadmap && Array.isArray(activeStudent.roadmap.sessions) && activeStudent.roadmap.sessions.length > 0) {
        setDocId(activeStudent.roadmap.id || `ROA/KEEN/${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2, '0')}/${Math.floor(Math.random()*9000)+1000}`)
        setRoadmapTitle(activeStudent.roadmap.roadmapTitle || 'PETA ALUR BELAJAR MODULAR 1-BATCH')
        setRoadmapSubtitle(activeStudent.roadmap.roadmapSubtitle || 'OFFICIAL 1-BATCH MODULAR LEARNING ROADMAP & SESSION MATRIX')
        setBatchName(activeStudent.roadmap.batchName || 'BATCH 1')
        setLevel(activeStudent.roadmap.level || (CURRICULUM_PRESETS[tier]?.level || 'A2'))
        setPaperSize(activeStudent.roadmap.paperSize || DEFAULT_PAPER_SIZE)
        setStartSessionNumber(Number(activeStudent.roadmap.startSessionNumber) || 1)
        const sTime = activeStudent.roadmap.defaultStartTime || studentSlotTime || '15:00'
        const sDur = Number(activeStudent.roadmap.defaultDuration) || 90
        setDefaultStartTime(sTime)
        setDefaultDuration(sDur)
        const dateSynced = applyDateBasedStatusToSessions(activeStudent.roadmap.sessions, sTime, sDur)
        setSessions(dateSynced)
      } else {
        // Generate initial sessions from preset based on student's CRM slot time
        setDefaultStartTime(studentSlotTime)
        setDefaultDuration(90)
        const initialList = generateBatchSessions(tier, sPerM, durM, startDate, 1, studentSlotTime, 90)
        setSessions(initialList)
        setRoadmapTitle('PETA ALUR BELAJAR MODULAR 1-BATCH')
        setRoadmapSubtitle('OFFICIAL 1-BATCH MODULAR LEARNING ROADMAP & SESSION MATRIX')
        setBatchName('BATCH 1')
        setLevel(CURRICULUM_PRESETS[tier]?.level || 'A2')
        setPaperSize(DEFAULT_PAPER_SIZE)
        setStartSessionNumber(1)
      }
    }
  }, [activeStudent?.id])

  // Calculated Progress & Total Sessions
  const totalCalculatedSessions = calculateBatchSessionCount(sessionsPerMonth, durationMonths)
  const stats = useMemo(() => calculateOverallRoadmapProgress(sessions), [sessions])

  // Active Paper Config
  const activePaperConfig = getPaperSizeConfig(paperSize)

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
    paperSize,
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
  const saveChanges = (latestSessions = sessions, curStartNum = startSessionNumber, curPaperSize = paperSize) => {
    if (!activeStudent) return
    const updatedRoadmap = {
      ...roadmapPayload,
      paperSize: curPaperSize,
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
      await exportRoadmapToPng('roadmap-export-canvas', roadmapPayload.studentName, roadmapPayload.batchName, paperSize)
    } catch (err) {
      console.error('Export PNG error:', err)
    } finally {
      setIsExportingPng(false)
    }
  }

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true)
    try {
      await exportRoadmapToPdf('roadmap-export-canvas', roadmapPayload.studentName, roadmapPayload.batchName, paperSize)
    } catch (err) {
      console.error('Export PDF error:', err)
    } finally {
      setIsExportingPdf(false)
    }
  }

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Studio Header Bar (shadcn/ui Minimalist) */}
      <RoadmapHeader
        onOpenPreset={() => setShowPresetModal(true)}
        onAddSession={() => {
          setEditingSession(null)
          setShowCustomModal(true)
        }}
        onShare={handleCopyLink}
        onDownloadData={handleDownloadPng}
        onExportPdf={handleDownloadPdf}
        onShareWhatsApp={handleCopyWA}
        isExportingPdf={isExportingPdf}
        isExportingPng={isExportingPng}
        copiedLink={copiedLink}
        copiedWA={copiedWA}
        activePaperName={activePaperConfig.name}
      />

      {/* Main Studio Split-Screen Container */}
      <div className="flex flex-col lg:flex-row w-full gap-6 items-start">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: CONTROL & BATCH SESSION MANAGER (shadcn/ui Minimalist)       */}
        {/* ========================================================================= */}
        <RoadmapParameterSidebar
          students={students}
          activeStudent={activeStudent}
          selectedStudentId={activeStudent?.id}
          onSelectStudent={onSelectStudent}
          batchName={batchName}
          setBatchName={setBatchName}
          level={level}
          setLevel={(newLevel) => {
            setLevel(newLevel)
            const totalCount = Math.max(1, Number(sessionsPerMonth || 4) * Number(durationMonths || 3))
            const generated = getPresetByCefr(newLevel, totalCount, startDate, startSessionNumber, defaultStartTime, defaultDuration)
            setSessions(generated)
            saveChanges(generated)
          }}
          paperSize={paperSize}
          setPaperSize={(key) => {
            setPaperSize(key)
            saveChanges(sessions, startSessionNumber, key)
          }}
          startDate={startDate}
          setStartDate={handleStartDateChange}
          startSessionNumber={startSessionNumber}
          setStartSessionNumber={handleStartSessionChange}
          defaultStartTime={defaultStartTime}
          setDefaultStartTime={handleStartTimeChange}
          defaultDuration={defaultDuration}
          setDefaultDuration={handleDefaultDurationChange}
          sessionsPerMonth={sessionsPerMonth}
          setSessionsPerMonth={setSessionsPerMonth}
          durationMonths={durationMonths}
          setDurationMonths={setDurationMonths}
          roadmapTitle={roadmapTitle}
          setRoadmapTitle={setRoadmapTitle}
          onResetSessions={handleRegenerateSessions}
          sessions={sessions}
          onEditSession={(s) => {
            setEditingSession(s)
            setShowCustomModal(true)
          }}
          onDeleteSession={handleDeleteSession}
          stats={stats}
        />

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: LIVE PRINTABLE DOCUMENT PREVIEW (Flexible & Responsive) */}
        {/* ========================================================================= */}
        <div className="flex-1 min-w-0 bg-slate-100/70 p-2 sm:p-4 lg:p-6 rounded-fluent border border-fluent-border overflow-hidden flex justify-center items-start shadow-inner">
          <ResponsiveDocumentWrapper baseWidth={activePaperConfig.widthPx}>
            <RoadmapBatchDocument
              roadmapData={roadmapPayload}
              previewRef={previewRef}
              onSelectSession={setActiveSession}
              paperSize={paperSize}
            />
          </ResponsiveDocumentWrapper>
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
