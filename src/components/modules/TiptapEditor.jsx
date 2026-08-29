import React, { useEffect } from 'react'
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
import Toolbar from './Toolbar'
import './editor.css'

export default function TiptapEditor({
  content = '',
  onChange,
  onDocxImported,
  placeholder = 'Tulis materi atau kurikulum modul pembelajaran di sini...',
  editable = true,
  minHeight = 'min-h-[320px]'
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
        heading: { levels: [1, 2, 3] }
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Image.configure({ inline: true, allowBase64: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content || '<p></p>',
    editable: editable,
    editorProps: {
      attributes: {
        class: `tiptap-content focus:outline-none ${minHeight} p-4 sm:p-6 text-slate-800 leading-relaxed font-sans`
      }
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML())
      }
    }
  })

  // Synchronize editor content if external content changes
  useEffect(() => {
    if (editor && content !== undefined && editor.getHTML() !== content) {
      editor.commands.setContent(content || '<p></p>', false)
    }
  }, [content, editor])

  // Synchronize editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable)
    }
  }, [editable, editor])

  return (
    <div className="w-full border border-fluent-border rounded-fluent bg-white overflow-hidden shadow-2xs focus-within:border-fluent-blue transition-colors">
      {editable && <Toolbar editor={editor} onDocxImported={onDocxImported} />}
      <div className="bg-white overflow-y-auto max-h-[600px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
