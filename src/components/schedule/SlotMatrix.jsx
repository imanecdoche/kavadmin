import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Calendar, Check, Lock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatDateKey } from '../../utils/scheduleManager'

const DEFAULT_TIME_SLOTS = [
  { id: '09.00', label: '09.00 WIB' },
  { id: '13.00', label: '13.00 WIB' },
  { id: '15.00', label: '15.00 WIB' },
]

export const SlotMatrix = ({
  weeksData = [],
  aggregatedSessionsMap = {},
  timeSlots = DEFAULT_TIME_SLOTS,
  onOpenCalendar,
  onSlotClick,
}) => {
  const [selectedWeek, setSelectedWeek] = useState('w0')

  // Fallback static weeks if no dynamic data provided
  const fallbackWeeks = [
    {
      weekIndex: 0,
      id: 'w0',
      title: 'Pekan 1 (Minggu Ini)',
      dateRange: '31 Agu - 6 Sep',
      days: [
        { dayName: 'Senin', formattedDate: '31 AGU', dateObj: new Date() },
        { dayName: 'Selasa', formattedDate: '1 SEP', dateObj: new Date() },
        { dayName: 'Rabu', formattedDate: '2 SEP', dateObj: new Date() },
        { dayName: 'Kamis', formattedDate: '3 SEP', dateObj: new Date() },
        { dayName: 'Jumat', formattedDate: '4 SEP', dateObj: new Date() },
        { dayName: 'Sabtu', formattedDate: '5 SEP', dateObj: new Date() },
        { dayName: 'Minggu', formattedDate: '6 SEP', dateObj: new Date() },
      ],
    },
    {
      weekIndex: 1,
      id: 'w1',
      title: 'Pekan 2 (Minggu Depan)',
      dateRange: '7 Sep - 13 Sep',
      days: [],
    },
    {
      weekIndex: 2,
      id: 'w2',
      title: 'Pekan 3',
      dateRange: '14 Sep - 20 Sep',
      days: [],
    },
    {
      weekIndex: 3,
      id: 'w3',
      title: 'Pekan 4',
      dateRange: '21 Sep - 27 Sep',
      days: [],
    },
  ]

  const activeWeeksList = weeksData && weeksData.length > 0 ? weeksData : fallbackWeeks

  const weekTabs = [
    ...activeWeeksList.map((wk, idx) => ({
      id: `w${idx}`,
      weekIndex: idx,
      label: wk.title || `Pekan ${idx + 1}`,
      range: wk.dateRange || '',
    })),
    {
      id: 'all',
      weekIndex: 'ALL',
      label: 'Semua Pekan',
      range: '',
    },
  ]

  const weeksToDisplay =
    selectedWeek === 'all'
      ? activeWeeksList
      : [activeWeeksList.find((_, idx) => `w${idx}` === selectedWeek) || activeWeeksList[0]]

  return (
    <Card className="rounded-lg border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
      {/* 1. MASTER HEADER & LEGEND (Zero Outline Strokes, Zero Decorative Dots) */}
      <CardHeader className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base sm:text-lg font-bold text-[#111111] dark:text-white tracking-tight">
            Matriks Ketersediaan Slot (4 Pekan)
          </CardTitle>
          <p className="text-xs text-neutral-500 font-medium mt-1">
            Monitoring slot bimbingan belajar aktif dan ketersediaan kuota harian
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenCalendar}
            className="h-8 text-xs font-semibold gap-1.5 bg-[#f5f5f5] hover:bg-[#e5e5e5] dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[#111111] dark:text-white rounded-md px-3.5 border-none cursor-pointer flex items-center whitespace-nowrap flex-shrink-0 shadow-2xs transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Kalender Sesi</span>
          </button>

          {/* Indikator Status Legend (Solid Tokens, Zero Status Bullets) */}
          <div className="flex items-center gap-2 text-xs font-medium">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#f5f5f5] dark:bg-neutral-800 text-[#111111] dark:text-neutral-200 border-none text-xs font-semibold whitespace-nowrap flex-shrink-0">
              <Check className="w-3.5 h-3.5 text-current" />
              <span className="whitespace-nowrap">Tersedia</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#111111] text-white dark:bg-neutral-700 border-none text-xs font-semibold whitespace-nowrap flex-shrink-0">
              <Lock className="w-3.5 h-3.5 text-current" />
              <span className="whitespace-nowrap">Terkunci</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* 2. WEEK SELECTOR PILLS (Solid-Filled Tokens) */}
        <div className="p-1 rounded-md bg-[#f5f5f5] dark:bg-neutral-800 inline-flex items-center gap-1 overflow-x-auto max-w-full no-scrollbar border-none">
          {weekTabs.map((w) => {
            const isActive = selectedWeek === w.id
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => setSelectedWeek(w.id)}
                className={`relative whitespace-nowrap px-3.5 py-1.5 rounded-md text-xs font-semibold border-none cursor-pointer flex-shrink-0 transition-colors ${
                  isActive
                    ? 'text-white dark:text-[#111111]'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="slot-matrix-week-pill"
                    transition={{
                      type: 'spring',
                      damping: 26,
                      stiffness: 360,
                      mass: 0.72,
                    }}
                    className="absolute inset-0 bg-[#111111] dark:bg-white rounded-md shadow-xs -z-10"
                  />
                )}
                <span className="relative z-10 whitespace-nowrap">{w.label}</span>
                {w.range && (
                  <span
                    className={`relative z-10 ml-1.5 text-[11px] font-normal whitespace-nowrap ${
                      isActive ? 'text-white/80 dark:text-neutral-600' : 'text-neutral-400'
                    }`}
                  >
                    ({w.range})
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* 3. WEEKS DISPLAY CONTAINER */}
        <div className="space-y-5">
          {weeksToDisplay.map((wk, wkIdx) => {
            const weekTitle = wk.title || `Pekan ${wk.weekIndex !== undefined ? wk.weekIndex + 1 : wkIdx + 1}`
            const weekRange = wk.dateRange ? ` (${wk.dateRange})` : ''

            return (
              <div
                key={wk.weekIndex ?? wkIdx}
                className="rounded-lg border border-neutral-100 dark:border-neutral-800 bg-[#f5f5f5] dark:bg-neutral-800/60 p-4 sm:p-5 space-y-4 shadow-2xs"
              >
                {/* Active Week Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-white dark:bg-neutral-900 text-[#111111] dark:text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <CalendarDays className="w-4 h-4 text-current" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#111111] dark:text-white whitespace-nowrap">
                      {weekTitle}{weekRange}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 px-2.5 py-1 rounded-md border-none whitespace-nowrap flex-shrink-0 shadow-2xs">
                    7 Hari x 3 Slot Harian
                  </span>
                </div>

                {/* 4. SEVEN COLUMNS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {(wk.days || []).map((dayItem, dIdx) => {
                    const dateKey = dayItem.dateObj ? formatDateKey(dayItem.dateObj) : ''
                    const daySessions = aggregatedSessionsMap[dateKey] || []

                    return (
                      <div
                        key={dayItem.dayName || dIdx}
                        className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800 p-3 flex flex-col gap-2.5 shadow-2xs"
                      >
                        {/* Header Tanggal & Nama Hari */}
                        <div className="text-center pb-2">
                          <span className="block font-mono text-[10px] font-medium text-neutral-400 tracking-wider whitespace-nowrap">
                            {dayItem.formattedDate || dayItem.date || '-'}
                          </span>
                          <span className="block font-bold text-xs text-[#111111] dark:text-white leading-tight mt-0.5 whitespace-nowrap">
                            {dayItem.dayName}
                          </span>
                        </div>

                        {/* Slot List */}
                        <div className="space-y-2 flex-1 flex flex-col justify-start">
                          {timeSlots.map((slotObj, sIdx) => {
                            const timeLabel = slotObj.label || `${slotObj.id || slotObj.time || '09.00'} WIB`
                            const sessionOnSlot = daySessions.find(
                              (s) => s.timeLabel === timeLabel || s.time === slotObj.id || s.time === timeLabel
                            )
                            const isBooked = Boolean(sessionOnSlot)

                            if (isBooked && sessionOnSlot) {
                              return (
                                <div
                                  key={sIdx}
                                  onClick={() => onSlotClick && onSlotClick(sessionOnSlot, dayItem)}
                                  className="rounded-md border-none bg-[#111111] text-white dark:bg-neutral-800 p-2.5 cursor-pointer text-left shadow-2xs"
                                >
                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    <span className="font-mono text-[11px] font-bold text-white whitespace-nowrap">
                                      {timeLabel}
                                    </span>
                                    <Lock className="w-3 h-3 text-white shrink-0" />
                                  </div>
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-xs font-bold text-white truncate whitespace-nowrap">
                                      {sessionOnSlot.studentName || sessionOnSlot.name || 'Siswa'}
                                    </span>
                                    <span className="bg-white/20 text-white border-none text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                                      {sessionOnSlot.sessionNumber ? `Sesi ${sessionOnSlot.sessionNumber}` : 'Terjadwal'}
                                    </span>
                                  </div>
                                  <span className="block text-[10px] font-mono text-neutral-300 mt-1 whitespace-nowrap">
                                    {sessionOnSlot.packageType ? `Paket ${sessionOnSlot.packageType}` : (sessionOnSlot.programTier || 'GROW')}
                                  </span>
                                </div>
                              )
                            }

                            return (
                              <div
                                key={sIdx}
                                onClick={() => onSlotClick && onSlotClick({ time: timeLabel, isBooked: false }, dayItem)}
                                className="rounded-md border-none bg-[#f5f5f5] dark:bg-neutral-800 p-2.5 flex items-center justify-between hover:bg-[#e5e5e5] dark:hover:bg-neutral-700 cursor-pointer group text-left transition-colors"
                              >
                                <span className="font-mono text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                                  {timeLabel}
                                </span>
                                <Check className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#111111] dark:group-hover:text-white" />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default SlotMatrix
