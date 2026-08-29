import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { logoSvg } from '../assets'

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0)
  const [loadingInfo, setLoadingInfo] = useState('Memuat modul sistem...')

  useEffect(() => {
    const startTime = Date.now()
    const targetDuration = 2200 // 2.2 seconds (strictly < 5s)

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const rawPct = Math.min(100, (elapsed / targetDuration) * 100)

      setProgress(rawPct)

      if (rawPct < 25) {
        setLoadingInfo('Memuat modul sistem...')
      } else if (rawPct < 55) {
        setLoadingInfo('Menghubungkan basis data...')
      } else if (rawPct < 80) {
        setLoadingInfo('Menyiapkan sesi & kuota belajar...')
      } else if (rawPct < 99) {
        setLoadingInfo('Menyiapkan antarmuka...')
      } else {
        setLoadingInfo('Selesai!')
      }

      if (rawPct >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          if (onFinish) onFinish()
        }, 220)
      }
    }, 25)

    return () => clearInterval(interval)
  }, [onFinish])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center p-6 select-none"
    >
      {/* Logo Kavio */}
      <div className="mb-8 flex items-center justify-center">
        <img
          src={logoSvg}
          alt="Kavio Edu Logo"
          className="h-10 sm:h-12 w-auto object-contain"
        />
      </div>

      {/* Progress Bar Container */}
      <div className="w-64 sm:w-80">
        {/* Slim Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
          <div
            className="h-full bg-fluent-blue rounded-full transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Info & Percentage Row */}
        <div className="flex items-center justify-between mt-2.5 text-xs text-slate-500">
          <span className="text-[11px] font-medium text-slate-500 truncate pr-2">
            {loadingInfo}
          </span>
          <span className="text-[11px] font-mono font-bold text-slate-700 flex-shrink-0">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </motion.div>
  )
}
