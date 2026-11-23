import React, { useState, useRef, useEffect } from 'react'
import ReportCardHeader from './ReportCardHeader'
import ReportCardParameterSidebar from './ReportCardParameterSidebar'
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
  const [includeNotes, setIncludeNotes] = useState(true)

  // Verification & Signatures
  const [evaluatorName, setEvaluatorName] = useState('FATIH FARHAT ASSHIDIQ')
  const [evaluatorTitle, setEvaluatorTitle] = useState('Founder & Academic Director')
  const [verification, setVerification] = useState({
    isSigned: true,
    isStamped: false
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

  // Select student handler with full auto-fill: package, guardian, duration, total sessions, period
  const handleSelectStudent = (st) => {
    if (!st) return
    setStudentName(st.name || '')
    setGuardianName(st.parentName || '')

    // Paket Program
    const pkg = st.programTier || st.packageType || 'GROW'
    setProgramTier(pkg)

    // Durasi & Hitung Jumlah Sesi
    const duration = Number(st.durationMonths) || 1
    const sessionsPerMonth =
      Number(st.sessionsPerMonth) ||
      (pkg === 'SEED' ? 3 : pkg === 'BOOST' || pkg === 'MASTER' ? 8 : 4)
    const totalSessions =
      Number(st.totalSessions) || Math.max(1, sessionsPerMonth * duration)
    const batch = st.batchName || 'Batch 1'

    // Format Lengkap Periode: 'Batch 1 (Sesi 1 - 12)'
    setPeriodName(`${batch} (Sesi 1 - ${totalSessions})`)

    // Presensi & Kehadiran Otomatis
    setAttendance({
      totalSessions,
      attendedSessions: totalSessions,
      attendanceRate: 100,
      punctualityRate: 100,
    })

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
    qualitativeAssessment: includeNotes
      ? qualitativeAssessment
      : {
          keyStrengths: '',
          areasForImprovement: '',
          generalNotes: '',
          nextRoadmapTarget: ''
        },
    evaluatorName,
    evaluatorTitle,
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
      {/* 1. Header Bar Minimalist shadcn/ui */}
      <ReportCardHeader
        compositeScore={compositeScore}
        letterGrade={letterGrade}
        onCopyLink={handleCopyLink}
        copiedLink={copiedLink}
        onPrint={handlePrint}
        onDownloadPng={handleDownloadPng}
        isExportingPng={isExportingPng}
        onDownloadPdf={handleDownloadPdf}
        isExportingPdf={isExportingPdf}
        onCopyWhatsApp={handleCopyWhatsApp}
        copiedWA={copiedWA}
      />

      {/* 2. Main Studio Split-Screen Container */}
      <div className="flex flex-col lg:flex-row w-full gap-6 items-start">
        
        {/* LEFT COLUMN: CONTROL CENTER & EVALUATION FORM (Fixed Width) */}
        <ReportCardParameterSidebar
          reportId={reportId}
          onRegenerateId={handleRegenerateId}
          studentName={studentName}
          onStudentNameChange={handleStudentNameChange}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
          isStudentLocked={isStudentLocked}
          students={students}
          onSelectStudent={handleSelectStudent}
          guardianName={guardianName}
          setGuardianName={setGuardianName}
          programTier={programTier}
          setProgramTier={setProgramTier}
          periodName={periodName}
          setPeriodName={setPeriodName}
          issueDate={issueDate}
          setIssueDate={setIssueDate}
          documentTitle={documentTitle}
          setDocumentTitle={setDocumentTitle}
          attendance={attendance}
          onAttendanceChange={handleAttendanceChange}
          competencies={competencies}
          onScoreChange={handleScoreChange}
          qualitativeAssessment={qualitativeAssessment}
          setQualitativeAssessment={setQualitativeAssessment}
          includeNotes={includeNotes}
          setIncludeNotes={setIncludeNotes}
          evaluatorName={evaluatorName}
          setEvaluatorName={setEvaluatorName}
          evaluatorTitle={evaluatorTitle}
          setEvaluatorTitle={setEvaluatorTitle}
          verification={verification}
          setVerification={setVerification}
        />

        {/* RIGHT COLUMN: LIVE A4 PRINTABLE CANVAS PREVIEW (Flexible & Responsive) */}
        <div className="flex-1 min-w-0 bg-neutral-100/70 p-2 sm:p-4 lg:p-6 rounded-lg border border-neutral-200 overflow-hidden flex justify-center items-start shadow-inner">
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
