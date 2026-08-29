import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Users,
  DollarSign,
  AlertCircle,
  AlertTriangle,
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  FileText,
  MessageSquare,
  Eye,
  Phone,
  Clock,
  BookOpen,
  Lock,
  Check,
  Grid,
  List,
  Maximize2,
  ChevronRight,
  ChevronDown,
  ExternalLink
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import StudentProfileDrawer from './StudentProfileDrawer'
import UpcomingSessionsModal from './UpcomingSessionsModal'
import SlotCalendarModal from './SlotCalendarModal'
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

  // Extract all digits
  let digits = str.replace(/\D/g, '')

  // Remove leading country code 62 if present
  if (digits.startsWith('62')) {
    digits = digits.slice(2)
  }

  // Remove leading zeros '0'
  while (digits.startsWith('0')) {
    digits = digits.slice(1)
  }

  if (!digits) return '+62 '

  // Limit digits length to maximum 12 digits
  digits = digits.slice(0, 12)

  const part1 = digits.slice(0, 3)
  const part2 = digits.slice(3, 7)
  const part3 = digits.slice(7, 12)

  let formatted = '+62 ' + part1
  if (part2) formatted += '-' + part2
  if (part3) formatted += '-' + part3

  return formatted
}

// Helper function to calculate occupied slots across all students
const getOccupiedSlotsMap = (studentsList, currentEditingId = null) => {
  const occupiedMap = {}
  if (!Array.isArray(studentsList)) return occupiedMap

  studentsList.forEach(st => {
    if (!st || !st.id) return
    if (currentEditingId && st.id === currentEditingId) return

    let slots = st.selectedSlots && Array.isArray(st.selectedSlots) ? [...st.selectedSlots] : []

    if (slots.length === 0 && st.schedule) {
      DAYS_LIST.forEach(day => {
        TIME_SLOTS_LIST.forEach(slotObj => {
          if (st.schedule.includes(day) && st.schedule.includes(slotObj.id)) {
            slots.push(`${day} ${slotObj.label}`)
          }
        })
      })
    }

    slots.forEach(slotKey => {
      occupiedMap[slotKey] = {
        studentId: st.id,
        studentName: st.name || 'Siswa',
        packageType: st.packageType || 'GROW',
        durationMonths: st.durationMonths || 1
      }
    })
  })

  return occupiedMap
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

// Helper to calculate upcoming sessions for the next 3 days
const getUpcomingSessions3Days = (studentsList) => {
  const dayNamesIndonesian = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const monthNamesIndonesian = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

  const today = new Date()
  const resultDays = []

  for (let i = 0; i < 3; i++) {
    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() + i)

    const dayName = dayNamesIndonesian[targetDate.getDay()]
    const dayNum = targetDate.getDate()
    const monthName = monthNamesIndonesian[targetDate.getMonth()]
    const dateFormatted = `${dayName}, ${dayNum} ${monthName}`

    const dateLabel = i === 0 ? 'Hari Ini' : i === 1 ? 'Besok' : 'Lusa'

    const sessions = []

    if (Array.isArray(studentsList)) {
      studentsList.forEach(st => {
        if (!st) return

        let slots = st.selectedSlots && Array.isArray(st.selectedSlots) ? [...st.selectedSlots] : []

        if (slots.length === 0 && st.schedule) {
          DAYS_LIST.forEach(day => {
            TIME_SLOTS_LIST.forEach(slotObj => {
              if (st.schedule.includes(day) && st.schedule.includes(slotObj.id)) {
                slots.push(`${day} ${slotObj.label}`)
              }
            })
          })
        }

        slots.forEach(slotStr => {
          if (typeof slotStr === 'string' && slotStr.toLowerCase().includes(dayName.toLowerCase())) {
            let timeLabel = ''
            TIME_SLOTS_LIST.forEach(ts => {
              if (slotStr.includes(ts.id) || slotStr.includes(ts.label)) {
                timeLabel = ts.label
              }
            })
            if (!timeLabel) {
              timeLabel = slotStr.replace(dayName, '').trim() || 'Jadwal Sesi'
            }

            sessions.push({
              student: st,
              slotStr,
              timeLabel
            })
          }
        })
      })
    }

    sessions.sort((a, b) => a.timeLabel.localeCompare(b.timeLabel))

    resultDays.push({
      dateObj: targetDate,
      dayName,
      dateFormatted,
      dateLabel,
      sessions
    })
  }

  return resultDays
}

// Helper to extract clean WhatsApp phone number (studentPhone first, fallback to parentPhone)
const getCleanWhatsAppPhone = (student) => {
  if (!student) return null

  const candidates = [student.studentPhone, student.parentPhone]

  for (const phone of candidates) {
    if (!phone) continue
    let digits = String(phone).replace(/\D/g, '')

    if (digits.startsWith('0')) {
      digits = '62' + digits.slice(1)
    }

    if (digits.startsWith('62') && digits.length >= 10) {
      return digits
    }
  }

  return null
}

// Helper to construct WhatsApp session reminder message
const createSessionReminderMessage = (student, dayItem, sess) => {
  const recipientName = student.name || 'Siswa'
  const dateStr = dayItem.dateFormatted || 'sesi mendatang'
  const timeStr = sess.timeLabel || ''

  return `Halo, ini pengingat sesi bimbingan belajar Kavio Edu untuk ${recipientName} pada ${dateStr} jam ${timeStr}. Mohon persiapkan diri. Terima kasih.`
}

export default function Dashboard({
  students,
  setStudents,
  onGenerateInvoice,
  onOpenRoadmap,
  onOpenReportCard = null,
  onOpenCertificate = null,
  reports = []
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [packageFilter, setPackageFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [dayFilter, setDayFilter] = useState('ALL')

  // View Mode: 'table' or 'matrix' with sliding transition direction
  const [viewMode, setViewModeState] = useState('table')
  const [slideDirection, setSlideDirection] = useState(0)

  const handleSetViewMode = (newMode) => {
    if (newMode === viewMode) return
    setSlideDirection(newMode === 'matrix' ? 1 : -1)
    setViewModeState(newMode)
  }
  const [matrixWeekTab, setMatrixWeekTab] = useState(0) // 0 = Pekan 1, 1 = Pekan 2, 2 = Pekan 3, 3 = Pekan 4, 'ALL' = Semua Pekan

  const fourWeeks = getFourWeeksData()

  // Selected student for Profile Drawer
  const [viewingStudent, setViewingStudent] = useState(null)

  // Upcoming Sessions Popup Modal State & Collapsible State
  const [isUpcomingModalOpen, setIsUpcomingModalOpen] = useState(false)
  const [isSlotCalendarOpen, setIsSlotCalendarOpen] = useState(false)
  const [isUpcomingCollapsed, setIsUpcomingCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('kavio_dashboard_upcoming_collapsed')
      return saved === 'true'
    } catch (e) {
      return false
    }
  })

  const toggleUpcomingCollapse = () => {
    setIsUpcomingCollapsed(prev => {
      const nextVal = !prev
      try {
        localStorage.setItem('kavio_dashboard_upcoming_collapsed', String(nextVal))
      } catch (e) {}
      return nextVal
    })
  }

  // Modal State for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeFormTab, setActiveFormTab] = useState('profile') // 'profile', 'contact', 'course'
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

  // Form State Roadmap 02 Extended Schema
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Laki-laki',
    age: '',
    grade: '',
    address: '',
    learningTarget: '',
    parentName: '',
    parentPhone: '',
    studentPhone: '',
    packageType: 'GROW',
    customValPerMonth: 200000,
    customSessionsPerMonth: 4,
    customMinutesPerSession: 60,
    durationMonths: 1,
    paid: 0,
    schedule: '',
    selectedSlots: [],
    notes: ''
  })

  // Calculate occupied slots map
  const occupiedSlotsMap = getOccupiedSlotsMap(students, editingStudent ? editingStudent.id : null)

  // Calculations for KPIs
  const totalActiveStudents = students.length
  const totalMonthlyRevenue = students.reduce((acc, curr) => acc + (Number(curr.paid) || 0), 0)
  const totalOutstanding = students.reduce((acc, curr) => {
    const totalInv = (curr.valPerMonth || 0) * (curr.durationMonths || 1)
    const out = totalInv - (Number(curr.paid) || 0)
    return acc + (out > 0 ? out : 0)
  }, 0)

  const totalGrossInvestment = totalMonthlyRevenue + totalOutstanding
  const revenueRealizationPct = totalGrossInvestment > 0 ? Math.min(100, Math.round((totalMonthlyRevenue / totalGrossInvestment) * 100)) : 100

  const outstandingStudentsCount = students.filter(s => {
    const totalInv = (s.valPerMonth || 0) * (s.durationMonths || 1)
    return (totalInv - (Number(s.paid) || 0)) > 0
  }).length

  // Total Hours and Total Sessions calculation
  const totalSessionsOverall = students.reduce((acc, curr) => acc + ((curr.sessionsPerMonth || 0) * (curr.durationMonths || 1)), 0)
  const totalStudyMinutesOverall = students.reduce((acc, curr) => {
    const sessions = (curr.sessionsPerMonth || 0) * (curr.durationMonths || 1)
    const mins = curr.minutesPerSession || 60
    return acc + (sessions * mins)
  }, 0)

  // Agregasi seluruh sesi tervalidasi kuota
  const aggregatedSessionsMap = useMemo(() => {
    return getAggregatedSessionsMap(students)
  }, [students])

  // Upcoming 3 Days Sessions calculation (Strictly Quota-Bound)
  const upcoming3DaysData = useMemo(() => {
    return getUpcomingSessions3DaysValidated(students)
  }, [students])
  const totalUpcoming3DaysCount = upcoming3DaysData.reduce((acc, curr) => acc + curr.sessions.length, 0)

  // Filtered Students List
  const safeStudentsList = Array.isArray(students) ? students : []

  const filteredStudents = safeStudentsList.filter(student => {
    if (!student) return false
    const search = searchTerm.toLowerCase()
    const sName = (student.name || '').toLowerCase()
    const pName = (student.parentName || '').toLowerCase()
    const addr = (student.address || '').toLowerCase()
    const pPhone = student.parentPhone || ''
    const sPhone = student.studentPhone || ''

    const matchesSearch =
      sName.includes(search) ||
      pName.includes(search) ||
      addr.includes(search) ||
      pPhone.includes(search) ||
      sPhone.includes(search)

    const matchesPackage = packageFilter === 'ALL' || student.packageType === packageFilter

    let status = 'PENDING'
    const totalInv = (student.valPerMonth || 0) * (student.durationMonths || 1)
    const paidPct = totalInv > 0 ? Math.min(100, Math.round(((student.paid || 0) / totalInv) * 100)) : 0
    if ((student.paid || 0) >= totalInv && totalInv > 0) {
      status = 'LUNAS'
    } else if ((student.paid || 0) > 0) {
      status = `DP ${paidPct}%`
    }

    const matchesStatus = statusFilter === 'ALL'
      || (statusFilter === 'DP' && status.startsWith('DP'))
      || status === statusFilter

    const matchesDay = dayFilter === 'ALL' || (student.schedule && student.schedule.toLowerCase().includes(dayFilter.toLowerCase()))

    return matchesSearch && matchesPackage && matchesStatus && matchesDay
  })

  // Open Modal for Create or Edit
  const openModal = (student = null) => {
    setActiveFormTab('profile')
    if (student) {
      setEditingStudent(student)
      let initialSlots = student.selectedSlots && Array.isArray(student.selectedSlots) ? [...student.selectedSlots] : []
      if (initialSlots.length === 0 && student.schedule) {
        DAYS_LIST.forEach(day => {
          TIME_SLOTS_LIST.forEach(slotObj => {
            if (student.schedule.includes(day) && student.schedule.includes(slotObj.id)) {
              initialSlots.push(`${day} ${slotObj.label}`)
            }
          })
        })
      }

      setFormData({
        name: student.name || '',
        gender: student.gender || 'Laki-laki',
        age: student.age || '',
        grade: student.grade || '',
        address: student.address || '',
        learningTarget: student.learningTarget || '',
        parentName: student.parentName || '',
        parentPhone: student.parentPhone ? formatIndonesianPhoneNumber(student.parentPhone) : '+62 ',
        studentPhone: student.studentPhone ? formatIndonesianPhoneNumber(student.studentPhone) : '+62 ',
        packageType: student.packageType || 'GROW',
        customValPerMonth: student.valPerMonth || 200000,
        customSessionsPerMonth: student.sessionsPerMonth || 4,
        customMinutesPerSession: student.minutesPerSession || 60,
        durationMonths: student.durationMonths || 1,
        paid: student.paid || 0,
        schedule: student.schedule || '',
        selectedSlots: initialSlots,
        notes: student.notes || ''
      })
    } else {
      setEditingStudent(null)
      setFormData({
        name: '',
        gender: 'Laki-laki',
        age: '',
        grade: '',
        address: '',
        learningTarget: '',
        parentName: '',
        parentPhone: '+62 ',
        studentPhone: '+62 ',
        packageType: 'GROW',
        customValPerMonth: 200000,
        customSessionsPerMonth: 4,
        customMinutesPerSession: 60,
        durationMonths: 1,
        paid: 0,
        schedule: '',
        selectedSlots: [],
        notes: ''
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingStudent(null)
  }

  // Calculate live numbers for Modal form
  let currentValPerMonth = 0
  let currentSessionsPerMonth = 0
  let currentMinutesPerSession = 60

  if (formData.packageType === 'CUSTOM') {
    currentValPerMonth = Number(formData.customValPerMonth) || 0
    currentSessionsPerMonth = Number(formData.customSessionsPerMonth) || 0
    currentMinutesPerSession = Number(formData.customMinutesPerSession) || 60
  } else {
    const rate = PACKAGE_RATES[formData.packageType] || PACKAGE_RATES.GROW
    currentValPerMonth = rate.valPerMonth
    currentSessionsPerMonth = rate.sessionsPerMonth
    currentMinutesPerSession = rate.minutesPerSession
  }

  const currentDuration = Number(formData.durationMonths) || 1
  const currentTotalInvestment = currentValPerMonth * currentDuration
  const currentTotalSessions = currentSessionsPerMonth * currentDuration
  const currentTotalStudyMinutes = currentTotalSessions * currentMinutesPerSession

  // Toggle slot selection in form modal
  const handleToggleSlotInModal = (slotKey) => {
    const currentSlots = formData.selectedSlots || []
    let updatedSlots = []
    if (currentSlots.includes(slotKey)) {
      updatedSlots = currentSlots.filter(s => s !== slotKey)
    } else {
      updatedSlots = [...currentSlots, slotKey]
    }

    setFormData({
      ...formData,
      selectedSlots: updatedSlots,
      schedule: updatedSlots.join(' & ')
    })
  }

  // Handle Save Student
  const handleSaveStudent = (e) => {
    e.preventDefault()

    const studentData = {
      id: editingStudent ? editingStudent.id : Date.now().toString(),
      name: formData.name,
      gender: formData.gender,
      age: Number(formData.age) || 0,
      grade: formData.grade,
      address: formData.address,
      learningTarget: formData.learningTarget,
      parentName: formData.parentName,
      parentPhone: formData.parentPhone,
      studentPhone: formData.studentPhone,
      packageType: formData.packageType,
      valPerMonth: currentValPerMonth,
      sessionsPerMonth: currentSessionsPerMonth,
      minutesPerSession: currentMinutesPerSession,
      durationMonths: currentDuration,
      totalSessions: currentTotalSessions,
      totalStudyMinutes: currentTotalStudyMinutes,
      totalInvestment: currentTotalInvestment,
      paid: Number(formData.paid) || 0,
      outstanding: Math.max(0, currentTotalInvestment - (Number(formData.paid) || 0)),
      schedule: formData.schedule || 'Jadwal belum ditentukan',
      selectedSlots: formData.selectedSlots || [],
      notes: formData.notes,
      invoices: editingStudent ? (editingStudent.invoices || []) : []
    }

    if (editingStudent) {
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? studentData : s))
    } else {
      setStudents(prev => [studentData, ...prev])
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

  const formatIDR = (amount, rpSize = 'text-[0.65em]') => {
    const numStr = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(amount || 0)
    return (
      <span className="inline-flex items-baseline">
        <span className={`${rpSize} font-semibold opacity-45 mr-0.5 select-none`}>Rp</span>
        <span>{numStr}</span>
      </span>
    )
  }

  // Apple / Fluent Design ultra-smooth deceleration curve for seamless 60fps layout shifts
  const smoothTransition = {
    duration: 0.42,
    ease: [0.16, 1, 0.3, 1]
  }

  // Directional sliding variants for Daftar Siswa <-> Matriks Jadwal
  const viewSlideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 36 : dir < 0 ? -36 : 0,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.28, ease: 'easeOut' }
      }
    },
    exit: (dir) => ({
      x: dir > 0 ? -36 : dir < 0 ? 36 : 0,
      opacity: 0,
      transition: {
        x: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.16, ease: 'easeIn' }
      }
    })
  }

  return (
    <motion.div layout transition={smoothTransition} className="space-y-6 pb-12">

      {/* Top Title & Primary Actions */}
      <motion.div layout transition={smoothTransition} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-fluent-text tracking-tight">
            Dashboard Siswa
          </h1>
          <p className="text-xs text-fluent-textSecondary mt-0.5">
            Manajemen data siswa, reservasi slot, dan status pembayaran.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => openModal(null)}
            className="px-4 py-2 bg-fluent-blue hover:bg-fluent-blueHover text-white rounded-fluent shadow-xs transition-all flex items-center space-x-2 text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </motion.div>

      {/* 4 Dynamic Reconstructed KPI Cards Row - Responsive 2-Columns on Mobile */}
      <motion.div layout transition={smoothTransition} className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">

        {/* CARD 1: SISWA AKTIF */}
        <div className="group relative bg-white p-2.5 sm:p-5 rounded-lg sm:rounded-fluent border border-fluent-border hover:border-fluent-blue/50 shadow-fluent hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-fluent-blue rounded-t" />
          <div className="flex items-start justify-between gap-1.5 sm:gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fluent-blue opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-fluent-blue"></span>
                </span>
                <p className="text-[9px] sm:text-[11px] font-bold text-fluent-textSecondary uppercase tracking-wider truncate">
                  Siswa Aktif
                </p>
              </div>
              <p className="text-base sm:text-2xl lg:text-3xl font-extrabold text-fluent-text mt-1 sm:mt-2 tracking-tight">
                {totalActiveStudents} <span className="text-[11px] sm:text-sm font-semibold text-fluent-textSecondary font-normal">Siswa</span>
              </p>
            </div>
            <div className="p-1.5 sm:p-3 bg-blue-50 text-fluent-blue rounded-md sm:rounded-fluent group-hover:bg-fluent-blue group-hover:text-white transition-all duration-200 group-hover:scale-105 shadow-2xs shrink-0">
              <Users className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[9px] sm:text-xs gap-1">
            <span className="text-fluent-textSecondary font-medium truncate">
              <span className="hidden sm:inline">Status </span>Reservasi
            </span>
            <span className="font-bold text-fluent-blue bg-blue-50 px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[11px] border border-blue-100 whitespace-nowrap">
              100% Aktif
            </span>
          </div>
        </div>

        {/* CARD 2: PENDAPATAN TERBAYAR */}
        <div className="group relative bg-white p-2.5 sm:p-5 rounded-lg sm:rounded-fluent border border-fluent-border hover:border-emerald-500/50 shadow-fluent hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-emerald-500 rounded-t" />
          <div className="flex items-start justify-between gap-1.5 sm:gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-500"></span>
                </span>
                <p className="text-[9px] sm:text-[11px] font-bold text-emerald-800 uppercase tracking-wider truncate">
                  <span className="hidden sm:inline">Pendapatan </span>Terbayar
                </p>
              </div>
              <p className="text-xs xs:text-sm sm:text-2xl lg:text-3xl font-extrabold text-emerald-600 mt-1 sm:mt-2 tracking-tight truncate" title={formatIDR(totalMonthlyRevenue)}>
                {formatIDR(totalMonthlyRevenue)}
              </p>
            </div>
            <div className="w-6 h-6 sm:w-11 sm:h-11 bg-emerald-50 text-emerald-600 rounded-md sm:rounded-fluent group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 group-hover:scale-105 flex items-center justify-center font-extrabold text-[10px] sm:text-sm shadow-2xs shrink-0">
              Rp
            </div>
          </div>
          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[9px] sm:text-xs gap-1">
            <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
              <div className="w-8 sm:w-16 h-1 sm:h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${revenueRealizationPct}%` }}
                />
              </div>
              <span className="text-[8px] sm:text-[11px] font-semibold text-slate-500 whitespace-nowrap">{revenueRealizationPct}%</span>
            </div>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[11px] border border-emerald-100 whitespace-nowrap">
              Kas Masuk
            </span>
          </div>
        </div>

        {/* CARD 3: OUTSTANDING */}
        <div className="group relative bg-white p-2.5 sm:p-5 rounded-lg sm:rounded-fluent border border-fluent-border hover:border-amber-500/50 shadow-fluent hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-amber-500 rounded-t" />
          <div className="flex items-start justify-between gap-1.5 sm:gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 shrink-0">
                  {outstandingStudentsCount > 0 && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  )}
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-amber-500"></span>
                </span>
                <p className="text-[9px] sm:text-[11px] font-bold text-amber-800 uppercase tracking-wider truncate">
                  Outstanding
                </p>
              </div>
              <p className="text-xs xs:text-sm sm:text-2xl lg:text-3xl font-extrabold text-amber-600 mt-1 sm:mt-2 tracking-tight truncate" title={formatIDR(totalOutstanding)}>
                {formatIDR(totalOutstanding)}
              </p>
            </div>
            <div className="p-1.5 sm:p-3 bg-amber-50 text-amber-600 rounded-md sm:rounded-fluent group-hover:bg-amber-500 group-hover:text-white transition-all duration-200 group-hover:scale-105 shadow-2xs shrink-0">
              <AlertCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[9px] sm:text-xs gap-1">
            <span className="text-fluent-textSecondary font-medium truncate">
              {outstandingStudentsCount > 0 ? `${outstandingStudentsCount} Menunggu` : 'Semua Lunas'}
            </span>
            <span className={`font-bold px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[11px] border whitespace-nowrap ${
              outstandingStudentsCount > 0
                ? 'text-amber-700 bg-amber-50 border-amber-200'
                : 'text-emerald-700 bg-emerald-50 border-emerald-200'
            }`}>
              {outstandingStudentsCount > 0 ? 'Belum Lunas' : 'Nihil'}
            </span>
          </div>
        </div>

        {/* CARD 4: TOTAL JAM BELAJAR */}
        <div className="group relative bg-white p-2.5 sm:p-5 rounded-lg sm:rounded-fluent border border-fluent-border hover:border-purple-500/50 shadow-fluent hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-purple-600 rounded-t" />
          <div className="flex items-start justify-between gap-1.5 sm:gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-purple-600"></span>
                </span>
                <p className="text-[9px] sm:text-[11px] font-bold text-purple-900 uppercase tracking-wider truncate">
                  <span className="hidden sm:inline">Total </span>Jam Belajar
                </p>
              </div>
              <p className="text-base sm:text-2xl lg:text-3xl font-extrabold text-purple-700 mt-1 sm:mt-2 tracking-tight">
                {(totalStudyMinutesOverall / 60).toFixed(1)} <span className="text-[11px] sm:text-sm font-semibold text-fluent-textSecondary font-normal">Jam</span>
              </p>
            </div>
            <div className="p-1.5 sm:p-3 bg-purple-50 text-purple-600 rounded-md sm:rounded-fluent group-hover:bg-purple-600 group-hover:text-white transition-all duration-200 group-hover:scale-105 shadow-2xs shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[9px] sm:text-xs gap-1">
            <span className="text-fluent-textSecondary font-medium truncate">
              <span className="hidden sm:inline">Akumulasi </span>Kuota
            </span>
            <span className="font-bold text-purple-700 bg-purple-50 px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[11px] border border-purple-100 whitespace-nowrap">
              {totalSessionsOverall} Sesi
            </span>
          </div>
        </div>

      </motion.div>

      {/* Section: Sesi Mendatang 3 Hari Ke Depan (Divider Style - Downscaled) - Collapsible */}
      <motion.div
        layout
        transition={smoothTransition}
        className="border-y border-slate-200/80 py-2.5 sm:py-3 my-0.5"
      >
        {/* Header with Expand / Collapse Toggle */}
        <div
          onClick={toggleUpcomingCollapse}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer select-none group"
        >
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-fluent-blue/10 text-fluent-blue rounded-md group-hover:bg-fluent-blue/20 transition-colors">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-bold text-fluent-text group-hover:text-fluent-blue transition-colors flex items-center gap-1.5">
                  Sesi Mendatang (3 Hari)
                </h2>
                <AnimatePresence>
                  {isUpcomingCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.2 }}
                      className="text-[9px] sm:text-[10px] font-semibold text-fluent-textSecondary bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200"
                    >
                      Disembunyikan
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-[10px] sm:text-[11px] text-fluent-textSecondary">
                Ringkasan sesi bimbingan belajar 3 hari ke depan
              </p>
            </div>
          </div>

          <div
            className="flex items-center space-x-1.5 self-start sm:self-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence>
              {isUpcomingCollapsed && upcoming3DaysData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                  className="hidden lg:flex items-center space-x-1.5 text-[11px] text-fluent-textSecondary bg-slate-100/80 px-2 py-0.5 rounded-full border border-slate-200 mr-1"
                >
                  {upcoming3DaysData.map((d, i) => (
                    <span key={i} className="flex items-center space-x-1">
                      <span className="font-medium text-slate-600">{d.dateLabel}:</span>
                      <span className="font-bold text-fluent-blue">{d.sessions.length}</span>
                      {i < upcoming3DaysData.length - 1 && <span className="text-slate-300">•</span>}
                    </span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <span className="px-2 py-0.5 bg-fluent-blue/10 text-fluent-blue text-[10px] sm:text-[11px] font-bold rounded-full border border-fluent-blue/20">
              Total {totalUpcoming3DaysCount} Sesi
            </span>

            <button
              type="button"
              onClick={() => setIsUpcomingModalOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-fluent-blue hover:bg-fluent-blueDark text-white text-[10px] sm:text-[11px] font-semibold rounded shadow-2xs transition-all group/btn"
              title="Buka detail lengkap sesi mendatang dalam jendela popup"
            >
              <Maximize2 className="w-3 h-3 transition-transform group-hover/btn:scale-110" />
              <span>Detail</span>
            </button>

            <button
              type="button"
              onClick={toggleUpcomingCollapse}
              aria-expanded={!isUpcomingCollapsed}
              className="p-1 text-fluent-textSecondary hover:text-fluent-text hover:bg-slate-100 rounded border border-slate-200 transition-all flex items-center justify-center"
              title={isUpcomingCollapsed ? "Tampilkan Sesi Mendatang" : "Sembunyikan Sesi Mendatang"}
            >
              <motion.div
                animate={{ rotate: isUpcomingCollapsed ? -90 : 0 }}
                transition={smoothTransition}
              >
                <ChevronDown className="w-3.5 h-3.5 text-slate-600 group-hover:text-fluent-blue transition-colors" />
              </motion.div>
            </button>
          </div>
        </div>

        {/* Collapsible Content Area */}
        <AnimatePresence initial={false}>
          {!isUpcomingCollapsed && (
            <motion.div
              key="upcoming-collapsible-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: 1,
                height: 'auto',
                transition: {
                  height: smoothTransition,
                  opacity: { duration: 0.28, delay: 0.05, ease: 'easeOut' }
                }
              }}
              exit={{
                opacity: 0,
                height: 0,
                transition: {
                  height: smoothTransition,
                  opacity: { duration: 0.18, ease: 'easeIn' }
                }
              }}
              className="overflow-hidden"
            >
              <div className="pt-2.5 border-t border-slate-200/60 mt-2.5">
                {/* 3-Days Summary Cards - Downscaled */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {upcoming3DaysData.map((dayItem, dayIdx) => (
                    <div
                      key={dayIdx}
                      onClick={() => setIsUpcomingModalOpen(true)}
                      className={`group rounded-lg border p-2.5 space-y-2 transition-all cursor-pointer hover:shadow-xs ${
                        dayItem.dateLabel === 'Hari Ini'
                          ? 'bg-blue-50/40 hover:bg-blue-50/70 border-blue-200 hover:border-fluent-blue/60'
                          : 'bg-white/80 hover:bg-white border-slate-200 hover:border-fluent-blue/40'
                      }`}
                      title="Klik untuk membuka rincian lengkap dalam popup"
                    >
                      {/* Day Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                              dayItem.dateLabel === 'Hari Ini'
                                ? 'bg-fluent-blue text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {dayItem.dateLabel}
                          </span>
                          <span className="text-[11px] font-semibold text-fluent-text">
                            {dayItem.dateFormatted}
                          </span>
                        </div>
                        <span className="px-1.5 py-0.5 bg-white text-fluent-blue border border-slate-200 text-[10px] font-bold rounded-full shadow-2xs">
                          {dayItem.sessions.length} Sesi
                        </span>
                      </div>

                      {/* Compact Sessions Preview / Summary */}
                      {dayItem.sessions.length === 0 ? (
                        <div className="py-1.5 px-2 text-center text-[10px] sm:text-[11px] text-fluent-textSecondary bg-slate-50/50 rounded border border-dashed border-slate-200">
                          Tidak ada sesi bimbingan
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {dayItem.sessions.slice(0, 2).map((sess, sIdx) => (
                            <div
                              key={sIdx}
                              className="flex items-center justify-between text-[11px] p-1.5 bg-white rounded border border-slate-200/80 group-hover:border-fluent-blue/30 transition-colors"
                            >
                              <div className="flex items-center space-x-1.5 truncate max-w-[150px] sm:max-w-[170px]">
                                <span className="text-[9px] font-bold text-fluent-blue bg-fluent-blue/10 px-1 py-0.5 rounded flex-shrink-0">
                                  {sess.timeLabel.split(' ')[0]}
                                </span>
                                <span className="font-semibold text-fluent-text truncate">
                                  {sess.student.name}
                                </span>
                              </div>
                              <span className="text-[9px] font-medium text-slate-500 bg-slate-100 px-1 py-0.5 rounded flex-shrink-0">
                                {sess.student.packageType || 'GROW'}
                              </span>
                            </div>
                          ))}

                          {dayItem.sessions.length > 2 && (
                            <div className="text-[10px] text-center font-medium text-fluent-blue pt-0.5 group-hover:underline flex items-center justify-center gap-1">
                              <span>+{dayItem.sessions.length - 2} sesi lainnya</span>
                              <ChevronRight className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* View Mode Toggle Bar (DAFTAR SISWA / MATRIKS JADWAL) */}
      <motion.div
        layout
        transition={smoothTransition}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1"
      >
        <div className="flex items-center space-x-2">
          <div className="bg-slate-200/70 p-0.5 sm:p-1 border border-fluent-border rounded-fluent flex items-center space-x-1 relative shadow-2xs">
            <button
              type="button"
              onClick={() => handleSetViewMode('table')}
              className={`relative w-28 sm:w-40 py-1 sm:py-1.5 rounded-fluent text-[11px] sm:text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 sm:space-x-2 z-10 select-none ${
                viewMode === 'table'
                  ? 'text-fluent-blue'
                  : 'text-fluent-textSecondary hover:text-fluent-text'
              }`}
            >
              {viewMode === 'table' && (
                <motion.div
                  layoutId="viewModeActivePill"
                  className="absolute inset-0 bg-white rounded-fluent shadow-xs border border-fluent-border/60"
                  transition={smoothTransition}
                />
              )}
              <List className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 flex-shrink-0" />
              <span className="relative z-10 truncate">Daftar Siswa</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetViewMode('matrix')}
              className={`relative w-28 sm:w-40 py-1 sm:py-1.5 rounded-fluent text-[11px] sm:text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 sm:space-x-2 z-10 select-none ${
                viewMode === 'matrix'
                  ? 'text-fluent-blue'
                  : 'text-fluent-textSecondary hover:text-fluent-text'
              }`}
            >
              {viewMode === 'matrix' && (
                <motion.div
                  layoutId="viewModeActivePill"
                  className="absolute inset-0 bg-white rounded-fluent shadow-xs border border-fluent-border/60"
                  transition={smoothTransition}
                />
              )}
              <Grid className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 flex-shrink-0" />
              <span className="relative z-10 truncate">Matriks Jadwal</span>
            </button>
          </div>
        </div>

        {/* Fixed-width Status Container (Opened / Focused View) */}
        <div className="w-64 flex-shrink-0 text-right text-xs text-fluent-textSecondary font-medium hidden sm:flex items-center justify-end space-x-2">
          <span className="text-slate-400">Tampilan Aktif:</span>
          <span className="inline-flex items-center justify-center w-36 px-2.5 py-1 bg-white rounded border border-slate-200 text-fluent-text font-bold text-[11px] shadow-2xs truncate">
            {viewMode === 'table' ? 'Tabel Data Siswa' : 'Matriks Jadwal'}
          </span>
        </div>
      </motion.div>

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
            className="bg-white rounded-fluent border border-fluent-border shadow-fluent overflow-hidden"
          >

          {/* Advanced Filters Bar - Compact on Mobile */}
          <div className="p-2.5 sm:p-4 border-b border-fluent-border bg-fluent-subtle/50 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4">

            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-fluent-textSecondary" />
              <input
                type="text"
                placeholder="Cari siswa, wali, alamat, atau no. HP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-1 sm:py-1.5 text-xs sm:text-sm bg-white border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div>
                <span className="text-[10px] sm:text-xs text-fluent-textSecondary mr-1 sm:mr-1.5 font-medium">Paket:</span>
                <select
                  value={packageFilter}
                  onChange={(e) => setPackageFilter(e.target.value)}
                  className="text-[10px] sm:text-xs bg-white border border-fluent-border rounded-fluent px-2 sm:px-2.5 py-1 sm:py-1.5 focus:outline-none focus:border-fluent-blue"
                >
                  <option value="ALL">Semua Paket</option>
                  <option value="SEED">SEED (3 Sesi/60m)</option>
                  <option value="GROW">GROW (4 Sesi/60m)</option>
                  <option value="BOOST">BOOST (8 Sesi/60m)</option>
                  <option value="MASTER">MASTER (8 Sesi/90m)</option>
                  <option value="CUSTOM">CUSTOM</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] sm:text-xs text-fluent-textSecondary mr-1 sm:mr-1.5 font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-[10px] sm:text-xs bg-white border border-fluent-border rounded-fluent px-2 sm:px-2.5 py-1 sm:py-1.5 focus:outline-none focus:border-fluent-blue"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="LUNAS">LUNAS</option>
                  <option value="DP">DP (Cicilan)</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] sm:text-xs text-fluent-textSecondary mr-1 sm:mr-1.5 font-medium">Hari:</span>
                <select
                  value={dayFilter}
                  onChange={(e) => setDayFilter(e.target.value)}
                  className="text-[10px] sm:text-xs bg-white border border-fluent-border rounded-fluent px-2 sm:px-2.5 py-1 sm:py-1.5 focus:outline-none focus:border-fluent-blue"
                >
                  <option value="ALL">Semua Hari</option>
                  {DAYS_LIST.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          {/* Table Content - Downscaled on Mobile */}
          <div className="overflow-x-auto border border-fluent-border rounded-fluent">
            <table className="min-w-full text-left text-xs sm:text-sm">
              <thead className="bg-fluent-subtle text-fluent-textSecondary font-semibold border-b border-fluent-border text-[9px] sm:text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-2 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">No</th>
                  <th className="py-2 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">Nama Siswa & Wali</th>
                  <th className="py-2 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">Paket</th>
                  <th className="py-2 px-2.5 sm:py-3 sm:px-4 text-center whitespace-nowrap">Durasi</th>
                  <th className="py-2 px-2.5 sm:py-3 sm:px-4 text-center whitespace-nowrap">Jam Belajar</th>
                  <th className="py-2 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">Jadwal Sesi</th>
                  <th className="py-2 px-2.5 sm:py-3 sm:px-4 text-right whitespace-nowrap">Status Bayar</th>
                  <th className="py-2 px-2.5 sm:py-3 sm:px-4 text-center whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fluent-border">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, idx) => {
                    const totalInv = (student.valPerMonth || 0) * (student.durationMonths || 1)
                    const totalSess = (student.sessionsPerMonth || 0) * (student.durationMonths || 1)
                    const totalMins = totalSess * (student.minutesPerSession || 60)

                    let statusLabel = 'PENDING'
                    let statusClass = 'text-rose-600 font-bold'
                    const paidPct = totalInv > 0 ? Math.min(100, Math.round((student.paid / totalInv) * 100)) : 0
                    if (student.paid >= totalInv && totalInv > 0) {
                      statusLabel = 'LUNAS'
                      statusClass = 'text-emerald-600 font-bold'
                    } else if (student.paid > 0) {
                      statusLabel = `DP ${paidPct}%`
                      statusClass = 'text-amber-600 font-bold'
                    }

                    return (
                      <tr key={student.id} className="hover:bg-fluent-subtle/60 transition-colors">
                        <td className="py-1.5 px-2.5 sm:py-3 sm:px-4 font-semibold text-fluent-textSecondary text-[10px] sm:text-xs whitespace-nowrap">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">
                          <button
                            onClick={() => setViewingStudent(student)}
                            className="font-bold text-[11px] sm:text-sm text-fluent-blue hover:underline text-left block"
                          >
                            {student.name}
                          </button>
                          {student.parentName && (
                            <span className="text-[9px] sm:text-xs text-fluent-textSecondary block">
                              Wali: {student.parentName}
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">
                          <span className="font-semibold text-[10px] sm:text-sm text-fluent-text block">
                            {student.packageType}
                          </span>
                          <span className="text-[9px] sm:text-xs text-fluent-textSecondary block">
                            {formatIDR(student.valPerMonth)}/bln
                          </span>
                        </td>
                        <td className="py-1.5 px-2.5 sm:py-3 sm:px-4 text-center whitespace-nowrap">
                          <span className="font-semibold text-[10px] sm:text-sm text-fluent-text">
                            {student.durationMonths || 1} Bln
                          </span>
                          <span className="text-[9px] sm:text-xs text-fluent-textSecondary block">
                            ({totalSess} Sesi)
                          </span>
                        </td>
                        <td className="py-1.5 px-2.5 sm:py-3 sm:px-4 text-center whitespace-nowrap">
                          <span className="font-semibold text-[10px] sm:text-sm text-purple-700">
                            {(totalMins / 60).toFixed(1)} Jam
                          </span>
                          <span className="text-[9px] sm:text-xs text-fluent-textSecondary block">
                            ({student.minutesPerSession || 60}m/sesi)
                          </span>
                        </td>
                        <td className="py-1.5 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">
                          <span className="text-[9px] sm:text-xs font-semibold text-fluent-text bg-blue-50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded border border-blue-200 inline-block">
                            {student.schedule || 'Belum diatur'}
                          </span>
                        </td>
                        <td className="py-1.5 px-2.5 sm:py-3 sm:px-4 text-right whitespace-nowrap">
                          <span className={`text-[10px] sm:text-xs ${statusClass} block`}>
                            {statusLabel}
                          </span>
                          <span className="text-[9px] sm:text-[11px] text-fluent-textSecondary block">
                            {formatIDR(student.paid)} / {formatIDR(totalInv)}
                          </span>
                        </td>
                        <td className="py-1.5 px-2.5 sm:py-3 sm:px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-0.5 sm:space-x-1">
                            <button
                              onClick={() => setViewingStudent(student)}
                              className="p-1 sm:p-1.5 text-fluent-textSecondary hover:text-fluent-blue rounded hover:bg-fluent-subtle"
                              title="Lihat Profil Detail"
                            >
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => onGenerateInvoice(student)}
                              className="p-1 sm:p-1.5 text-fluent-textSecondary hover:text-emerald-600 rounded hover:bg-fluent-subtle"
                              title="Generate Invoice"
                            >
                              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            {onOpenRoadmap && (
                              <button
                                onClick={() => onOpenRoadmap(student)}
                                className="p-1 sm:p-1.5 text-fluent-textSecondary hover:text-fluent-blue rounded hover:bg-fluent-subtle"
                                title="Buka Roadmap Pembelajaran"
                              >
                                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => openModal(student)}
                              className="p-1 sm:p-1.5 text-fluent-textSecondary hover:text-fluent-blue rounded hover:bg-fluent-subtle"
                              title="Edit Data Siswa"
                            >
                              <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId(student.id)}
                              className="p-1 sm:p-1.5 text-fluent-textSecondary hover:text-rose-600 rounded hover:bg-fluent-subtle"
                              title="Hapus Siswa"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="py-6 sm:py-8 text-center text-fluent-textSecondary text-[10px] sm:text-xs">
                      Tidak ada data siswa yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

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
          className="bg-white rounded-fluent border border-fluent-border shadow-fluent p-6 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-fluent-border pb-4 gap-4">
            <div>
              <h2 className="text-base font-bold text-fluent-text">
                Matriks Ketersediaan Slot (4 Pekan)
              </h2>
            </div>
            <div className="flex items-center space-x-3 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setIsSlotCalendarOpen(true)}
                className="px-3 py-1.5 bg-fluent-subtle hover:bg-blue-50 text-fluent-blue border border-fluent-border hover:border-blue-200 rounded-fluent transition-colors flex items-center space-x-1.5 text-xs font-semibold shadow-2xs"
                title="Buka Kalender Ringkas Sesi Belajar"
                aria-label="Buka Kalender Ringkas Sesi Belajar"
              >
                <Calendar className="w-4 h-4" />
                <span>Kalender Sesi</span>
              </button>

              <div className="flex items-center space-x-3 pl-2 border-l border-fluent-border">
                <span className="flex items-center space-x-1 text-emerald-700">
                  <Check className="w-4 h-4 text-emerald-600 font-bold" />
                  <span>Tersedia</span>
                </span>
                <span className="flex items-center space-x-1 text-rose-700">
                  <Lock className="w-4 h-4 text-rose-600" />
                  <span>Terkunci</span>
                </span>
              </div>
            </div>
          </div>

          {/* Week Selector Tab Bar */}
          <div className="flex border-b border-fluent-border bg-fluent-subtle/40 p-2 rounded-t flex-wrap gap-2">
            {fourWeeks.map((wk, idx) => (
              <button
                key={wk.weekIndex}
                onClick={() => setMatrixWeekTab(idx)}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center space-x-1.5 ${matrixWeekTab === idx
                  ? 'bg-fluent-blue text-white shadow-xs'
                  : 'bg-white border border-fluent-border text-fluent-text hover:bg-fluent-subtle'
                  }`}
              >
                <span>{wk.title}</span>
                <span className="text-[10px] opacity-80">({wk.dateRange})</span>
              </button>
            ))}
            <button
              onClick={() => setMatrixWeekTab('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center space-x-1.5 ${matrixWeekTab === 'ALL'
                ? 'bg-fluent-blue text-white shadow-xs'
                : 'bg-white border border-fluent-border text-fluent-text hover:bg-fluent-subtle'
                }`}
            >
              <span>Semua Pekan</span>
            </button>
          </div>

          {/* Render Week Containers (1 Pekan = 1 Div) */}
          <div className="space-y-8">
            {(matrixWeekTab === 'ALL' ? fourWeeks : [fourWeeks[matrixWeekTab] || fourWeeks[0]]).map((wk) => (
              <div key={wk.weekIndex} className="bg-fluent-subtle/30 rounded-fluent border border-fluent-border p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-fluent-border pb-2">
                  <h3 className="font-bold text-sm text-fluent-blue flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{wk.title} ({wk.dateRange})</span>
                  </h3>
                  <span className="text-xs font-semibold text-fluent-textSecondary">7 Hari x 3 Slot Harian</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
                  {wk.days.map((dayItem) => (
                    <div key={dayItem.dayName} className="bg-white rounded border border-fluent-border p-2.5 space-y-2.5 shadow-xs">

                      {/* Day Header with Small Date Text Above */}
                      <div className="text-center bg-fluent-subtle/80 rounded border border-fluent-border py-1.5 px-1">
                        <span className="text-[10px] text-fluent-textSecondary font-bold block uppercase leading-tight mb-0.5">
                          {dayItem.formattedDate}
                        </span>
                        <h4 className="font-bold text-xs text-fluent-text leading-tight">
                          {dayItem.dayName}
                        </h4>
                      </div>

                      <div className="space-y-2">
                        {TIME_SLOTS_LIST.map(slotObj => {
                          const slotKey = `${dayItem.dayName} ${slotObj.label}`
                          const dateKey = formatDateKey(dayItem.dateObj)
                          const daySessions = aggregatedSessionsMap[dateKey] || []
                          const sessionOnSlot = daySessions.find(s => s.timeLabel === slotObj.label)
                          const occupied = Boolean(sessionOnSlot)

                          return (
                            <div
                              key={slotKey}
                              onClick={() => {
                                if (sessionOnSlot?.student) {
                                  setViewingStudent(sessionOnSlot.student)
                                }
                              }}
                              className={`p-2 rounded border text-xs flex flex-col justify-between space-y-1 transition-all ${occupied
                                ? 'bg-rose-50 border-rose-200 text-rose-800 cursor-pointer hover:bg-rose-100/80 hover:border-rose-300'
                                : 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                                }`}
                              title={occupied ? `Klik untuk melihat profil ${sessionOnSlot.studentName}` : 'Slot Waktu Tersedia'}
                            >
                              <div className="flex items-center justify-between font-bold text-[11px]">
                                <span>{slotObj.label}</span>
                                {occupied ? (
                                  <Lock className="w-4 h-4 text-rose-600" />
                                ) : (
                                  <Check className="w-4 h-4 text-emerald-600 font-bold" />
                                )}
                              </div>

                              {occupied && sessionOnSlot && (
                                <div className="pt-1 border-t border-rose-200/60 text-[11px]">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold block truncate max-w-[90px]">
                                      {sessionOnSlot.studentName}
                                    </span>
                                    <span className="text-[9px] font-bold bg-rose-200/60 text-rose-900 px-1 py-0.2 rounded">
                                      Sesi {sessionOnSlot.sessionNumber}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-rose-600 block truncate mt-0.5">
                                    Paket {sessionOnSlot.packageType}
                                  </span>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Slide-Over Profile Drawer */}
      {viewingStudent && (
        <StudentProfileDrawer
          student={viewingStudent}
          onClose={() => setViewingStudent(null)}
          onEdit={(st) => {
            setViewingStudent(null)
            openModal(st)
          }}
          onGenerateInvoice={(st) => {
            setViewingStudent(null)
            onGenerateInvoice(st)
          }}
          onOpenRoadmap={(st) => {
            setViewingStudent(null)
            if (onOpenRoadmap) onOpenRoadmap(st)
          }}
          onOpenReportCard={(st, rep) => {
            setViewingStudent(null)
            if (onOpenReportCard) onOpenReportCard(st, rep)
          }}
          onOpenCertificate={(st) => {
            setViewingStudent(null)
            if (onOpenCertificate) onOpenCertificate(st)
          }}
          reports={reports}
        />
      )}

      {/* Modal Popup: Detail Sesi Mendatang */}
      <UpcomingSessionsModal
        isOpen={isUpcomingModalOpen}
        onClose={() => setIsUpcomingModalOpen(false)}
        upcoming3DaysData={upcoming3DaysData}
        totalUpcoming3DaysCount={totalUpcoming3DaysCount}
        onSelectStudent={(st) => setViewingStudent(st)}
        getCleanWhatsAppPhone={getCleanWhatsAppPhone}
        createSessionReminderMessage={createSessionReminderMessage}
      />

      {/* Modal Popup: Kalender Ringkas Sesi Belajar (Matriks Ketersediaan Slot) */}
      <SlotCalendarModal
        isOpen={isSlotCalendarOpen}
        onClose={() => setIsSlotCalendarOpen(false)}
        students={students}
        onSelectStudent={(st) => setViewingStudent(st)}
        onOpenRoadmap={onOpenRoadmap}
      />

      {/* Add / Edit Student Modal Form (3 Tabs) - Full Screen Portal & Smooth Slide Up/Down */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              data-lenis-prevent="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={closeModal}
              className="fixed inset-0 top-0 left-0 w-screen h-screen z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
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
                className="bg-white rounded-fluent border border-fluent-border shadow-fluent-modal w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto will-change-transform"
              >

              {/* Modal Header */}
              <div className="p-4 border-b border-fluent-border bg-fluent-subtle flex justify-between items-center flex-shrink-0">
                <h2 className="font-bold text-base text-fluent-text">
                  {editingStudent ? 'Edit Siswa' : 'Tambah Siswa Baru'}
                </h2>
                <button onClick={closeModal} className="p-1 text-fluent-textSecondary hover:text-fluent-text rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 3 Form Tabs Header */}
              <div className="flex border-b border-fluent-border bg-white px-4 pt-2 space-x-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveFormTab('profile')}
                  className={`py-2 px-4 text-xs font-semibold rounded-t border-b-2 transition-colors ${activeFormTab === 'profile'
                    ? 'border-fluent-blue text-fluent-blue bg-fluent-subtle/50'
                    : 'border-transparent text-fluent-textSecondary hover:text-fluent-text'
                    }`}
                >
                  1. Profil
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFormTab('contact')}
                  className={`py-2 px-4 text-xs font-semibold rounded-t border-b-2 transition-colors ${activeFormTab === 'contact'
                    ? 'border-fluent-blue text-fluent-blue bg-fluent-subtle/50'
                    : 'border-transparent text-fluent-textSecondary hover:text-fluent-text'
                    }`}
                >
                  2. Kontak & Wali
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFormTab('course')}
                  className={`py-2 px-4 text-xs font-semibold rounded-t border-b-2 transition-colors ${activeFormTab === 'course'
                    ? 'border-fluent-blue text-fluent-blue bg-fluent-subtle/50'
                    : 'border-transparent text-fluent-textSecondary hover:text-fluent-text'
                    }`}
                >
                  3. Paket & Jadwal
                </button>
              </div>

              <motion.form
                layout
                transition={{ layout: { type: 'spring', stiffness: 350, damping: 32 } }}
                onSubmit={handleSaveStudent}
                className="p-6 space-y-4 overflow-y-auto text-xs"
              >
                <AnimatePresence mode="popLayout">
                  {/* TAB 1: Profil & Demografi */}
                  {activeFormTab === 'profile' && (
                    <motion.div
                      layout
                      key="profile"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                      className="space-y-4"
                    >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                        Nama Siswa *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
                        placeholder="Contoh: Alya Rahma"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                        Jenis Kelamin
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue bg-white"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                        Usia (Tahun)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
                        placeholder="Contoh: 17"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                        Jenjang Sekolah / Kelompok
                      </label>
                      <input
                        type="text"
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
                        placeholder="Contoh: 12 SMA"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                      Alamat Lengkap Siswa
                    </label>
                    <textarea
                      rows="2"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
                      placeholder="Contoh: Pandeglang, Banten"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                      Target Belajar / Fokus Program
                    </label>
                    <input
                      type="text"
                      value={formData.learningTarget}
                      onChange={(e) => setFormData({ ...formData, learningTarget: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
                      placeholder="Contoh: Speaking Confidence & Preparation PTN"
                    />
                  </div>
                </motion.div>
              )}

              {/* TAB 2: Kontak & Wali */}
              {activeFormTab === 'contact' && (
                <motion.div
                  layout
                  key="contact"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                      Nama Orang Tua / Wali
                    </label>
                    <input
                      type="text"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
                      placeholder="Contoh: Ibu Rina"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                        No. WhatsApp Orang Tua / Wali
                      </label>
                      <input
                        type="text"
                        value={formData.parentPhone || '+62 '}
                        onChange={(e) => setFormData({ ...formData, parentPhone: formatIndonesianPhoneNumber(e.target.value) })}
                        className="w-full px-3 py-1.5 text-sm border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-mono font-medium"
                        placeholder="+62 821-1150-0190"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                        No. WhatsApp Siswa
                      </label>
                      <input
                        type="text"
                        value={formData.studentPhone || '+62 '}
                        onChange={(e) => setFormData({ ...formData, studentPhone: formatIndonesianPhoneNumber(e.target.value) })}
                        className="w-full px-3 py-1.5 text-sm border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue font-mono font-medium"
                        placeholder="+62 821-1150-0190"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: Paket & Reservasi Slot Sesi */}
              {activeFormTab === 'course' && (
                <motion.div
                  layout
                  key="course"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                        Jenis Paket Kursus *
                      </label>
                      <select
                        value={formData.packageType}
                        onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue bg-white font-semibold"
                      >
                        <option value="SEED">SEED (Rp 150.000 / 3 Sesi / 60m)</option>
                        <option value="GROW">GROW (Rp 200.000 / 4 Sesi / 60m)</option>
                        <option value="BOOST">BOOST (Rp 400.000 / 8 Sesi / 60m)</option>
                        <option value="MASTER">MASTER (Rp 500.000 / 8 Sesi / 90m)</option>
                        <option value="CUSTOM">CUSTOM (Setting Manual)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                        Durasi Bimbingan (Bulan) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.durationMonths}
                        onChange={(e) => setFormData({ ...formData, durationMonths: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-full px-3 py-1.5 text-sm border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
                      />
                    </div>
                  </div>

                  {formData.packageType === 'CUSTOM' && (
                    <div className="grid grid-cols-3 gap-3 bg-fluent-subtle p-3 rounded border border-fluent-border text-xs">
                      <div>
                        <label className="block font-semibold text-fluent-textSecondary mb-1">Harga/Bulan (Rp)</label>
                        <input
                          type="number"
                          value={formData.customValPerMonth}
                          onChange={(e) => setFormData({ ...formData, customValPerMonth: e.target.value })}
                          className="w-full px-2 py-1 border border-fluent-border rounded"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-fluent-textSecondary mb-1">Sesi/Bulan</label>
                        <input
                          type="number"
                          value={formData.customSessionsPerMonth}
                          onChange={(e) => setFormData({ ...formData, customSessionsPerMonth: e.target.value })}
                          className="w-full px-2 py-1 border border-fluent-border rounded"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-fluent-textSecondary mb-1">Menit/Sesi</label>
                        <input
                          type="number"
                          value={formData.customMinutesPerSession}
                          onChange={(e) => setFormData({ ...formData, customMinutesPerSession: e.target.value })}
                          className="w-full px-2 py-1 border border-fluent-border rounded"
                        />
                      </div>
                    </div>
                  )}

                  {/* Interactive Slot Reservation Matrix Component */}
                  <div className="space-y-2 pt-2 border-t border-fluent-border">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-fluent-text">
                        Pilih Reservasi Slot Sesi (3 Slot/Hari)
                      </label>
                      <span className="text-[11px] font-semibold text-fluent-blue">
                        Terpilih: {formData.selectedSlots?.length || 0} Slot
                      </span>
                    </div>
                    <p className="text-[11px] text-fluent-textSecondary">
                      Slot yang sudah direservasi oleh siswa lain bertanda FULL dan terkunci selama durasi bimbingan aktif.
                    </p>

                    <div className="space-y-2 border border-fluent-border p-3 rounded-fluent bg-fluent-subtle/30 max-h-56 overflow-y-auto">
                      {DAYS_LIST.map(day => (
                        <div key={day} className="bg-white p-2 rounded border border-fluent-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="font-bold text-xs text-fluent-text min-w-[65px]">{day}</span>
                          <div className="grid grid-cols-3 gap-1.5 flex-1">
                            {TIME_SLOTS_LIST.map(slotObj => {
                              const slotKey = `${day} ${slotObj.label}`
                              const occupied = occupiedSlotsMap[slotKey]
                              const isSelected = (formData.selectedSlots || []).includes(slotKey)

                              if (occupied) {
                                return (
                                  <button
                                    key={slotKey}
                                    type="button"
                                    disabled
                                    className="px-2 py-1.5 bg-rose-50 border border-rose-200 text-rose-800 rounded text-[11px] font-semibold flex items-center justify-center space-x-1 cursor-not-allowed opacity-85"
                                    title={`Terisi oleh ${occupied.studentName} (${occupied.durationMonths} Bulan)`}
                                  >
                                    <Lock className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">FULL ({occupied.studentName})</span>
                                  </button>
                                )
                              }

                              return (
                                <button
                                  key={slotKey}
                                  type="button"
                                  onClick={() => handleToggleSlotInModal(slotKey)}
                                  className={`px-2 py-1.5 rounded text-[11px] font-semibold flex items-center justify-center space-x-1 transition-all ${isSelected
                                    ? 'bg-fluent-blue text-white border border-fluent-blue shadow-sm'
                                    : 'bg-white border border-fluent-border text-fluent-text hover:bg-fluent-subtle hover:border-fluent-blue'
                                    }`}
                                >
                                  {isSelected && <Check className="w-3 h-3 flex-shrink-0" />}
                                  <span>{slotObj.label}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                        Nominal Terbayar / Paid (Rp)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.paid}
                        onChange={(e) => setFormData({ ...formData, paid: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                        Teks Ringkasan Jadwal
                      </label>
                      <input
                        type="text"
                        value={formData.schedule}
                        onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
                        placeholder="Contoh: Selasa 15.00 WIB"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
                      Catatan Pembayaran / Khusus
                    </label>
                    <textarea
                      rows="2"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
                    ></textarea>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

              {/* Real-time Calculation Live Summary Panel */}
              <div className="p-4 bg-fluent-subtle rounded border border-fluent-border space-y-2 mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-fluent-textSecondary block">Total Investasi:</span>
                    <span className="font-bold text-fluent-text">{formatIDR(currentTotalInvestment)}</span>
                  </div>
                  <div>
                    <span className="text-fluent-textSecondary block">Total Sesi:</span>
                    <span className="font-bold text-fluent-text">{currentTotalSessions} Sesi</span>
                  </div>
                  <div>
                    <span className="text-fluent-textSecondary block">Total Jam Belajar:</span>
                    <span className="font-bold text-purple-700">{(currentTotalStudyMinutes / 60).toFixed(1)} Jam</span>
                  </div>
                  <div>
                    <span className="text-fluent-textSecondary block">Sisa Piutang:</span>
                    <span className="font-bold text-amber-600">
                      {formatIDR(Math.max(0, currentTotalInvestment - (Number(formData.paid) || 0)))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-fluent-border">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded-fluent text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-fluent-blue hover:bg-fluent-blueHover text-white rounded-fluent text-xs font-medium"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Tambah Siswa'}
                </button>
              </div>

            </motion.form>

          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>,
      document.body
    )}

      {/* Custom Confirmation Modal for Delete (Sensitive & Crucial) - Portal & Smooth Slide Up/Down */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {deleteId && (
            <motion.div
              data-lenis-prevent="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setDeleteId(null)}
              className="fixed inset-0 top-0 left-0 w-screen h-screen z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            >
              <motion.div
                data-lenis-prevent="true"
                initial={{ opacity: 0, scale: 0.84, scaleY: 0.74, scaleX: 0.92, y: 40 }}
                animate={{ opacity: 1, scale: 1, scaleY: 1, scaleX: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.86, scaleY: 0.76, scaleX: 0.94, y: 32 }}
                transition={{
                  type: 'spring',
                  damping: 25,
                  stiffness: 280,
                  mass: 0.85,
                  opacity: { duration: 0.2, ease: 'easeOut' }
                }}
                style={{ transformOrigin: '50% 85%' }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-fluent border border-rose-200 shadow-fluent-modal w-full max-w-md p-6 space-y-4 my-auto will-change-transform"
              >
                
                {/* Header with Red Warning Icon */}
                <div className="flex items-center space-x-2 border-b border-fluent-border pb-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  <h3 className="text-sm font-bold text-fluent-text">
                    Konfirmasi Hapus Siswa (Tindakan Sensitif)
                  </h3>
                </div>

                {/* Crucial Blinking Warning Box (No Glow) */}
                <div className="bg-rose-50 border border-rose-300 rounded p-3 text-xs space-y-1.5">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <p className="font-bold text-rose-700 leading-snug animate-pulse">
                      PERINGATAN KRUSIAL: Tindakan ini tidak bisa diurungkan!
                    </p>
                  </div>
                  <p className="text-[11px] text-rose-700/90 pl-6 leading-relaxed">
                    Apakah Anda yakin ingin menghapus data siswa ini? Seluruh data profil, reservasi slot, dan riwayat invoice terkait akan dihapus secara permanen dari sistem.
                  </p>
                </div>

              {/* Action Buttons & Countdown Footer */}
              <div className="space-y-2 pt-2 border-t border-fluent-border">
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setDeleteId(null)}
                    className="px-3.5 py-1.5 border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded text-xs font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={deleteCountdown > 0}
                    onClick={confirmDelete}
                    className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${
                      deleteCountdown > 0
                        ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                        : 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                    }`}
                  >
                    {deleteCountdown > 0 ? `Ya, Hapus Data (${deleteCountdown}s)` : 'Ya, Hapus Data'}
                  </button>
                </div>

                {/* Small Countdown Text Outside Button */}
                <div className="text-right text-[11px]">
                  {deleteCountdown > 0 ? (
                    <span className="text-amber-700 font-semibold">
                      Tombol Hapus akan aktif dalam {deleteCountdown} detik...
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-semibold">
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
