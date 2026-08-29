import React, { useState, useRef, useEffect } from 'react'
import {
  FileText,
  Printer,
  Download,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  User,
  Calendar,
  Sparkles,
  Sliders,
  Award,
  RefreshCw,
  Eye,
  Send,
  MessageCircle,
  ShieldCheck,
  BookOpen
} from 'lucide-react'
import ReportCardPreview from './ReportCardPreview'
import ResponsiveDocumentWrapper from '../common/ResponsiveDocumentWrapper'
import {
  DEFAULT_COMPETENCIES,
  calculateCompositeScore,
  getLetterGrade,
  getPerformanceCategory,
  getBenchmark,
  generateReportNumber
} from '../../utils/reportCalculator'

import { exportReportToPdf, exportReportToPng } from '../../utils/reportPdfExport'
import { generateReportShareLink, generateReportWhatsAppMessage } from '../../utils/reportShare'

const INDONESIAN_COMPETENCY_MAP = {
  grammar: { label: 'Tata Bahasa & Struktur Kalimat', shortLabel: 'Tata Bahasa' },
  vocabulary: { label: 'Kosakata & Penguasaan Idiom', shortLabel: 'Kosakata' },
  speaking: { label: 'Kelancaran Berbicara & Pelafalan', shortLabel: 'Berbicara' },
  listening: { label: 'Pemahaman Mendengar & Simakan', shortLabel: 'Mendengar' },
  discipline: { label: 'Kedisiplinan & Tugas Mandiri', shortLabel: 'Kedisiplinan' }
}

export default function ReportCardStudio({
  students = [],
  selectedStudent: initialStudent = null,
  onSaveReport = null,
  onExportPdf = null,
  onCopyWhatsApp = null
}) {
  const previewRef = useRef(null)

  // Report Form State
  const [reportId, setReportId] = useState(() => generateReportNumber())
  const [documentTitle, setDocumentTitle] = useState('LAPORAN PERKEMBANGAN BELAJAR RESMI')
  const [documentSubtitle, setDocumentSubtitle] = useState('Official Academic Progress & Competency Evaluation')
  const [studentName, setStudentName] = useState('')
  const [guardianName, setGuardianName] = useState('')
  const [programTier, setProgramTier] = useState('GROW')
  const [periodName, setPeriodName] = useState('Batch 1 (Sesi 1 - 8)')
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0])
  
  // Attendance State
  const [attendance, setAttendance] = useState({
    totalSessions: 8,
    attendedSessions: 8,
    attendanceRate: 100,
    punctualityRate: 100
  })

  // Competency Rubric State
  const [competencies, setCompetencies] = useState(() => JSON.parse(JSON.stringify(DEFAULT_COMPETENCIES)))

  // Qualitative Feedback State
  const [qualitativeAssessment, setQualitativeAssessment] = useState({
    keyStrengths: 'Penguasaan struktur kalimat dan kosakata meningkat signifikan. Siswa sangat percaya diri dalam sesi speaking spontan.',
    areasForImprovement: 'Tingkatkan ketelitian penggunaan irregular past tenses dan variasi idiom bahasa Inggris.',
    generalNotes: 'Menunjukkan komitmen belajar dan antusiasme yang luar biasa selama periode kursus.',
    nextRoadmapTarget: 'Modul Academic Reading & Discussion Tingkat Lanjut.'
  })

  // Verification & Signatures
  const [verification, setVerification] = useState({
    isSigned: true,
    isStamped: true
  })

  // UI Autocomplete & Action Feedback State
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isStudentLocked, setIsStudentLocked] = useState(false)
  const [copiedWA, setCopiedWA] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const [isExportingPng, setIsExportingPng] = useState(false)

  // Handle Initial Selected Student from Dashboard
  useEffect(() => {
    if (initialStudent) {
      handleSelectStudent(initialStudent)
    }
  }, [initialStudent])

  // Select student handler
  const handleSelectStudent = (st) => {
    if (!st) return
    setStudentName(st.name || '')
    setGuardianName(st.parentName || '')
    if (st.packageType) setProgramTier(st.packageType)
    setIsStudentLocked(true)
    setShowSuggestions(false)
  }

  // Handle typing in student search
  const handleStudentNameChange = (e) => {
    const val = e.target.value
    setStudentName(val)
    setShowSuggestions(true)

    const safeList = Array.isArray(students) ? students : []
    const matched = safeList.find(s => (s.name || '').toLowerCase() === val.toLowerCase().trim())
    if (matched) {
      handleSelectStudent(matched)
    } else {
      setIsStudentLocked(false)
    }
  }

  // Competency Score Update with Dynamic Benchmark
  const handleScoreChange = (key, rawVal) => {
    const score = Math.max(0, Math.min(100, Number(rawVal) || 0))
    setCompetencies(prev => prev.map(item => {
      if (item.key === key) {
        return {
          ...item,
          score,
          benchmark: getBenchmark(score)
        }
      }
      return item
    }))
  }

  // Attendance updater
  const handleAttendanceChange = (field, val) => {
    const num = Math.max(0, Number(val) || 0)
    setAttendance(prev => {
      const updated = { ...prev, [field]: num }
      const total = field === 'totalSessions' ? num : prev.totalSessions
      const attended = field === 'attendedSessions' ? num : prev.attendedSessions
      const rate = total > 0 ? Math.min(100, Math.round((attended / total) * 100)) : 100
      return {
        ...updated,
        attendanceRate: rate
      }
    })
  }

  // Calculated Composite Metrics
  const compositeScore = calculateCompositeScore(competencies)
  const letterGrade = getLetterGrade(compositeScore)
  const performanceCategory = getPerformanceCategory(compositeScore)

  // Assembled Report Data Object
  const reportPayload = {
    id: reportId,
    documentTitle: documentTitle || 'LAPORAN PERKEMBANGAN BELAJAR RESMI',
    documentSubtitle: documentSubtitle || 'Official Academic Progress & Competency Evaluation',
    studentName: studentName.trim(),
    guardianName,
    programTier,
    periodName,
    issueDate,
    attendance,
    competencies,
    compositeScore,
    letterGrade,
    performanceCategory,
    qualitativeAssessment,
    evaluatorName: 'FATIH FARHAT ASSHIDIQ',
    evaluatorTitle: 'Founder & Academic Director',
    verification
  }

  // Generate new report number
  const handleRegenerateId = () => {
    setReportId(generateReportNumber(issueDate))
  }

  // Action: Copy Share Link
  const handleCopyLink = () => {
    const link = generateReportShareLink(reportPayload)
    navigator.clipboard.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // Action: Copy WhatsApp Draft
  const handleCopyWhatsApp = () => {
    const waText = generateReportWhatsAppMessage(reportPayload)
    navigator.clipboard.writeText(waText)
    setCopiedWA(true)
    setTimeout(() => setCopiedWA(false), 2000)
  }

  // Action: Export PDF
  const handleDownloadPdf = async () => {
    if (previewRef.current) {
      setIsExportingPdf(true)
      try {
        await exportReportToPdf(previewRef.current, reportPayload)
      } catch (err) {
        console.error('Export PDF error:', err)
      } finally {
        setIsExportingPdf(false)
      }
    }
  }

  // Action: Export PNG
  const handleDownloadPng = async () => {
    if (previewRef.current) {
      setIsExportingPng(true)
      try {
        await exportReportToPng(previewRef.current, reportPayload)
      } catch (err) {
        console.error('Export PNG error:', err)
      } finally {
        setIsExportingPng(false)
      }
    }
  }

  // Quick Action: Print
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-fluent-text tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-fluent-blue" />
            <span>Digital Report Card Studio</span>
          </h1>
          <p className="text-xs text-fluent-textSecondary mt-0.5">
            Evaluasi berkala capaian belajar siswa & penerbitan rapor resmi Kavio Edu.
          </p>
        </div>

        {/* Action Toolbars */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Quick Score Badge */}
          <div className="hidden sm:flex items-center bg-white px-3 py-1.5 rounded-fluent border border-fluent-border shadow-2xs space-x-2 mr-1">
            <span className="text-xs font-semibold text-fluent-textSecondary">Score:</span>
            <span className="text-xs font-mono font-bold text-fluent-blue">{compositeScore.toFixed(1)}</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
              {letterGrade}
            </span>
          </div>

          {/* Copy Share Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-2.5 border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded-fluent transition-colors flex items-center justify-center"
            title="Salin Tautan Berbagi Publik Rapor"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-fluent-blue" />}
          </button>

          {/* Print A4 */}
          <button
            type="button"
            onClick={handlePrint}
            className="p-2.5 border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded-fluent transition-colors flex items-center justify-center"
            title="Cetak Rapor A4"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Download PNG */}
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={isExportingPng}
            className="p-2.5 border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded-fluent transition-colors flex items-center justify-center disabled:opacity-50"
            title="Download Gambar PNG HD"
          >
            <Download className="w-4 h-4 text-fluent-blue" />
          </button>

          {/* Download PDF */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="p-2.5 bg-fluent-blue hover:bg-fluent-blueHover text-white rounded-fluent transition-colors flex items-center justify-center shadow-xs disabled:opacity-50"
            title="Download PDF Rapor A4 Resmi"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Copy WhatsApp Draft */}
          <button
            type="button"
            onClick={handleCopyWhatsApp}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-fluent flex items-center justify-center transition-colors shadow-xs"
            title={copiedWA ? "Pesan WhatsApp Tersalin!" : "Salin Pesan WhatsApp Laporan Rapor"}
          >
            {copiedWA ? <Check className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Studio Split-Screen Container */}
      <div className="flex flex-col lg:flex-row w-full gap-6 items-start">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: CONTROL CENTER & EVALUATION FORM (Fixed Width) */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-[420px] xl:w-[460px] shrink-0 bg-white p-5 rounded-fluent border border-fluent-border shadow-fluent space-y-5 no-print">
          
          {/* Section: Student & Metadata */}
          <div className="space-y-3 pb-3 border-b border-fluent-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-fluent-text flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-fluent-blue" />
                Data Siswa & Periode Rapor
              </h2>
              <button
                type="button"
                onClick={handleRegenerateId}
                className="text-[10px] text-fluent-blue hover:underline flex items-center gap-1 font-semibold"
                title="Acak nomor rapor baru"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                {reportId}
              </button>
            </div>

            {/* Nama Siswa Field with Autosuggestions */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-fluent-textSecondary">
                  Nama Siswa *
                </label>
                {isStudentLocked && (
                  <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
                )}
              </div>
              <input
                type="text"
                required
                value={studentName}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onChange={handleStudentNameChange}
                placeholder="Ketik nama siswa..."
                className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-medium"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && studentName.trim().length > 0 && (
                <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white border border-fluent-border rounded-fluent shadow-lg max-h-48 overflow-y-auto">
                  {(Array.isArray(students) ? students : [])
                    .filter(st => (st.name || '').toLowerCase().includes(studentName.toLowerCase().trim()))
                    .map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onMouseDown={() => handleSelectStudent(st)}
                        className="w-full text-left px-3 py-2 hover:bg-fluent-subtle border-b border-slate-100 last:border-0 text-xs transition-colors flex items-center justify-between"
                      >
                        <span className="font-semibold text-fluent-text">{st.name}</span>
                        <span className="text-[11px] font-semibold text-fluent-blue">
                          {st.packageType || 'GROW'}
                        </span>
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Orang Tua / Wali & Program Tier */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                  Nama Orang Tua / Wali
                </label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="Ibu / Bapak..."
                  className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                  Paket Program
                </label>
                <select
                  value={programTier}
                  onChange={(e) => setProgramTier(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue bg-white"
                >
                  <option value="SEED">SEED</option>
                  <option value="GROW">GROW</option>
                  <option value="BOOST">BOOST</option>
                  <option value="MASTER">MASTER</option>
                  <option value="CUSTOM">CUSTOM</option>
                </select>
              </div>
            </div>

            {/* Periode & Tanggal Terbit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                  Periode Evaluasi
                </label>
                <input
                  type="text"
                  value={periodName}
                  onChange={(e) => setPeriodName(e.target.value)}
                  placeholder="Contoh: Batch 1 (Sesi 1 - 8)"
                  className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                  Tanggal Terbit
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
                />
              </div>
            </div>

            {/* Judul Dokumen Rapor */}
            <div>
              <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                Judul Dokumen Rapor
              </label>
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="LAPORAN PERKEMBANGAN BELAJAR RESMI"
                className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-medium"
              />
            </div>
          </div>

          {/* Section: Presensi Kehadiran */}
          <div className="space-y-3 pb-3 border-b border-fluent-border">
            <h2 className="text-xs font-bold uppercase tracking-wider text-fluent-text flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-fluent-blue" />
              Metrik Presensi & Kehadiran
            </h2>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                  Total Sesi
                </label>
                <input
                  type="number"
                  min="1"
                  value={attendance.totalSessions}
                  onChange={(e) => handleAttendanceChange('totalSessions', e.target.value)}
                  className="w-full px-2.5 py-1 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-semibold text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                  Sesi Hadir
                </label>
                <input
                  type="number"
                  min="0"
                  max={attendance.totalSessions}
                  value={attendance.attendedSessions}
                  onChange={(e) => handleAttendanceChange('attendedSessions', e.target.value)}
                  className="w-full px-2.5 py-1 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-bold text-emerald-700 text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                  Rasio Kehadiran
                </label>
                <div className="w-full py-1 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-fluent text-center">
                  {attendance.attendanceRate}%
                </div>
              </div>
            </div>
          </div>

          {/* Section: Competency Evaluation Sliders */}
          <div className="space-y-3.5 pb-3 border-b border-fluent-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-fluent-text flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-fluent-blue" />
                Matriks Penilaian Kompetensi (0 - 100)
              </h2>
            </div>

            <div className="space-y-3">
              {competencies.map((comp) => {
                const s = Number(comp.score) || 0
                return (
                  <div key={comp.key} className="bg-fluent-subtle p-2.5 rounded border border-fluent-border space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-semibold text-fluent-text flex items-center gap-1">
                        <span>{(comp.key && INDONESIAN_COMPETENCY_MAP[comp.key]?.label) || comp.label}</span>
                        <span className="text-[10px] text-fluent-textSecondary font-mono font-normal">({comp.weight}%)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded border bg-white border-slate-200 text-slate-700">
                          {comp.benchmark}
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={comp.score}
                          onChange={(e) => handleScoreChange(comp.key, e.target.value)}
                          className="w-14 px-1.5 py-0.5 text-xs border border-fluent-border rounded text-center font-bold text-fluent-blue bg-white focus:outline-none focus:border-fluent-blue [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>

                    {/* Interactive Slider Input */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={comp.score}
                      onChange={(e) => handleScoreChange(comp.key, e.target.value)}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-fluent-blue"
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section: Qualitative Feedback */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-fluent-text flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-fluent-blue" />
              Evaluasi Kualitatif & Rekomendasi Mentor
            </h2>

            <div>
              <label className="block text-[11px] font-semibold text-emerald-800 mb-1">
                🌟 Kekuatan & Capaian Unggulan (Key Strengths)
              </label>
              <textarea
                rows="2"
                value={qualitativeAssessment.keyStrengths}
                onChange={(e) => setQualitativeAssessment({ ...qualitativeAssessment, keyStrengths: e.target.value })}
                placeholder="Tuliskan capaian dan kelebihan siswa..."
                className="w-full px-3 py-1.5 text-xs border border-emerald-200 rounded-fluent focus:outline-none focus:border-emerald-500 bg-emerald-50/30"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-amber-800 mb-1">
                🎯 Area Fokus Pengembangan (Areas for Growth)
              </label>
              <textarea
                rows="2"
                value={qualitativeAssessment.areasForImprovement}
                onChange={(e) => setQualitativeAssessment({ ...qualitativeAssessment, areasForImprovement: e.target.value })}
                placeholder="Tuliskan hal yang perlu dilatih lebih intensif..."
                className="w-full px-3 py-1.5 text-xs border border-amber-200 rounded-fluent focus:outline-none focus:border-amber-500 bg-amber-50/30"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-blue-800 mb-1">
                🚀 Target Sesi / Kurikulum Berikutnya
              </label>
              <input
                type="text"
                value={qualitativeAssessment.nextRoadmapTarget}
                onChange={(e) => setQualitativeAssessment({ ...qualitativeAssessment, nextRoadmapTarget: e.target.value })}
                placeholder="Contoh: Modul Academic Reading & Discussion..."
                className="w-full px-3 py-1.5 text-xs border border-blue-200 rounded-fluent focus:outline-none focus:border-fluent-blue bg-blue-50/30"
              />
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: LIVE A4 PRINTABLE CANVAS PREVIEW (Flexible & Responsive) */}
        {/* ========================================================================= */}
        <div className="flex-1 min-w-0 bg-slate-100/70 p-2 sm:p-4 lg:p-6 rounded-fluent border border-fluent-border overflow-hidden flex justify-center items-start shadow-inner">
          <ResponsiveDocumentWrapper>
            <ReportCardPreview
              reportData={reportPayload}
              previewRef={previewRef}
            />
          </ResponsiveDocumentWrapper>
        </div>

      </div>
    </div>
  )
}
