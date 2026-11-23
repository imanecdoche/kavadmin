import React from 'react'
import {
  User,
  Calendar,
  Sliders,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Check
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

export const INDONESIAN_COMPETENCY_MAP = {
  grammar: { label: 'Tata Bahasa & Struktur Kalimat', shortLabel: 'Tata Bahasa' },
  vocabulary: { label: 'Kosakata & Penguasaan Idiom', shortLabel: 'Kosakata' },
  speaking: { label: 'Kelancaran Berbicara & Pelafalan', shortLabel: 'Berbicara' },
  listening: { label: 'Pemahaman Mendengar & Simakan', shortLabel: 'Mendengar' },
  discipline: { label: 'Kedisiplinan & Tugas Mandiri', shortLabel: 'Kedisiplinan' }
}

export default function ReportCardParameterSidebar({
  reportId,
  onRegenerateId,
  studentName,
  onStudentNameChange,
  showSuggestions,
  setShowSuggestions,
  isStudentLocked,
  students = [],
  onSelectStudent,
  guardianName,
  setGuardianName,
  programTier,
  setProgramTier,
  periodName,
  setPeriodName,
  issueDate,
  setIssueDate,
  documentTitle,
  setDocumentTitle,
  attendance,
  onAttendanceChange,
  competencies,
  onScoreChange,
  qualitativeAssessment,
  setQualitativeAssessment,
  includeNotes = true,
  setIncludeNotes = () => {},
  evaluatorName = 'FATIH FARHAT ASSHIDIQ',
  setEvaluatorName = () => {},
  evaluatorTitle = 'Founder & Academic Director',
  setEvaluatorTitle = () => {},
  verification = { isSigned: true, isStamped: false },
  setVerification = () => {}
}) {
  return (
    <div className="w-full lg:w-[420px] xl:w-[460px] shrink-0 space-y-4 no-print">
      
      {/* ========================================================================= */}
      {/* KARTU 1: DATA SISWA & PERIODE RAPOR */}
      {/* ========================================================================= */}
      <Card className="border-neutral-200 shadow-none">
        <CardHeader className="pb-3 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-black" />
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-black">
                Data Siswa & Periode Rapor
              </CardTitle>
            </div>
            <button
              type="button"
              onClick={onRegenerateId}
              className="text-[11px] text-neutral-500 hover:text-black flex items-center gap-1 font-mono font-medium transition-colors"
              title="Acak nomor laporan baru"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{reportId}</span>
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-3.5 space-y-3">
          
          {/* Nama Siswa Field with Autocomplete */}
          <div className="relative space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-neutral-700">
                Nama Siswa <span className="text-red-500">*</span>
              </Label>
              {isStudentLocked && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                  <Check className="w-3.5 h-3.5" />
                  <span>Terpilih</span>
                </span>
              )}
            </div>
            <Input
              type="text"
              required
              value={studentName}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onChange={onStudentNameChange}
              placeholder="Ketik nama siswa..."
              className="h-8 text-xs font-medium"
            />

            {/* Autosuggestion Dropdown */}
            {showSuggestions && studentName.trim().length > 0 && (
              <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white border border-neutral-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {(Array.isArray(students) ? students : [])
                  .filter(st => (st.name || '').toLowerCase().includes(studentName.toLowerCase().trim()))
                  .map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onMouseDown={() => onSelectStudent(st)}
                      className="w-full text-left px-3 py-2 hover:bg-neutral-50 border-b border-neutral-100 last:border-0 text-xs transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-neutral-900">{st.name}</p>
                        <span className="text-[10px] text-neutral-400 font-normal">
                          Wali: {st.parentName || '-'} • {st.batchName || 'Batch 1'}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {st.programTier || st.packageType || 'GROW'}
                      </Badge>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* 2 Kolom Sejajar: Orang Tua / Wali & Paket Program */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-neutral-700">
                Nama Orang Tua / Wali
              </Label>
              <Input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="Ibu / Bapak..."
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-neutral-700">
                Paket Program
              </Label>
              <Select value={programTier} onValueChange={setProgramTier}>
                <SelectTrigger className="h-8 text-xs bg-white">
                  <SelectValue placeholder="Pilih paket" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEED">SEED</SelectItem>
                  <SelectItem value="GROW">GROW</SelectItem>
                  <SelectItem value="BOOST">BOOST</SelectItem>
                  <SelectItem value="MASTER">MASTER</SelectItem>
                  <SelectItem value="CUSTOM">CUSTOM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 2 Kolom Sejajar: Periode Evaluasi & Tanggal Terbit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-neutral-700">
                Periode Evaluasi
              </Label>
              <Input
                type="text"
                value={periodName}
                onChange={(e) => setPeriodName(e.target.value)}
                placeholder="Contoh: Batch 1 (Sesi 1 - 12)"
                className="h-8 text-xs font-medium font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-neutral-700">
                Tanggal Terbit
              </Label>
              <Input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          {/* Judul Dokumen Rapor */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-neutral-700">
              Judul Dokumen Rapor
            </Label>
            <Input
              type="text"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder="LAPORAN HASIL EVALUASI PERKEMBANGAN BELAJAR"
              className="h-8 text-xs font-medium"
            />
          </div>

        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* KARTU 2: METRIK PRESENSI & KEHADIRAN */}
      {/* ========================================================================= */}
      <Card className="border-neutral-200 shadow-none">
        <CardHeader className="pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-black" />
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-black">
              Metrik Presensi & Kehadiran
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-3.5 space-y-3">
          
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-neutral-600">
                Total Sesi
              </Label>
              <Input
                type="number"
                min="1"
                value={attendance.totalSessions}
                onChange={(e) => onAttendanceChange('totalSessions', e.target.value)}
                className="h-8 text-xs font-semibold text-center font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-neutral-600">
                Sesi Hadir
              </Label>
              <Input
                type="number"
                min="0"
                max={attendance.totalSessions}
                value={attendance.attendedSessions}
                onChange={(e) => onAttendanceChange('attendedSessions', e.target.value)}
                className="h-8 text-xs font-bold text-center text-black font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-neutral-600">
                Rasio Kehadiran
              </Label>
              <div className="h-8 flex items-center justify-center text-xs bg-neutral-100 border border-neutral-300 text-black font-bold rounded-md font-mono">
                {attendance.attendanceRate}%
              </div>
            </div>
          </div>

          <div className="pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600 text-[11px]">Tingkat Ketepatan Waktu:</span>
              <span className="font-mono font-bold text-black text-xs">
                {attendance.punctualityRate || 100}%
              </span>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* KARTU 3: MATRIKS PENILAIAN KOMPETENSI (0 - 100) */}
      {/* ========================================================================= */}
      <Card className="border-neutral-200 shadow-none">
        <CardHeader className="pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-black" />
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-black">
              Matriks Penilaian Kompetensi (0 - 100)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-3.5 space-y-3">
          
          <div className="space-y-2.5">
            {competencies.map((comp) => {
              const s = Number(comp.score) || 0
              const mapInfo = INDONESIAN_COMPETENCY_MAP[comp.key] || { label: comp.label, shortLabel: comp.label }
              return (
                <div
                  key={comp.key}
                  className="p-2.5 rounded-lg border border-neutral-200 bg-neutral-50/60 space-y-1.5"
                >
                  {/* Header aspect, predikat & score */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-black">
                      <span>{mapInfo.label}</span>
                      <span className="text-[10px] text-neutral-400 font-mono font-normal">
                        ({comp.weight}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 h-4 bg-white border-neutral-300 text-neutral-800">
                        {comp.benchmark}
                      </Badge>
                      <span className="w-9 text-right font-mono font-bold text-xs text-black">
                        {s}
                      </span>
                    </div>
                  </div>

                  {/* Slider Component */}
                  <Slider
                    value={[s]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(vals) => onScoreChange(comp.key, vals[0])}
                    className="py-1 cursor-pointer"
                  />
                </div>
              )
            })}
          </div>

        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* KARTU 4: EVALUASI KUALITATIF & REKOMENDASI MENTOR */}
      {/* ========================================================================= */}
      <Card className="border-neutral-200 shadow-none">
        <CardHeader className="pb-3 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-black" />
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-black">
                Evaluasi Kualitatif & Rekomendasi
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="include-notes-switch" className="text-[11px] text-neutral-500 cursor-pointer">
                Sertakan
              </Label>
              <Switch
                id="include-notes-switch"
                checked={includeNotes}
                onCheckedChange={setIncludeNotes}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-3.5 space-y-3">
          
          {includeNotes ? (
            <div className="space-y-3">
              {/* Key Strengths */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-neutral-800">
                  Kekuatan & Capaian Unggulan (Key Strengths)
                </Label>
                <Textarea
                  rows={2}
                  value={qualitativeAssessment.keyStrengths}
                  onChange={(e) =>
                    setQualitativeAssessment({
                      ...qualitativeAssessment,
                      keyStrengths: e.target.value
                    })
                  }
                  placeholder="Tuliskan capaian dan kelebihan siswa..."
                  className="text-xs"
                />
              </div>

              {/* Areas for Growth */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-neutral-800">
                  Area Fokus Peningkatan Akademik
                </Label>
                <Textarea
                  rows={2}
                  value={qualitativeAssessment.areasForImprovement}
                  onChange={(e) =>
                    setQualitativeAssessment({
                      ...qualitativeAssessment,
                      areasForImprovement: e.target.value
                    })
                  }
                  placeholder="Tuliskan hal yang perlu dilatih lebih intensif..."
                  className="text-xs"
                />
              </div>

              {/* Target Kurikulum Berikutnya */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-neutral-800">
                  Target Kurikulum / Jenjang Berikutnya
                </Label>
                <Input
                  type="text"
                  value={qualitativeAssessment.nextRoadmapTarget}
                  onChange={(e) =>
                    setQualitativeAssessment({
                      ...qualitativeAssessment,
                      nextRoadmapTarget: e.target.value
                    })
                  }
                  placeholder="Contoh: Modul Academic Reading & Discussion..."
                  className="h-8 text-xs font-medium"
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-400 italic text-center py-2">
              Catatan evaluasi naratif dinonaktifkan pada dokumen rapor.
            </p>
          )}

        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* KARTU 5: PENGESAHAN DOKUMEN */}
      {/* ========================================================================= */}
      <Card className="border-neutral-200 shadow-none">
        <CardHeader className="pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-black" />
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-black">
              Pengesahan & Legalitas Dokumen
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-3.5 space-y-3">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-neutral-700">
                Nama Direktur / Evaluator
              </Label>
              <Input
                type="text"
                value={evaluatorName}
                onChange={(e) => setEvaluatorName(e.target.value)}
                className="h-8 text-xs font-bold uppercase"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-neutral-700">
                Jabatan
              </Label>
              <Input
                type="text"
                value={evaluatorTitle}
                onChange={(e) => setEvaluatorTitle(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs border-t border-neutral-100">
            <span className="text-neutral-600">Sertakan Tanda Tangan Digital</span>
            <Switch
              checked={verification.isSigned}
              onCheckedChange={(checked) =>
                setVerification((prev) => ({ ...prev, isSigned: checked }))
              }
            />
          </div>

        </CardContent>
      </Card>

    </div>
  )
}
