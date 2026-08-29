import React, { useRef, useState } from 'react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Highlighter,
  Undo2,
  Redo2,
  RemoveFormatting,
  Palette,
  FileUp,
  Table as TableIcon,
  Loader2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from 'lucide-react'
import { convertDocxToHtml } from '../../utils/docxImporter'

export default function Toolbar({ editor, onDocxImported }) {
  const fileInputRef = useRef(null)
  const [isImporting, setIsImporting] = useState(false)

  if (!editor) return null

  const btnClass = (isActive) =>
    `p-1.5 sm:p-2 rounded-fluent text-xs flex items-center justify-center transition-all cursor-pointer ${
      isActive
        ? 'bg-fluent-blue text-white shadow-2xs font-semibold'
        : 'text-slate-600 hover:text-fluent-blue hover:bg-slate-100'
    }`

  const handleDocxUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsImporting(true)
      const { html } = await convertDocxToHtml(file)
      editor.commands.setContent(html, { emitUpdate: true })
      if (onDocxImported) {
        onDocxImported({ file, html })
      }
    } catch (err) {
      console.error('Failed to import docx:', err)
      alert('Gagal mengimpor file DOCX: ' + (err.message || 'Format tidak valid'))
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-fluent-border bg-slate-50/80 p-2 select-none">
      {/* Undo & Redo */}
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-1.5 sm:p-2 rounded-fluent text-slate-600 hover:text-fluent-blue hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-1.5 sm:p-2 rounded-fluent text-slate-600 hover:text-fluent-blue hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
        title="Redo (Ctrl+Y)"
      >
        <Redo2 className="w-4 h-4" />
      </button>

      <div className="h-4 w-[1px] bg-slate-300 mx-1" />

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
        title="Heading 1 (# + Spasi)"
      >
        <Heading1 className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btnClass(editor.isActive('heading', { level: 2 }))}
        title="Heading 2 (## + Spasi)"
      >
        <Heading2 className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={btnClass(editor.isActive('heading', { level: 3 }))}
        title="Heading 3 (### + Spasi)"
      >
        <Heading3 className="w-4 h-4" />
      </button>

      <div className="h-4 w-[1px] bg-slate-300 mx-1" />

      {/* Text Alignment */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={btnClass(editor.isActive({ textAlign: 'left' }))}
        title="Rata Kiri (Align Left)"
      >
        <AlignLeft className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={btnClass(editor.isActive({ textAlign: 'center' }))}
        title="Rata Tengah (Align Center)"
      >
        <AlignCenter className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={btnClass(editor.isActive({ textAlign: 'right' }))}
        title="Rata Kanan (Align Right)"
      >
        <AlignRight className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        className={btnClass(editor.isActive({ textAlign: 'justify' }))}
        title="Rata Kanan Kiri (Align Justify)"
      >
        <AlignJustify className="w-4 h-4" />
      </button>

      <div className="h-4 w-[1px] bg-slate-300 mx-1" />

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

      <div className="h-4 w-[1px] bg-slate-300 mx-1" />

      {/* Lists, Quote, Code, Separator, Table */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btnClass(editor.isActive('bulletList'))}
        title="Bullet List (- + Spasi)"
      >
        <List className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btnClass(editor.isActive('orderedList'))}
        title="Numbered List (1. + Spasi)"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btnClass(editor.isActive('blockquote'))}
        title="Blockquote (> + Spasi)"
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
        className="p-1.5 sm:p-2 rounded-fluent text-slate-600 hover:text-fluent-blue hover:bg-slate-100 transition-all cursor-pointer"
        title="Garis Pemisah (Horizontal Rule)"
      >
        <Minus className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        className="p-1.5 sm:p-2 rounded-fluent text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
        title="Hapus Format (Clear Formatting)"
      >
        <RemoveFormatting className="w-4 h-4" />
      </button>

      <div className="h-4 w-[1px] bg-slate-300 mx-1" />

      {/* Text Color Picker */}
      <div className="flex items-center gap-1.5 px-1.5 py-1 rounded-fluent hover:bg-slate-100 transition-all" title="Ubah Warna Teks">
        <Palette className="w-3.5 h-3.5 text-slate-500" />
        <input
          type="color"
          value={editor.getAttributes('textStyle').color || '#000000'}
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
        />
      </div>

      <div className="h-4 w-[1px] bg-slate-300 mx-1" />

      {/* Import DOCX Button */}
      <div className="ml-auto flex items-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleDocxUpload}
          accept=".docx"
          className="hidden"
          id="docx-upload-input"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-fluent hover:bg-slate-50 hover:text-fluent-blue hover:border-fluent-blue transition-all shadow-2xs cursor-pointer disabled:opacity-50"
          title="Import dari Dokumen Word (.docx)"
        >
          {isImporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-fluent-blue" />
          ) : (
            <FileUp className="w-3.5 h-3.5 text-fluent-blue" />
          )}
          <span>{isImporting ? 'Mengimpor...' : 'Import DOCX'}</span>
        </button>
      </div>
    </div>
  )
}
