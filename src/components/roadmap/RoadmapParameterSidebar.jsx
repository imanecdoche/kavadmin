import React from 'react'
import { 
  SlidersHorizontal, 
  Printer, 
  Calendar, 
  Clock, 
  RotateCcw, 
  Layers, 
  Pencil, 
  Trash2 
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatSessionNumber } from '../../utils/roadmapCalculator'

export const RoadmapParameterSidebar = ({
  students = [],
  activeStudent,
  selectedStudentId,
  onSelectStudent,
  batchName = 'BATCH 1',
  setBatchName,
  level = 'A2',
  setLevel,
  paperSize = 'A4',
  setPaperSize,
  startDate = '2026-09-04',
  setStartDate,
  startSessionNumber = 1,
  setStartSessionNumber,
  defaultStartTime = '09:00',
  setDefaultStartTime,
  defaultDuration = 90,
  setDefaultDuration,
  sessionsPerMonth = 4,
  setSessionsPerMonth,
  durationMonths = 3,
  setDurationMonths,
  roadmapTitle = 'PETA ALUR BELAJAR MODULAR 1-BATCH',
  setRoadmapTitle,
  onResetSessions,
  sessions = [],
  onEditSession,
  onDeleteSession,
  stats = { completedCount: 0, percentage: 0 },
}) => {
  // Paper options
  const paperOptions = [
    { id: 'A4', name: 'A4', dim: '210 × 297 mm' },
    { id: 'F4', name: 'F4 / Folio', dim: '215 × 330 mm' },
    { id: 'Legal', name: 'US Legal', dim: '215.9 × 355.6 mm' },
    { id: 'Letter', name: 'US Letter', dim: '215.9 × 279.4 mm' },
  ]

  const totalSessions = (Number(sessionsPerMonth) || 4) * (Number(durationMonths) || 3)

  return (
    <Card className="border-neutral-200 shadow-none bg-white font-sans text-neutral-900 rounded-xl overflow-hidden w-full lg:w-[420px] xl:w-[460px] shrink-0">
      <CardContent className="p-4 sm:p-5 space-y-5">
        
        {/* 1. PILIH SISWA TERDAFTAR */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
            PILIH SISWA TERDAFTAR
          </Label>
          <Select
            value={activeStudent?.id || selectedStudentId || (students[0]?.id ?? '')}
            onValueChange={(val) => {
              const matched = students.find((s) => s.id === val)
              if (matched && onSelectStudent) onSelectStudent(matched)
            }}
          >
            <SelectTrigger className="w-full text-xs h-9 border-neutral-200">
              <SelectValue placeholder="Pilih Siswa" />
            </SelectTrigger>
            <SelectContent>
              {students.length > 0 ? (
                students.map((st) => {
                  const sTime = st.scheduleTime || (st.schedule ? st.schedule.split(' ').slice(1).join(' ') : '09:00 WIB')
                  return (
                    <SelectItem key={st.id} value={st.id} className="text-xs">
                      {st.name} — Paket {st.packageType || 'GROW'} (Slot: {sTime})
                    </SelectItem>
                  )
                })
              ) : (
                <>
                  <SelectItem className="text-xs" value="alya">
                    Alya — Paket GROW (Slot: 09:00 WIB)
                  </SelectItem>
                  <SelectItem className="text-xs" value="hana">
                    Hana — Paket GROW (Slot: 09:00 WIB)
                  </SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* 2. PARAMETER 1-BATCH PEMBELAJARAN */}
        <div className="space-y-4 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 pb-1 border-b border-neutral-100">
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-600" />
            <span className="text-[11px] uppercase tracking-wider">Parameter 1-Batch Pembelajaran</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-neutral-700">Nama Batch / Periode</Label>
              <Input
                value={batchName}
                onChange={(e) => setBatchName && setBatchName(e.target.value)}
                className="text-xs h-9 font-mono font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-neutral-700">Jenjang CEFR</Label>
              <Select
                value={level}
                onValueChange={(val) => setLevel && setLevel(val)}
              >
                <SelectTrigger className="text-xs h-9 border-neutral-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="text-xs" value="A1">Level A1 - Beginner</SelectItem>
                  <SelectItem className="text-xs" value="A2">Level A2 - Elementary</SelectItem>
                  <SelectItem className="text-xs" value="B1">Level B1 - Intermediate</SelectItem>
                  <SelectItem className="text-xs" value="B2">Level B2 - Upper-Int</SelectItem>
                  <SelectItem className="text-xs" value="C1">Level C1 - Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Format Ukuran Kertas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-neutral-700">
                <Printer className="w-3.5 h-3.5 text-neutral-500" />
                <span>Format Ukuran Kertas Cetak & PDF</span>
              </div>
              <span className="font-mono text-[10px] text-neutral-400">
                {paperOptions.find((p) => p.id === paperSize)?.dim}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {paperOptions.map((opt) => {
                const isSelected = paperSize === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaperSize && setPaperSize(opt.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-black bg-neutral-50/70 shadow-xs ring-1 ring-black/10'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900">{opt.name}</span>
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-black' : 'border border-neutral-300'}`} />
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">
                      {opt.dim}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tanggal & Sesi Mulai */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-neutral-700 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-neutral-400" />
                Tanggal Mulai Batch
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate && setStartDate(e.target.value)}
                className="text-xs h-9 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-neutral-700">Mulai dari Sesi Ke-</Label>
              <Input
                type="number"
                min="1"
                value={startSessionNumber}
                onChange={(e) => setStartSessionNumber && setStartSessionNumber(Number(e.target.value) || 1)}
                className="text-xs h-9 font-mono text-center font-bold"
              />
            </div>
          </div>

          {/* Jam & Durasi Sesi */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-neutral-700 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-neutral-400" />
                  Jam Mulai Sesi
                </Label>
                <Input
                  value={defaultStartTime}
                  onChange={(e) => setDefaultStartTime && setDefaultStartTime(e.target.value)}
                  className="text-xs h-9 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-neutral-700">Durasi Sesi</Label>
                <Select
                  value={String(defaultDuration)}
                  onValueChange={(val) => setDefaultDuration && setDefaultDuration(Number(val) || 90)}
                >
                  <SelectTrigger className="text-xs h-9 border-neutral-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs" value="45">45 Menit</SelectItem>
                    <SelectItem className="text-xs" value="60">60 Menit (1 Jam)</SelectItem>
                    <SelectItem className="text-xs" value="90">90 Menit (1.5 Jam)</SelectItem>
                    <SelectItem className="text-xs" value="120">120 Menit (2 Jam)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quick Time Chips */}
            <div className="flex items-center gap-1.5 pt-0.5">
              {['09:00', '13:00', '15:00'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDefaultStartTime && setDefaultStartTime(t)}
                  className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md border transition-all ${
                    defaultStartTime === t
                      ? 'bg-black text-white border-black shadow-xs'
                      : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Kalkulasi Sesi/Bulan, Durasi, Total Sesi */}
          <div className="grid grid-cols-3 gap-2 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-neutral-700">Sesi / Bulan</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={sessionsPerMonth}
                onChange={(e) => setSessionsPerMonth && setSessionsPerMonth(Number(e.target.value) || 4)}
                className="text-xs h-9 font-mono text-center font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-neutral-700">Durasi (Bln)</Label>
              <Input
                type="number"
                min="1"
                max="12"
                value={durationMonths}
                onChange={(e) => setDurationMonths && setDurationMonths(Number(e.target.value) || 3)}
                className="text-xs h-9 font-mono text-center font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-neutral-700">Total Sesi</Label>
              <div className="h-9 rounded-md border border-neutral-200 bg-neutral-50/80 flex items-center justify-center font-mono font-bold text-xs text-neutral-900">
                {totalSessions} Sesi
              </div>
            </div>
          </div>

          {/* Judul Dokumen Roadmap */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-neutral-700">Judul Dokumen Roadmap</Label>
            <Input
              value={roadmapTitle}
              onChange={(e) => setRoadmapTitle && setRoadmapTitle(e.target.value)}
              className="text-xs h-9 uppercase font-semibold"
            />
          </div>

          {/* Tombol Sesuaikan Ulang */}
          <Button
            type="button"
            variant="outline"
            onClick={onResetSessions}
            className="w-full h-9 text-xs font-semibold border-neutral-200 hover:bg-neutral-50 gap-1.5 rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
            Sesuaikan Ulang Daftar {totalSessions} Sesi
          </Button>
        </div>

        {/* 3. DAFTAR SESI GRANULAR */}
        <div className="space-y-3 pt-3 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
              <Layers className="w-3.5 h-3.5 text-neutral-600" />
              <span className="uppercase text-[11px] tracking-wider">Daftar Sesi Granular ({sessions.length})</span>
            </div>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
              {stats.completedCount} Tuntas ({stats.percentage}%)
            </Badge>
          </div>

          {/* List Kartu Sesi */}
          <div className="space-y-2 max-h-[320px] overflow-y-auto overscroll-contain pr-0.5">
            {sessions.map((sesi, idx) => {
              const rawStatus = String(sesi.status || '').toUpperCase()
              const isDone = rawStatus === 'COMPLETED' || rawStatus === 'SELESAI' || sesi.isCompleted
              const isRun = rawStatus === 'IN_PROGRESS' || rawStatus === 'SEDANG BERJALAN'
              const sessionNo = sesi.sessionNumber ? formatSessionNumber(sesi.sessionNumber) : (sesi.sessionNo || `0${idx + 1}`)

              return (
                <div
                  key={sesi.id || idx}
                  onClick={() => onEditSession && onEditSession(sesi)}
                  className="p-3 rounded-lg border border-neutral-200/90 bg-white hover:border-neutral-300 transition-colors flex items-center justify-between gap-3 shadow-xs cursor-pointer group"
                >
                  <div className="truncate flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[11px] font-mono font-bold text-neutral-800">
                        Sesi {sessionNo}
                      </span>
                      <span className="text-neutral-300">•</span>
                      <Badge variant="outline" className="text-[9px] font-mono px-1 py-0 border-neutral-200">
                        {sesi.level || level}
                      </Badge>
                      <span className="text-neutral-300">•</span>
                      {isDone ? (
                        <span className="text-[10px] font-bold text-emerald-700">SELESAI</span>
                      ) : isRun ? (
                        <span className="text-[10px] font-bold text-blue-700">BERJALAN</span>
                      ) : (
                        <span className="text-[10px] font-semibold text-neutral-400">BELUM</span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-neutral-900 truncate">
                      {sesi.title}
                    </p>
                  </div>

                  {/* Aksi Sesi */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (onEditSession) onEditSession(sesi)
                      }}
                      className="h-7 w-7 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md"
                      title="Edit Sesi"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (onDeleteSession) onDeleteSession(sesi.id)
                      }}
                      className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md"
                      title="Hapus Sesi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </CardContent>
    </Card>
  )
}

export default RoadmapParameterSidebar
