import React, { useState, useRef } from 'react'
import { BookOpen, Copy, Check, Download, Plus, Trash2, Printer } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function StudentRoadmap() {
  const roadmapRef = useRef(null)

  const [studentName, setStudentName] = useState('Alya')
  const [level, setLevel] = useState('Level A1 (Beginner to Elementary)')
  const [moduleTitle, setModuleTitle] = useState('Grammar & Speaking Module: BE vs DO & Essential Tenses')
  const [targetDuration, setTargetDuration] = useState('1 Bulan (8 Sesi)')

  const [topics, setTopics] = useState([
    { id: '1', name: 'Sesi 1: Auxiliary Verb BE (Am/Is/Are) vs DO/Does dalam Kalimat Tanya', status: 'Selesai' },
    { id: '2', name: 'Sesi 2: Simple Present Tense untuk Kebiasaan & Aktivitas Harian', status: 'Selesai' },
    { id: '3', name: 'Sesi 3: Present Continuous Tense & Perbedaannya dengan Simple Present', status: 'Proses' },
    { id: '4', name: 'Sesi 4: Simple Past Tense (Regular & Irregular Verbs)', status: 'Belum' },
    { id: '5', name: 'Sesi 5: Future Tense (Will vs Be Going To)', status: 'Belum' },
    { id: '6', name: 'Sesi 6: Praktek Conversational Speaking & Roleplay Situasional', status: 'Belum' },
    { id: '7', name: 'Sesi 418sd+abulary & Sentence Structure Building', status: 'Belum' },
    { id: '8', name: 'Sesi 8: Evaluasi Akhir Modul & Assessment Feedback', status: 'Belum' },
  ])

  const [newTopicName, setNewTopicName] = useState('')
  const [copied, setCopied] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Add Topic
  const handleAddTopic = (e) => {
    e.preventDefault()
    if (!newTopicName.trim()) return
    setTopics(prev => [
      ...prev,
      { id: Date.now().toString(), name: `Sesi ${prev.length + 1}: ${newTopicName.trim()}`, status: 'Belum' }
    ])
    setNewTopicName('')
  }

  // Remove Topic
  const handleRemoveTopic = (id) => {
    setTopics(prev => prev.filter(t => t.id !== id))
  }

  // Toggle Topic Status
  const handleToggleStatus = (id) => {
    setTopics(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'Selesai' ? 'Proses' : t.status === 'Proses' ? 'Belum' : 'Selesai'
        return { ...t, status: nextStatus }
      }
      return t
    }))
  }

  // Format Markdown Export
  const generateMarkdown = () => {
    return `# Roadmap Pembelajaran Kavio Edu

**Nama Siswa:** ${studentName}  
**Tingkat / Level:** ${level}  
**Nama Modul:** ${moduleTitle}  
**Target Durasi:** ${targetDuration}  

---

### Kurikulum & Rincian Sesi:

${topics.map((t, idx) => `- [${t.status === 'Selesai' ? 'x' : ' '}] **${t.name}** (${t.status})`).join('\n')}

---
*Diterbitkan oleh Kavio Edu Academic Management*`
  }

  // Copy Markdown
  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdown())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Download PDF
  const handleDownloadPDF = async () => {
    if (!roadmapRef.current) return
    setIsExporting(true)

    try {
      const canvas = await html2canvas(roadmapRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`Roadmap_${studentName}_KavioEdu.pdf`)
    } catch (err) {
      console.error('Export PDF error:', err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fluent-text tracking-tight">
            Student Roadmap & Module Generator
          </h1>
          <p className="text-sm text-fluent-textSecondary">
            Format dan cetak panduan roadmap pembelajaran kurikulum siswa Kavio Edu.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyMarkdown}
            className="px-3 py-2 border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded-fluent text-sm font-medium flex items-center space-x-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Markdown Tersalin!' : 'Salin Markdown'}</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="px-4 py-2 bg-fluent-blue hover:bg-fluent-blueHover text-white rounded-fluent text-sm font-medium flex items-center space-x-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Memproses...' : 'Download PDF Handout'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Config Controls */}
        <div className="lg:col-span-5 bg-white p-5 rounded-fluent border border-fluent-border shadow-fluent space-y-4 no-print">
          <h2 className="text-sm font-bold text-fluent-text uppercase tracking-wider text-fluent-blue border-b border-fluent-border pb-2">
            Pengaturan Roadmap Siswa
          </h2>

          <div>
            <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
              Nama Siswa
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
              Tingkat / Level
            </label>
            <input
              type="text"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
              Judul Modul Pembelajaran
            </label>
            <input
              type="text"
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
              Target Durasi
            </label>
            <input
              type="text"
              value={targetDuration}
              onChange={(e) => setTargetDuration(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
            />
          </div>

          {/* Add New Session Item Form */}
          <form onSubmit={handleAddTopic} className="pt-2">
            <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
              Tambah Sesi Pembelajaran Baru
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder="Contoh: Present Perfect Tense..."
                className="flex-1 px-3 py-1.5 text-sm border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-fluent-blue hover:bg-fluent-blueHover text-white rounded-fluent text-sm font-medium flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah</span>
              </button>
            </div>
          </form>

        </div>

        {/* Right Column: Printable Roadmap Document Preview */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div
            ref={roadmapRef}
            className="w-full bg-white border border-fluent-border rounded-fluent p-8 shadow-fluent space-y-6 text-fluent-text print:shadow-none print:border-none print:p-0"
          >
            {/* Header with Logo */}
            <div className="flex justify-between items-start border-b border-fluent-border pb-6">
              <div>
                <img src="/logo.svg" alt="Kavio Edu Logo" className="h-10 w-auto object-contain mb-2" />
                <p className="text-xs text-fluent-textSecondary">
                  Student Learning Roadmap & Handout
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-fluent-blue uppercase tracking-wider block">
                  KURIKULUM KHUSUS
                </span>
                <p className="text-xs text-fluent-textSecondary mt-2">
                  Terbit: {new Date().toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>

            {/* Student Info Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-fluent-subtle p-4 rounded-fluent border border-fluent-border text-xs">
              <div>
                <span className="text-fluent-textSecondary block">Siswa:</span>
                <span className="font-bold text-sm text-fluent-text">{studentName}</span>
              </div>
              <div>
                <span className="text-fluent-textSecondary block">Level:</span>
                <span className="font-semibold text-fluent-text">{level}</span>
              </div>
              <div>
                <span className="text-fluent-textSecondary block">Modul:</span>
                <span className="font-semibold text-fluent-text">{moduleTitle}</span>
              </div>
              <div>
                <span className="text-fluent-textSecondary block">Target Durasi:</span>
                <span className="font-semibold text-fluent-text">{targetDuration}</span>
              </div>
            </div>

            {/* Topics Checklist */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-fluent-text uppercase tracking-wider border-b border-fluent-border pb-2">
                Rincian Sesi & Materi Pembelajaran
              </h3>

              <div className="space-y-2">
                {topics.map((topic) => {
                  let textColor = 'text-slate-500 font-medium'
                  if (topic.status === 'Selesai') {
                    textColor = 'text-emerald-600 font-bold'
                  } else if (topic.status === 'Proses') {
                    textColor = 'text-amber-600 font-bold'
                  }

                  return (
                    <div
                      key={topic.id}
                      className="flex items-center justify-between p-3 bg-fluent-subtle/50 rounded border border-fluent-border text-xs group"
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(topic.id)}
                          className="text-left font-medium text-fluent-text hover:text-fluent-blue transition-colors"
                        >
                          {topic.name}
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          onClick={() => handleToggleStatus(topic.id)}
                          className={`cursor-pointer text-xs tracking-wider uppercase ${textColor}`}
                        >
                          {topic.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTopic(topic.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:text-rose-700 transition-opacity no-print"
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

            {/* Footer */}
            <div className="border-t border-fluent-border pt-4 text-xs text-fluent-textSecondary flex justify-between items-center">
              <div>
                Kavio Edu Academic Mentoring • Fatih Farhat Asshidiq
              </div>
              <div className="font-mono text-[10px]">
                KAVIO-EDU-ROADMAP-2026
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  )
}
