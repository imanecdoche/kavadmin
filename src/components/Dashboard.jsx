import React, { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  Users,
  AlertCircle,
  AlertTriangle,
  Calendar,
  X,
  Lock,
  Check,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { SimpleTooltip } from '@/components/ui/tooltip'
import DashboardStudentStats from './dashboard/DashboardStudentStats'
import StudentsStats from './students/StudentsStats'
import UpcomingSessions from './dashboard/UpcomingSessions'
import StudentTableView from './students/StudentTable'
import StudentViewSwitcher from './students/StudentViewSwitcher'
import SlotMatrix from './schedule/SlotMatrix'
import StudentDetailModal from './students/StudentDetailModal'
import AddStudentModal from './students/AddStudentModal'
import UpcomingSessionsDetailModal from './dashboard/UpcomingSessionsDetailModal'
import QuickSessionCalendarModal from './dashboard/QuickSessionCalendarModal'
import {
  getAggregatedSessionsMap,
  getUpcomingSessions3DaysValidated,
  formatDateKey
} from '../utils/scheduleManager'

export const PACKAGE_RATES = {
  SEED: { valPerMonth: 150000, sessionsPerMonth: 3, minutesPerSession: 60 },
  GROW: { valPerMonth: 200000, sessionsPerMonth: 4, minutesPerSession: 60 },
  BOOST: { valPerMonth: 400000, sessionsPerMonth: 8, minutesPerSession: 60 },
  MASTER: { valPerMonth: 500000, sessionsPerMonth: 8, minutesPerSession: 90 },
}

const DAYS_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
const TIME_SLOTS_LIST = [
  { id: '09.00', label: '09.00 WIB', subtitle: 'Jam 9 Pagi' },
  { id: '13.00', label: '13.00 WIB', subtitle: 'Jam 1 Siang' },
  { id: '15.00', label: '15.00 WIB', subtitle: 'Jam 3 Sore' }
]

// Helper to format Indonesian Phone Numbers: +62 821-1150-0190
export const formatIndonesianPhoneNumber = (inputVal) => {
  if (!inputVal) return '+62 '

  let str = String(inputVal)
  let digits = str.replace(/\D/g, '')

  if (digits.startsWith('62')) {
    digits = digits.slice(2)
  }

  while (digits.startsWith('0')) {
    digits = digits.slice(1)
  }

  if (!digits) return '+62 '
  digits = digits.slice(0, 12)

  const part1 = digits.slice(0, 3)
  const part2 = digits.slice(3, 7)
  const part3 = digits.slice(7, 12)

  let formatted = '+62 ' + part1
  if (part2) formatted += '-' + part2
  if (part3) formatted += '-' + part3

  return formatted
}


// Helper to calculate 4 consecutive weeks starting from current Monday
const getFourWeeksData = () => {
  const today = new Date()
  const currentDay = today.getDay()
  const distToMonday = currentDay === 0 ? -6 : 1 - currentDay
  const mondayOfThisWeek = new Date(today)
  mondayOfThisWeek.setDate(today.getDate() + distToMonday)
  mondayOfThisWeek.setHours(0, 0, 0, 0)

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const weeks = []

  for (let w = 0; w < 4; w++) {
    const weekDays = []
    const weekStart = new Date(mondayOfThisWeek)
    weekStart.setDate(mondayOfThisWeek.getDate() + (w * 7))

    for (let d = 0; d < 7; d++) {
      const dateObj = new Date(weekStart)
      dateObj.setDate(weekStart.getDate() + d)

      const dayName = DAYS_LIST[d]
      const dayNum = dateObj.getDate()
      const formattedDate = `${dayNum} ${monthNames[dateObj.getMonth()]}`

      weekDays.push({
        dayName,
        dateObj,
        formattedDate
      })
    }

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    const dayNumStart = weekStart.getDate()
    const monthStart = monthNames[weekStart.getMonth()]
    const dayNumEnd = weekEnd.getDate()
    const monthEnd = monthNames[weekEnd.getMonth()]

    weeks.push({
      weekIndex: w,
      title: w === 0 ? 'Pekan 1 (Minggu Ini)' : w === 1 ? 'Pekan 2 (Minggu Depan)' : `Pekan ${w + 1}`,
      dateRange: `${dayNumStart} ${monthStart} - ${dayNumEnd} ${monthEnd}`,
      days: weekDays
    })
  }

  return weeks
}

export default function Dashboard({
  students = [],
  setStudents,
  onGenerateInvoice,
  onOpenRoadmap,
  onOpenReportCard = null,
  onOpenCertificate = null,
  reports = [],
  activeTab = 'dashboard'
}) {

  // View Mode: 'table' or 'matrix' with sliding transition direction
  const [viewMode, setViewModeState] = useState('table')
  const [slideDirection, setSlideDirection] = useState(0)

  useEffect(() => {
    if (activeTab === 'students') {
      setViewModeState('table')
      setSlideDirection(-1)
    } else if (activeTab === 'schedule') {
      setViewModeState('matrix')
      setSlideDirection(1)
    }
  }, [activeTab])

  const handleSetViewMode = (newMode) => {
    if (newMode === viewMode) return
    setSlideDirection(newMode === 'matrix' ? 1 : -1)
    setViewModeState(newMode)
  }

  const fourWeeks = getFourWeeksData()

  // Selected student for Profile Drawer
  const [viewingStudent, setViewingStudent] = useState(null)

  // Upcoming Sessions Popup Modal State
  const [isUpcomingModalOpen, setIsUpcomingModalOpen] = useState(false)
  const [isSlotCalendarOpen, setIsSlotCalendarOpen] = useState(false)

  // Modal State for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)

  // Custom Dialog Delete State & 5-Second Safety Lock
  const [deleteId, setDeleteId] = useState(null)
  const [deleteCountdown, setDeleteCountdown] = useState(5)

  useEffect(() => {
    if (!deleteId) {
      setDeleteCountdown(5)
      return
    }

    setDeleteCountdown(5)
    const interval = setInterval(() => {
      setDeleteCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [deleteId])

  // Lock body scroll whenever ANY modal/popup is open
  useEffect(() => {
    const isAnyModalOpen = isModalOpen || !!deleteId || isUpcomingModalOpen || isSlotCalendarOpen || !!viewingStudent
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden'
      document.documentElement.classList.add('lenis-stopped')
    } else {
      document.body.style.overflow = ''
      document.documentElement.classList.remove('lenis-stopped')
    }
    return () => {
      document.body.style.overflow = ''
      document.documentElement.classList.remove('lenis-stopped')
    }
  }, [isModalOpen, deleteId, isUpcomingModalOpen, isSlotCalendarOpen, viewingStudent])

  // Calculations for KPIs
  const safeStudentsList = Array.isArray(students) ? students : []
  const totalActiveStudents = safeStudentsList.length
  const totalMonthlyRevenue = safeStudentsList.reduce((acc, curr) => acc + (Number(curr?.paid) || 0), 0)
  const totalOutstanding = safeStudentsList.reduce((acc, curr) => {
    const totalInv = (curr?.valPerMonth || 0) * (curr?.durationMonths || 1)
    const out = totalInv - (Number(curr?.paid) || 0)
    return acc + (out > 0 ? out : 0)
  }, 0)

  const totalGrossInvestment = totalMonthlyRevenue + totalOutstanding
  const revenueRealizationPct = totalGrossInvestment > 0 ? Math.min(100, Math.round((totalMonthlyRevenue / totalGrossInvestment) * 100)) : 100

  const outstandingStudentsCount = safeStudentsList.filter(s => {
    const totalInv = (s?.valPerMonth || 0) * (s?.durationMonths || 1)
    return (totalInv - (Number(s?.paid) || 0)) > 0
  }).length

  // Total Hours and Total Sessions calculation
  const totalSessionsOverall = safeStudentsList.reduce((acc, curr) => acc + ((curr?.sessionsPerMonth || 0) * (curr?.durationMonths || 1)), 0)
  const totalStudyMinutesOverall = safeStudentsList.reduce((acc, curr) => {
    const sessions = (curr?.sessionsPerMonth || 0) * (curr?.durationMonths || 1)
    const mins = curr?.minutesPerSession || 60
    return acc + (sessions * mins)
  }, 0)

  // Agregasi seluruh sesi tervalidasi kuota
  const aggregatedSessionsMap = useMemo(() => {
    return getAggregatedSessionsMap(safeStudentsList)
  }, [safeStudentsList])

  // Upcoming 3 Days Sessions calculation (Strictly Quota-Bound)
  const upcoming3DaysData = useMemo(() => {
    return getUpcomingSessions3DaysValidated(safeStudentsList)
  }, [safeStudentsList])
  const totalUpcoming3DaysCount = upcoming3DaysData.reduce((acc, curr) => acc + curr.sessions.length, 0)


  // Open Modal for Create or Edit
  const openModal = (student = null) => {
    setEditingStudent(student)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingStudent(null)
  }

  // Handle Save Student from AddStudentModal
  const handleSaveStudent = (studentData) => {
    const finalStudentData = {
      ...studentData,
      id: editingStudent ? editingStudent.id : (studentData.id || Date.now().toString()),
      invoices: editingStudent ? (editingStudent.invoices || []) : []
    }

    if (editingStudent) {
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? finalStudentData : s))
    } else {
      setStudents(prev => [finalStudentData, ...prev])
    }

    closeModal()
  }

  // Confirm Delete Handler
  const confirmDelete = () => {
    if (deleteId) {
      setStudents(prev => prev.filter(s => s.id !== deleteId))
      setDeleteId(null)
    }
  }

  const formatIDR = (amount, rpSize = 'text-[0.68em]') => {
    const numStr = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(amount || 0)
    return (
      <span className="inline-flex items-baseline font-semibold tracking-tight">
        <span className={`${rpSize} font-bold text-muted-foreground mr-0.5 select-none`}>Rp</span>
        <span>{numStr}</span>
      </span>
    )
  }

  const smoothTransition = {
    duration: 0.22,
    ease: [0.23, 1, 0.32, 1]
  }

  const viewSlideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 18 : dir < 0 ? -18 : 0,
      scale: 0.99,
      opacity: 0
    }),
    center: {
      x: 0,
      scale: 1,
      opacity: 1,
      transition: {
        x: { duration: 0.20, ease: [0.23, 1, 0.32, 1] },
        scale: { duration: 0.20, ease: [0.34, 1.28, 0.64, 1] },
        opacity: { duration: 0.18, ease: 'easeOut' }
      }
    },
    exit: (dir) => ({
      x: dir > 0 ? -18 : dir < 0 ? 18 : 0,
      scale: 0.99,
      opacity: 0,
      transition: {
        x: { duration: 0.16, ease: [0.23, 1, 0.32, 1] },
        scale: { duration: 0.15, ease: [0.23, 1, 0.32, 1] },
        opacity: { duration: 0.14, ease: 'easeOut' }
      }
    })
  }

  return (
    <motion.div layout transition={smoothTransition} className="space-y-6 pb-12">
      {activeTab === 'students' ? (
        <div className="space-y-6">
          {/* Matriks Khusus Tab Siswa: Siswa Aktif, Siswa Selesai, Total Siswa */}
          <StudentsStats
            students={safeStudentsList}
            onAddStudent={() => openModal(null)}
          />

          {/* Tabel Lengkap Data Siswa dengan Filter, Sorting & Multi-Field Search */}
          <StudentTableView
            students={safeStudentsList}
            onViewDetail={(student) => setViewingStudent(student)}
            onOpenInvoice={(student) => onGenerateInvoice(student)}
            onOpenRoadmap={onOpenRoadmap ? (student) => onOpenRoadmap(student) : null}
            onEditStudent={(student) => openModal(student)}
            onDeleteStudent={(student) => setDeleteId(student.id)}
          />
        </div>
      ) : activeTab === 'schedule' ? (
        <div className="space-y-6">
          {/* Tab Jadwal Khusus: Matriks Ketersediaan Slot 4 Pekan */}
          <SlotMatrix
            weeksData={fourWeeks}
            aggregatedSessionsMap={aggregatedSessionsMap}
            timeSlots={TIME_SLOTS_LIST}
            onOpenCalendar={() => setIsSlotCalendarOpen(true)}
            onSlotClick={(sessionOrSlot) => {
              if (sessionOrSlot?.student) {
                setViewingStudent(sessionOrSlot.student)
              }
            }}
          />
        </div>
      ) : (
        <>
          {/* Top Header & 4 Stat Cards Dashboard */}
          <DashboardStudentStats
            students={students}
            paidRevenue={totalMonthlyRevenue}
            outstandingRevenue={totalOutstanding}
            totalHours={totalStudyMinutesOverall / 60}
            totalSessions={totalSessionsOverall}
            paidPercentage={revenueRealizationPct}
            pendingCount={outstandingStudentsCount}
            onAddStudent={() => openModal(null)}
          />

          {/* Section: Sesi Mendatang 3 Hari Ke Depan */}
          <UpcomingSessions
            sessionsData={upcoming3DaysData}
            onOpenDetail={() => setIsUpcomingModalOpen(true)}
          />

          {/* View Mode Toggle Bar (DAFTAR SISWA / MATRIKS JADWAL) */}
          <StudentViewSwitcher
            activeView={viewMode}
            onViewChange={handleSetViewMode}
          />

          {/* Switchable View Containers with Directional Slide Transition */}
          <AnimatePresence mode="wait" custom={slideDirection} initial={false}>
            {viewMode === 'table' ? (
              <motion.div
                key="view-table"
                custom={slideDirection}
                variants={viewSlideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                layout="position"
                transition={smoothTransition}
              >
                <StudentTableView
                  students={safeStudentsList}
                  onViewDetail={(student) => setViewingStudent(student)}
                  onOpenInvoice={(student) => onGenerateInvoice(student)}
                  onOpenRoadmap={onOpenRoadmap ? (student) => onOpenRoadmap(student) : null}
                  onEditStudent={(student) => openModal(student)}
                  onDeleteStudent={(student) => setDeleteId(student.id)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="view-matrix"
                custom={slideDirection}
                variants={viewSlideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                layout="position"
                transition={smoothTransition}
              >
                <SlotMatrix
                  weeksData={fourWeeks}
                  aggregatedSessionsMap={aggregatedSessionsMap}
                  timeSlots={TIME_SLOTS_LIST}
                  onOpenCalendar={() => setIsSlotCalendarOpen(true)}
                  onSlotClick={(sessionOrSlot) => {
                    if (sessionOrSlot?.student) {
                      setViewingStudent(sessionOrSlot.student)
                    }
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Modal Popup: Detail Siswa (shadcn/ui Minimalist) */}
      <StudentDetailModal
        isOpen={Boolean(viewingStudent)}
        student={students.find((s) => s.id === viewingStudent?.id) || viewingStudent}
        onClose={() => setViewingStudent(null)}
        onOpenInvoice={(st) => {
          setViewingStudent(null)
          onGenerateInvoice(st)
        }}
        onOpenRoadmap={(st) => {
          setViewingStudent(null)
          if (onOpenRoadmap) onOpenRoadmap(st)
        }}
        onOpenReport={(st) => {
          setViewingStudent(null)
          if (onOpenReportCard) onOpenReportCard(st)
        }}
        onOpenCertificate={(st) => {
          setViewingStudent(null)
          if (onOpenCertificate) onOpenCertificate(st)
        }}
      />

      {/* Modal Popup: Detail Sesi Mendatang (shadcn/ui Minimalist) */}
      <UpcomingSessionsDetailModal
        isOpen={isUpcomingModalOpen}
        onClose={() => setIsUpcomingModalOpen(false)}
        upcoming3DaysData={upcoming3DaysData}
        totalUpcoming3DaysCount={totalUpcoming3DaysCount}
        onSelectStudent={(st) => setViewingStudent(st)}
        getCleanWhatsAppPhone={(st) => {
          if (!st) return null
          const candidates = [st.studentPhone, st.parentPhone]
          for (const phone of candidates) {
            if (!phone) continue
            let digits = String(phone).replace(/\D/g, '')
            if (digits.startsWith('0')) digits = '62' + digits.slice(1)
            if (digits.startsWith('62') && digits.length >= 10) return digits
          }
          return null
        }}
        createSessionReminderMessage={(st, dayItem, sess) => {
          const recipientName = st?.name || 'Siswa'
          const dateStr = dayItem?.dateFormatted || 'sesi mendatang'
          const timeStr = sess?.timeLabel || ''
          return `Halo, ini pengingat sesi bimbingan belajar Kavio Edu untuk ${recipientName} pada ${dateStr} jam ${timeStr}. Mohon persiapkan diri. Terima kasih.`
        }}
      />

      {/* Modal Popup: Kalender Ringkas Sesi Belajar (shadcn/ui Minimalist) */}
      <QuickSessionCalendarModal
        isOpen={isSlotCalendarOpen}
        onClose={() => setIsSlotCalendarOpen(false)}
        students={students}
        onSelectStudent={(st) => setViewingStudent(st)}
        onOpenRoadmap={onOpenRoadmap}
      />

      {/* Add / Edit Student Modal Form (shadcn/ui Minimalist) */}
      <AddStudentModal
        isOpen={isModalOpen}
        onClose={closeModal}
        editingStudent={editingStudent}
        existingStudents={students}
        onSubmit={handleSaveStudent}
      />

      {/* Custom Confirmation Modal for Delete (Sensitive & Crucial) - Portal & Extreme Minimalism */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {deleteId && (
            <motion.div
              data-lenis-prevent="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={() => setDeleteId(null)}
              className="fixed inset-0 top-0 left-0 w-screen h-screen z-50 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-4 overflow-y-auto"
            >
              <motion.div
                data-lenis-prevent="true"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-neutral-900 text-[#111111] dark:text-neutral-100 rounded-t-[16px] md:rounded-3xl border-none shadow-2xl w-full md:max-w-md p-6 space-y-4 my-0 md:my-auto will-change-transform"
              >
                
                {/* Header */}
                <div className="flex items-center gap-3 pb-2">
                  <div className="w-8 h-8 rounded-full bg-[#f5f5f5] dark:bg-neutral-800 text-[#111111] dark:text-white flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-current" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#111111] dark:text-white leading-tight">
                      Konfirmasi Hapus Siswa
                    </h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Tindakan administratif sensitif & permanen
                    </p>
                  </div>
                </div>

                {/* Warning Box (Solid-Filled, Zero Outline Strokes) */}
                <div className="bg-[#f5f5f5] dark:bg-neutral-800 border-none rounded-2xl p-4 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-neutral-700 dark:text-neutral-300 shrink-0 mt-0.5" />
                    <p className="font-bold text-[#111111] dark:text-white leading-snug">
                      PERINGATAN: Tindakan ini tidak dapat diurungkan!
                    </p>
                  </div>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-300 pl-6 leading-relaxed">
                    Apakah Anda yakin ingin menghapus data siswa ini? Seluruh data profil, reservasi slot, dan riwayat invoice terkait akan dihapus secara permanen dari sistem.
                  </p>
                </div>

                {/* Action Buttons & Countdown Footer (Solid-Filled Tokens) */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setDeleteId(null)}
                      className="rounded-full h-9 px-4 text-xs font-semibold bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#111111] dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-white border-none cursor-pointer whitespace-nowrap flex-shrink-0 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={deleteCountdown > 0}
                      onClick={confirmDelete}
                      className="rounded-full h-9 px-5 text-xs font-bold bg-[#111111] hover:bg-[#2b2b2b] text-white border-none cursor-pointer whitespace-nowrap flex-shrink-0 disabled:opacity-50 transition-colors shadow-xs"
                    >
                      {deleteCountdown > 0 ? `Ya, Hapus Data (${deleteCountdown}s)` : 'Ya, Hapus Data'}
                    </button>
                  </div>

                  <div className="text-right text-[11px]">
                    {deleteCountdown > 0 ? (
                      <span className="text-neutral-600 dark:text-neutral-400 font-semibold">
                        Tombol Hapus akan aktif dalam {deleteCountdown} detik...
                      </span>
                    ) : (
                      <span className="text-neutral-700 dark:text-neutral-300 font-semibold">
                        Tombol Hapus telah aktif. Silakan konfirmasi jika Anda yakin.
                      </span>
                    )}
                  </div>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </motion.div>
  )
}
