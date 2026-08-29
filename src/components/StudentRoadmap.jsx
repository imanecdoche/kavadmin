import React, { useState, useEffect, useRef } from 'react'
import {
  BookOpen,
  Copy,
  Check,
  Download,
  Plus,
  Trash2,
  Printer,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  CheckCircle2,
  Clock,
  Circle,
  FileText,
  MessageSquare,
  Sparkles,
  ArrowUp,
  ArrowDown,
  CopyPlus,
  User,
  Layers,
  Calendar,
  Award,
  AlertCircle,
  Search,
  ExternalLink
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { exportElementToPdf, exportElementToPng } from '../utils/documentExportEngine'
import {
  SESSION_STATUS,
  STATUS_CONFIG,
  createDefaultRoadmap,
  normalizeStudentRoadmap,
  calculateRoadmapStats,
  generateRoadmapMarkdown,
  getDefaultSessionTemplate,
  getStudentSessionQuota
} from '../utils/roadmapDefaults'
import { formatDateIndonesian } from '../utils/dateFormatter'
import { logoSvg, ttdFatihPng, stempelKavioEduPng } from '../assets'

export default function StudentRoadmap({
  students = [],
  onUpdateStudent,
  selectedStudentId = null,
  onSelectStudent = null
}) {
  const roadmapRef = useRef(null)

  // 1. Registered Student Selection State
  const [selectedStudent, setSelectedStudent] = useState(() => {
    if (selectedStudentId && Array.isArray(students)) {
      const match = students.find(s => s.id === selectedStudentId)
      if (match) return match
    }
    return Array.isArray(students) && students.length > 0 ? students[0] : null
  })

  const [studentSearchQuery, setStudentSearchQuery] = useState('')
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false)

  // Update selected student when props change
  useEffect(() => {
    if (selectedStudentId && Array.isArray(students)) {
      const match = students.find(s => s.id === selectedStudentId)
      if (match) {
        setSelectedStudent(match)
      }
    } else if (!selectedStudent && Array.isArray(students) && students.length > 0) {
      setSelectedStudent(students[0])
    }
  }, [selectedStudentId, students])

  // 2. Active Roadmap Data State (1:1 with Selected Student)
  const [roadmapData, setRoadmapData] = useState(() => {
    return normalizeStudentRoadmap(selectedStudent)
  })

  // When selectedStudent changes, load its normalized roadmap
  useEffect(() => {
    if (selectedStudent) {
      const normalized = normalizeStudentRoadmap(selectedStudent)
      setRoadmapData(normalized)
    } else {
      setRoadmapData(null)
    }
  }, [selectedStudent?.id])

  // 3. UI State for Sessions & Forms
  const [expandedSessions, setExpandedSessions] = useState({})
  const [copiedWA, setCopiedWA] = useState(false)
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [isExportingPNG, setIsExportingPNG] = useState(false)
  const [saveStatus, setSaveStatus] = useState('saved') // 'saved' | 'saving' | 'dirty'
  const [toastMessage, setToastMessage] = useState(null)

  // Quick helper for Toast
  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type })
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // 4. Synchronization / Persistence Handler
  const persistRoadmapToStudent = (updatedRoadmap) => {
    if (!selectedStudent || !onUpdateStudent) return

    setSaveStatus('saving')
    const updatedStudent = {
      ...selectedStudent,
      roadmap: {
        ...updatedRoadmap,
        updatedAt: new Date().toISOString()
      }
    }

    onUpdateStudent(updatedStudent)
    setTimeout(() => {
      setSaveStatus('saved')
    }, 400)
  }

  // Handle updates to roadmap root metadata (level, moduleTitle, targetDuration, customNotes)
  const handleMetadataChange = (field, value) => {
    if (!roadmapData) return
    const updated = {
      ...roadmapData,
      [field]: value
    }
    setRoadmapData(updated)
    persistRoadmapToStudent(updated)
  }

  // 5. Session Operations (CRUD & Reorder)

  // Toggle single session accordion expand/collapse
  const toggleExpandSession = (sessionId) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }))
  }

  // Expand or collapse all sessions
  const handleToggleExpandAll = (expandAll) => {
    if (!roadmapData || !roadmapData.sessions) return
    const newState = {}
    roadmapData.sessions.forEach(s => {
      newState[s.id] = expandAll
    })
    setExpandedSessions(newState)
  }

  // Update specific session field
  const handleSessionFieldChange = (sessionId, field, value) => {
    if (!roadmapData) return
    const updatedSessions = roadmapData.sessions.map(s => {
      if (s.id === sessionId) {
        return { ...s, [field]: value }
      }
      return s
    })

    const updated = {
      ...roadmapData,
      sessions: updatedSessions
    }
    setRoadmapData(updated)
    persistRoadmapToStudent(updated)
  }

  // Quick toggle / cycle session status
  const handleCycleSessionStatus = (sessionId) => {
    if (!roadmapData) return
    const updatedSessions = roadmapData.sessions.map(s => {
      if (s.id === sessionId) {
        let nextStatus = SESSION_STATUS.PROSES
        if (s.status === SESSION_STATUS.BELUM) nextStatus = SESSION_STATUS.PROSES
        else if (s.status === SESSION_STATUS.PROSES) nextStatus = SESSION_STATUS.SELESAI
        else if (s.status === SESSION_STATUS.SELESAI) nextStatus = SESSION_STATUS.BELUM
        return { ...s, status: nextStatus }
      }
      return s
    })

    const updated = {
      ...roadmapData,
      sessions: updatedSessions
    }
    setRoadmapData(updated)
    persistRoadmapToStudent(updated)
  }

  // Set explicit status for a session
  const handleSetSessionStatus = (sessionId, status) => {
    handleSessionFieldChange(sessionId, 'status', status)
  }

  // Add new session
  const handleAddNewSession = () => {
    if (!roadmapData) return
    const currentSessions = roadmapData.sessions || []
    const nextSessionNumber = currentSessions.length + 1
    const newSession = getDefaultSessionTemplate(nextSessionNumber, selectedStudent)

    // Expand the new session automatically
    setExpandedSessions(prev => ({
      ...prev,
      [newSession.id]: true
    }))

    const updated = {
      ...roadmapData,
      sessions: [...currentSessions, newSession]
    }
    setRoadmapData(updated)
    persistRoadmapToStudent(updated)
    showToast(`Sesi ${nextSessionNumber} berhasil ditambahkan!`, 'success')
  }

  // Delete session
  const handleDeleteSession = (sessionId) => {
    if (!roadmapData) return
    const filtered = roadmapData.sessions.filter(s => s.id !== sessionId)
    // Renumber remaining sessions sequentially
    const renumbered = filtered.map((s, idx) => ({
      ...s,
      sessionNumber: idx + 1
    }))

    const updated = {
      ...roadmapData,
      sessions: renumbered
    }
    setRoadmapData(updated)
    persistRoadmapToStudent(updated)
    showToast('Sesi berhasil dihapus dan urutan diperbarui.', 'success')
  }

  // Duplicate session
  const handleDuplicateSession = (sessionId) => {
    if (!roadmapData) return
    const currentSessions = roadmapData.sessions || []
    const index = currentSessions.findIndex(s => s.id === sessionId)
    if (index === -1) return

    const source = currentSessions[index]
    const duplicated = {
      ...source,
      id: `sesi-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: `${source.title} (Lanjutan/Review)`,
      status: SESSION_STATUS.BELUM
    }

    const nextSessions = [...currentSessions]
    nextSessions.splice(index + 1, 0, duplicated)

    // Renumber
    const renumbered = nextSessions.map((s, idx) => ({
      ...s,
      sessionNumber: idx + 1
    }))

    setExpandedSessions(prev => ({
      ...prev,
      [duplicated.id]: true
    }))

    const updated = {
      ...roadmapData,
      sessions: renumbered
    }
    setRoadmapData(updated)
    persistRoadmapToStudent(updated)
    showToast('Sesi berhasil diduplikasi.', 'success')
  }

  // Move session Up/Down
  const handleMoveSession = (sessionId, direction) => {
    if (!roadmapData) return
    const currentSessions = [...roadmapData.sessions]
    const index = currentSessions.findIndex(s => s.id === sessionId)
    if (index === -1) return

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= currentSessions.length) return

    // Swap
    const temp = currentSessions[index]
    currentSessions[index] = currentSessions[targetIndex]
    currentSessions[targetIndex] = temp

    // Renumber
    const renumbered = currentSessions.map((s, idx) => ({
      ...s,
      sessionNumber: idx + 1
    }))

    const updated = {
      ...roadmapData,
      sessions: renumbered
    }
    setRoadmapData(updated)
    persistRoadmapToStudent(updated)
  }

  // Reset sessions to student's default package quota
  const handleResetToDefault = () => {
    if (!selectedStudent) return
    const confirmed = window.confirm(`Reset seluruh sesi roadmap ${selectedStudent.name} ke default kuota paket (${getStudentSessionQuota(selectedStudent)} Sesi)? Perubahan sesi saat ini akan diganti.`)
    if (!confirmed) return

    const freshDefault = createDefaultRoadmap(selectedStudent)
    setRoadmapData(freshDefault)
    persistRoadmapToStudent(freshDefault)
    showToast(`Roadmap berhasil direset sesuai paket ${selectedStudent.packageType || 'Standar'}.`, 'success')
  }

  // Mark all sessions as completed
  const handleMarkAllCompleted = () => {
    if (!roadmapData || !roadmapData.sessions) return
    const updatedSessions = roadmapData.sessions.map(s => ({
      ...s,
      status: SESSION_STATUS.SELESAI
    }))
    const updated = {
      ...roadmapData,
      sessions: updatedSessions
    }
    setRoadmapData(updated)
    persistRoadmapToStudent(updated)
    showToast('Seluruh sesi ditandai SELESAI.', 'success')
  }

  // 6. Copy Markdown / WhatsApp Format
  const handleCopyMarkdownWA = () => {
    if (!roadmapData) return
    const text = generateRoadmapMarkdown(roadmapData, selectedStudent)
    navigator.clipboard.writeText(text)
    setCopiedWA(true)
    showToast('Ringkasan roadmap berhasil disalin ke clipboard!', 'success')
    setTimeout(() => setCopiedWA(false), 2000)
  }

  // Open Direct WhatsApp with Parent/Student
  const handleSendViaWhatsApp = () => {
    if (!roadmapData || !selectedStudent) return
    const text = generateRoadmapMarkdown(roadmapData, selectedStudent)
    const phone = selectedStudent.parentPhone || selectedStudent.studentPhone || ''
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }



  // Export PDF with exact A4 proportions
  const handleDownloadPDF = async () => {
    if (!roadmapRef.current || !selectedStudent) return
    setIsExportingPDF(true)

    try {
      const cleanName = (selectedStudent.name || 'Siswa').replace(/[^a-zA-Z0-9_-]/g, '_')
      await exportElementToPdf(roadmapRef.current, `Roadmap_${cleanName}_KavioEdu`, { mode: 'continuous', orientation: 'portrait' })
      showToast('File PDF Roadmap berhasil diunduh!', 'success')
    } catch (err) {
      console.error('Export PDF error:', err)
      showToast('Gagal mengekspor PDF. Silakan coba kembali.', 'error')
    } finally {
      setIsExportingPDF(false)
    }
  }

  // Export PNG Image (2x High Resolution)
  const handleDownloadPNG = async () => {
    if (!roadmapRef.current || !selectedStudent) return
    setIsExportingPNG(true)

    try {
      const cleanName = (selectedStudent.name || 'Siswa').replace(/[^a-zA-Z0-9_-]/g, '_')
      await exportElementToPng(roadmapRef.current, `Roadmap_${cleanName}_KavioEdu`)
      showToast('Gambar PNG Roadmap berhasil diunduh!', 'success')
    } catch (err) {
      console.error('Export PNG error:', err)
      showToast('Gagal mengekspor PNG.', 'error')
    } finally {
      setIsExportingPNG(false)
    }
  }

  // Trigger Browser Print Dialog
  const handlePrint = () => {
    window.print()
  }

  // Calculate statistics
  const stats = calculateRoadmapStats(roadmapData?.sessions || [])
  const filteredStudents = (Array.isArray(students) ? students : []).filter(s =>
    (s.name || '').toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    (s.packageType || '').toLowerCase().includes(studentSearchQuery.toLowerCase())
  )

  // Empty state if no students registered
  if (!Array.isArray(students) || students.length === 0) {
    return (
      <div className="bg-white rounded-fluent border border-fluent-border p-12 text-center shadow-fluent space-y-4 max-w-xl mx-auto my-8">
        <div className="w-14 h-14 bg-blue-50 text-fluent-blue rounded-full flex items-center justify-center mx-auto">
          <BookOpen className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-fluent-text">
          Belum Ada Siswa Terdaftar
        </h2>
        <p className="text-xs text-fluent-textSecondary max-w-md mx-auto">
          Roadmap Pembelajaran terhubung 1:1 secara eksklusif dengan siswa yang sudah terdaftar di sistem. Silakan tambahkan data siswa terlebih dahulu di tab <strong>Dashboard</strong>.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-16">

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-fluent-text tracking-tight">
              Roadmap Pembelajaran
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-bold bg-blue-50 text-fluent-blue border border-blue-200 rounded-fluent">
              1:1 Siswa Aktif
            </span>
          </div>
          <p className="text-xs text-fluent-textSecondary mt-0.5">
            Manajemen kurikulum personal, silabus pembelajaran, dan monitoring progres capaian siswa Kavio Edu.
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 no-print">
          {/* Status Saved Badge */}
          <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 bg-fluent-subtle rounded-fluent border border-fluent-border text-[11px] text-fluent-textSecondary">
            {saveStatus === 'saving' ? (
              <>
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium text-emerald-800">Tersimpan Otomatis</span>
              </>
            )}
          </div>

          {/* Copy Markdown / WA */}
          <button
            type="button"
            onClick={handleCopyMarkdownWA}
            title={copiedWA ? 'Ringkasan Tersalin!' : 'Salin Format WhatsApp / Markdown'}
            aria-label="Salin Format WhatsApp / Markdown"
            className="p-2.5 border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded-fluent flex items-center justify-center transition-colors shadow-xs"
          >
            {copiedWA ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Direct WhatsApp Share */}
          <button
            type="button"
            onClick={handleSendViaWhatsApp}
            title="Kirim Ringkasan Roadmap via WhatsApp"
            aria-label="Kirim Ringkasan Roadmap via WhatsApp"
            className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-fluent flex items-center justify-center transition-colors shadow-xs"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Download PNG */}
          <button
            type="button"
            onClick={handleDownloadPNG}
            disabled={isExportingPNG || isExportingPDF}
            title="Download Gambar PNG (High Resolution)"
            aria-label="Download Gambar PNG"
            className="p-2.5 border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded-fluent flex items-center justify-center transition-colors shadow-xs disabled:opacity-50"
          >
            {isExportingPNG ? (
              <div className="w-4 h-4 border-2 border-fluent-blue border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FileText className="w-4 h-4 text-fluent-blue" />
            )}
          </button>

          {/* Download PDF */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isExportingPDF || isExportingPNG}
            title="Download Dokumen PDF A4 Standar"
            aria-label="Download Dokumen PDF"
            className="p-2.5 bg-fluent-blue hover:bg-fluent-blueHover text-white rounded-fluent flex items-center justify-center transition-colors shadow-xs disabled:opacity-50"
          >
            {isExportingPDF ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>

          {/* Print */}
          <button
            type="button"
            onClick={handlePrint}
            title="Cetak Langsung (Print)"
            aria-label="Cetak Langsung"
            className="p-2.5 border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded-fluent flex items-center justify-center transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Config Panel & Right Live Preview Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ======================================================== */}
        {/* LEFT COLUMN: FORM INPUTS & SESSIONS EDITOR               */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 bg-white p-5 rounded-fluent border border-fluent-border shadow-fluent space-y-5 no-print">

          {/* Section 1: Student Selection (1:1 Relation) */}
          <div className="space-y-2 border-b border-fluent-border pb-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-fluent-blue uppercase tracking-wider">
                1. Pilih Siswa Terdaftar
              </label>
              {selectedStudent && (
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold">
                  Paket {selectedStudent.packageType} ({getStudentSessionQuota(selectedStudent)} Sesi)
                </span>
              )}
            </div>

            {/* Custom Student Selector with Search */}
            <div className="relative">
              <div
                onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}
                className="w-full px-3 py-2 text-xs border border-fluent-border rounded-fluent bg-fluent-subtle/50 hover:bg-fluent-subtle cursor-pointer flex items-center justify-between transition-colors"
              >
                <div className="flex items-center space-x-2 truncate">
                  <User className="w-4 h-4 text-fluent-blue flex-shrink-0" />
                  <span className="font-bold text-fluent-text truncate">
                    {selectedStudent ? selectedStudent.name : 'Pilih Siswa...'}
                  </span>
                  {selectedStudent?.grade && (
                    <span className="text-fluent-textSecondary text-[11px] truncate">
                      • {selectedStudent.grade}
                    </span>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-fluent-textSecondary transition-transform ${isStudentDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Dropdown Menu */}
              {isStudentDropdownOpen && (
                <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white border border-fluent-border rounded-fluent shadow-fluent-modal max-h-60 overflow-hidden flex flex-col animate-fadeIn">
                  {/* Search Input */}
                  <div className="p-2 border-b border-fluent-border bg-fluent-subtle/80 flex items-center space-x-2">
                    <Search className="w-3.5 h-3.5 text-fluent-textSecondary" />
                    <input
                      type="text"
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      placeholder="Cari nama atau paket..."
                      className="w-full text-xs bg-transparent focus:outline-none"
                      autoFocus
                    />
                  </div>

                  {/* Options List */}
                  <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((st) => {
                        const isSelected = selectedStudent?.id === st.id
                        const quota = getStudentSessionQuota(st)
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => {
                              setSelectedStudent(st)
                              if (onSelectStudent) onSelectStudent(st)
                              setIsStudentDropdownOpen(false)
                              setStudentSearchQuery('')
                            }}
                            className={`w-full text-left px-3 py-2.5 text-xs transition-colors flex items-center justify-between ${isSelected ? 'bg-blue-50/80 text-fluent-blue font-semibold' : 'hover:bg-fluent-subtle text-fluent-text'}`}
                          >
                            <div>
                              <div className="font-bold">{st.name}</div>
                              <div className="text-[10px] text-fluent-textSecondary">
                                {st.grade || 'Umum'} • Wali: {st.parentName || '-'}
                              </div>
                            </div>
                            <span className="text-[10px] bg-fluent-subtle px-1.5 py-0.5 rounded text-fluent-textSecondary font-medium border border-fluent-border">
                              {st.packageType} ({quota} Sesi)
                            </span>
                          </button>
                        )
                      })
                    ) : (
                      <div className="p-3 text-center text-xs text-fluent-textSecondary italic">
                        Siswa tidak ditemukan.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Metadata Kurikulum (Level, Modul, Target Durasi) */}
          <div className="space-y-3 border-b border-fluent-border pb-4">
            <h2 className="text-xs font-bold text-fluent-blue uppercase tracking-wider">
              2. Informasi & Target Modul
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                  Tingkat / Level Siswa
                </label>
                <input
                  type="text"
                  value={roadmapData?.level || ''}
                  onChange={(e) => handleMetadataChange('level', e.target.value)}
                  placeholder="Contoh: Level A1 / 12 SMA"
                  className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                  Target Durasi & Kuota
                </label>
                <input
                  type="text"
                  value={roadmapData?.targetDuration || ''}
                  onChange={(e) => handleMetadataChange('targetDuration', e.target.value)}
                  placeholder="Contoh: 1 Bulan (4 Sesi)"
                  className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                Judul Modul / Silabus Utama
              </label>
              <input
                type="text"
                value={roadmapData?.moduleTitle || ''}
                onChange={(e) => handleMetadataChange('moduleTitle', e.target.value)}
                placeholder="Contoh: Grammar & Speaking Mastery: Essential Tenses"
                className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                Catatan Khusus / Target Akademik (Opsional)
              </label>
              <input
                type="text"
                value={roadmapData?.customNotes || ''}
                onChange={(e) => handleMetadataChange('customNotes', e.target.value)}
                placeholder="Contoh: Fokus speaking confidence & persiapan ujian sekolah"
                className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
              />
            </div>
          </div>

          {/* Section 3: Sessions Manager & Quick Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h2 className="text-xs font-bold text-fluent-blue uppercase tracking-wider">
                  3. Rincian Sesi ({stats.total} Sesi)
                </h2>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  {stats.selesaiCount}/{stats.total} Selesai ({stats.percentComplete}%)
                </span>
              </div>

              {/* Accordion Expand/Collapse All Buttons */}
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => handleToggleExpandAll(true)}
                  className="px-2 py-0.5 text-[10px] text-fluent-textSecondary hover:text-fluent-blue hover:bg-fluent-subtle rounded border border-fluent-border"
                >
                  Buka Semua
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleExpandAll(false)}
                  className="px-2 py-0.5 text-[10px] text-fluent-textSecondary hover:text-fluent-blue hover:bg-fluent-subtle rounded border border-fluent-border"
                >
                  Tutup Semua
                </button>
              </div>
            </div>

            {/* Quick Progress Bar in Form */}
            <div className="bg-fluent-subtle p-2.5 rounded-fluent border border-fluent-border space-y-1.5">
              <div className="flex justify-between text-[11px] font-semibold text-fluent-textSecondary">
                <span>Progres Kurikulum</span>
                <span>{stats.percentComplete}% Selesai</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${(stats.selesaiCount / (stats.total || 1)) * 100}%` }}
                  title={`${stats.selesaiCount} Selesai`}
                ></div>
                <div
                  className="bg-amber-400 h-full transition-all duration-300"
                  style={{ width: `${(stats.prosesCount / (stats.total || 1)) * 100}%` }}
                  title={`${stats.prosesCount} Dalam Proses`}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-fluent-textSecondary pt-0.5">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  <span>Selesai: <strong>{stats.selesaiCount}</strong></span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                  <span>Proses: <strong>{stats.prosesCount}</strong></span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-slate-300 inline-block"></span>
                  <span>Belum: <strong>{stats.belumCount}</strong></span>
                </span>
              </div>
            </div>

            {/* Sessions List Accordion */}
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {roadmapData?.sessions && roadmapData.sessions.length > 0 ? (
                roadmapData.sessions.map((session, index) => {
                  const isExpanded = !!expandedSessions[session.id]
                  const statusInfo = STATUS_CONFIG[session.status] || STATUS_CONFIG.BELUM

                  return (
                    <div
                      key={session.id}
                      className={`bg-white rounded border transition-all ${statusInfo.border} shadow-xs`}
                    >
                      {/* Session Header / Collapsed Bar */}
                      <div className="p-2.5 flex items-center justify-between gap-2">
                        {/* Number & Title */}
                        <div
                          onClick={() => toggleExpandSession(session.id)}
                          className="flex items-center space-x-2.5 flex-1 min-w-0 cursor-pointer select-none"
                        >
                          <span className="w-6 h-6 rounded-full bg-fluent-subtle border border-fluent-border flex items-center justify-center text-[10px] font-bold text-fluent-text flex-shrink-0">
                            {session.sessionNumber}
                          </span>
                          <span className="font-semibold text-xs text-fluent-text truncate">
                            {session.title || `Sesi ${session.sessionNumber}`}
                          </span>
                        </div>

                        {/* Status Quick Pill + Actions */}
                        <div className="flex items-center space-x-1.5 flex-shrink-0">
                          {/* Cycle Status Button */}
                          <button
                            type="button"
                            onClick={() => handleCycleSessionStatus(session.id)}
                            title={`Status: ${session.status} (Klik untuk ganti)`}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full border transition-all ${statusInfo.badgeBg} flex items-center space-x-1`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></span>
                            <span>{session.status}</span>
                          </button>

                          {/* Reorder Up */}
                          <button
                            type="button"
                            onClick={() => handleMoveSession(session.id, 'up')}
                            disabled={index === 0}
                            title="Pindah ke Atas"
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-colors"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>

                          {/* Reorder Down */}
                          <button
                            type="button"
                            onClick={() => handleMoveSession(session.id, 'down')}
                            disabled={index === (roadmapData.sessions.length - 1)}
                            title="Pindah ke Bawah"
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-colors"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Duplicate */}
                          <button
                            type="button"
                            onClick={() => handleDuplicateSession(session.id)}
                            title="Duplikasi Sesi"
                            className="p-1 text-slate-400 hover:text-fluent-blue transition-colors"
                          >
                            <CopyPlus className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteSession(session.id)}
                            title="Hapus Sesi"
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Expand/Collapse Chevron */}
                          <button
                            type="button"
                            onClick={() => toggleExpandSession(session.id)}
                            className="p-1 text-slate-400 hover:text-slate-700"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Edit Form Body */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-fluent-border p-3 bg-fluent-subtle/40 space-y-3 text-xs"
                          >
                            {/* Judul Sesi & Status Picker */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="sm:col-span-2">
                                <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                                  Judul Sesi #{session.sessionNumber}
                                </label>
                                <input
                                  type="text"
                                  value={session.title}
                                  onChange={(e) => handleSessionFieldChange(session.id, 'title', e.target.value)}
                                  placeholder="Contoh: Simple Past Tense & Irregular Verbs"
                                  className="w-full px-2.5 py-1.5 border border-fluent-border rounded-fluent bg-white text-xs font-semibold focus:outline-none focus:border-fluent-blue"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                                  Status Sesi
                                </label>
                                <div className="grid grid-cols-3 gap-1">
                                  {[SESSION_STATUS.BELUM, SESSION_STATUS.PROSES, SESSION_STATUS.SELESAI].map((st) => (
                                    <button
                                      key={st}
                                      type="button"
                                      onClick={() => handleSetSessionStatus(session.id, st)}
                                      className={`py-1 text-[10px] font-bold rounded border transition-all ${session.status === st ? STATUS_CONFIG[st].badgeBg : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                    >
                                      {st}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Rincian Materi */}
                            <div>
                              <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                                Rincian Materi yang Dipelajari
                              </label>
                              <textarea
                                rows="2"
                                value={session.materials}
                                onChange={(e) => handleSessionFieldChange(session.id, 'materials', e.target.value)}
                                placeholder="Contoh: Pembahasan aturan pembentukan kalimat past tense, 20 irregular verbs umum, latihan reading."
                                className="w-full px-2.5 py-1.5 border border-fluent-border rounded-fluent bg-white text-xs focus:outline-none focus:border-fluent-blue"
                              ></textarea>
                            </div>

                            {/* Evaluasi / Catatan Belajar */}
                            <div>
                              <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                                Evaluasi / Catatan Belajar Siswa
                              </label>
                              <textarea
                                rows="2"
                                value={session.evaluation}
                                onChange={(e) => handleSessionFieldChange(session.id, 'evaluation', e.target.value)}
                                placeholder="Contoh: Siswa sudah paham rumus dasar, perlu penguatan hafalan irregular verbs."
                                className="w-full px-2.5 py-1.5 border border-fluent-border rounded-fluent bg-white text-xs focus:outline-none focus:border-fluent-blue"
                              ></textarea>
                            </div>

                            {/* Tugas / Assignment (Opsional) */}
                            <div>
                              <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                                Tugas / Assignment (Opsional)
                              </label>
                              <input
                                type="text"
                                value={session.tasks}
                                onChange={(e) => handleSessionFieldChange(session.id, 'tasks', e.target.value)}
                                placeholder="Contoh: Menulis 5 kalimat pengalaman liburan (deadline H-1 sebelum sesi berikutnya)"
                                className="w-full px-2.5 py-1.5 border border-fluent-border rounded-fluent bg-white text-xs focus:outline-none focus:border-fluent-blue"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })
              ) : (
                <div className="p-4 text-center text-xs text-fluent-textSecondary italic bg-fluent-subtle rounded border border-fluent-border">
                  Belum ada sesi pada roadmap ini. Klik tombol Tambah Sesi di bawah.
                </div>
              )}
            </div>

            {/* Bottom Form Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={handleAddNewSession}
                className="w-full sm:flex-1 py-2 px-3 bg-fluent-blue hover:bg-fluent-blueHover text-white rounded-fluent text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Sesi Pembelajaran Baru</span>
              </button>

              <button
                type="button"
                onClick={handleMarkAllCompleted}
                title="Tandai Seluruh Sesi Selesai"
                className="w-full sm:w-auto py-2 px-3 border border-fluent-border hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-fluent-text rounded-fluent text-xs font-medium transition-colors"
              >
                Semua Selesai
              </button>

              <button
                type="button"
                onClick={handleResetToDefault}
                title="Reset Sesi Sesuai Kuota Paket Siswa"
                className="w-full sm:w-auto p-2 border border-fluent-border hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-fluent-textSecondary rounded-fluent transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: DOCUMENT PREVIEW (TEXT & LINES ONLY)       */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 flex flex-col items-center w-full">

          {/* Responsive Document Container - 100% Frame Fit */}
          <div
            ref={roadmapRef}
            id="roadmap-printable-container"
            className="w-full bg-white border border-fluent-border rounded-fluent p-6 sm:p-8 space-y-6 text-slate-900 print:shadow-none print:border-none print:p-0 select-text shadow-fluent"
            style={{ boxSizing: 'border-box' }}
          >

            {/* Document Header with Kavio Edu Branding */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 gap-4">
              <div>
                <img
                  src={logoSvg}
                  alt="Kavio Edu Logo"
                  className="h-9 sm:h-10 w-auto object-contain mb-2"
                />
                <h1 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-900">
                  KURIKULUM & ROADMAP PEMBELAJARAN
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-600">
                  Private English Class & Academic Mentoring • Kavio Edu
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="font-mono font-bold text-[11px] sm:text-xs text-slate-900 tracking-wider">
                  KAV/RDM/{new Date().getFullYear()}/{(selectedStudent?.name || 'EDU').toUpperCase().slice(0, 4)}
                </div>
                <p className="text-[11px] sm:text-xs text-slate-600 mt-1">
                  Terbit: <span className="font-semibold text-slate-900">{formatDateIndonesian(new Date().toISOString())}</span>
                </p>
                <p className="text-[10px] sm:text-[11px] text-slate-500">
                  Academic Session {new Date().getFullYear()}
                </p>
              </div>
            </div>

            {/* Student & Program Overview Grid (Text & Lines Only) */}
            <div className="border-b border-slate-300 pb-4 pt-1">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Nama Siswa
                  </span>
                  <span className="font-bold text-sm text-slate-900 block mt-0.5">
                    {selectedStudent?.name || roadmapData?.studentName || '-'}
                  </span>
                  {selectedStudent?.parentName && (
                    <span className="text-[11px] text-slate-600 block mt-0.5">
                      Wali: {selectedStudent.parentName}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Paket & Kuota
                  </span>
                  <span className="font-semibold text-slate-900 block mt-0.5">
                    Paket {selectedStudent?.packageType || 'Standar'}
                  </span>
                  <span className="text-[11px] text-slate-600 block mt-0.5">
                    {roadmapData?.targetDuration || `${selectedStudent?.durationMonths || 1} Bulan`}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Jenjang / Level
                  </span>
                  <span className="font-semibold text-slate-900 block mt-0.5">
                    {roadmapData?.level || '-'}
                  </span>
                  <span className="text-[11px] text-slate-600 block mt-0.5 truncate">
                    {selectedStudent?.learningTarget || 'Target Umum'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Capaian Kurikulum
                  </span>
                  <span className="font-bold text-sm text-slate-900 block mt-0.5">
                    {stats.selesaiCount} dari {stats.total} Sesi
                  </span>
                  <span className="text-[11px] font-semibold text-slate-700 block mt-0.5">
                    Progres: {stats.percentComplete}% Selesai
                  </span>
                </div>
              </div>
            </div>

            {/* Modul Title Section (Text & Lines Only) */}
            <div className="border-b border-slate-300 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Silabus & Modul Pembelajaran
              </span>
              <h2 className="text-sm font-bold text-slate-900 mt-0.5">
                {roadmapData?.moduleTitle || 'Comprehensive English Mastery'}
              </h2>
              {roadmapData?.customNotes && (
                <p className="text-xs text-slate-600 mt-1 italic">
                  Catatan Khusus: {roadmapData.customNotes}
                </p>
              )}
            </div>

            {/* Curriculum Sessions Details (Text & Lines Only) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Rincian Sesi & Materi Pembelajaran
                </h3>
                <span className="text-xs font-semibold text-slate-600">
                  Total {stats.total} Sesi Terjadwal
                </span>
              </div>

              {/* Sessions List - Divider Lines & Text Only */}
              <div className="divide-y divide-slate-200">
                {roadmapData?.sessions && roadmapData.sessions.length > 0 ? (
                  roadmapData.sessions.map((session) => {
                    const isSelesai = session.status === SESSION_STATUS.SELESAI
                    const isProses = session.status === SESSION_STATUS.PROSES

                    return (
                      <div
                        key={session.id}
                        className="py-4 space-y-2 text-xs"
                      >
                        {/* Session Top Bar: Number, Title, Status */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-baseline space-x-2 flex-1 min-w-0">
                            <span className="font-bold text-sm text-slate-900 font-mono flex-shrink-0">
                              {session.sessionNumber < 10 ? `0${session.sessionNumber}.` : `${session.sessionNumber}.`}
                            </span>
                            <h4 className="font-bold text-sm text-slate-900 leading-snug">
                              {session.title || `Sesi ${session.sessionNumber}`}
                            </h4>
                          </div>

                          <div className="flex-shrink-0 text-right">
                            <span className={`font-mono text-xs font-bold tracking-wider uppercase ${
                              isSelesai
                                ? 'text-emerald-700'
                                : isProses
                                  ? 'text-amber-700'
                                  : 'text-slate-500'
                            }`}>
                              [{session.status}]
                            </span>
                          </div>
                        </div>

                        {/* Rincian Materi */}
                        {session.materials && (
                          <div className="pl-6 space-y-0.5">
                            <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 block">
                              Materi Pembelajaran:
                            </span>
                            <p className="text-slate-800 leading-relaxed whitespace-pre-line text-xs">
                              {session.materials}
                            </p>
                          </div>
                        )}

                        {/* Evaluasi / Catatan Belajar & Tugas */}
                        {(session.evaluation || session.tasks) && (
                          <div className="pl-6 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            {session.evaluation && (
                              <div className="space-y-0.5">
                                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 block">
                                  Catatan & Evaluasi:
                                </span>
                                <p className="text-slate-800 leading-relaxed text-xs">
                                  {session.evaluation}
                                </p>
                              </div>
                            )}

                            {session.tasks && (
                              <div className="space-y-0.5">
                                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 block">
                                  Tugas Mandiri / PR:
                                </span>
                                <p className="text-slate-800 leading-relaxed text-xs">
                                  {session.tasks}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500 italic">
                    Belum ada rincian sesi.
                  </div>
                )}
              </div>
            </div>

            {/* Document Verification & Academic Sign-Off Footer */}
            <div className="border-t-2 border-slate-900 pt-6 mt-8 flex justify-between items-end">
              {/* Left: Verification Info */}
              <div className="space-y-1 text-xs text-slate-600">
                <div className="font-bold text-slate-900 uppercase tracking-wider">
                  Kavio Edu Academic Management
                </div>
                <p className="text-[11px]">
                  Official Student Curriculum & Learning Progress Record
                </p>
                <p className="text-[11px] text-slate-500 font-mono pt-1">
                  VERIFIED-DOC: {selectedStudent?.id ? `STU-${selectedStudent.id}` : 'STU-001'}-RDM2026
                </p>
              </div>

              {/* Right: Founder Signature & Seal */}
              <div className="text-center relative pr-4">
                <p className="text-xs text-slate-600 mb-1">
                  Pandeglang, {formatDateIndonesian(new Date().toISOString())}
                </p>
                <p className="text-xs font-bold text-slate-900 mb-2">
                  Academic Director & Mentor
                </p>

                {/* Signature & Stamp Overlay Container */}
                <div className="relative h-20 w-44 mx-auto flex items-center justify-center">
                  {/* Digital Signature */}
                  <img
                    src={ttdFatihPng}
                    alt="Tanda Tangan Founder"
                    className="h-16 w-auto object-contain relative z-10 select-none pointer-events-none"
                  />

                  {/* Stamp */}
                  <img
                    src={stempelKavioEduPng}
                    alt="Stempel Kavio Edu"
                    className="h-16 w-auto object-contain absolute top-1 left-2 opacity-75 rotate-[-12deg] z-20 select-none pointer-events-none"
                  />
                </div>

                <div className="border-t border-slate-900 pt-1 mt-1">
                  <p className="text-xs font-bold text-slate-900">
                    Fatih Farhat Asshidiq
                  </p>
                  <p className="text-[10px] text-slate-600">
                    Founder Kavio Edu
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Copyright Strip */}
            <div className="text-center pt-3 border-t border-slate-200 text-[10px] text-slate-500">
              Kavio Edu Private English • Empowering Minds, Inspiring Excellence • © 2026
            </div>

          </div>

        </div>

      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-fadeIn no-print">
          <div className={`px-4 py-3 rounded-fluent shadow-fluent-modal border flex items-center space-x-2.5 text-xs font-semibold ${toastMessage.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-800'
              : 'bg-emerald-50 border-emerald-300 text-emerald-800'
            }`}>
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

    </div>
  )
}
