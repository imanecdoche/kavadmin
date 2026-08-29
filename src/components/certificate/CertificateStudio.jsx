import React, { useState, useRef, useEffect, useMemo } from 'react'
import {
  Award,
  Download,
  Printer,
  Share2,
  Check,
  MessageCircle,
  Calendar,
  User,
  Sliders,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  FileCheck2
} from 'lucide-react'
import CertificatePreview from './CertificatePreview'
import ResponsiveDocumentWrapper from '../common/ResponsiveDocumentWrapper'
import { formatDateIndonesian } from '../../utils/dateFormatter'
import { exportElementToPdf, exportElementToPng } from '../../utils/documentExportEngine'
import { generateCertificateShareLink, generateCertificateWhatsAppMessage } from '../../utils/certificateShare'

export default function CertificateStudio({
  students = [],
  selectedStudentId = null,
  onSelectStudent = null,
  onUpdateStudent = null,
  onSaveCertificate = null
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

  // Form State
  const [docId, setDocId] = useState('CRT/KEEN/202608/0001')
  const [studentName, setStudentName] = useState('Nama Siswa')
  const [programName, setProgramName] = useState('Paket GROW')
  const [batchName, setBatchName] = useState('BATCH 1')
  const [cefrLevel, setCefrLevel] = useState('A2 - Elementary')
  const [totalSessions, setTotalSessions] = useState(12)
  const [completionDate, setCompletionDate] = useState(() => formatDateIndonesian(new Date().toISOString()))
  const [predicate, setPredicate] = useState('SANGAT BAIK (EXCELLENT)')
  const [signLocation, setSignLocation] = useState('Pandeglang')
  const [directorName, setDirectorName] = useState('Fatih Farhat Asshidiq')
  const [directorTitle, setDirectorTitle] = useState('Founder & Academic Director')
  const [gratitudeMessage, setGratitudeMessage] = useState(
    'Terima kasih atas dedikasi, kerja keras, dan komitmen luar biasa yang telah ditunjukkan selama mengikuti program pembelajaran. Semoga pencapaian ini menjadi pijakan kuat untuk meraih kesuksesan akademik dan masa depan yang gemilang.'
  )
  const [isSigned, setIsSigned] = useState(true)
  const [isStamped, setIsStamped] = useState(true)

  // Feedback State
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedWA, setCopiedWA] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const [isExportingPng, setIsExportingPng] = useState(false)

  // Generate deterministic security hash
  const verificationHash = useMemo(() => {
    const raw = `${docId}-${studentName}-${programName}-${completionDate}`
    let hash = 0
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i)
      hash |= 0
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')
    return `VERIF-KEEN-${hex}`
  }, [docId, studentName, programName, completionDate])

  // Load student profile when activeStudent changes
  useEffect(() => {
    if (activeStudent) {
      const tier = activeStudent.packageType || 'GROW'
      const sPerM = Number(activeStudent.sessionsPerMonth) || 4
      const durM = Number(activeStudent.durationMonths) || 3
      const totalSess = sPerM * durM

      setStudentName(activeStudent.name || 'Nama Siswa')
      setProgramName(`Paket ${tier}`)
      setTotalSessions(totalSess)

      if (activeStudent.certificate) {
        const cert = activeStudent.certificate
        setDocId(cert.documentId || `CRT/KEEN/${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2, '0')}/${Math.floor(Math.random()*9000)+1000}`)
        setBatchName(cert.batchName || 'BATCH 1')
        setCefrLevel(cert.cefrLevel || (tier === 'SEED' ? 'A1 - Beginner' : tier === 'GROW' ? 'A2 - Elementary' : tier === 'BOOST' ? 'B1 - Intermediate' : 'B2/C1 - Advanced'))
        setPredicate(cert.predicate || 'SANGAT BAIK (EXCELLENT)')
        setCompletionDate(cert.completionDate || formatDateIndonesian(new Date().toISOString()))
        setSignLocation(cert.signLocation || 'Pandeglang')
        setDirectorName(cert.directorName || 'Fatih Farhat Asshidiq')
        setDirectorTitle(cert.directorTitle || 'Founder & Academic Director')
        setGratitudeMessage(cert.gratitudeMessage || 'Terima kasih atas dedikasi, kerja keras, dan komitmen luar biasa yang telah ditunjukkan selama mengikuti program pembelajaran. Semoga pencapaian ini menjadi pijakan kuat untuk meraih kesuksesan akademik dan masa depan yang gemilang.')
        if (cert.verification) {
          setIsSigned(cert.verification.isSigned !== false)
          setIsStamped(cert.verification.isStamped !== false)
        }
      } else {
        setDocId(`CRT/KEEN/${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2, '0')}/${Math.floor(Math.random()*9000)+1000}`)
        setBatchName('BATCH 1')
        setCefrLevel(tier === 'SEED' ? 'A1 - Beginner' : tier === 'GROW' ? 'A2 - Elementary' : tier === 'BOOST' ? 'B1 - Intermediate' : 'B2/C1 - Advanced')
        setPredicate('SANGAT BAIK (EXCELLENT)')
        setCompletionDate(formatDateIndonesian(new Date().toISOString()))
        setGratitudeMessage('Terima kasih atas dedikasi, kerja keras, dan komitmen luar biasa yang telah ditunjukkan selama mengikuti program pembelajaran. Semoga pencapaian ini menjadi pijakan kuat untuk meraih kesuksesan akademik dan masa depan yang gemilang.')
      }
    }
  }, [activeStudent?.id])

  // Assembled Certificate Data Payload
  const certificatePayload = {
    documentId: docId,
    studentId: activeStudent?.id || '',
    studentName,
    programName,
    batchName,
    cefrLevel,
    totalSessions,
    completionDate,
    predicate,
    verificationHash,
    signLocation,
    directorName,
    directorTitle,
    gratitudeMessage,
    verification: {
      isSigned,
      isStamped
    },
    updatedAt: new Date().toISOString()
  }

  // Save changes to student record
  const saveCertificate = () => {
    if (!activeStudent) return
    const updatedStudent = {
      ...activeStudent,
      certificate: certificatePayload
    }
    if (onUpdateStudent) onUpdateStudent(updatedStudent)
    if (onSaveCertificate) onSaveCertificate(certificatePayload)
  }

  // Actions
  const handleCopyLink = () => {
    const link = generateCertificateShareLink(certificatePayload)
    navigator.clipboard.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleCopyWA = () => {
    const text = generateCertificateWhatsAppMessage(certificatePayload)
    navigator.clipboard.writeText(text)
    setCopiedWA(true)
    setTimeout(() => setCopiedWA(false), 2000)
  }

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true)
    try {
      saveCertificate()
      await exportElementToPdf('certificate-export-canvas', `Sertifikat_${studentName.replace(/\s+/g, '_')}_${batchName}`, {
        mode: 'a4',
        orientation: 'portrait'
      })
    } catch (err) {
      console.error('Export PDF error:', err)
    } finally {
      setIsExportingPdf(false)
    }
  }

  const handleDownloadPng = async () => {
    setIsExportingPng(true)
    try {
      saveCertificate()
      await exportElementToPng('certificate-export-canvas', `Sertifikat_${studentName.replace(/\s+/g, '_')}_${batchName}`)
    } catch (err) {
      console.error('Export PNG error:', err)
    } finally {
      setIsExportingPng(false)
    }
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-fluent-text tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-fluent-blue" />
            <span>Certificate Generator (Kelulusan 1-Batch)</span>
          </h1>
          <p className="text-xs text-fluent-textSecondary mt-0.5">
            Penerbitan sertifikat kelulusan dan pencapaian akademik resmi siswa Kavio Edu.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-2 border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded-fluent transition-colors flex items-center justify-center shadow-2xs"
            title="Salin Tautan Verifikasi Publik"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-fluent-blue" />}
          </button>

          <button
            type="button"
            onClick={handleCopyWA}
            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-fluent flex items-center justify-center transition-colors shadow-xs"
            title={copiedWA ? "Pesan WhatsApp Tersalin!" : "Salin Pesan WhatsApp"}
          >
            {copiedWA ? <Check className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={isExportingPng}
            className="p-2 border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded-fluent transition-colors flex items-center justify-center disabled:opacity-50 shadow-2xs"
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
            onClick={() => window.print()}
            className="p-2 border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded-fluent transition-colors flex items-center justify-center shadow-2xs"
            title="Cetak Langsung"
          >
            <Printer className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      </div>

      {/* Main Studio Split-Screen Container */}
      <div className="flex flex-col lg:flex-row w-full gap-6 items-start">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: CONTROL PARAMETERS (Fixed Width) */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-[420px] xl:w-[460px] shrink-0 bg-white p-5 rounded-fluent border border-fluent-border shadow-fluent space-y-4 text-fluent-text">
          
          {/* Student Selector */}
          <div className="space-y-2 pb-3 border-b border-fluent-border">
            <label className="block text-xs font-bold text-fluent-textSecondary uppercase tracking-wider">
              Pilih Siswa Lulus
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
                  {st.name} — Paket {st.packageType || 'GROW'}
                </option>
              ))}
            </select>
          </div>

          {/* Form Parameters */}
          <div className="space-y-3 pb-3 border-b border-fluent-border">
            <h2 className="text-xs font-bold uppercase tracking-wider text-fluent-text flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-fluent-blue" />
              Parameter Sertifikat
            </h2>

            <div>
              <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                Doc. No. (Nomor Dokumen)
              </label>
              <input
                type="text"
                value={docId}
                onChange={(e) => setDocId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-bold font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                Nama Siswa (Penerima)
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                  Nama Program
                </label>
                <input
                  type="text"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                  Periode / Batch
                </label>
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                  Jenjang CEFR
                </label>
                <select
                  value={cefrLevel}
                  onChange={(e) => setCefrLevel(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent bg-white focus:outline-none focus:border-fluent-blue font-semibold"
                >
                  <option value="A1 - Beginner">A1 - Beginner</option>
                  <option value="A2 - Elementary">A2 - Elementary</option>
                  <option value="B1 - Intermediate">B1 - Intermediate</option>
                  <option value="B2 - Upper Intermediate">B2 - Upper Intermediate</option>
                  <option value="C1/C2 - Advanced">C1/C2 - Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                  Total Sesi Selesai
                </label>
                <input
                  type="number"
                  min="1"
                  value={totalSessions}
                  onChange={(e) => setTotalSessions(Number(e.target.value) || 12)}
                  className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-bold text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                Hasil Evaluasi / Predikat Kelulusan
              </label>
              <select
                value={predicate}
                onChange={(e) => setPredicate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent bg-white focus:outline-none focus:border-fluent-blue font-bold text-emerald-700"
              >
                <option value="DENGAN PUJIAN (DISTINCTION)">DENGAN PUJIAN (DISTINCTION)</option>
                <option value="SANGAT BAIK (EXCELLENT)">SANGAT BAIK (EXCELLENT)</option>
                <option value="BAIK (GOOD)">BAIK (GOOD)</option>
                <option value="MEMUASKAN (SATISFACTORY)">MEMUASKAN (SATISFACTORY)</option>
                <option value="LULUS (PASS)">LULUS (PASS)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                  Tanggal Terbit
                </label>
                <input
                  type="text"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                  Kota Penerbitan
                </label>
                <input
                  type="text"
                  value={signLocation}
                  onChange={(e) => setSignLocation(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                Ucapan Terima Kasih & Pesan Apresiasi
              </label>
              <textarea
                rows={3}
                value={gratitudeMessage}
                onChange={(e) => setGratitudeMessage(e.target.value)}
                placeholder="Tulis ucapan terima kasih dan apresiasi untuk siswa..."
                className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-medium leading-relaxed"
              />
            </div>
          </div>

          {/* Legalitas & Verifikasi Toggles */}
          <div className="space-y-3 pt-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-fluent-text flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-fluent-blue" />
              Otoritas & Tanda Tangan
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                  Nama Direktur Akademik
                </label>
                <input
                  type="text"
                  value={directorName}
                  onChange={(e) => setDirectorName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-fluent-textSecondary mb-1">
                  Jabatan
                </label>
                <input
                  type="text"
                  value={directorTitle}
                  onChange={(e) => setDirectorTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isSigned}
                  onChange={(e) => setIsSigned(e.target.checked)}
                  className="rounded border-slate-300 text-fluent-blue focus:ring-fluent-blue"
                />
                <span>Tanda Tangan Digital</span>
              </label>

              <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isStamped}
                  onChange={(e) => setIsStamped(e.target.checked)}
                  className="rounded border-slate-300 text-fluent-blue focus:ring-fluent-blue"
                />
                <span>Stempel Resmi</span>
              </label>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: LIVE CANVAS A4 PREVIEW */}
        {/* ========================================================================= */}
        <div className="flex-1 w-full min-w-0 bg-slate-100/70 p-2 sm:p-6 rounded-fluent border border-fluent-border flex justify-center items-start shadow-inner overflow-hidden">
          <ResponsiveDocumentWrapper>
            <CertificatePreview
              previewRef={previewRef}
              certificateData={certificatePayload}
            />
          </ResponsiveDocumentWrapper>
        </div>
      </div>
    </div>
  )
}
