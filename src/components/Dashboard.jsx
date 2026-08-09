import React, { useState, useEffect } from 'react'
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
  List
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import StudentProfileDrawer from './StudentProfileDrawer'

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

export default function Dashboard({ students, setStudents, onGenerateInvoice }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [packageFilter, setPackageFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [dayFilter, setDayFilter] = useState('ALL')

  // View Mode: 'table' or 'matrix'
  const [viewMode, setViewMode] = useState('table')
  const [matrixWeekTab, setMatrixWeekTab] = useState(0) // 0 = Pekan 1, 1 = Pekan 2, 2 = Pekan 3, 3 = Pekan 4, 'ALL' = Semua Pekan

  const fourWeeks = getFourWeeksData()

  // Selected student for Profile Drawer
  const [viewingStudent, setViewingStudent] = useState(null)

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

  // Total Hours calculation
  const totalStudyMinutesOverall = students.reduce((acc, curr) => {
    const sessions = (curr.sessionsPerMonth || 0) * (curr.durationMonths || 1)
    const mins = curr.minutesPerSession || 60
    return acc + (sessions * mins)
  }, 0)

  // Upcoming 3 Days Sessions calculation
  const upcoming3DaysData = getUpcomingSessions3Days(students)
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

  const formatIDR = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount || 0)
  }

  return (
    <div className="space-y-6 pb-12">

      {/* Top Title & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fluent-text tracking-tight">
            Dashboard Siswa & Penjadwalan Sesi
          </h1>
          <p className="text-sm text-fluent-textSecondary">
            Kelola data demografi, durasi bimbingan, serta matriks 3 slot harian Kavio Edu.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="bg-fluent-subtle p-1 border border-fluent-border rounded-fluent flex items-center space-x-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center space-x-1.5 ${viewMode === 'table'
                ? 'bg-white text-fluent-blue shadow-sm'
                : 'text-fluent-textSecondary hover:text-fluent-text'
                }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Daftar Siswa</span>
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center space-x-1.5 ${viewMode === 'matrix'
                ? 'bg-white text-fluent-blue shadow-sm'
                : 'text-fluent-textSecondary hover:text-fluent-text'
                }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Matriks Jadwal
              </span>
            </button>
          </div>

          <button
            onClick={() => openModal(null)}
            className="px-4 py-2 bg-fluent-blue hover:bg-fluent-blueHover text-white rounded-fluent text-sm font-medium flex items-center space-x-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Siswa Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-fluent border border-fluent-border shadow-fluent flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-fluent-textSecondary uppercase tracking-wider">
              Siswa Aktif
            </p>
            <p className="text-2xl font-bold text-fluent-text mt-1">
              {totalActiveStudents} Siswa
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-fluent-blue rounded-fluent">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-fluent border border-fluent-border shadow-fluent flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-fluent-textSecondary uppercase tracking-wider">
              Pendapatan Terbayar
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {formatIDR(totalMonthlyRevenue)}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-fluent font-extrabold text-base flex items-center justify-center min-w-12 h-12">
            Rp
          </div>
        </div>

        <div className="bg-white p-5 rounded-fluent border border-fluent-border shadow-fluent flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-fluent-textSecondary uppercase tracking-wider">
              Outstanding
            </p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {formatIDR(totalOutstanding)}
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-fluent">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-fluent border border-fluent-border shadow-fluent flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-fluent-textSecondary uppercase tracking-wider">
              Total Jam Belajar Siswa
            </p>
            <p className="text-2xl font-bold text-purple-700 mt-1">
              {(totalStudyMinutesOverall / 60).toFixed(1)} Jam
            </p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-fluent">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Widget: Sesi Mendatang 3 Hari Ke Depan */}
      <div className="bg-white rounded-fluent border border-fluent-border shadow-fluent p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-fluent-border pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-fluent-blue/10 text-fluent-blue rounded-fluent">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-fluent-text">
                Sesi Mendatang (3 Hari Ke Depan)
              </h2>
              <p className="text-xs text-fluent-textSecondary">
                Ringkasan jadwal bimbingan belajar siswa untuk Hari Ini, Besok, dan Lusa
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 self-start sm:self-center">
            <span className="px-3 py-1 bg-fluent-blue/10 text-fluent-blue text-xs font-bold rounded-full border border-fluent-blue/20">
              Total {totalUpcoming3DaysCount} Sesi
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcoming3DaysData.map((dayItem, dayIdx) => (
            <div
              key={dayIdx}
              className={`rounded-fluent border p-3 space-y-3 ${
                dayItem.dateLabel === 'Hari Ini'
                  ? 'bg-blue-50/40 border-blue-200'
                  : 'bg-fluent-subtle/30 border-fluent-border'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-2 border-b border-fluent-border/60">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                      dayItem.dateLabel === 'Hari Ini'
                        ? 'bg-fluent-blue text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {dayItem.dateLabel}
                  </span>
                  <span className="text-xs font-semibold text-fluent-text">
                    {dayItem.dateFormatted}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-fluent-textSecondary">
                  {dayItem.sessions.length} Sesi
                </span>
              </div>

              {/* Sessions List */}
              {dayItem.sessions.length === 0 ? (
                <div className="py-6 px-3 text-center text-xs text-fluent-textSecondary bg-white rounded border border-dashed border-fluent-border">
                  Tidak ada sesi bimbingan
                </div>
              ) : (
                <div className="space-y-2">
                  {dayItem.sessions.map((sess, sessIdx) => (
                    <div
                      key={sessIdx}
                      onClick={() => setViewingStudent(sess.student)}
                      className="p-3 bg-white hover:bg-slate-50/90 rounded-fluent border border-fluent-border hover:border-fluent-blue/50 transition-all cursor-pointer space-y-2 shadow-sm group"
                      title="Klik untuk melihat profil lengkap siswa"
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center text-xs font-bold text-fluent-blue bg-fluent-blue/10 px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3 mr-1" />
                          {sess.timeLabel}
                        </span>
                        
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-semibold text-fluent-textSecondary bg-slate-100 px-1.5 py-0.5 rounded">
                            {sess.student.packageType || 'GROW'}
                          </span>

                          {/* Tombol Reminder WhatsApp */}
                          {(() => {
                            const waPhone = getCleanWhatsAppPhone(sess.student)
                            const hasPhone = Boolean(waPhone)

                            return (
                              <button
                                type="button"
                                disabled={!hasPhone}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (!hasPhone) return
                                  const text = createSessionReminderMessage(sess.student, dayItem, sess)
                                  const url = `https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`
                                  window.open(url, '_blank', 'noopener,noreferrer')
                                }}
                                className={`p-1 rounded transition-colors flex items-center justify-center ${
                                  hasPhone
                                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 hover:border-emerald-300'
                                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50'
                                }`}
                                title={
                                  hasPhone
                                    ? `Kirim reminder WhatsApp ke +${waPhone}`
                                    : 'Nomor WhatsApp siswa/orang tua tidak tersedia'
                                }
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                            )
                          })()}
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-fluent-text group-hover:text-fluent-blue transition-colors">
                            {sess.student.name}
                          </p>
                          <Eye className="w-3.5 h-3.5 text-fluent-textSecondary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-[11px] text-fluent-textSecondary truncate">
                          {sess.student.grade || 'Siswa'} • {sess.student.address || 'Alamat -'}
                        </p>
                      </div>

                      {sess.student.learningTarget && (
                        <p className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100 truncate">
                          Target: {sess.student.learningTarget}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* VIEW 1: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-fluent border border-fluent-border shadow-fluent overflow-hidden">

          {/* Advanced Filters Bar */}
          <div className="p-4 border-b border-fluent-border bg-fluent-subtle/50 flex flex-col md:flex-row md:items-center justify-between gap-4">

            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-fluent-textSecondary" />
              <input
                type="text"
                placeholder="Cari siswa, wali, alamat, atau no. HP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-white border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div>
                <span className="text-xs text-fluent-textSecondary mr-1.5 font-medium">Paket:</span>
                <select
                  value={packageFilter}
                  onChange={(e) => setPackageFilter(e.target.value)}
                  className="text-xs bg-white border border-fluent-border rounded-fluent px-2.5 py-1.5 focus:outline-none focus:border-fluent-blue"
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
                <span className="text-xs text-fluent-textSecondary mr-1.5 font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs bg-white border border-fluent-border rounded-fluent px-2.5 py-1.5 focus:outline-none focus:border-fluent-blue"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="LUNAS">LUNAS</option>
                  <option value="DP">DP (Cicilan)</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              <div>
                <span className="text-xs text-fluent-textSecondary mr-1.5 font-medium">Hari:</span>
                <select
                  value={dayFilter}
                  onChange={(e) => setDayFilter(e.target.value)}
                  className="text-xs bg-white border border-fluent-border rounded-fluent px-2.5 py-1.5 focus:outline-none focus:border-fluent-blue"
                >
                  <option value="ALL">Semua Hari</option>
                  {DAYS_LIST.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          {/* Table Content */}
          <div className="overflow-x-auto border border-fluent-border rounded-fluent">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-fluent-subtle text-fluent-textSecondary font-semibold border-b border-fluent-border text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 whitespace-nowrap">No</th>
                  <th className="py-3 px-4 whitespace-nowrap">Nama Siswa & Wali</th>
                  <th className="py-3 px-4 whitespace-nowrap">Paket</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Durasi</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Jam Belajar</th>
                  <th className="py-3 px-4 whitespace-nowrap">Jadwal Sesi</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Status Bayar</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Aksi</th>
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
                        <td className="py-3 px-4 font-semibold text-fluent-textSecondary text-xs whitespace-nowrap">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <button
                            onClick={() => setViewingStudent(student)}
                            className="font-bold text-fluent-blue hover:underline text-left block"
                          >
                            {student.name}
                          </button>
                          {student.parentName && (
                            <span className="text-xs text-fluent-textSecondary block">
                              Wali: {student.parentName}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-semibold text-fluent-text block">
                            {student.packageType}
                          </span>
                          <span className="text-xs text-fluent-textSecondary block">
                            {formatIDR(student.valPerMonth)}/bln
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className="font-semibold text-fluent-text">
                            {student.durationMonths || 1} Bulan
                          </span>
                          <span className="text-xs text-fluent-textSecondary block">
                            ({totalSess} Sesi)
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className="font-semibold text-purple-700">
                            {(totalMins / 60).toFixed(1)} Jam
                          </span>
                          <span className="text-xs text-fluent-textSecondary block">
                            ({student.minutesPerSession || 60}m/sesi)
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-xs font-semibold text-fluent-text bg-blue-50 px-2 py-1 rounded border border-blue-200 inline-block">
                            {student.schedule || 'Belum diatur'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <span className={`text-xs ${statusClass} block`}>
                            {statusLabel}
                          </span>
                          <span className="text-[11px] text-fluent-textSecondary block">
                            {formatIDR(student.paid)} / {formatIDR(totalInv)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => setViewingStudent(student)}
                              className="p-1.5 text-fluent-textSecondary hover:text-fluent-blue rounded hover:bg-fluent-subtle"
                              title="Lihat Profil Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onGenerateInvoice(student)}
                              className="p-1.5 text-fluent-textSecondary hover:text-emerald-600 rounded hover:bg-fluent-subtle"
                              title="Generate Invoice"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openModal(student)}
                              className="p-1.5 text-fluent-textSecondary hover:text-fluent-blue rounded hover:bg-fluent-subtle"
                              title="Edit Data Siswa"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId(student.id)}
                              className="p-1.5 text-fluent-textSecondary hover:text-rose-600 rounded hover:bg-fluent-subtle"
                              title="Hapus Siswa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-fluent-textSecondary text-xs">
                      Tidak ada data siswa yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* VIEW 2: WEEKLY SCHEDULE MATRIX BOARD (4 WEEKS AHEAD) */}
      {viewMode === 'matrix' && (
        <div className="bg-white rounded-fluent border border-fluent-border shadow-fluent p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-fluent-border pb-4 gap-4">
            <div>
              <h2 className="text-base font-bold text-fluent-text">
                Matriks Ketersediaan Slot Sesi (Proyeksi 4 Pekan Ke Depan)
              </h2>
              <p className="text-xs text-fluent-textSecondary mt-0.5">
                Proyeksi 4 pekan jadwalles Kavio Edu. Setiap pekan memiliki 7 hari x 3 slot harian.
              </p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-semibold">
              <span className="flex items-center space-x-1.5 text-emerald-700">
                <Check className="w-4 h-4 text-emerald-600 font-bold" />
                <span>Slot Tersedia</span>
              </span>
              <span className="flex items-center space-x-1.5 text-rose-700">
                <Lock className="w-4 h-4 text-rose-600" />
                <span>Slot Terkunci (FULL)</span>
              </span>
            </div>
          </div>

          {/* Week Selector Tab Bar */}
          <div className="flex border-b border-fluent-border bg-fluent-subtle/40 p-2 rounded-t flex-wrap gap-2">
            {fourWeeks.map((wk, idx) => (
              <button
                key={wk.weekIndex}
                onClick={() => setMatrixWeekTab(idx)}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center space-x-1.5 ${matrixWeekTab === idx
                  ? 'bg-fluent-blue text-white shadow-sm'
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
                ? 'bg-fluent-blue text-white shadow-sm'
                : 'bg-white border border-fluent-border text-fluent-text hover:bg-fluent-subtle'
                }`}
            >
              <span>Tampilkan Semua 4 Pekan</span>
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
                          const occupied = occupiedSlotsMap[slotKey]

                          return (
                            <div
                              key={slotKey}
                              className={`p-2 rounded border text-xs flex flex-col justify-between space-y-1 transition-all ${occupied
                                ? 'bg-rose-50 border-rose-200 text-rose-800'
                                : 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                                }`}
                            >
                              <div className="flex items-center justify-between font-bold text-[11px]">
                                <span>{slotObj.label}</span>
                                {occupied ? (
                                  <Lock className="w-4 h-4 text-rose-600" />
                                ) : (
                                  <Check className="w-4 h-4 text-emerald-600 font-bold" />
                                )}
                              </div>

                              {occupied && (
                                <div className="pt-1 border-t border-rose-200/60 text-[11px]">
                                  <span className="font-bold block truncate">{occupied.studentName}</span>
                                  <span className="text-[10px] text-rose-600 block">
                                    Paket {occupied.packageType} ({occupied.durationMonths} Bln)
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
        </div>
      )}

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
        />
      )}

      {/* Add / Edit Student Modal Form (3 Tabs) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              layout
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{
                layout: { type: 'spring', stiffness: 350, damping: 32 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 }
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-fluent border border-fluent-border shadow-fluent-modal w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
            >

              {/* Modal Header */}
              <div className="p-4 border-b border-fluent-border bg-fluent-subtle flex justify-between items-center flex-shrink-0">
                <h2 className="font-bold text-base text-fluent-text">
                  {editingStudent ? 'Edit Data Siswa & Reservasi Slot' : 'Tambah Siswa Baru & Reservasi Slot'}
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
                  1. Profil & Demografi
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
                  3. Paket & Reservasi Slot
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
      </AnimatePresence>

      {/* Custom Confirmation Modal for Delete (Sensitive & Crucial) */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteId(null)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              layout
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{
                layout: { type: 'spring', stiffness: 350, damping: 30 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 }
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-fluent border border-rose-200 shadow-fluent-modal w-full max-w-md p-6 space-y-4 my-auto"
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
      </AnimatePresence>

    </div>
  )
}
