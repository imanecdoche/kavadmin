import React, { useState, useMemo, useEffect } from 'react'
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  MessageSquare, 
  Eye, 
  BookOpen, 
  CalendarCheck2,
  CalendarX,
  Calendar,
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DAYS_INDONESIAN,
  formatDateKey,
  getAggregatedSessionsMap
} from '../../utils/scheduleManager'

const DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export const QuickSessionCalendarModal = ({
  isOpen = true,
  onClose,
  students = [],
  onViewStudent,
  onSelectStudent,
  onOpenRoadmap,
}) => {
  const today = useMemo(() => new Date(), [])

  // Currently viewed month in calendar
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))

  // Currently selected date
  const [selectedDate, setSelectedDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), today.getDate()))

  // Reset to today when modal opens
  useEffect(() => {
    if (isOpen) {
      const now = new Date()
      setSelectedDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()))
      setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1))
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

  // Fallback sessions data
  const mockFallbackSessionsByDate = useMemo(() => ({
    '2026-09-05': [
      {
        id: 's1',
        timeLabel: '09.00 WIB',
        sessionNumber: 6,
        totalQuota: 12,
        packageType: 'GROW',
        paymentStatus: 'BELUM',
        studentName: 'Alya',
        grade: '12 SMA',
        phone: '6287772130407',
        moduleTitle: 'GROW — Elementary Grammar & Active Fluency',
        student: null,
      },
    ],
    '2026-09-06': [
      {
        id: 's2',
        timeLabel: '09.00 WIB',
        sessionNumber: 5,
        totalQuota: 12,
        packageType: 'GROW',
        paymentStatus: 'LUNAS',
        studentName: 'Hana',
        grade: '10 MA',
        phone: '6283833287361',
        moduleTitle: 'GROW — Elementary Grammar & Active Fluency',
        student: null,
      },
    ],
  }), [])

  // Dynamic real data from scheduleManager
  const aggregatedSessionsMap = useMemo(() => {
    if (students && students.length > 0) {
      return getAggregatedSessionsMap(students)
    }
    return mockFallbackSessionsByDate
  }, [students, mockFallbackSessionsByDate])

  // Helper date comparison
  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    )
  }

  // Generate calendar grid for currentMonthDate
  const calendarGrid = useMemo(() => {
    const year = currentMonthDate.getFullYear()
    const month = currentMonthDate.getMonth()

    const firstDayIndex = new Date(year, month, 1).getDay()
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate()
    const totalDaysPrevMonth = new Date(year, month, 0).getDate()

    const cells = []

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, totalDaysPrevMonth - i)
      const key = formatDateKey(d)
      const sessions = aggregatedSessionsMap[key] || []
      cells.push({
        dateObj: d,
        dayNum: totalDaysPrevMonth - i,
        isCurrentMonth: false,
        sessionsCount: sessions.length,
        sessions,
      })
    }

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const d = new Date(year, month, day)
      const key = formatDateKey(d)
      const sessions = aggregatedSessionsMap[key] || []
      cells.push({
        dateObj: d,
        dayNum: day,
        isCurrentMonth: true,
        sessionsCount: sessions.length,
        sessions,
      })
    }

    const remainingCells = 42 - cells.length
    for (let day = 1; day <= remainingCells; day++) {
      const d = new Date(year, month + 1, day)
      const key = formatDateKey(d)
      const sessions = aggregatedSessionsMap[key] || []
      cells.push({
        dateObj: d,
        dayNum: day,
        isCurrentMonth: false,
        sessionsCount: sessions.length,
        sessions,
      })
    }

    return cells
  }, [currentMonthDate, aggregatedSessionsMap])

  // Selected date sessions
  const currentDaySessions = useMemo(() => {
    const key = formatDateKey(selectedDate)
    const rawList = aggregatedSessionsMap[key] || []

    return rawList.map((item, idx) => {
      const st = item.student || {}
      const sName = item.studentName || st.name || 'Siswa'
      const sGrade = [st.grade, st.address].filter(Boolean).join(' • ') || 'Siswa Kavio Edu'
      const sPackage = item.packageType || st.programTier || st.packageType || 'GROW'

      const totalInv = (st.valPerMonth || 0) * (st.durationMonths || 1)
      const paidPct = totalInv > 0 ? Math.min(100, Math.round(((st.paid || 0) / totalInv) * 100)) : 0
      let paymentStatus = 'PENDING'
      if ((st.paid || 0) >= totalInv && totalInv > 0) {
        paymentStatus = 'LUNAS'
      } else if ((st.paid || 0) > 0) {
        paymentStatus = `DP ${paidPct}%`
      }

      let phone = st.studentPhone || st.parentPhone || item.phone || ''
      if (phone) {
        phone = String(phone).replace(/\D/g, '')
        if (phone.startsWith('0')) phone = '62' + phone.slice(1)
      }

      const sessionNo = item.sessionNumber || (idx + 1)
      const totalQ = item.totalQuota || (st.totalSessions || 12)
      const sModule = item.moduleTitle || (st.learningTarget || `Pembelajaran Modul Sesi ${sessionNo}`)

      return {
        id: item.id || `cal-${key}-${idx}`,
        time: item.timeLabel || item.time || '09.00 WIB',
        sessionProgress: `Sesi ${sessionNo}/${totalQ}`,
        packageTier: sPackage,
        paymentStatus,
        studentName: sName,
        grade: sGrade,
        phone: phone || '',
        moduleName: sModule,
        rawStudent: st,
      }
    })
  }, [selectedDate, aggregatedSessionsMap])

  const handleStudentClick = (session) => {
    if (onSelectStudent && session.rawStudent) {
      onSelectStudent(session.rawStudent)
      if (onClose) onClose()
    } else if (onViewStudent) {
      onViewStudent(session.rawStudent || session)
      if (onClose) onClose()
    }
  }

  const handleRoadmapClick = (session) => {
    if (onOpenRoadmap) {
      onOpenRoadmap(session.rawStudent || session)
      if (onClose) onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogContent className="fixed inset-0 w-screen h-screen max-w-none max-h-none rounded-none p-0 overflow-hidden border-none bg-white dark:bg-neutral-900 font-sans text-[#111111] dark:text-neutral-100 flex flex-col m-0">
        
        {/* 1. HEADER MODAL (Zero Outline Strokes) */}
        <div className="p-5 sm:p-6 flex items-center justify-between border-none">
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-full bg-[#f5f5f5] dark:bg-neutral-800 text-[#111111] dark:text-white flex items-center justify-center shrink-0">
              <CalendarDays className="w-4 h-4 text-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base sm:text-lg font-bold text-[#111111] dark:text-white tracking-tight leading-none">
                  Kalender Ringkas Sesi Belajar
                </DialogTitle>
                <span className="text-[11px] font-semibold bg-[#f5f5f5] dark:bg-neutral-800 text-[#111111] dark:text-neutral-200 rounded-full px-2.5 py-0.5 border-none whitespace-nowrap flex-shrink-0">
                  Sesuai Kuota Paket
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-medium mt-1">
                Pemantauan jadwal sesi aktif sesuai kuota dan masa durasi bimbingan siswa.
              </p>
            </div>
          </div>
        </div>

        {/* 2. BODY DUA KOLOM (MATRIKS KALENDER & RINCIAN JADWAL) - Scrollable Flex */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          
          {/* KOLOM KIRI: MATRIKS KALENDER (5 COLS) */}
          <div className="lg:col-span-5 p-5 bg-[#f5f5f5] dark:bg-neutral-800/40 flex flex-col justify-between border-none">
            <div>
              {/* Header Kalender: Bulan, Tombol Hari Ini, Navigasi */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#111111] dark:text-white whitespace-nowrap">
                    {MONTH_NAMES_ID[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
                  </span>
                  <button
                    type="button"
                    onClick={handleGoToToday}
                    className="h-6 px-2.5 text-[11px] font-semibold bg-white dark:bg-neutral-700 text-[#111111] dark:text-white rounded-full border-none cursor-pointer whitespace-nowrap flex-shrink-0 transition-colors"
                  >
                    Hari Ini
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="h-7 w-7 rounded-full bg-white dark:bg-neutral-700 text-[#111111] dark:text-white flex items-center justify-center border-none cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="h-7 w-7 rounded-full bg-white dark:bg-neutral-700 text-[#111111] dark:text-white flex items-center justify-center border-none cursor-pointer transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Header Nama Hari */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {DAYS_SHORT.map((day, idx) => (
                  <span
                    key={day}
                    className={`text-[11px] font-bold py-1 ${
                      idx === 0 ? 'text-neutral-900 font-extrabold dark:text-white' : 'text-neutral-400'
                    }`}
                  >
                    {day}
                  </span>
                ))}
              </div>

              {/* Grid Tanggal Kalender (Solid-Filled Only) */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {calendarGrid.map((cell, idx) => {
                  const isSelected = isSameDay(cell.dateObj, selectedDate)
                  const isCurrentDay = isSameDay(cell.dateObj, today)
                  const hasSessions = cell.sessionsCount > 0

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedDate(cell.dateObj)
                        if (!cell.isCurrentMonth) {
                          setCurrentMonthDate(new Date(cell.dateObj.getFullYear(), cell.dateObj.getMonth(), 1))
                        }
                      }}
                      className={`h-11 rounded-xl flex flex-col items-center justify-center relative transition-colors text-xs font-semibold border-none cursor-pointer ${
                        !cell.isCurrentMonth
                          ? 'text-neutral-300 dark:text-neutral-600'
                          : isSelected
                          ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111] shadow-xs'
                          : isCurrentDay
                          ? 'bg-neutral-200 dark:bg-neutral-700 text-[#111111] dark:text-white'
                          : 'text-[#111111] dark:text-neutral-200 hover:bg-white/60 dark:hover:bg-neutral-700/50'
                      }`}
                    >
                      <span className="leading-none">{cell.dayNum}</span>
                      
                      {/* Badge Bulat Penanda Sesi (Solid Token) */}
                      {hasSessions && (
                        <div
                          className={`mt-1 flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold font-mono border-none ${
                            isSelected
                              ? 'bg-white text-[#111111] dark:bg-[#111111] dark:text-white'
                              : 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                          }`}
                        >
                          {cell.sessionsCount}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Legend Kalender (Zero Status Bullets) */}
            <div className="pt-4 mt-4 flex items-center justify-between text-[11px] text-neutral-500 border-none">
              <span className="whitespace-nowrap">Hitam: Ada Sesi Belajar</span>
              <span className="whitespace-nowrap">Abu-abu: Hari Ini</span>
            </div>
          </div>

          {/* KOLOM KANAN: RINCIAN JADWAL HARIAN (7 COLS) */}
          <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between bg-white dark:bg-neutral-900 border-none">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1 whitespace-nowrap">
                Rincian Jadwal Harian
              </span>

              {/* Tanggal Terpilih & Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CalendarCheck2 className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                  <h3 className="text-sm sm:text-base font-bold text-[#111111] dark:text-white whitespace-nowrap">
                    {DAYS_INDONESIAN[selectedDate.getDay()]}, {selectedDate.getDate()} {MONTH_NAMES_ID[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                  </h3>
                </div>

                <span className="bg-[#f5f5f5] dark:bg-neutral-800 text-[#111111] dark:text-neutral-200 text-xs font-semibold px-3 py-0.5 rounded-full border-none whitespace-nowrap flex-shrink-0">
                  {currentDaySessions.length} Sesi Terjadwal
                </span>
              </div>

              {/* List Kartu Sesi Hari Ini */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {currentDaySessions.length > 0 ? (
                  currentDaySessions.map((session) => (
                    <div
                      key={session.id}
                      className="rounded-2xl border-none bg-[#f5f5f5] dark:bg-neutral-800 p-4 space-y-3"
                    >
                      {/* Baris Meta Atas */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 font-mono text-xs font-semibold text-[#111111] dark:text-neutral-200 bg-white dark:bg-neutral-900 px-2.5 py-1 rounded-full border-none whitespace-nowrap flex-shrink-0">
                            <Clock className="w-3 h-3 text-neutral-500" />
                            <span>{session.time}</span>
                          </div>

                          <span className="text-[11px] font-mono font-medium text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-900 rounded-full px-2.5 py-0.5 border-none whitespace-nowrap flex-shrink-0">
                            {session.sessionProgress}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold bg-[#111111] text-white dark:bg-white dark:text-[#111111] rounded-full px-2.5 py-0.5 border-none whitespace-nowrap flex-shrink-0">
                            Paket {session.packageTier}
                          </span>
                          <span className="text-[10px] font-bold rounded-full px-2.5 py-0.5 bg-white dark:bg-neutral-900 text-[#111111] dark:text-white border-none whitespace-nowrap flex-shrink-0">
                            {session.paymentStatus}
                          </span>
                        </div>
                      </div>

                      {/* Baris Nama Siswa & Action Buttons */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center text-[#111111] dark:text-white shrink-0">
                            <User className="w-4 h-4 text-current" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#111111] dark:text-white block leading-tight whitespace-nowrap">
                              {session.studentName}
                            </span>
                            <span className="text-[11px] text-neutral-500 leading-tight whitespace-nowrap">
                              {session.grade}
                            </span>
                          </div>
                        </div>

                        {/* Action Icons */}
                        <div className="flex items-center gap-1">
                          {session.phone ? (
                            <a
                              href={`https://wa.me/${session.phone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="h-8 w-8 rounded-full bg-white dark:bg-neutral-900 text-[#111111] dark:text-white hover:bg-[#111111] hover:text-white dark:hover:bg-white dark:hover:text-[#111111] flex items-center justify-center border-none transition-colors"
                              title="Chat WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span className="h-8 w-8 rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center text-neutral-400 opacity-60 cursor-not-allowed border-none">
                              <MessageSquare className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleStudentClick(session)}
                            className="h-8 w-8 rounded-full bg-white dark:bg-neutral-900 text-[#111111] dark:text-white hover:bg-[#111111] hover:text-white dark:hover:bg-white dark:hover:text-[#111111] border-none flex items-center justify-center cursor-pointer transition-colors"
                            title="Lihat Profil Siswa"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRoadmapClick(session)}
                            className="h-8 w-8 rounded-full bg-white dark:bg-neutral-900 text-[#111111] dark:text-white hover:bg-[#111111] hover:text-white dark:hover:bg-white dark:hover:text-[#111111] border-none flex items-center justify-center cursor-pointer transition-colors"
                            title="Buka Roadmap Belajar"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Detail Modul */}
                      <div className="rounded-xl border-none bg-white dark:bg-neutral-900 p-2.5 text-[11px] text-neutral-700 dark:text-neutral-300">
                        <span className="font-semibold text-[#111111] dark:text-white">Modul: </span>
                        {session.moduleName}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 border-none rounded-2xl text-center bg-[#f5f5f5] dark:bg-neutral-800/40">
                    <CalendarX className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
                    <p className="text-xs text-neutral-400 font-medium whitespace-nowrap">
                      Tidak ada jadwal sesi bimbingan pada tanggal ini.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Note Status Bawah (Zero Emojis, Clean SVG) */}
            <div className="pt-4 text-xs text-neutral-500 flex items-center gap-1.5 border-none">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span className="whitespace-nowrap">
                {isSameDay(selectedDate, today)
                  ? 'Menampilkan jadwal hari ini'
                  : `Menampilkan jadwal untuk tanggal ${selectedDate.getDate()} ${MONTH_NAMES_ID[selectedDate.getMonth()]}`}
              </span>
            </div>
          </div>

        </div>

        {/* 3. FOOTER MODAL (Sticky at bottom, Solid Token) */}
        <div className="p-4 sm:px-6 bg-[#f5f5f5] dark:bg-neutral-800/80 flex items-center justify-end border-none sticky bottom-0 inset-x-0 z-10 mt-auto">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-5 text-xs font-semibold bg-[#111111] hover:bg-[#2b2b2b] text-white rounded-full border-none cursor-pointer whitespace-nowrap flex-shrink-0 transition-colors shadow-xs"
          >
            Tutup
          </button>
        </div>

      </DialogContent>
    </Dialog>
  )
}

export default QuickSessionCalendarModal
