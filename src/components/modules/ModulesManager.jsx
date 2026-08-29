import React, { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Grid,
  List as ListIcon,
  Edit3,
  Trash2,
  Copy,
  Eye,
  FileUp,
  Loader2,
  FolderOpen,
  X
} from 'lucide-react'
import FullPageWordEditor from './FullPageWordEditor'
import ModuleDetailModal from './ModuleDetailModal'
import { DEFAULT_MODULE_CATEGORIES, MODULE_LEVELS } from '../../utils/defaultModules'
import { formatDateIndonesian } from '../../utils/dateFormatter'
import { convertDocxToHtml } from '../../utils/docxImporter'

export default function ModulesManager({
  modules = [],
  onSaveModule,
  onDeleteModule
}) {
  // Search, Filter & View States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'

  // Full Page Word Editor State
  const [isFullEditorOpen, setIsFullEditorOpen] = useState(false)
  const [activeEditingModule, setActiveEditingModule] = useState(null)

  // Preview & Delete States
  const [previewModule, setPreviewModule] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  // Header Import DOCX State
  const headerFileInputRef = useRef(null)
  const [isHeaderImporting, setIsHeaderImporting] = useState(false)

  // Filtered Modules
  const filteredModules = useMemo(() => {
    return modules.filter((m) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        m.title?.toLowerCase().includes(q) ||
        m.summary?.toLowerCase().includes(q) ||
        m.category?.toLowerCase().includes(q) ||
        m.tags?.some((t) => t.toLowerCase().includes(q))

      const matchesCategory =
        selectedCategory === 'Semua' || m.category === selectedCategory
      const matchesLevel =
        selectedLevel === 'all' || m.level === selectedLevel

      return matchesSearch && matchesCategory && matchesLevel
    })
  }, [modules, searchQuery, selectedCategory, selectedLevel])

  // Open Full-Page Editor for New Module
  const handleOpenCreate = () => {
    setActiveEditingModule({
      id: null,
      title: '',
      category: 'Grammar & Structure',
      level: 'Beginner',
      summary: '',
      tags: [],
      content: '<h1>Judul Modul Pembelajaran</h1><p>Mulai ketik isi kurikulum atau materi modul Anda di sini...</p>'
    })
    setIsFullEditorOpen(true)
  }

  // Open Full-Page Editor for Existing Module
  const handleOpenEdit = (mod) => {
    setActiveEditingModule(mod)
    setIsFullEditorOpen(true)
  }

  // Handle direct DOCX upload from Bank Modul header
  const handleHeaderDocxUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsHeaderImporting(true)
      const { html, rawText } = await convertDocxToHtml(file)

      const cleanTitle = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]+/g, ' ')
        .trim()

      const firstLine = rawText.split('\n').map((l) => l.trim()).filter(Boolean)[0] || ''
      const briefSummary = firstLine.length > 160 ? firstLine.substring(0, 157) + '...' : firstLine

      setActiveEditingModule({
        id: null,
        title: cleanTitle || 'Modul Baru dari Word',
        category: 'General English',
        level: 'Intermediate',
        summary: briefSummary,
        tags: ['Docx', 'Import'],
        content: html
      })
      setIsFullEditorOpen(true)
    } catch (err) {
      console.error('Failed to import DOCX file:', err)
      alert('Gagal mengimpor file Word (.docx): ' + (err.message || 'File tidak valid'))
    } finally {
      setIsHeaderImporting(false)
      if (headerFileInputRef.current) {
        headerFileInputRef.current.value = ''
      }
    }
  }

  // Save handler from FullPageWordEditor
  const handleSaveFullEditor = (moduleRecord) => {
    if (onSaveModule) {
      onSaveModule(moduleRecord)
    }
    setActiveEditingModule(moduleRecord)
  }

  // Handle Duplicate
  const handleDuplicate = (mod) => {
    const duplicated = {
      ...mod,
      id: `mod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${mod.title} (Salinan)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    if (onSaveModule) onSaveModule(duplicated)
  }

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deleteConfirmId && onDeleteModule) {
      onDeleteModule(deleteConfirmId)
    }
    setDeleteConfirmId(null)
  }

  const getLevelBadgeClass = (lvl) => {
    switch (lvl) {
      case 'Beginner':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Intermediate':
        return 'bg-blue-50 text-fluent-blue border-blue-200'
      case 'Advanced':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  // If Full Page Word Editor is open, render it full screen
  if (isFullEditorOpen) {
    return (
      <FullPageWordEditor
        initialModule={activeEditingModule}
        onSave={handleSaveFullEditor}
        onBack={() => setIsFullEditorOpen(false)}
      />
    )
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner & Stats */}
      <div className="bg-white rounded-fluent border border-fluent-border p-6 shadow-fluent flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2.5 bg-blue-50 text-fluent-blue rounded-fluent">
              <BookOpen className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Bank Modul Pembelajaran
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Pusat kurikulum, materi ajar, dan modul terstruktur Kavio Edu dengan Microsoft Word Full-Page Editor.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-fluent border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Modul</span>
              <span className="font-extrabold text-slate-800 text-base">{modules.length}</span>
            </div>
            <div className="h-6 w-[1px] bg-slate-200" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Kategori</span>
              <span className="font-extrabold text-fluent-blue text-base">
                {new Set(modules.map((m) => m.category)).size}
              </span>
            </div>
          </div>

          {/* Direct Docx Import Button */}
          <input
            type="file"
            ref={headerFileInputRef}
            onChange={handleHeaderDocxUpload}
            accept=".docx"
            className="hidden"
            id="header-docx-upload-input"
          />
          <button
            onClick={() => headerFileInputRef.current?.click()}
            disabled={isHeaderImporting}
            type="button"
            className="px-3.5 py-2.5 rounded-fluent bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-fluent-blue hover:border-fluent-blue text-xs font-semibold shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 disabled:opacity-50"
            title="Import Dokumen Word (.docx) menjadi Modul Baru"
          >
            {isHeaderImporting ? (
              <Loader2 className="w-4 h-4 animate-spin text-fluent-blue" />
            ) : (
              <FileUp className="w-4 h-4 text-fluent-blue" />
            )}
            <span>{isHeaderImporting ? 'Mengimpor...' : 'Import DOCX'}</span>
          </button>

          <button
            onClick={handleOpenCreate}
            type="button"
            className="px-4 py-2.5 rounded-fluent bg-fluent-blue hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all flex items-center gap-2 active:scale-[0.98] cursor-pointer flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Modul Baru</span>
          </button>
        </div>
      </div>

      {/* Search, Filter & View Controls */}
      <div className="bg-white rounded-fluent border border-fluent-border p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul modul, ringkasan, atau tag..."
              className="w-full pl-9.5 pr-4 py-2 text-xs rounded-fluent border border-slate-200 focus:outline-none focus:border-fluent-blue focus:ring-1 focus:ring-fluent-blue bg-white text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Level Filter & View Mode Toggle */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 text-xs rounded-fluent border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-fluent-blue"
            >
              {MODULE_LEVELS.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.label}
                </option>
              ))}
            </select>

            {/* Grid / Table Toggle */}
            <div className="flex items-center border border-slate-200 rounded-fluent p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-fluent-blue shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Tampilan Grid"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-fluent-blue shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Tampilan Tabel"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <span className="text-slate-400 text-[11px] font-semibold mr-1 flex items-center gap-1 flex-shrink-0">
            <Filter className="w-3 h-3" />
            Kategori:
          </span>
          {DEFAULT_MODULE_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-fluent-blue text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Modules List / Grid Display */}
      {filteredModules.length === 0 ? (
        <div className="bg-white rounded-fluent border border-fluent-border p-12 text-center shadow-2xs">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Tidak ada modul ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Coba sesuaikan kata kunci pencarian atau kategori filter, atau buat modul pembelajaran baru.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 rounded-fluent bg-fluent-blue text-white text-xs font-semibold hover:bg-blue-700 transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Modul Sekarang</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModules.map((mod) => (
            <motion.div
              key={mod.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-fluent border border-fluent-border hover:border-fluent-blue/50 p-5 shadow-2xs hover:shadow-fluent transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header tags & level */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                    {mod.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex-shrink-0 ${getLevelBadgeClass(mod.level)}`}>
                    {mod.level}
                  </span>
                </div>

                {/* Title */}
                <h3
                  onClick={() => handleOpenEdit(mod)}
                  className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-fluent-blue transition-colors cursor-pointer line-clamp-2 leading-snug"
                >
                  {mod.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {mod.summary || 'Klik untuk membuka dan mengedit materi lengkap modul ini.'}
                </p>

                {/* Tags */}
                {Array.isArray(mod.tags) && mod.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {mod.tags.slice(0, 3).map((t, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600">
                        #{t}
                      </span>
                    ))}
                    {mod.tags.length > 3 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{mod.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px]">
                  {formatDateIndonesian(mod.updatedAt?.split('T')[0] || new Date().toISOString().split('T')[0])}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewModule(mod)}
                    className="p-1.5 rounded hover:bg-blue-50 text-slate-500 hover:text-fluent-blue transition-colors cursor-pointer"
                    title="Pratinjau Modul"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(mod)}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-fluent-blue transition-colors cursor-pointer"
                    title="Edit Modul (Full Page Editor)"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDuplicate(mod)}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-fluent-blue transition-colors cursor-pointer"
                    title="Duplikasi Modul"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(mod.id)}
                    className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Hapus Modul"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-fluent border border-fluent-border shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-fluent-border text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Judul Modul</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Terakhir Diubah</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredModules.map((mod) => (
                  <tr key={mod.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div
                        onClick={() => handleOpenEdit(mod)}
                        className="font-bold text-slate-900 hover:text-fluent-blue cursor-pointer line-clamp-1"
                      >
                        {mod.title}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {mod.summary || 'Klik untuk membuka'}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {mod.category}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getLevelBadgeClass(mod.level)}`}>
                        {mod.level}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {formatDateIndonesian(mod.updatedAt?.split('T')[0] || new Date().toISOString().split('T')[0])}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPreviewModule(mod)}
                          className="p-1 rounded text-slate-500 hover:text-fluent-blue hover:bg-blue-50"
                          title="Pratinjau"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(mod)}
                          className="p-1 rounded text-slate-500 hover:text-fluent-blue hover:bg-slate-100"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(mod)}
                          className="p-1 rounded text-slate-500 hover:text-fluent-blue hover:bg-slate-100"
                          title="Duplikasi"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(mod.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Preview / Reader */}
      <ModuleDetailModal
        isOpen={!!previewModule}
        moduleItem={previewModule}
        onClose={() => setPreviewModule(null)}
        onEdit={handleOpenEdit}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div
            className="fixed inset-0 z-[999999] flex items-center justify-center p-4"
            data-lenis-prevent="true"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280, mass: 0.85 }}
              className="relative bg-white rounded-2xl border border-fluent-border shadow-2xl max-w-sm w-full p-6 text-center overflow-hidden z-10"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Hapus Modul Ini?</h3>
              <p className="text-xs text-slate-500 mt-1.5">
                Modul ini akan dihapus secara permanen dari Bank Modul dan cloud database.
              </p>
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2.5 rounded-fluent bg-fluent-blue hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                >
                  Kembali
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2.5 rounded-fluent bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
