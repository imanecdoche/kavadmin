import React, { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  BookOpen,
  MessageSquare,
  Eye,
  CheckCircle2,
  CalendarCheck,
  CalendarX,
  Sparkles,
  Layers,
  Award
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DAYS_INDONESIAN,
  TIME_SLOTS_LIST,
  formatDateKey,
  getAggregatedSessionsMap
} from '../utils/scheduleManager'

const DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export default function SlotCalendarModal({
  isOpen,
  onClose,
  students = [],
  onSelectStudent = null,
  onOpenRoadmap = null
}) {
  const today = useMemo(() => new Date(), [])

  // Currently viewed month in calendar
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))

  // Currently selected date
  const [selectedDate, setSelectedDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), today.getDate()))

  // Keyboard shortcut listener for ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Reset to today when modal is opened & lock body scroll
  useEffect(() => {
    if (isOpen) {
      const now = new Date()
      setSelectedDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()))
      setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1))
      document.body.style.overflow = 'hidden'
      document.documentElement.classList.add('lenis-stopped')
    }
    return () => {
      document.body.style.overflow = ''
      document.documentElement.classList.remove('lenis-stopped')
    }
  }, [isOpen])

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const handleGoToToday = () => {
    const now = new Date()
    setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1))
    setSelectedDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()))
  }

  // 1. Hitung seluruh sesi valid yang teragregasi dan dibatasi ketat oleh kuota/durasi siswa
  const aggregatedSessionsMap = useMemo(() => {
    return getAggregatedSessionsMap(students)
  }, [students])

  // 2. Generate Calendar Month Grid (Previous, Current, Next Month padding)
  const calendarGrid = useMemo(() => {
    const year = currentMonthDate.getFullYear()
    const month = currentMonthDate.getMonth()

    const firstDayIndex = new Date(year, month, 1).getDay() // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const grid = []

    // Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, daysInPrevMonth - i)
      const dateKey = formatDateKey(prevDate)
      const sessions = aggregatedSessionsMap[dateKey] || []
      grid.push({
        dateObj: prevDate,
        dateKey,
        dayNum: daysInPrevMonth - i,
        isCurrentMonth: false,
        sessionsCount: sessions.length
      })
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const thisDate = new Date(year, month, d)
      const dateKey = formatDateKey(thisDate)
      const sessions = aggregatedSessionsMap[dateKey] || []
      grid.push({
        dateObj: thisDate,
        dateKey,
        dayNum: d,
        isCurrentMonth: true,
        sessionsCount: sessions.length
      })
    }

    // Next month padding days to complete grid
    const remaining = (7 - (grid.length % 7)) % 7
    for (let nextD = 1; nextD <= remaining; nextD++) {
      const nextDate = new Date(year, month + 1, nextD)
      const dateKey = formatDateKey(nextDate)
      const sessions = aggregatedSessionsMap[dateKey] || []
      grid.push({
        dateObj: nextDate,
        dateKey,
        dayNum: nextD,
        isCurrentMonth: false,
        sessionsCount: sessions.length
      })
    }

    return grid
  }, [currentMonthDate, aggregatedSessionsMap])

  // Sessions for the currently selected date (Strictly bound by student quota)
  const selectedDaySessions = useMemo(() => {
    const key = formatDateKey(selectedDate)
    return aggregatedSessionsMap[key] || []
  }, [selectedDate, aggregatedSessionsMap])

  // Helper for Date Comparison
  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    )
  }

  // Open Direct WhatsApp Link
  const openWhatsApp = (phone, text = '') => {
    if (!phone) return
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  if (!isOpen) return null

  return typeof document !== 'undefined' ? createPortal(
    <AnimatePresence>
      <motion.div
        data-lenis-prevent="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={onClose}
        className="fixed inset-0 top-0 left-0 w-screen h-screen z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      >
        <motion.div
          data-lenis-prevent="true"
          initial={{ opacity: 0, scale: 0.82, scaleY: 0.72, scaleX: 0.90, y: 48 }}
          animate={{ opacity: 1, scale: 1, scaleY: 1, scaleX: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.84, scaleY: 0.74, scaleX: 0.92, y: 38 }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 280,
            mass: 0.85,
            opacity: { duration: 0.22, ease: 'easeOut' }
          }}
          style={{ transformOrigin: '50% 85%' }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-fluent border border-fluent-border shadow-fluent-modal w-full max-w-4xl flex flex-col max-h-[92vh] overflow-hidden my-auto will-change-transform"
        >
          {/* Modal Header */}
          <div className="p-4 sm:px-6 sm:py-4 border-b border-fluent-border bg-gradient-to-r from-fluent-subtle via-white to-fluent-subtle/50 flex items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-fluent-blue/10 text-fluent-blue rounded-fluent">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-fluent-text">
                    Kalender Ringkas Sesi Belajar
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-fluent-blue border border-blue-200 rounded-full">
                    Sesuai Kuota Paket
                  </span>
                </div>
                <p className="text-xs text-fluent-textSecondary mt-0.5">
                  Pemantauan jadwal sesi aktif sesuai kuota dan masa durasi bimbingan siswa.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-fluent-textSecondary hover:text-fluent-text hover:bg-fluent-subtle rounded-fluent transition-colors"
              title="Tutup (Esc)"
              aria-label="Tutup Kalender"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Split-View Body (2 Kolom) */}
          <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto divide-y md:divide-y-0 md:divide-x divide-fluent-border">

            {/* ======================================================== */}
            {/* KOLOM KIRI: COMPACT MINI CALENDAR (GRID BULANAN RINGKAS) */}
            {/* ======================================================== */}
            <div className="md:col-span-5 p-5 space-y-4 bg-fluent-subtle/30 flex flex-col justify-between">
              <div>
                {/* Month & Year Selector Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-fluent-text">
                      {MONTH_NAMES_ID[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
                    </span>
                    <button
                      type="button"
                      onClick={handleGoToToday}
                      title="Kembali ke Hari Ini"
                      className="px-2 py-0.5 text-[10px] font-bold bg-white text-fluent-blue border border-fluent-border hover:bg-fluent-subtle rounded-fluent transition-colors"
                    >
                      Hari Ini
                    </button>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      title="Bulan Sebelumnya"
                      className="p-1.5 bg-white text-fluent-text hover:bg-fluent-subtle rounded border border-fluent-border transition-colors shadow-2xs"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      title="Bulan Berikutnya"
                      className="p-1.5 bg-white text-fluent-text hover:bg-fluent-subtle rounded border border-fluent-border transition-colors shadow-2xs"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Day of Week Labels (Header) */}
                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-fluent-textSecondary border-b border-fluent-border pb-1.5 mb-1.5">
                  {DAYS_SHORT.map((d, idx) => (
                    <div key={idx} className={idx === 0 ? 'text-rose-600' : ''}>
                      {d}
                    </div>
                  ))}
                </div>

                {/* Monthly Days Grid (Minimalist & Compact) */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {calendarGrid.map((item, idx) => {
                    const isSelected = isSameDay(item.dateObj, selectedDate)
                    const isCurrentDay = isSameDay(item.dateObj, today)
                    const hasSessions = item.sessionsCount > 0

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedDate(item.dateObj)
                          // If clicking padding from other month, sync currentMonthDate
                          if (!item.isCurrentMonth) {
                            setCurrentMonthDate(new Date(item.dateObj.getFullYear(), item.dateObj.getMonth(), 1))
                          }
                        }}
                        className={`h-10 rounded flex flex-col items-center justify-center relative transition-all text-xs font-semibold ${
                          isSelected
                            ? 'bg-fluent-blue text-white shadow-xs font-bold'
                            : item.isCurrentMonth
                              ? 'bg-white hover:bg-blue-50 text-fluent-text border border-transparent hover:border-blue-200'
                              : 'bg-fluent-subtle/50 text-slate-300 hover:text-slate-500'
                        } ${isCurrentDay && !isSelected ? 'ring-1.5 ring-fluent-blue font-bold text-fluent-blue' : ''}`}
                      >
                        {/* Day Number */}
                        <span className="leading-none text-xs">{item.dayNum}</span>

                        {/* Session Dot / Badge Indicator */}
                        {hasSessions && (
                          <span
                            className={`mt-1 flex items-center justify-center text-[9px] font-bold leading-none ${
                              isSelected
                                ? 'bg-white text-fluent-blue px-1 rounded-full'
                                : 'bg-emerald-600 text-white w-3.5 h-3.5 rounded-full'
                            }`}
                            title={`${item.sessionsCount} Sesi Terjadwal`}
                          >
                            {item.sessionsCount}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Legend Strip */}
              <div className="pt-3 border-t border-fluent-border flex items-center justify-between text-[11px] text-fluent-textSecondary">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                  <span>Ada Sesi Belajar</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full border border-fluent-blue inline-block"></span>
                  <span>Hari Ini</span>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* KOLOM KANAN: PANEL RINCIAN SESI HARIAN                   */}
            {/* ======================================================== */}
            <div className="md:col-span-7 p-5 space-y-4 flex flex-col justify-between bg-white">
              <div className="space-y-3.5">
                {/* Selected Date Header */}
                <div className="flex items-center justify-between border-b border-fluent-border pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-fluent-textSecondary uppercase tracking-wider block">
                      Rincian Jadwal Harian
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-fluent-text flex items-center space-x-1.5 mt-0.5">
                      <CalendarCheck className="w-4 h-4 text-fluent-blue flex-shrink-0" />
                      <span>{DAYS_INDONESIAN[selectedDate.getDay()]}, {selectedDate.getDate()} {MONTH_NAMES_ID[selectedDate.getMonth()]} {selectedDate.getFullYear()}</span>
                    </h4>
                  </div>

                  <span className={`px-2.5 py-1 text-xs font-bold rounded-fluent border ${
                    selectedDaySessions.length > 0
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {selectedDaySessions.length} Sesi Terjadwal
                  </span>
                </div>

                {/* Sessions List on Selected Date */}
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {selectedDaySessions.length > 0 ? (
                    selectedDaySessions.map((session) => {
                      const st = session.student
                      const phone = st?.studentPhone || st?.parentPhone || ''
                      const totalQuota = st ? (st.totalSessions || ((st.sessionsPerMonth || 4) * (st.durationMonths || 1))) : 0

                      return (
                        <div
                          key={session.id}
                          className="p-3.5 bg-fluent-subtle/50 hover:bg-fluent-subtle rounded-fluent border border-fluent-border hover:border-fluent-blue/50 transition-all space-y-2.5 group shadow-2xs"
                        >
                          {/* Top Row: Time, Session Number & Status */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center text-xs font-bold text-fluent-blue bg-fluent-blue/10 px-2 py-0.5 rounded">
                                <Clock className="w-3.5 h-3.5 mr-1" />
                                {session.timeLabel}
                              </span>
                              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                Sesi {session.sessionNumber < 10 ? `0${session.sessionNumber}` : session.sessionNumber} / {totalQuota < 10 ? `0${totalQuota}` : totalQuota}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1.5">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-fluent-blue border border-blue-200">
                                Paket {session.packageType}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                session.status === 'SELESAI'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : session.status === 'PROSES'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}>
                                {session.status}
                              </span>
                            </div>
                          </div>

                          {/* Student Info & Actions */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5 flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <User className="w-3.5 h-3.5 text-fluent-textSecondary flex-shrink-0" />
                                <h5 className="font-bold text-xs text-fluent-text truncate">
                                  {session.studentName}
                                </h5>
                                {session.grade && (
                                  <span className="text-[11px] text-fluent-textSecondary">
                                    • {session.grade}
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] text-slate-600 pl-5 truncate">
                                Modul: {session.moduleTitle}
                              </p>
                              {session.materials && (
                                <p className="text-[10px] text-slate-500 pl-5 truncate italic">
                                  Materi: {session.materials}
                                </p>
                              )}
                            </div>

                            {/* Action Buttons: WhatsApp & Profile & Roadmap */}
                            <div className="flex items-center space-x-1 flex-shrink-0">
                              {phone && (
                                <button
                                  type="button"
                                  onClick={() => openWhatsApp(phone, `Halo ${session.studentName}, ini pengingat sesi bimbingan belajar Kavio Edu (Sesi ke-${session.sessionNumber}) pada ${DAYS_INDONESIAN[selectedDate.getDay()]}, ${selectedDate.getDate()} ${MONTH_NAMES_ID[selectedDate.getMonth()]} jam ${session.timeLabel}. Terima kasih.`)}
                                  title={`Kirim WA ke ${session.studentName}`}
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded border border-emerald-200 transition-colors"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {onSelectStudent && st && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onSelectStudent(st)
                                    onClose()
                                  }}
                                  title="Lihat Profil Siswa"
                                  className="p-1.5 bg-white hover:bg-fluent-subtle text-fluent-text rounded border border-fluent-border transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5 text-fluent-blue" />
                                </button>
                              )}

                              {onOpenRoadmap && st && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onOpenRoadmap(st)
                                    onClose()
                                  }}
                                  title="Buka Roadmap Siswa"
                                  className="p-1.5 bg-white hover:bg-blue-50 text-fluent-blue rounded border border-fluent-border hover:border-blue-200 transition-colors"
                                >
                                  <BookOpen className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                        </div>
                      )
                    })
                  ) : (
                    /* Empty State */
                    <div className="py-12 px-4 text-center bg-fluent-subtle/30 rounded-fluent border border-dashed border-fluent-border space-y-2.5">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <CalendarX className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-fluent-text">
                          Tidak Ada Sesi Bimbingan
                        </p>
                        <p className="text-[11px] text-fluent-textSecondary max-w-xs mx-auto mt-0.5">
                          Tidak ada jadwal bimbingan pada tanggal ini. Seluruh kuota sesi siswa pada periode ini telah selesai atau belum dijadwalkan.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Footer Controls */}
              <div className="pt-3 border-t border-fluent-border flex items-center justify-between">
                <span className="text-[11px] text-fluent-textSecondary">
                  {isSameDay(selectedDate, today) ? '📅 Menampilkan jadwal hari ini' : `📅 Jadwal tanggal terpilih (${selectedDaySessions.length} Sesi)`}
                </span>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 bg-white border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded-fluent text-xs font-semibold transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  ) : null
}
