import React, { useState, useMemo } from 'react'
import { 
  CalendarDays, 
  Search, 
  Clock, 
  MessageSquare, 
  ArrowUpRight, 
  Calendar 
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export const UpcomingSessionsDetailModal = ({
  isOpen = true,
  onClose,
  upcoming3DaysData,
  totalUpcoming3DaysCount,
  onSelectStudent,
  onViewProfile,
  getCleanWhatsAppPhone,
  createSessionReminderMessage,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilterDay, setActiveFilterDay] = useState('all')

  const defaultScheduleDays = [
    {
      id: 'today',
      filterKey: 'today',
      tag: 'Hari Ini',
      dateLabel: 'Sabtu, 5 Sep',
      isToday: true,
      sessions: [
        {
          id: 's1',
          time: '09.00 WIB',
          studentName: 'Alya',
          studentGrade: '12 SMA • Pandeglang, Banten',
          packageTier: 'GROW',
          phone: '6287772130407',
          learningTarget: 'Lulus Ujian PTN & Speaking Confidence',
          rawStudent: null,
        },
      ],
    },
    {
      id: 'tomorrow',
      filterKey: 'tomorrow',
      tag: 'Besok',
      dateLabel: 'Minggu, 6 Sep',
      isToday: false,
      sessions: [
        {
          id: 's2',
          time: '09.00 WIB',
          studentName: 'Hana',
          studentGrade: '10 MA • Pandeglang City',
          packageTier: 'GROW',
          phone: '6283833287361',
          learningTarget: 'Persiapan TOEFL & Academic Writing',
          rawStudent: null,
        },
      ],
    },
    {
      id: 'dayAfter',
      filterKey: 'dayAfter',
      tag: 'Lusa',
      dateLabel: 'Senin, 7 Sep',
      isToday: false,
      sessions: [],
    },
  ]

  const scheduleDays = useMemo(() => {
    if (!upcoming3DaysData || !Array.isArray(upcoming3DaysData) || upcoming3DaysData.length === 0) {
      return defaultScheduleDays
    }

    return upcoming3DaysData.map((dayItem, idx) => {
      const filterKey = idx === 0 ? 'today' : idx === 1 ? 'tomorrow' : idx === 2 ? 'dayAfter' : `day-${idx}`
      const isToday = dayItem.dateLabel === 'Hari Ini' || idx === 0
      const tag = dayItem.dateLabel || (idx === 0 ? 'Hari Ini' : idx === 1 ? 'Besok' : 'Lusa')
      const dateLabel = dayItem.dateFormatted || dayItem.dayName || ''

      const sessions = (dayItem.sessions || []).map((sess, sIdx) => {
        const student = sess.student || {}
        const sName = sess.studentName || student.name || 'Siswa'
        const sGrade = sess.studentGrade || [student.grade, student.address].filter(Boolean).join(' • ') || 'Siswa Kavio Edu'
        const packageTier = sess.packageTier || student.programTier || student.packageType || 'GROW'

        let phone = null
        if (getCleanWhatsAppPhone && sess.student) {
          phone = getCleanWhatsAppPhone(sess.student)
        } else {
          const candidates = [sess.phone, student.studentPhone, student.parentPhone]
          for (const cand of candidates) {
            if (!cand) continue
            let digits = String(cand).replace(/\D/g, '')
            if (digits.startsWith('0')) digits = '62' + digits.slice(1)
            if (digits.startsWith('62') && digits.length >= 10) {
              phone = digits
              break
            }
          }
        }

        const learningTarget = sess.learningTarget || student.learningTarget || 'Bimbingan belajar private interaktif'

        return {
          id: sess.id || `s-${idx}-${sIdx}`,
          time: sess.time || sess.timeLabel || '09.00 WIB',
          studentName: sName,
          studentGrade: sGrade,
          packageTier,
          phone,
          learningTarget,
          rawStudent: sess.student || null,
          rawSession: sess,
          rawDayItem: dayItem,
        }
      })

      return {
        id: dayItem.dateKey || filterKey,
        filterKey,
        tag,
        dateLabel,
        isToday,
        sessions,
      }
    })
  }, [upcoming3DaysData, getCleanWhatsAppPhone])

  const filteredDays = useMemo(() => {
    return scheduleDays
      .filter((day) => activeFilterDay === 'all' || day.filterKey === activeFilterDay)
      .map((day) => {
        if (!searchQuery.trim()) return day
        const q = searchQuery.toLowerCase()
        const matchedSessions = day.sessions.filter(
          (s) =>
            s.studentName.toLowerCase().includes(q) ||
            s.learningTarget.toLowerCase().includes(q) ||
            s.packageTier.toLowerCase().includes(q) ||
            s.studentGrade.toLowerCase().includes(q) ||
            s.time.toLowerCase().includes(q)
        )
        return { ...day, sessions: matchedSessions }
      })
  }, [scheduleDays, searchQuery, activeFilterDay])

  const totalScheduled = totalUpcoming3DaysCount ?? scheduleDays.reduce((acc, d) => acc + d.sessions.length, 0)

  const handleProfileClick = (session) => {
    if (onSelectStudent && session.rawStudent) {
      onSelectStudent(session.rawStudent)
    } else if (onViewProfile) {
      onViewProfile(session.rawStudent || session)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogContent className="fixed inset-0 w-screen h-screen max-w-none max-h-none rounded-none p-0 overflow-hidden border-none bg-white dark:bg-neutral-900 font-sans text-[#111111] dark:text-neutral-100 flex flex-col m-0">
        
        {/* 1. HEADER SECTION (Zero Outline Strokes, Centered on Mobile) */}
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-none">
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-full bg-[#f5f5f5] dark:bg-neutral-800 text-[#111111] dark:text-white flex items-center justify-center shrink-0">
              <CalendarDays className="w-4 h-4 text-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base sm:text-lg font-bold text-[#111111] dark:text-white tracking-tight leading-none">
                  Detail Sesi Bimbingan Mendatang
                </DialogTitle>
                <span className="text-[11px] font-semibold bg-[#f5f5f5] dark:bg-neutral-800 text-[#111111] dark:text-neutral-300 rounded-full px-2.5 py-0.5 border-none whitespace-nowrap flex-shrink-0">
                  3 Hari Ke Depan
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-medium mt-1">
                Rincian jadwal bimbingan, materi/target belajar, dan pengingat WhatsApp langsung.
              </p>
            </div>
          </div>

          <span className="bg-[#111111] text-white dark:bg-neutral-800 dark:text-neutral-200 border-none text-xs font-semibold px-3.5 py-1 rounded-full self-start sm:self-auto whitespace-nowrap flex-shrink-0">
            {totalScheduled} Sesi Terjadwal
          </span>
        </div>

        {/* 2. SEARCH & FILTER CONTROLS (Solid Tokens) */}
        <div className="p-4 sm:px-6 bg-[#f5f5f5] dark:bg-neutral-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 border-none">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Cari nama siswa, target materi, atau paket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs border-none bg-white dark:bg-neutral-900 text-[#111111] dark:text-white rounded-full focus:ring-0 placeholder:text-neutral-400"
            />
          </div>

          {/* Segmented Filter Pills */}
          <div className="p-1 rounded-full bg-white dark:bg-neutral-900 inline-flex items-center gap-1 overflow-x-auto w-full sm:w-auto border-none no-scrollbar">
            {[
              { key: 'all', label: 'Semua (3 Hari)' },
              { key: 'today', label: 'Hari Ini' },
              { key: 'tomorrow', label: 'Besok' },
              { key: 'dayAfter', label: 'Lusa' },
            ].map((tab) => {
              const isActive = activeFilterDay === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveFilterDay(tab.key)}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border-none cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 3. 3-COLUMN DAYS GRID (Scrollable Locked Content) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          <div className={`grid gap-4 ${activeFilterDay === 'all' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 max-w-xl mx-auto'}`}>
            {filteredDays.map((day) => {
              const count = day.sessions.length

              return (
                <div
                  key={day.id}
                  className={`rounded-2xl border-none p-4 flex flex-col justify-between transition-all ${
                    day.isToday
                      ? 'bg-[#f0f0f0] dark:bg-neutral-800'
                      : 'bg-[#f5f5f5] dark:bg-neutral-800/60'
                  }`}
                >
                  {/* Sub-header Hari */}
                  <div className="flex items-center justify-between pb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border-none whitespace-nowrap flex-shrink-0 ${
                          day.isToday ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]' : 'bg-[#e5e5e5] text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200'
                        }`}
                      >
                        {day.tag}
                      </span>
                      <span className="text-xs font-bold text-[#111111] dark:text-white whitespace-nowrap">
                        {day.dateLabel}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono font-medium bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 rounded-full px-2.5 py-0.5 border-none whitespace-nowrap flex-shrink-0">
                      {count} Sesi
                    </span>
                  </div>

                  {/* List Kartu Sesi */}
                  <div className="pt-2 space-y-3 flex-1 flex flex-col justify-start">
                    {count > 0 ? (
                      day.sessions.map((session) => {
                        const hasPhone = Boolean(session.phone)
                        let waHref = null
                        if (hasPhone) {
                          const reminderText = createSessionReminderMessage && session.rawStudent && session.rawDayItem && session.rawSession
                            ? createSessionReminderMessage(session.rawStudent, session.rawDayItem, session.rawSession)
                            : `Halo, ini pengingat sesi bimbingan belajar Kavio Edu untuk ${session.studentName} pada ${day.dateLabel} jam ${session.time}. Mohon persiapkan diri. Terima kasih.`
                          waHref = `https://wa.me/${session.phone}?text=${encodeURIComponent(reminderText)}`
                        }

                        return (
                          <div
                            key={session.id}
                            className="rounded-2xl border-none bg-white dark:bg-neutral-900 p-3.5 space-y-3 shadow-2xs"
                          >
                            {/* Sesi Meta Row */}
                            <div className="flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200 bg-[#f5f5f5] dark:bg-neutral-800 px-2.5 py-1 rounded-full font-mono text-[11px] font-semibold border-none whitespace-nowrap flex-shrink-0">
                                <Clock className="w-3 h-3 text-neutral-500" />
                                <span>{session.time}</span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono font-bold bg-[#f5f5f5] dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-full px-2.5 py-0.5 border-none whitespace-nowrap flex-shrink-0">
                                  {session.packageTier}
                                </span>

                                {hasPhone ? (
                                  <a
                                    href={waHref}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-[#111111] hover:bg-[#2b2b2b] dark:bg-neutral-700 px-2.5 py-0.5 rounded-full border-none whitespace-nowrap flex-shrink-0 transition-colors"
                                  >
                                    <MessageSquare className="w-3 h-3 text-current" />
                                    <span>WA</span>
                                  </a>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-400 bg-[#f5f5f5] dark:bg-neutral-800 px-2.5 py-0.5 rounded-full border-none opacity-60 cursor-not-allowed whitespace-nowrap flex-shrink-0">
                                    <MessageSquare className="w-3 h-3 text-current" />
                                    <span>WA</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Info Siswa */}
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#111111] dark:text-white whitespace-nowrap">
                                  {session.studentName}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleProfileClick(session)}
                                  className="text-[11px] font-medium text-neutral-600 hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white hover:underline flex items-center gap-0.5 border-none cursor-pointer whitespace-nowrap"
                                >
                                  <span>Lihat Profil</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-[11px] text-neutral-500 mt-0.5 truncate whitespace-nowrap">
                                {session.studentGrade}
                              </p>
                            </div>

                            {/* Target Belajar Box */}
                            <div className="rounded-xl border-none bg-[#f5f5f5] dark:bg-neutral-800 p-2.5 text-[11px]">
                              <span className="font-bold text-neutral-400 block text-[9.5px] uppercase tracking-wider mb-0.5 whitespace-nowrap">
                                Target Belajar:
                              </span>
                              <span className="text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed block line-clamp-2">
                                {session.learningTarget}
                              </span>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="h-full min-h-[140px] flex flex-col items-center justify-center border-none rounded-2xl p-4 text-center bg-white dark:bg-neutral-900">
                        <Calendar className="w-5 h-5 text-neutral-300 mb-1.5" />
                        <p className="text-xs text-neutral-400 whitespace-nowrap">
                          Tidak ada sesi bimbingan pada hari ini
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 4. FOOTER SECTION (Sticky at bottom, Solid Tokens) */}
        <div className="p-4 sm:px-6 bg-[#f5f5f5] dark:bg-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-none sticky bottom-0 inset-x-0 z-10 mt-auto">
          <div className="flex items-center gap-2 text-xs text-neutral-500 flex-wrap">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">Ringkasan:</span>
            {scheduleDays.map((d, i) => (
              <span key={i} className="text-[10px] font-mono bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 rounded-full px-2.5 py-0.5 border-none whitespace-nowrap flex-shrink-0">
                {d.tag}: {d.sessions.length} Sesi
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-9 px-5 text-xs font-semibold bg-[#111111] hover:bg-[#2b2b2b] text-white rounded-full self-end sm:self-auto border-none cursor-pointer whitespace-nowrap flex-shrink-0 transition-colors shadow-xs"
          >
            Tutup Jendela
          </button>
        </div>

      </DialogContent>
    </Dialog>
  )
}

export default UpcomingSessionsDetailModal
