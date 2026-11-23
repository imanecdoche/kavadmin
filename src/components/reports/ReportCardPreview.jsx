import React from 'react'
import { formatDateIndonesian } from '../../utils/dateFormatter'
import { logoSvg, ttdFatihPng } from '../../assets'

/**
 * 🏛️ ReportCardPreview
 * Lembar Rapor Akademik Formal Kavio Academy A4 Portrait.
 * 
 * Standar Desain:
 * - Gaya: Lembaga Akademik Modern & Berkelas (Cambridge / British Council Style), lapang bernafas.
 * - Branding: Full Logo Kavio resmi di kiri atas, nama lembaga 'KAVIO ACADEMY' (tanpa 'Yayasan').
 * - Tipografi: Serif Elegan (Lora / Playfair Display / Georgia) dipadukan angka tabular monospaced.
 * - Tabel Nilai: Hairline Clean Bordered Table dengan padding sel lega dan deskripsi kualitatif per aspek.
 * - Rekapitulasi: Presensi kehadiran & hasil akhir komposit berdampingan berimbang.
 * - Pengesahan: 1 Kolom tunggal di kanan bawah (Pandeglang, Tanda Tangan Direktur Akademik Fatih Farhat Asshidiq).
 * - Dimensi: Tepat 1 halaman A4 portrait (w-[794px] min-h-[1123px]) siap cetak & anti-potong.
 */
export default function ReportCardPreview({ reportData, previewRef }) {
  if (!reportData) return null

  const {
    id = 'REP/KEEN/202611/7097',
    studentName = '-',
    guardianName = '-',
    programTier = 'GROW',
    periodName = 'Batch 1 (Sesi 1 - 8)',
    issueDate = new Date().toISOString().split('T')[0],
    attendance = { totalSessions: 8, attendedSessions: 8, attendanceRate: 100, punctualityRate: 100 },
    competencies = [],
    compositeScore = 85.0,
    letterGrade = 'A',
    performanceCategory = {
      label: 'PROFICIENT',
      description: 'Pemahaman materi sangat solid, komunikasi aktif & minim kesalahan mendasar.',
    },
    qualitativeAssessment = {
      keyStrengths: 'Siswa menunjukkan antusiasme tinggi dan pemahaman konsep yang cepat.',
      areasForImprovement: 'Perlu memperluas variasi kosakata formal dalam sesi speaking.',
      generalNotes: 'Progres belajar sangat memuaskan.',
      nextRoadmapTarget: 'Modul Grammar Tingkat Menengah & Percakapan Tematik.'
    },
    evaluatorName = 'FATIH FARHAT ASSHIDIQ',
    evaluatorTitle = 'Founder & Academic Director',
    verification = { isSigned: true, isStamped: false }
  } = reportData

  const INDONESIAN_LABEL_MAP = {
    grammar: 'Tata Bahasa & Struktur Kalimat (Grammar)',
    vocabulary: 'Penguasaan Kosakata & Ungkapan (Vocabulary)',
    speaking: 'Kelancaran Berbicara & Pelafalan (Speaking)',
    listening: 'Pemahaman Simakan & Menyimak (Listening)',
    discipline: 'Kedisiplinan, Partisipasi & Tugas Mandiri'
  }

  const getLetterGrade = (score) => {
    const s = Number(score) || 0
    if (s >= 88) return 'A'
    if (s >= 78) return 'B'
    if (s >= 65) return 'C'
    return 'D'
  }

  const getCompetencyDescription = (key, score) => {
    const s = Number(score) || 0
    if (s >= 88) return 'Sangat memuaskan; menguasai kaidah secara komprehensif, mandiri, dan akurat.'
    if (s >= 78) return 'Baik; mencapai indikator kompetensi dengan responsif dan berpartisipasi aktif.'
    if (s >= 65) return 'Cukup; memahami materi dasar namun memerlukan latihan terarah dan pengayaan berkala.'
    return 'Perlu bimbingan; memerlukan pendampingan intensif dan pengulangan materi pokok.'
  }

  return (
    <div
      ref={previewRef}
      id="report-card-canvas"
      className="w-[794px] h-[1123px] max-h-[1123px] shrink-0 bg-white border border-neutral-300 shadow-2xl p-8 sm:p-9 text-neutral-900 font-serif-formal print:shadow-none print:border-none print:p-0 relative overflow-hidden flex flex-col justify-between"
      style={{
        width: '794px',
        height: '1123px',
        maxHeight: '1123px',
        boxSizing: 'border-box',
        fontFamily: `'Lora', 'Playfair Display', 'Georgia', 'Times New Roman', serif`,
      }}
    >
      {/* KONTEN UTAMA DOKUMEN RAPOR */}
      <div className="space-y-3.5">
        
        {/* ========================================================================= */}
        {/* 1. HEADER KAVIO ACADEMY BERKELAS (FULL LOGO & METADATA RESMI) */}
        {/* ========================================================================= */}
        <div className="flex justify-between items-start border-b border-black pb-3 gap-6">
          <div className="space-y-1">
            <img
              src={logoSvg}
              alt="Kavio Academy"
              className="h-11 sm:h-12 w-auto object-contain"
            />
            <p className="text-xs italic text-neutral-700 tracking-wide pt-0.5">
              Private English Class & Academic Mentoring
            </p>
            <p className="text-[10px] text-neutral-500 font-sans">
              Pandeglang, Banten • contact@kavioedu.id • www.kavioedu.id
            </p>
          </div>

          <div className="text-right font-mono text-xs space-y-1 pt-0.5 shrink-0">
            <div className="font-bold text-black uppercase tracking-wider text-xs sm:text-[13px]">
              EVALUASI AKADEMIK RESMI
            </div>
            <div className="text-neutral-600">
              No. Laporan : <span className="font-bold text-black">{id}</span>
            </div>
            <div className="text-neutral-600">
              Tanggal     : {formatDateIndonesian(issueDate)}
            </div>
            <div className="text-neutral-600">
              Program     : <span className="font-bold text-black">Paket {programTier}</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. JUDUL DOKUMEN LAPORAN HASIL BELAJAR */}
        {/* ========================================================================= */}
        <div className="text-center py-0.5">
          <h2 className="text-base sm:text-lg font-bold tracking-wider text-black uppercase font-serif">
            LAPORAN HASIL EVALUASI PERKEMBANGAN BELAJAR
          </h2>
          <p className="text-xs italic text-neutral-600 mt-0.5">
            Official Academic Progress & Competency Evaluation Report
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 3. IDENTITAS PESERTA DIDIK (HAIRLINE CLEAN BORDERED BOX) */}
        {/* ========================================================================= */}
        <div className="border border-neutral-300 p-3 text-xs">
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 leading-relaxed">
            
            {/* Kolom Kiri */}
            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-36 shrink-0 text-neutral-600">Nama Peserta Didik</span>
                <span className="w-3 shrink-0 font-bold">:</span>
                <strong className="font-bold text-black uppercase">{studentName || '-'}</strong>
              </div>
              <div className="flex">
                <span className="w-36 shrink-0 text-neutral-600">Nomor Registrasi / ID</span>
                <span className="w-3 shrink-0 font-bold">:</span>
                <span className="font-mono font-semibold text-black">{id}</span>
              </div>
              <div className="flex">
                <span className="w-36 shrink-0 text-neutral-600">Program Pembelajaran</span>
                <span className="w-3 shrink-0 font-bold">:</span>
                <span className="font-bold text-black">Paket {programTier}</span>
              </div>
            </div>

            {/* Kolom Kanan */}
            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-36 shrink-0 text-neutral-600">Orang Tua / Wali</span>
                <span className="w-3 shrink-0 font-bold">:</span>
                <span className="font-semibold text-black">{guardianName || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-36 shrink-0 text-neutral-600">Periode Evaluasi</span>
                <span className="w-3 shrink-0 font-bold">:</span>
                <span className="text-black">{periodName}</span>
              </div>
              <div className="flex">
                <span className="w-36 shrink-0 text-neutral-600">Tanggal Penerbitan</span>
                <span className="w-3 shrink-0 font-bold">:</span>
                <span className="text-black">{formatDateIndonesian(issueDate)}</span>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. TABEL CAPAIAN KOMPETENSI (HAIRLINE CLEAN BORDERED TABLE) */}
        {/* ========================================================================= */}
        <div className="space-y-1.5">
          <div className="text-xs font-bold uppercase tracking-wider text-black flex justify-between items-baseline">
            <span>I. PENILAIAN CAPAIAN KOMPETENSI BELAJAR</span>
            <span className="text-[11px] font-normal text-neutral-500 font-sans">Rentang Penilaian: 0 – 100</span>
          </div>

          <table className="w-full text-left border-collapse border border-neutral-300 text-xs">
            <thead>
              <tr className="border-b border-neutral-300 bg-neutral-50/80 text-black font-bold uppercase text-[10px] tracking-wide">
                <th className="py-2 px-2.5 w-10 text-center border-r border-neutral-300">No</th>
                <th className="py-2 px-3 border-r border-neutral-300">Aspek Kompetensi yang Dinilai</th>
                <th className="py-2 px-2.5 w-16 text-center border-r border-neutral-300">Bobot</th>
                <th className="py-2 px-2.5 w-16 text-center border-r border-neutral-300">Nilai</th>
                <th className="py-2 px-2.5 w-16 text-center border-r border-neutral-300">Predikat</th>
                <th className="py-2 px-3">Deskripsi Capaian Pembelajaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {competencies.map((comp, idx) => {
                const s = Number(comp.score) || 0
                const letter = getLetterGrade(s)
                const label = (comp.key && INDONESIAN_LABEL_MAP[comp.key]) || comp.label
                const desc = comp.description || getCompetencyDescription(comp.key, s)

                return (
                  <tr key={comp.key || idx} className="align-top hover:bg-neutral-50/30 transition-colors">
                    <td className="py-2 px-2.5 text-center font-bold border-r border-neutral-300 text-[11px] text-neutral-700">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 border-r border-neutral-300 font-semibold text-black text-[11px]">
                      {label}
                    </td>
                    <td className="py-2 px-2.5 text-center border-r border-neutral-300 font-sans text-neutral-600 text-[10px]">
                      {comp.weight}%
                    </td>
                    <td className="py-2 px-2.5 text-center font-bold border-r border-neutral-300 font-mono text-xs text-black">
                      {s}
                    </td>
                    <td className="py-2 px-2.5 text-center font-bold border-r border-neutral-300 font-mono text-xs text-black">
                      {letter}
                    </td>
                    <td className="py-2 px-3 text-[11px] text-neutral-700 leading-relaxed">
                      {desc}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* ========================================================================= */}
        {/* 5. PRESENSI & RANGKUMAN HASIL AKHIR (BERDAMPINGAN SECARA PROPORSIONAL) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          
          {/* Bagian II: Presensi */}
          <div className="space-y-1.5">
            <div className="font-bold uppercase tracking-wider text-black text-xs">
              II. REKAPITULASI PRESENSI & KEHADIRAN
            </div>
            <table className="w-full border-collapse border border-neutral-300 text-xs">
              <tbody>
                <tr className="border-b border-neutral-200">
                  <td className="py-1.5 px-3 border-r border-neutral-300 text-neutral-600 text-[11px]">Total Sesi Pertemuan</td>
                  <td className="py-1.5 px-3 font-bold font-mono text-center text-[11px]">{attendance.totalSessions} Sesi</td>
                </tr>
                <tr className="border-b border-neutral-200">
                  <td className="py-1.5 px-3 border-r border-neutral-300 text-neutral-600 text-[11px]">Kehadiran Aktual</td>
                  <td className="py-1.5 px-3 font-bold font-mono text-center text-black text-[11px]">{attendance.attendedSessions} Sesi</td>
                </tr>
                <tr className="border-b border-neutral-200">
                  <td className="py-1.5 px-3 border-r border-neutral-300 text-neutral-600 text-[11px]">Persentase Kehadiran</td>
                  <td className="py-1.5 px-3 font-bold font-mono text-center text-black text-[11px]">{attendance.attendanceRate}%</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 border-r border-neutral-300 text-neutral-600 text-[11px]">Tingkat Ketepatan Waktu</td>
                  <td className="py-1.5 px-3 font-bold font-mono text-center text-black text-[11px]">{attendance.punctualityRate || 100}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bagian III: Rangkuman Skor Komposit */}
          <div className="space-y-1.5">
            <div className="font-bold uppercase tracking-wider text-black text-xs">
              III. HASIL PENILAIAN KOMPOSIT AKHIR
            </div>
            <div className="border border-neutral-300 p-3 flex flex-col justify-between h-[118px] text-xs">
              <div className="flex justify-between items-baseline border-b border-neutral-200 pb-1.5">
                <span className="text-neutral-600 text-[11px]">Nilai Rata-rata Komposit</span>
                <span className="font-bold font-mono text-base text-black">
                  {Number(compositeScore).toFixed(1)} <span className="text-xs font-normal text-neutral-400">/ 100</span>
                </span>
              </div>
              <div className="flex justify-between items-baseline border-b border-neutral-200 pb-1.5">
                <span className="text-neutral-600 text-[11px]">Predikat Nilai Huruf</span>
                <span className="font-black font-mono text-base text-black">{letterGrade}</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-neutral-600">Status Kualifikasi</span>
                <span className="font-bold text-black uppercase tracking-wide">
                  {Number(compositeScore) >= 70 ? 'TUNTAS / MEMENUHI SYARAT' : 'PERLU PENGULANGAN'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 6. EVALUASI KUALITATIF & REKOMENDASI PENDIDIK */}
        {/* ========================================================================= */}
        <div className="space-y-1.5">
          <div className="font-bold uppercase tracking-wider text-black text-xs">
            IV. EVALUASI KUALITATIF & REKOMENDASI PEMBIMBING
          </div>
          <div className="border border-neutral-300 p-3.5 space-y-2 text-xs leading-relaxed">
            <div>
              <span className="font-bold text-black uppercase tracking-wide text-[10px]">Kekuatan & Capaian Unggulan: </span>
              <span className="text-neutral-800 text-[11px]">{qualitativeAssessment.keyStrengths || '-'}</span>
            </div>
            <div className="border-t border-neutral-200 pt-1.5">
              <span className="font-bold text-black uppercase tracking-wide text-[10px]">Fokus Peningkatan Akademik: </span>
              <span className="text-neutral-800 text-[11px]">{qualitativeAssessment.areasForImprovement || '-'}</span>
            </div>
            <div className="border-t border-neutral-200 pt-1.5">
              <span className="font-bold text-black uppercase tracking-wide text-[10px]">Target Kurikulum Berikutnya: </span>
              <span className="text-neutral-800 text-[11px]">{qualitativeAssessment.nextRoadmapTarget || 'Melanjutkan ke jenjang silabus berikutnya.'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 7. PENGESAHAN DOKUMEN (1 KOLOM TUNGGAL DI KANAN BAWAH) */}
      {/* ========================================================================= */}
      <div className="pt-3 border-t border-black flex justify-between items-end text-xs">
        
        {/* Legalitas Kiri */}
        <div className="max-w-[340px] text-[10px] text-neutral-500 space-y-0.5 leading-snug">
          <p className="font-bold text-black uppercase">Ketentuan Dokumen:</p>
          <p>
            Laporan hasil belajar ini diterbitkan secara sah oleh sistem akademik Kavio Edu sebagai evaluasi resmi perkembangan kompetensi peserta didik.
          </p>
          <p className="font-mono text-neutral-400 text-[9px] pt-0.5">
            Security Ref: {String(id).replace(/[^a-zA-Z0-9]/g, '')}-KEEN
          </p>
        </div>

        {/* Pengesahan Kanan */}
        <div className="text-center shrink-0 w-56">
          <p className="text-xs text-neutral-700">
            Pandeglang, {formatDateIndonesian(issueDate)}
          </p>
          <p className="text-[11px] font-semibold text-neutral-600 mt-0.5">
            Founder & Academic Director,
          </p>
          
          {/* Kontainer Tanda Tangan */}
          <div className="h-16 sm:h-18 w-full my-0.5 flex items-center justify-center">
            {verification.isSigned && (
              <img
                src={ttdFatihPng}
                alt="Tanda Tangan Direktur"
                className="h-14 sm:h-16 w-auto max-w-full object-contain pointer-events-none select-none"
              />
            )}
          </div>

          <div className="border-t border-black pt-1">
            <p className="font-bold text-black text-xs sm:text-sm leading-tight uppercase font-serif">
              {evaluatorName || 'FATIH FARHAT ASSHIDIQ'}
            </p>
            <p className="text-[10px] text-neutral-500 leading-tight font-sans">
              Kavio Edu Academic System
            </p>
          </div>
        </div>

      </div>

    </div>
  )
}
