import React, { useState } from 'react'
import {
  Palette,
  Type,
  Layout,
  Image as ImageIcon,
  Save,
  RotateCcw,
  Check,
  Sparkles,
  Sliders,
  Eye,
  FileText
} from 'lucide-react'

// Built-in Invoice Themes Presets
export const BUILTIN_THEMES = [
  {
    id: 'classic-blue',
    name: 'Classic Blue (Default)',
    primaryColor: '#0078d4', // Fluent Blue
    accentColor: '#f0f6ff',
    textColor: '#1b1b1b',
    fontFamily: 'font-sans',
    logoPosition: 'left',
    headerSize: 'text-xl',
    watermarkText: 'KAVIO EDU',
    watermarkOpacity: 5,
    showBankBox: true,
    bankStyle: 'grid',
    customFooterText: 'Terima kasih atas kepercayaan Anda memilih Kavio Edu.'
  },
  {
    id: 'modern-emerald',
    name: 'Modern Emerald',
    primaryColor: '#059669', // Emerald Green
    accentColor: '#ecfdf5',
    textColor: '#0f172a',
    fontFamily: 'font-sans',
    logoPosition: 'center',
    headerSize: 'text-2xl',
    watermarkText: 'OFFICIAL INVOICE',
    watermarkOpacity: 8,
    showBankBox: true,
    bankStyle: 'boxed',
    customFooterText: 'Lembaga Bimbingan Belajar & Kursus Private Bahasa Inggris Terpercaya.'
  },
  {
    id: 'elegant-indigo',
    name: 'Elegant Indigo',
    primaryColor: '#4f46e5', // Indigo
    accentColor: '#eef2ff',
    textColor: '#1e1b4b',
    fontFamily: 'font-serif',
    logoPosition: 'right',
    headerSize: 'text-2xl',
    watermarkText: 'PAID & VERIFIED',
    watermarkOpacity: 6,
    showBankBox: true,
    bankStyle: 'compact',
    customFooterText: 'Kavio Edu - Empowering Future English Leaders.'
  },
  {
    id: 'compact-dark',
    name: 'Dark Slate Premium',
    primaryColor: '#0f172a', // Dark Slate
    accentColor: '#f8fafc',
    textColor: '#020617',
    fontFamily: 'font-mono',
    logoPosition: 'left',
    headerSize: 'text-xl',
    watermarkText: 'KAVIO ACADEMY',
    watermarkOpacity: 7,
    showBankBox: true,
    bankStyle: 'grid',
    customFooterText: 'Simpan invoice ini sebagai bukti transaksi sah Kavio Edu.'
  }
]

export default function InvoiceThemerStudio({ currentTheme, onApplyTheme, onSaveThemeToLibrary }) {
  const [themeConfig, setThemeConfig] = useState(currentTheme || BUILTIN_THEMES[0])
  const [activeSubTab, setActiveSubTab] = useState('presets') // 'presets', 'colors', 'typography', 'layout', 'watermark'
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [customThemeName, setCustomThemeName] = useState('')

  const handleSelectPreset = (preset) => {
    setThemeConfig(preset)
    if (onApplyTheme) onApplyTheme(preset)
  }

  const handleFieldChange = (field, value) => {
    const updated = { ...themeConfig, [field]: value }
    setThemeConfig(updated)
    if (onApplyTheme) onApplyTheme(updated)
  }

  const handleSaveTheme = () => {
    const themeName = customThemeName.trim() || `Tema Kustom ${Date.now().toString().slice(-4)}`
    const newThemeObj = {
      ...themeConfig,
      id: `custom-${Date.now()}`,
      name: themeName
    }
    if (onSaveThemeToLibrary) onSaveThemeToLibrary(newThemeObj)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  return (
    <div className="bg-white rounded-fluent border border-fluent-border shadow-fluent p-5 space-y-5 hidden lg:block no-print">
      
      {/* Studio Header */}
      <div className="flex items-center justify-between border-b border-fluent-border pb-3">
        <div className="flex items-center space-x-2">
          <Palette className="w-5 h-5 text-fluent-blue" />
          <div>
            <h3 className="text-sm font-bold text-fluent-text">Invoice Themer Studio</h3>
            <p className="text-[11px] text-fluent-textSecondary">Desain layout, warna, typography, dan watermark template invoice kustom.</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={customThemeName}
            onChange={(e) => setCustomThemeName(e.target.value)}
            placeholder="Nama Tema Kustom..."
            className="px-2.5 py-1 text-xs border border-fluent-border rounded focus:outline-none focus:border-fluent-blue w-40"
          />
          <button
            onClick={handleSaveTheme}
            title={savedSuccess ? 'Tersimpan!' : 'Simpan Tema'}
            aria-label="Simpan Tema"
            className="p-1.5 bg-fluent-blue hover:bg-fluent-blueHover text-white rounded flex items-center justify-center shadow-xs transition-colors"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Studio Navigation Bar - Icon Only */}
      <div className="flex border-b border-fluent-border space-x-1">
        <button
          onClick={() => setActiveSubTab('presets')}
          title="Pustaka Tema"
          aria-label="Pustaka Tema"
          className={`p-2 border-b-2 transition-colors flex items-center justify-center ${
            activeSubTab === 'presets'
              ? 'border-fluent-blue text-fluent-blue font-bold bg-fluent-subtle'
              : 'border-transparent text-fluent-textSecondary hover:text-fluent-text hover:bg-fluent-subtle'
          }`}
        >
          <Sparkles className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveSubTab('colors')}
          title="Warna Utama"
          aria-label="Warna Utama"
          className={`p-2 border-b-2 transition-colors flex items-center justify-center ${
            activeSubTab === 'colors'
              ? 'border-fluent-blue text-fluent-blue font-bold bg-fluent-subtle'
              : 'border-transparent text-fluent-textSecondary hover:text-fluent-text hover:bg-fluent-subtle'
          }`}
        >
          <Palette className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveSubTab('typography')}
          title="Font & Ukuran"
          aria-label="Font & Ukuran"
          className={`p-2 border-b-2 transition-colors flex items-center justify-center ${
            activeSubTab === 'typography'
              ? 'border-fluent-blue text-fluent-blue font-bold bg-fluent-subtle'
              : 'border-transparent text-fluent-textSecondary hover:text-fluent-text hover:bg-fluent-subtle'
          }`}
        >
          <Type className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveSubTab('layout')}
          title="Tata Letak"
          aria-label="Tata Letak"
          className={`p-2 border-b-2 transition-colors flex items-center justify-center ${
            activeSubTab === 'layout'
              ? 'border-fluent-blue text-fluent-blue font-bold bg-fluent-subtle'
              : 'border-transparent text-fluent-textSecondary hover:text-fluent-text hover:bg-fluent-subtle'
          }`}
        >
          <Layout className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveSubTab('watermark')}
          title="Watermark & Catatan"
          aria-label="Watermark & Catatan"
          className={`p-2 border-b-2 transition-colors flex items-center justify-center ${
            activeSubTab === 'watermark'
              ? 'border-fluent-blue text-fluent-blue font-bold bg-fluent-subtle'
              : 'border-transparent text-fluent-textSecondary hover:text-fluent-text hover:bg-fluent-subtle'
          }`}
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>

      {/* Studio Subtab Content Panels */}

      {/* Subtab 1: Presets */}
      {activeSubTab === 'presets' && (
        <div className="grid grid-cols-4 gap-3">
          {BUILTIN_THEMES.map((preset) => {
            const isSelected = themeConfig.id === preset.id
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-fluent border text-left transition-all relative space-y-2 ${
                  isSelected
                    ? 'border-fluent-blue bg-fluent-blue/5 shadow-xs ring-1 ring-fluent-blue'
                    : 'border-fluent-border bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-fluent-text block truncate">{preset.name}</span>
                  <div
                    className="w-4 h-4 rounded-full border border-black/10 flex-shrink-0"
                    style={{ backgroundColor: preset.primaryColor }}
                  />
                </div>
                <div className="text-[10px] text-fluent-textSecondary flex items-center space-x-2">
                  <span>Font: {preset.fontFamily.replace('font-', '')}</span>
                  <span>|</span>
                  <span>Logo: {preset.logoPosition}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Subtab 2: Colors */}
      {activeSubTab === 'colors' && (
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-fluent-textSecondary mb-1">
              Warna Utama Header & Judul
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={themeConfig.primaryColor || '#0078d4'}
                onChange={(e) => handleFieldChange('primaryColor', e.target.value)}
                className="w-9 h-8 rounded border border-fluent-border cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={themeConfig.primaryColor || '#0078d4'}
                onChange={(e) => handleFieldChange('primaryColor', e.target.value)}
                className="flex-1 px-2.5 py-1 text-xs font-mono border border-fluent-border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-fluent-textSecondary mb-1">
              Warna Latar Belakang Kotak
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={themeConfig.accentColor || '#f0f6ff'}
                onChange={(e) => handleFieldChange('accentColor', e.target.value)}
                className="w-9 h-8 rounded border border-fluent-border cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={themeConfig.accentColor || '#f0f6ff'}
                onChange={(e) => handleFieldChange('accentColor', e.target.value)}
                className="flex-1 px-2.5 py-1 text-xs font-mono border border-fluent-border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-fluent-textSecondary mb-1">
              Warna Teks Utama
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={themeConfig.textColor || '#1b1b1b'}
                onChange={(e) => handleFieldChange('textColor', e.target.value)}
                className="w-9 h-8 rounded border border-fluent-border cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={themeConfig.textColor || '#1b1b1b'}
                onChange={(e) => handleFieldChange('textColor', e.target.value)}
                className="flex-1 px-2.5 py-1 text-xs font-mono border border-fluent-border rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Typography */}
      {activeSubTab === 'typography' && (
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-fluent-textSecondary mb-1">
              Gaya Jenis Huruf (Font Family)
            </label>
            <select
              value={themeConfig.fontFamily || 'font-sans'}
              onChange={(e) => handleFieldChange('fontFamily', e.target.value)}
              className="w-full px-3 py-1.5 border border-fluent-border rounded focus:outline-none focus:border-fluent-blue bg-white text-xs"
            >
              <option value="font-sans">Inter / Modern Sans (Default)</option>
              <option value="font-serif">Georgia / Classic Serif</option>
              <option value="font-mono">Courier / Monospace Tech</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-fluent-textSecondary mb-1">
              Ukuran Judul Header Invoice
            </label>
            <select
              value={themeConfig.headerSize || 'text-xl'}
              onChange={(e) => handleFieldChange('headerSize', e.target.value)}
              className="w-full px-3 py-1.5 border border-fluent-border rounded focus:outline-none focus:border-fluent-blue bg-white text-xs"
            >
              <option value="text-lg">Sedang (Standard)</option>
              <option value="text-xl">Besar (Default)</option>
              <option value="text-2xl">Ekstra Besar (Bold Title)</option>
            </select>
          </div>
        </div>
      )}

      {/* Subtab 4: Layout */}
      {activeSubTab === 'layout' && (
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-fluent-textSecondary mb-1">
              Posisi Logo Kavio Edu
            </label>
            <select
              value={themeConfig.logoPosition || 'left'}
              onChange={(e) => handleFieldChange('logoPosition', e.target.value)}
              className="w-full px-3 py-1.5 border border-fluent-border rounded focus:outline-none focus:border-fluent-blue bg-white text-xs"
            >
              <option value="left">Rata Kiri (Standard)</option>
              <option value="center">Rata Tengah (Tengah Header)</option>
              <option value="right">Rata Kanan</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-fluent-textSecondary mb-1">
              Gaya Tampilan Rekening Bank
            </label>
            <select
              value={themeConfig.bankStyle || 'grid'}
              onChange={(e) => handleFieldChange('bankStyle', e.target.value)}
              className="w-full px-3 py-1.5 border border-fluent-border rounded focus:outline-none focus:border-fluent-blue bg-white text-xs"
            >
              <option value="grid">Grid 3 Kolom (Default)</option>
              <option value="boxed">Boxed Bordered Highlight</option>
              <option value="compact">Ringkas Horizontal</option>
            </select>
          </div>
        </div>
      )}

      {/* Subtab 5: Watermark & Notes */}
      {activeSubTab === 'watermark' && (
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-fluent-textSecondary mb-1">
              Teks Watermark Latar Belakang
            </label>
            <input
              type="text"
              value={themeConfig.watermarkText || ''}
              onChange={(e) => handleFieldChange('watermarkText', e.target.value)}
              placeholder="Contoh: KAVIO EDU / OFFICIAL"
              className="w-full px-3 py-1.5 border border-fluent-border rounded focus:outline-none focus:border-fluent-blue text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-fluent-textSecondary mb-1">
              Transparansi Watermark ({themeConfig.watermarkOpacity || 5}%)
            </label>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={themeConfig.watermarkOpacity || 5}
              onChange={(e) => handleFieldChange('watermarkOpacity', Number(e.target.value))}
              className="w-full accent-fluent-blue cursor-pointer"
            />
          </div>

          <div>
            <label className="block font-semibold text-fluent-textSecondary mb-1">
              Catatan Kustom Footer
            </label>
            <input
              type="text"
              value={themeConfig.customFooterText || ''}
              onChange={(e) => handleFieldChange('customFooterText', e.target.value)}
              placeholder="Catatan di bagian bawah invoice..."
              className="w-full px-3 py-1.5 border border-fluent-border rounded focus:outline-none focus:border-fluent-blue text-xs"
            />
          </div>
        </div>
      )}

    </div>
  )
}
