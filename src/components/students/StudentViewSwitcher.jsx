import React from 'react'
import { motion } from 'framer-motion'

export const StudentViewSwitcher = ({
  activeView = 'table',
  onViewChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1">
      {/* SISI KIRI: SEGMENTED SWITCHER - PILL PUTIH, AKTIF BG-HITAM TEKS PUTIH, TIDAK AKTIF TEKS & IKON HITAM */}
      <div className="inline-flex bg-white dark:bg-neutral-900 p-1 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-sm gap-1 w-auto self-start">
        <button
          type="button"
          onClick={() => onViewChange && onViewChange('table')}
          className={`relative flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-md border-none cursor-pointer whitespace-nowrap flex-shrink-0 transition-all ${
            activeView === 'table'
              ? 'bg-black text-white shadow-xs'
              : 'bg-transparent text-black dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <img 
            src="/icons/student-list.png" 
            alt="Daftar Siswa" 
            className={`w-3.5 h-3.5 object-contain transition-all ${
              activeView === 'table' ? 'brightness-0 invert' : 'brightness-0 opacity-100 dark:invert'
            }`} 
          />
          <span className="whitespace-nowrap">Daftar Siswa</span>
        </button>

        <button
          type="button"
          onClick={() => onViewChange && onViewChange('matrix')}
          className={`relative flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-md border-none cursor-pointer whitespace-nowrap flex-shrink-0 transition-all ${
            activeView === 'matrix'
              ? 'bg-black text-white shadow-xs'
              : 'bg-transparent text-black dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <img 
            src="/icons/matrix-grid.png" 
            alt="Matriks Jadwal" 
            className={`w-3.5 h-3.5 object-contain transition-all ${
              activeView === 'matrix' ? 'brightness-0 invert' : 'brightness-0 opacity-100 dark:invert'
            }`} 
          />
          <span className="whitespace-nowrap">Matriks Jadwal</span>
        </button>
      </div>

      {/* SISI KANAN: STATUS TAMPILAN AKTIF (SOLID TOKEN) */}
      <div className="hidden sm:flex items-center gap-2 text-xs font-medium">
        <span className="text-neutral-500 whitespace-nowrap">Tampilan:</span>
        <span className="font-semibold bg-[#f5f5f5] dark:bg-neutral-800 text-[#111111] dark:text-neutral-200 px-3 py-1 rounded-md border-none whitespace-nowrap flex-shrink-0">
          {activeView === 'table' ? 'Tabel Data Siswa' : 'Matriks Jadwal'}
        </span>
      </div>
    </div>
  )
}

export default StudentViewSwitcher
