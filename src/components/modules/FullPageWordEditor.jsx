import React, { useState, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import {
  ArrowLeft,
  Save,
  FileUp,
  Download,
  Printer,
  Copy,
  Check,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Table as TableIcon,
  Minus,
  RemoveFormatting,
  Palette,
  Loader2,
  Tag,
  FileText,
  ChevronDown
} from 'lucide-react'
import { convertDocxToHtml } from '../../utils/docxImporter'
import { DEFAULT_MODULE_CATEGORIES, MODULE_LEVELS } from '../../utils/defaultModules'
import './editor.css'

export default function FullPageWordEditor({
  initialModule,
  onSave,
  onBack
}) {
  // Module metadata states
  const [title, setTitle] = useState(initialModule?.title || '')
  const [category, setCategory] = useState(initialModule?.category || 'Grammar & Structure')
  const [level, setLevel] = useState(initialModule?.level || 'Beginner')
  const [summary, setSummary] = useState(initialModule?.summary || '')
  const [tags, setTags] = useState(
    Array.isArray(initialModule?.tags) ? initialModule.tags.join(', ') : (initialModule?.tags || '')
  )
  const [showMetadataDrawer, setShowMetadataDrawer] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [copied, setCopied] = useState(false)

  const fileInputRef = useRef(null)

  // Initialize Tiptap Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
        heading: { levels: [1, 2, 3] }
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Image.configure({ inline: true, allowBase64: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell
    ],
    content: initialModule?.content || '<h1>Judul Modul Pembelajaran</h1><p>Mulai ketik isi kurikulum atau materi modul Anda di sini...</p>',
    editorProps: {
      attributes: {
        class: 'tiptap-content focus:outline-none w-full min-h-[980px] font-sans text-slate-900 leading-relaxed'
      }
    }
  })

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [title, category, level, summary, tags, editor])

  // Count words and characters
  const wordCount = editor ? editor.storage?.characterCount?.words?.() || editor.getText().split(/\s+/).filter(Boolean).length : 0
  const charCount = editor ? editor.getText().length : 0

  // Save handler
  const handleSave = () => {
    if (!title.trim()) {
      alert('Mohon isi judul modul terlebih dahulu')
      return
    }

    setIsSaving(true)
    const parsedTags = tags
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : []

    const moduleRecord = {
      id: initialModule?.id || `mod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      category,
      level,
      summary: summary.trim(),
      tags: parsedTags,
      content: editor ? editor.getHTML() : (initialModule?.content || ''),
      updatedAt: new Date().toISOString(),
      createdAt: initialModule?.createdAt || new Date().toISOString()
    }

    if (onSave) onSave(moduleRecord)
    setTimeout(() => setIsSaving(false), 500)
  }

  // Import Word .docx
  const handleDocxImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    try {
      setIsImporting(true)
      const { html, rawText } = await convertDocxToHtml(file)
      editor.commands.setContent(html, { emitUpdate: true })

      // Auto-populate title if empty
      if (!title.trim()) {
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim()
        setTitle(cleanTitle)
      }

      // Auto-populate summary if empty
      if (!summary.trim()) {
        const firstLine = rawText.split('\n').map((l) => l.trim()).filter(Boolean)[0] || ''
        const brief = firstLine.length > 160 ? firstLine.substring(0, 157) + '...' : firstLine
        setSummary(brief)
      }
    } catch (err) {
      console.error('Import error:', err)
      alert('Gagal mengimpor file DOCX: ' + (err.message || 'File tidak valid'))
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Copy formatted text
  const handleCopyText = () => {
    if (!editor) return
    const text = editor.getText()
    navigator.clipboard.writeText(`*${title || 'Modul Pembelajaran'}*\nKategori: ${category} | Level: ${level}\n\n${text}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Print module
  const handlePrint = () => {
    document.body.classList.add('printing-module')
    window.print()
    setTimeout(() => {
      document.body.classList.remove('printing-module')
    }, 1500)
  }

  // Export to PDF
  const handleExportPDF = () => {
    const originalTitle = document.title
    const safeDocTitle = title.trim() || 'Modul Pembelajaran'
    document.title = `${safeDocTitle} - Kavio Edu`
    document.body.classList.add('printing-module')

    window.print()

    setTimeout(() => {
      document.body.classList.remove('printing-module')
      document.title = originalTitle
    }, 1500)
  }

  const btnClass = (isActive = false) =>
    `p-1.5 rounded-fluent text-xs flex items-center justify-center transition-all cursor-pointer ${
      isActive
        ? 'bg-fluent-blue text-white shadow-2xs font-semibold'
        : 'text-slate-700 hover:text-fluent-blue hover:bg-slate-200/80 active:bg-slate-300'
    }`

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-200/90 w-screen h-screen overflow-hidden select-none font-sans">
      {/* 1. TOP TITLEBAR & MAIN ACTIONS */}
      <header className="w-full bg-white border-b border-slate-200 shadow-2xs z-20 shrink-0 no-print">
        <div className="flex items-center justify-between px-4 sm:px-6 py-2 border-b border-slate-100 gap-3">
          {/* Back & Document Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-fluent text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer shrink-0"
              title="Kembali ke Bank Modul"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Bank Modul</span>
            </button>

            <div className="h-5 w-[1px] bg-slate-200 shrink-0" />

            {/* Word Brand Icon */}
            <div className="w-7 h-7 bg-blue-600 rounded-fluent flex items-center justify-center text-white font-extrabold text-xs shadow-2xs shrink-0">
              W
            </div>

            {/* Editable Title */}
            <div className="flex-1 min-w-0 max-w-xl">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ketik Judul Modul di Sini..."
                className="w-full font-bold text-slate-900 text-sm hover:border-slate-300 border border-transparent rounded-fluent px-2 py-1 focus:outline-none focus:border-fluent-blue focus:bg-white bg-transparent transition-all truncate"
              />
            </div>
          </div>

          {/* Top Right Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Category & Level Dropdowns */}
            <div className="hidden lg:flex items-center gap-2 text-xs">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-2.5 py-1.5 rounded-fluent border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-fluent-blue"
              >
                {DEFAULT_MODULE_CATEGORIES.filter((c) => c !== 'Semua').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="px-2.5 py-1.5 rounded-fluent border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-fluent-blue"
              >
                {MODULE_LEVELS.filter((l) => l.id !== 'all').map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Metadata Settings Toggle */}
            <button
              type="button"
              onClick={() => setShowMetadataDrawer(!showMetadataDrawer)}
              className={`px-2.5 py-1.5 rounded-fluent border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                showMetadataDrawer
                  ? 'bg-blue-50 border-fluent-blue text-fluent-blue'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Pengaturan Ringkasan & Tag Modul"
            >
              <Tag className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Ringkasan & Tag</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMetadataDrawer ? 'rotate-180' : ''}`} />
            </button>

            {/* Import DOCX */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleDocxImport}
              accept=".docx"
              className="hidden"
              id="full-editor-docx-input"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="px-3 py-1.5 rounded-fluent bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-fluent-blue text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
              title="Buka Dokumen Word (.docx)"
            >
              {isImporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-fluent-blue" />
              ) : (
                <FileUp className="w-3.5 h-3.5 text-fluent-blue" />
              )}
              <span className="hidden sm:inline">{isImporting ? 'Mengimpor...' : 'Buka DOCX'}</span>
            </button>

            {/* Ekspor PDF Button */}
            <button
              type="button"
              onClick={handleExportPDF}
              className="px-3 py-1.5 rounded-fluent bg-blue-50 border border-blue-200 hover:bg-blue-100 text-fluent-blue text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-[0.98]"
              title="Ekspor / Simpan Dokumen sebagai PDF (A4)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ekspor PDF</span>
            </button>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-fluent bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-fluent-blue text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Salin Teks Modul"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Salin'}</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-fluent bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-fluent-blue text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Cetak Dokumen Modul"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-1.5 rounded-fluent bg-fluent-blue hover:bg-blue-700 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-[0.98] disabled:opacity-50"
              title="Simpan Modul (Ctrl+S)"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSaving ? 'Menyimpan...' : 'Simpan'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Metadata Drawer (Summary & Tags) */}
        {showMetadataDrawer && (
          <div className="bg-slate-50/95 border-b border-slate-200 px-6 py-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-fadeIn">
            <div className="lg:hidden flex gap-2">
              <div className="flex-1">
                <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-fluent border border-slate-200 bg-white text-slate-700 text-xs"
                >
                  {DEFAULT_MODULE_CATEGORIES.filter((c) => c !== 'Semua').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block font-bold text-slate-700 mb-1">Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-fluent border border-slate-200 bg-white text-slate-700 text-xs"
                >
                  {MODULE_LEVELS.filter((l) => l.id !== 'all').map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Ringkasan / Objektif Modul</label>
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Tuliskan 1-2 kalimat ringkasan modul ini..."
                className="w-full px-3 py-1.5 rounded-fluent border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-fluent-blue"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tags (Pisahkan koma)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Grammar, Speaking, IELTS"
                className="w-full px-3 py-1.5 rounded-fluent border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-fluent-blue"
              />
            </div>
          </div>
        )}

        {/* 2. MICROSOFT WORD RIBBON ACTION TOOLBAR */}
        {editor && (
          <div className="flex items-center flex-wrap gap-1 px-4 sm:px-6 py-1.5 bg-slate-50/80 text-xs text-slate-700 select-none overflow-x-auto no-scrollbar">
            {/* Undo / Redo */}
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className={`${btnClass()} disabled:opacity-30 disabled:pointer-events-none`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className={`${btnClass()} disabled:opacity-30 disabled:pointer-events-none`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>

            <span className="w-[1px] h-4 bg-slate-300 mx-1" />

            {/* Paragraph / Normal Text */}
            <button
              type="button"
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={btnClass(editor.isActive('paragraph'))}
              title="Paragraf Normal"
            >
              <Pilcrow className="w-4 h-4" />
            </button>

            {/* Headings */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={btnClass(editor.isActive('heading', { level: 1 }))}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={btnClass(editor.isActive('heading', { level: 2 }))}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={btnClass(editor.isActive('heading', { level: 3 }))}
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </button>

            <span className="w-[1px] h-4 bg-slate-300 mx-1" />

            {/* Text Alignments */}
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={btnClass(editor.isActive({ textAlign: 'left' }))}
              title="Rata Kiri"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={btnClass(editor.isActive({ textAlign: 'center' }))}
              title="Rata Tengah"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={btnClass(editor.isActive({ textAlign: 'right' }))}
              title="Rata Kanan"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={btnClass(editor.isActive({ textAlign: 'justify' }))}
              title="Rata Kanan-Kiri"
            >
              <AlignJustify className="w-4 h-4" />
            </button>

            <span className="w-[1px] h-4 bg-slate-300 mx-1" />

            {/* Inline Formatting */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={btnClass(editor.isActive('bold'))}
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={btnClass(editor.isActive('italic'))}
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={btnClass(editor.isActive('underline'))}
              title="Underline (Ctrl+U)"
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={btnClass(editor.isActive('strike'))}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={btnClass(editor.isActive('highlight'))}
              title="Highlight Teks"
            >
              <Highlighter className="w-4 h-4" />
            </button>

            {/* Color Picker */}
            <div className="flex items-center gap-1 px-1.5 py-1 rounded-fluent hover:bg-slate-200 transition-all cursor-pointer" title="Warna Font">
              <Palette className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="color"
                value={editor.getAttributes('textStyle').color || '#000000'}
                onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                className="w-4 h-4 p-0 border-0 rounded cursor-pointer bg-transparent"
              />
            </div>

            <span className="w-[1px] h-4 bg-slate-300 mx-1" />

            {/* Lists, Quote, Code, Table */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={btnClass(editor.isActive('bulletList'))}
              title="Bullet Points"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={btnClass(editor.isActive('orderedList'))}
              title="Penomoran (Numbered List)"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={btnClass(editor.isActive('blockquote'))}
              title="Kutipan (Quote)"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={btnClass(editor.isActive('codeBlock'))}
              title="Code Block"
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
              className={btnClass(editor.isActive('table'))}
              title="Sisipkan Tabel"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className={`${btnClass()} text-slate-600`}
              title="Garis Pemisah"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
              className="p-1.5 rounded-fluent text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
              title="Hapus Format"
            >
              <RemoveFormatting className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      {/* 3. SCROLLABLE WORKSPACE CANVAS WITH CENTERED A4 DOCUMENT */}
      <main className="flex-1 w-full overflow-y-auto p-4 sm:p-8 md:p-12 flex justify-center cursor-default bg-slate-200/90" data-lenis-prevent="true">
        {/* 4. WHITE A4 DOCUMENT SHEET */}
        <div className="word-page w-full max-w-[850px] bg-white shadow-2xl rounded-xs border border-slate-300/80 px-8 sm:px-14 md:px-20 py-12 sm:py-16 md:py-20 min-h-[1056px] select-text h-fit my-2">
          {editor && <EditorContent editor={editor} />}
        </div>
      </main>

      {/* 5. BOTTOM WORD STATUS BAR */}
      <footer className="h-6 bg-slate-100 border-t border-slate-300 px-4 flex items-center justify-between text-[11px] text-slate-600 shrink-0 select-none no-print">
        <div className="flex items-center gap-4">
          <span>Halaman 1</span>
          <span>•</span>
          <span>{wordCount} kata</span>
          <span>•</span>
          <span>{charCount} karakter</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-emerald-700 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Tersimpan
          </span>
          <span>•</span>
          <span>Kavio Edu Word Canvas • 100% Zoom</span>
        </div>
      </footer>
    </div>
  )
}
