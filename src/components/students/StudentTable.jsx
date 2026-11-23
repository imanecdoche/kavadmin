import React, { useState, useMemo } from 'react'
import {
  Search,
  Check,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SimpleTooltip } from '@/components/ui/tooltip'
import { getStudentSessionStatus } from '@/utils/studentStatusHelper'

const DAYS_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

export const StudentTableView = ({
  students = [],
  onViewDetail,
  onOpenInvoice,
  onOpenRoadmap,
  onEditStudent,
  onDeleteStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPackage, setFilterPackage] = useState('ALL')
  const [filterStudentStatus, setFilterStudentStatus] = useState('ALL') // ALL, AKTIF, SELESAI
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('ALL') // ALL, LUNAS, DP, PENDING
  const [filterDay, setFilterDay] = useState('ALL')
  const [sortField, setSortField] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  const handleSortToggle = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setFilterPackage('ALL')
    setFilterStudentStatus('ALL')
    setFilterPaymentStatus('ALL')
    setFilterDay('ALL')
    setSortField('name')
    setSortOrder('asc')
  }

  const isFiltered =
    searchQuery !== '' ||
    filterPackage !== 'ALL' ||
    filterStudentStatus !== 'ALL' ||
    filterPaymentStatus !== 'ALL' ||
    filterDay !== 'ALL' ||
    sortField !== 'name' ||
    sortOrder !== 'asc'

  const filteredAndSortedStudents = useMemo(() => {
    let result = (students || []).filter((student) => {
      if (!student) return false
      const q = searchQuery.toLowerCase().trim()

      const totalInv = (student.valPerMonth || 0) * (student.durationMonths || 1)
      const paid = Number(student.paid) || 0
      const isLunas = paid >= totalInv && totalInv > 0
      const isDp = paid > 0 && !isLunas
      const isPending = paid === 0

      const paymentStatus = isLunas ? 'LUNAS' : isDp ? 'DP' : 'PENDING'
      
      // Evaluasi status sesi: Aktif jika masih ada sisa sesi, Selesai jika semua sesi tuntas
      const sessionInfo = getStudentSessionStatus(student)
      const studentStatus = sessionInfo.status

      if (q) {
        const matchSearch =
          (student.name || '').toLowerCase().includes(q) ||
          (student.parentName || '').toLowerCase().includes(q) ||
          (student.address || '').toLowerCase().includes(q) ||
          (student.parentPhone || '').includes(q) ||
          (student.studentPhone || '').includes(q) ||
          (student.packageType || '').toLowerCase().includes(q) ||
          (student.schedule || '').toLowerCase().includes(q) ||
          (student.notes || '').toLowerCase().includes(q) ||
          (student.learningTarget || '').toLowerCase().includes(q) ||
          (student.grade || '').toLowerCase().includes(q) ||
          studentStatus.toLowerCase().includes(q) ||
          paymentStatus.toLowerCase().includes(q) ||
          (studentStatus === 'AKTIF' && (q.includes('aktif') || q.includes('sisa'))) ||
          (studentStatus === 'SELESAI' && (q.includes('selesai') || q.includes('lulus') || q.includes('tuntas')))

        if (!matchSearch) return false
      }

      // Filter Paket
      if (filterPackage !== 'ALL' && student.packageType !== filterPackage) {
        return false
      }

      // Filter Status Siswa (AKTIF = masih ada sesi / SELESAI = seluruh sesi tuntas)
      if (filterStudentStatus !== 'ALL' && studentStatus !== filterStudentStatus) {
        return false
      }

      // Filter Status Bayar
      if (filterPaymentStatus !== 'ALL') {
        if (filterPaymentStatus === 'LUNAS' && !isLunas) return false
        if (filterPaymentStatus === 'DP' && !isDp) return false
        if (filterPaymentStatus === 'PENDING' && !isPending) return false
      }

      // Filter Hari
      if (filterDay !== 'ALL') {
        if (!student.schedule || !student.schedule.toLowerCase().includes(filterDay.toLowerCase())) {
          return false
        }
      }

      return true
    })

    // Sorting
    result.sort((a, b) => {
      let valA, valB
      switch (sortField) {
        case 'name':
          valA = (a.name || '').toLowerCase()
          valB = (b.name || '').toLowerCase()
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
        case 'package':
          valA = a.packageType || ''
          valB = b.packageType || ''
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
        case 'duration':
          valA = a.durationMonths || 1
          valB = b.durationMonths || 1
          return sortOrder === 'asc' ? valA - valB : valB - valA
        case 'hours':
          valA = (a.sessionsPerMonth || 0) * (a.durationMonths || 1) * (a.minutesPerSession || 60)
          valB = (b.sessionsPerMonth || 0) * (b.durationMonths || 1) * (b.minutesPerSession || 60)
          return sortOrder === 'asc' ? valA - valB : valB - valA
        case 'date':
          valA = new Date(a.startDate || a.registrationDate || 0).getTime()
          valB = new Date(b.startDate || b.registrationDate || 0).getTime()
          return sortOrder === 'asc' ? valA - valB : valB - valA
        case 'investment':
          valA = (a.valPerMonth || 0) * (a.durationMonths || 1)
          valB = (b.valPerMonth || 0) * (b.durationMonths || 1)
          return sortOrder === 'asc' ? valA - valB : valB - valA
        case 'outstanding':
          valA = Math.max(0, ((a.valPerMonth || 0) * (a.durationMonths || 1)) - (Number(a.paid) || 0))
          valB = Math.max(0, ((b.valPerMonth || 0) * (b.durationMonths || 1)) - (Number(b.paid) || 0))
          return sortOrder === 'asc' ? valA - valB : valB - valA
        case 'payment':
          valA = (Number(a.paid) || 0) / Math.max(1, ((a.valPerMonth || 0) * (a.durationMonths || 1)))
          valB = (Number(b.paid) || 0) / Math.max(1, ((b.valPerMonth || 0) * (b.durationMonths || 1)))
          return sortOrder === 'asc' ? valA - valB : valB - valA
        case 'schedule':
          valA = (a.schedule || '').toLowerCase()
          valB = (b.schedule || '').toLowerCase()
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
        default:
          return 0
      }
    })

    return result
  }, [students, searchQuery, filterPackage, filterStudentStatus, filterPaymentStatus, filterDay, sortField, sortOrder])

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-neutral-400 group-hover:text-neutral-700 transition-colors shrink-0" />
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-neutral-900 dark:text-white shrink-0" />
    ) : (
      <ArrowDown className="w-3 h-3 text-neutral-900 dark:text-white shrink-0" />
    )
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg shadow-sm overflow-hidden space-y-0">
      {/* 1. SEARCH, FILTERS & SORTING BAR (Solid Tokens, Zero Outline Strokes) */}
      <div className="p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Multi-Field Search Box */}
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Cari nama siswa, wali, no. HP, paket, jadwal, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 text-xs bg-[#f5f5f5] dark:bg-neutral-800 text-[#111111] dark:text-white border-none rounded-md focus:bg-white focus:ring-0 transition-colors placeholder:text-neutral-400 shadow-2xs w-full"
            />
          </div>

          {/* Quick Counter & Sort Dropdown */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            {/* Sorting Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <span className="text-[11px] font-semibold hidden sm:inline text-neutral-500 whitespace-nowrap">Urutkan:</span>
              <Select
                value={`${sortField}-${sortOrder}`}
                onValueChange={(val) => {
                  const [f, o] = val.split('-')
                  setSortField(f)
                  setSortOrder(o)
                }}
              >
                <SelectTrigger className="h-9 text-xs w-[170px] border-none rounded-md bg-[#f5f5f5] dark:bg-neutral-800 text-[#111111] dark:text-neutral-200 hover:bg-[#e5e5e5] dark:hover:bg-neutral-700 transition-colors whitespace-nowrap shadow-2xs">
                  <SelectValue placeholder="Pilih Urutan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="text-xs" value="name-asc">Nama (A - Z)</SelectItem>
                  <SelectItem className="text-xs" value="name-desc">Nama (Z - A)</SelectItem>
                  <SelectItem className="text-xs" value="date-desc">Mulai (Terbaru)</SelectItem>
                  <SelectItem className="text-xs" value="date-asc">Mulai (Terlama)</SelectItem>
                  <SelectItem className="text-xs" value="investment-desc">Biaya (Tertinggi)</SelectItem>
                  <SelectItem className="text-xs" value="outstanding-desc">Tagihan (Tertinggi)</SelectItem>
                  <SelectItem className="text-xs" value="hours-desc">Jam Belajar (Terbanyak)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reset Filter Button */}
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-9 px-3 text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-[#f5f5f5] hover:bg-[#e5e5e5] dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-md border-none flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors shadow-2xs"
                title="Reset Semua Filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-800/80">
          {/* Paket Filter */}
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <span className="text-[11px] font-semibold text-neutral-500 whitespace-nowrap">Paket:</span>
            <Select value={filterPackage} onValueChange={setFilterPackage}>
              <SelectTrigger className="h-8 text-xs w-[115px] border-none rounded-md bg-[#f5f5f5] dark:bg-neutral-800 text-[#111111] dark:text-neutral-200 hover:bg-[#e5e5e5] dark:hover:bg-neutral-700 transition-colors whitespace-nowrap shadow-2xs">
                <SelectValue placeholder="Semua Paket" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="text-xs" value="ALL">Semua Paket</SelectItem>
                <SelectItem className="text-xs" value="SEED">SEED</SelectItem>
                <SelectItem className="text-xs" value="GROW">GROW</SelectItem>
                <SelectItem className="text-xs" value="BOOST">BOOST</SelectItem>
                <SelectItem className="text-xs" value="MASTER">MASTER</SelectItem>
                <SelectItem className="text-xs" value="CUSTOM">CUSTOM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Siswa Filter */}
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <span className="text-[11px] font-semibold text-neutral-500 whitespace-nowrap">Status:</span>
            <Select value={filterStudentStatus} onValueChange={setFilterStudentStatus}>
              <SelectTrigger className="h-8 text-xs w-[120px] border-none rounded-md bg-[#f5f5f5] dark:bg-neutral-800 text-[#111111] dark:text-neutral-200 hover:bg-[#e5e5e5] dark:hover:bg-neutral-700 transition-colors whitespace-nowrap shadow-2xs">
                <SelectValue placeholder="Status Siswa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="text-xs" value="ALL">Semua Siswa</SelectItem>
                <SelectItem className="text-xs" value="AKTIF">Siswa Aktif</SelectItem>
                <SelectItem className="text-xs" value="SELESAI">Siswa Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Bayar Filter */}
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <span className="text-[11px] font-semibold text-neutral-500 whitespace-nowrap">Bayar:</span>
            <Select value={filterPaymentStatus} onValueChange={setFilterPaymentStatus}>
              <SelectTrigger className="h-8 text-xs w-[125px] border-none rounded-md bg-[#f5f5f5] dark:bg-neutral-800 text-[#111111] dark:text-neutral-200 hover:bg-[#e5e5e5] dark:hover:bg-neutral-700 transition-colors whitespace-nowrap shadow-2xs">
                <SelectValue placeholder="Semua Bayar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="text-xs" value="ALL">Semua Bayar</SelectItem>
                <SelectItem className="text-xs" value="LUNAS">Lunas</SelectItem>
                <SelectItem className="text-xs" value="DP">DP / Cicilan</SelectItem>
                <SelectItem className="text-xs" value="PENDING">Belum Bayar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Hari Filter */}
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <span className="text-[11px] font-semibold text-neutral-500 whitespace-nowrap">Hari:</span>
            <Select value={filterDay} onValueChange={setFilterDay}>
              <SelectTrigger className="h-8 text-xs w-[115px] border-none rounded-md bg-[#f5f5f5] dark:bg-neutral-800 text-[#111111] dark:text-neutral-200 hover:bg-[#e5e5e5] dark:hover:bg-neutral-700 transition-colors whitespace-nowrap shadow-2xs">
                <SelectValue placeholder="Semua Hari" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="text-xs" value="ALL">Semua Hari</SelectItem>
                {DAYS_LIST.map((day) => (
                  <SelectItem key={day} className="text-xs" value={day}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Total Filter Counter Strip */}
          <div className="ml-auto text-[11px] text-neutral-400 font-medium whitespace-nowrap self-center">
            Menampilkan <span className="font-semibold text-neutral-700 dark:text-neutral-200">{filteredAndSortedStudents.length}</span> dari {students.length} siswa
          </div>
        </div>
      </div>

      {/* 2. DATA TABLE (Container Fit & Anti-Wrapping) */}
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[860px]">
          <TableHeader className="bg-[#f5f5f5] dark:bg-neutral-800 border-none select-none">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="w-12 text-[11px] font-bold text-neutral-500 uppercase tracking-wider text-center whitespace-nowrap flex-shrink-0">
                No
              </TableHead>

              {/* Header Nama Siswa & Wali (Sortable) */}
              <TableHead
                onClick={() => handleSortToggle('name')}
                className="group cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 text-[11px] font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white uppercase tracking-wider whitespace-nowrap flex-shrink-0 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Nama Siswa & Wali</span>
                  {renderSortIcon('name')}
                </div>
              </TableHead>

              {/* Header Paket (Sortable) */}
              <TableHead
                onClick={() => handleSortToggle('package')}
                className="group cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 text-[11px] font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white uppercase tracking-wider whitespace-nowrap flex-shrink-0 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Paket</span>
                  {renderSortIcon('package')}
                </div>
              </TableHead>

              {/* Header Durasi (Sortable) */}
              <TableHead
                onClick={() => handleSortToggle('duration')}
                className="group cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 text-[11px] font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white uppercase tracking-wider whitespace-nowrap flex-shrink-0 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Durasi</span>
                  {renderSortIcon('duration')}
                </div>
              </TableHead>

              {/* Header Jam Belajar (Sortable) */}
              <TableHead
                onClick={() => handleSortToggle('hours')}
                className="group cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 text-[11px] font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white uppercase tracking-wider whitespace-nowrap flex-shrink-0 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Jam Belajar</span>
                  {renderSortIcon('hours')}
                </div>
              </TableHead>

              {/* Header Jadwal Sesi (Sortable) */}
              <TableHead
                onClick={() => handleSortToggle('schedule')}
                className="group cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 text-[11px] font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white uppercase tracking-wider whitespace-nowrap flex-shrink-0 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Jadwal Sesi</span>
                  {renderSortIcon('schedule')}
                </div>
              </TableHead>

              {/* Header Status Bayar (Sortable) */}
              <TableHead
                onClick={() => handleSortToggle('payment')}
                className="group cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 text-[11px] font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white uppercase tracking-wider text-center whitespace-nowrap flex-shrink-0 transition-colors"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Status Bayar</span>
                  {renderSortIcon('payment')}
                </div>
              </TableHead>

              <TableHead className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider text-right pr-4 whitespace-nowrap flex-shrink-0">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredAndSortedStudents.length > 0 ? (
              filteredAndSortedStudents.map((s, idx) => {
                const totalInv = (s.valPerMonth || 0) * (s.durationMonths || 1)
                const totalSess = (s.sessionsPerMonth || 0) * (s.durationMonths || 1)
                const totalMins = totalSess * (s.minutesPerSession || 60)
                const paidPct = totalInv > 0 ? Math.min(100, Math.round(((s.paid || 0) / totalInv) * 100)) : 0
                
                // Evaluasi status sesi konkret
                const sessionInfo = getStudentSessionStatus(s)
                const isCompleted = sessionInfo.isCompleted

                return (
                  <TableRow
                    key={s.id || idx}
                    className="border-b border-neutral-100/60 dark:border-neutral-800/60 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    {/* NO */}
                    <TableCell className="text-center font-mono text-xs text-neutral-400 font-medium whitespace-nowrap flex-shrink-0">
                      {idx + 1}
                    </TableCell>

                    {/* NAMA SISWA & WALI */}
                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span
                            onClick={() => onViewDetail && onViewDetail(s)}
                            className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 hover:underline cursor-pointer whitespace-nowrap"
                          >
                            {s.name}
                          </span>
                          {isCompleted ? (
                            <span 
                              className="bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap flex-shrink-0"
                              title="Seluruh sesi bimbingan belajar tuntas"
                            >
                              SELESAI
                            </span>
                          ) : (
                            <span 
                              className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap flex-shrink-0"
                              title={`Masih ada ${sessionInfo.remainingSessions} sesi tersisa (${sessionInfo.completedSessions}/${sessionInfo.totalSessions} sesi)`}
                            >
                              AKTIF ({sessionInfo.remainingSessions} Sesi)
                            </span>
                          )}
                        </div>
                        {s.parentName && (
                          <span className="text-[11px] text-neutral-500 mt-0.5 whitespace-nowrap">
                            Wali: {s.parentName} {s.parentPhone ? `(${s.parentPhone})` : ''}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* PAKET */}
                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100 tracking-tight whitespace-nowrap">
                          {s.packageType}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-500 mt-0.5 whitespace-nowrap flex-shrink-0">
                          Rp {(s.valPerMonth || 0).toLocaleString('id-ID')}/bln
                        </span>
                      </div>
                    </TableCell>

                    {/* DURASI */}
                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                          {s.durationMonths || 1} Bln
                        </span>
                        <span className="text-[11px] text-neutral-500 mt-0.5 whitespace-nowrap">
                          ({totalSess} Sesi)
                        </span>
                      </div>
                    </TableCell>

                    {/* JAM BELAJAR */}
                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-neutral-800 dark:text-neutral-200 font-mono whitespace-nowrap flex-shrink-0">
                          {(totalMins / 60).toFixed(1)} Jam
                        </span>
                        <span className="text-[11px] text-neutral-500 mt-0.5 whitespace-nowrap">
                          ({s.minutesPerSession || 60}m/sesi)
                        </span>
                      </div>
                    </TableCell>

                    {/* JADWAL SESI */}
                    <TableCell className="whitespace-nowrap">
                      <span className="inline-block bg-[#f5f5f5] dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-none text-[11px] font-medium px-2.5 py-1 rounded-md whitespace-nowrap flex-shrink-0">
                        {s.schedule || 'Belum diatur'}
                      </span>
                    </TableCell>

                    {/* STATUS BAYAR (Solid-Filled Only, Zero Outline Strokes) */}
                    <TableCell className="text-center whitespace-nowrap">
                      <div className="flex flex-col items-center">
                        {(s.paid || 0) >= totalInv && totalInv > 0 ? (
                          <span className="bg-[#111111] text-white dark:bg-white dark:text-[#111111] border-none text-[10px] font-semibold gap-1 px-2.5 py-0.5 rounded-md inline-flex items-center whitespace-nowrap flex-shrink-0">
                            <Check className="w-3 h-3 text-current" />
                            LUNAS
                          </span>
                        ) : (s.paid || 0) > 0 ? (
                          <span className="bg-[#f5f5f5] text-[#111111] dark:bg-neutral-800 dark:text-neutral-200 border-none text-[10px] font-semibold gap-1 px-2.5 py-0.5 rounded-md inline-flex items-center whitespace-nowrap flex-shrink-0">
                            <AlertCircle className="w-3 h-3 text-current" />
                            DP {paidPct}%
                          </span>
                        ) : (
                          <span className="bg-[#f5f5f5] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border-none text-[10px] font-semibold gap-1 px-2.5 py-0.5 rounded-md inline-flex items-center whitespace-nowrap flex-shrink-0">
                            <AlertCircle className="w-3 h-3 text-current" />
                            BELUM BAYAR
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-neutral-500 mt-1 whitespace-nowrap flex-shrink-0">
                          Rp {(s.paid || 0).toLocaleString('id-ID')} / Rp {totalInv.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </TableCell>

                    {/* AKSI */}
                    <TableCell className="text-right pr-4 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <SimpleTooltip content="Lihat Detail">
                          <button
                            type="button"
                            onClick={() => onViewDetail && onViewDetail(s)}
                            className="group h-8 w-8 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-[#f5f5f5] dark:hover:bg-neutral-800 dark:hover:text-white border-none flex items-center justify-center cursor-pointer hover:shadow-xs transition-all"
                          >
                            <img 
                              src="/icons/search-detail.png" 
                              alt="Lihat Detail" 
                              className="w-4 h-4 object-contain opacity-70 group-hover:opacity-100 transition-opacity dark:invert" 
                            />
                          </button>
                        </SimpleTooltip>

                        <SimpleTooltip content="Invoice / Dokumen">
                          <button
                            type="button"
                            onClick={() => onOpenInvoice && onOpenInvoice(s)}
                            className="group h-8 w-8 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-[#f5f5f5] dark:hover:bg-neutral-800 dark:hover:text-white border-none flex items-center justify-center cursor-pointer hover:shadow-xs transition-all"
                          >
                            <img 
                              src="/nav-icons/invoice.png" 
                              alt="Invoice / Dokumen" 
                              className="w-4 h-4 object-contain opacity-70 group-hover:opacity-100 transition-opacity dark:invert" 
                            />
                          </button>
                        </SimpleTooltip>

                        {onOpenRoadmap && (
                          <SimpleTooltip content="Roadmap Siswa">
                            <button
                              type="button"
                              onClick={() => onOpenRoadmap(s)}
                              className="group h-8 w-8 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-[#f5f5f5] dark:hover:bg-neutral-800 dark:hover:text-white border-none flex items-center justify-center cursor-pointer hover:shadow-xs transition-all"
                            >
                              <img 
                                src="/icons/module.png" 
                                alt="Roadmap Siswa" 
                                className="w-4 h-4 object-contain opacity-70 group-hover:opacity-100 transition-opacity dark:invert" 
                              />
                            </button>
                          </SimpleTooltip>
                        )}

                        <SimpleTooltip content="Edit Siswa">
                          <button
                            type="button"
                            onClick={() => onEditStudent && onEditStudent(s)}
                            className="group h-8 w-8 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-[#f5f5f5] dark:hover:bg-neutral-800 dark:hover:text-white border-none flex items-center justify-center cursor-pointer hover:shadow-xs transition-all"
                          >
                            <img 
                              src="/icons/edit.png" 
                              alt="Edit Siswa" 
                              className="w-4 h-4 object-contain opacity-70 group-hover:opacity-100 transition-opacity dark:invert" 
                            />
                          </button>
                        </SimpleTooltip>

                        <SimpleTooltip content="Hapus Siswa">
                          <button
                            type="button"
                            onClick={() => onDeleteStudent && onDeleteStudent(s)}
                            className="group h-8 w-8 rounded-md text-neutral-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-neutral-800 border-none flex items-center justify-center cursor-pointer hover:shadow-xs transition-all"
                          >
                            <img 
                              src="/icons/delete.png" 
                              alt="Hapus Siswa" 
                              className="w-4 h-4 object-contain opacity-70 group-hover:opacity-100 transition-opacity dark:invert" 
                            />
                          </button>
                        </SimpleTooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-neutral-400 text-xs">
                  Tidak ada data siswa yang cocok dengan filter atau pencarian Anda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default StudentTableView
