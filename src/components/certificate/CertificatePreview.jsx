import React from 'react'
import { logoSvg, stempelKavioEduPng, ttdFatihPng } from '../../assets'
import { INVOICE_CONFIG } from '../../config/stampConfig'

export default function CertificatePreview({ certificateData, previewRef }) {
  if (!certificateData) return null

  const {
    documentId = "CRT/KEEN/202608/0001",
    studentName = "Alya",
    programName = "Paket GROW",
    batchName = "BATCH 1",
    cefrLevel = "A2 - Elementary",
    totalSessions = 12,
    completionDate = "29 Agustus 2026",
    predicate = "SANGAT BAIK (EXCELLENT)",
    verificationHash = "VERIF-KEEN-202608-CERT",
    signLocation = "Pandeglang",
    directorName = "Fatih Farhat Asshidiq",
    directorTitle = "Founder & Academic Director",
    gratitudeMessage = "Terima kasih atas dedikasi, kerja keras, dan komitmen luar biasa yang telah ditunjukkan selama mengikuti program pembelajaran. Semoga pencapaian ini menjadi pijakan kuat untuk meraih kesuksesan akademik dan masa depan yang gemilang.",
    verification = { isSigned: true, isStamped: true }
  } = certificateData

  return (
    <div
      ref={previewRef}
      id="certificate-export-canvas"
      className="w-[794px] min-h-[1123px] max-w-[794px] bg-white p-14 box-border text-slate-900 mx-auto flex flex-col justify-between relative shadow-2xl print:shadow-none print:border-none print:p-8"
      style={{ width: '794px', minHeight: '1123px', maxWidth: '794px', boxSizing: 'border-box' }}
    >
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 opacity-[0.025]">
        <span className="text-8xl font-black uppercase tracking-widest text-slate-900 -rotate-12 text-center max-w-lg leading-tight">
          KAVIO EDU
        </span>
      </div>

      {/* 1. MASTER HEADER & METADATA */}
      <div className="relative z-10">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center">
            <img src={logoSvg} alt="Kavio Edu Logo" className="h-16 w-auto max-w-[240px] object-contain shrink-0" />
          </div>

          <div className="text-right flex flex-col justify-center shrink-0">
            <p className="text-[11px] font-mono font-bold text-slate-900 tracking-wider whitespace-nowrap">
              Doc. No. : {documentId}
            </p>
            <p className="text-xs text-slate-600 mt-0.5 whitespace-nowrap">
              Tanggal Terbit: <span className="font-semibold text-slate-800">{completionDate}</span>
            </p>
          </div>
        </div>

        {/* Divider Header */}
        <div className="w-full border-b-2 border-slate-900 my-4" />

        {/* 2. TITEL UTAMA SERTIFIKAT */}
        <div className="text-center py-6">
          <p className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-fluent-blue mb-2">
            CERTIFICATE OF COMPLETION
          </p>
          <h2 className="text-2xl font-black tracking-wide text-slate-900 uppercase">
            SERTIFIKAT KELULUSAN & PENCAPAIAN
          </h2>
          <div className="w-16 h-0.5 bg-slate-900 mx-auto mt-3" />
        </div>

        {/* 3. RECIPIENT STATEMENT */}
        <div className="text-center mt-4">
          <p className="text-xs text-slate-500 font-medium italic">
            Diberikan dengan penuh penghargaan dan pengakuan resmi kepada:
          </p>
          <h3
            className="text-4xl font-semibold italic text-slate-900 tracking-tight my-4 underline decoration-slate-300 underline-offset-8 font-serif"
            style={{ fontFamily: 'Georgia, "Playfair Display", "Times New Roman", Times, serif' }}
          >
            {studentName}
          </h3>
          <p className="text-xs text-slate-700 max-w-xl mx-auto leading-relaxed mt-2">
            Telah berhasil menyelesaikan seluruh silabus kurikulum pembelajaran intensif secara terstruktur pada jenjang <span className="font-bold text-slate-900">{cefrLevel}</span>, mencakup penguasaan tata bahasa fungsional, kelancaran berbicara, serta pemahaman kontekstual.
          </p>
        </div>

        {/* 4. RINCIAN MATRIKS PENCAPAIAN (FLAT & CLEAN) */}
        <div className="w-full border-y border-slate-200 my-8 py-4">
          <div className="grid grid-cols-4 gap-4 text-center divide-x divide-slate-200">
            <div className="px-2">
              <span className="block text-[10px] uppercase font-mono font-semibold text-slate-400">Program</span>
              <span className="text-xs font-bold text-slate-900">{programName}</span>
            </div>
            <div className="px-2">
              <span className="block text-[10px] uppercase font-mono font-semibold text-slate-400">Periode / Batch</span>
              <span className="text-xs font-bold text-slate-900">{batchName}</span>
            </div>
            <div className="px-2">
              <span className="block text-[10px] uppercase font-mono font-semibold text-slate-400">Total Sesi</span>
              <span className="text-xs font-bold text-slate-900">{totalSessions} Sesi Selesai</span>
            </div>
            <div className="px-2">
              <span className="block text-[10px] uppercase font-mono font-semibold text-slate-400">Hasil Evaluasi</span>
              <span className="text-xs font-bold text-emerald-700">{predicate}</span>
            </div>
          </div>
        </div>

        {/* 5. UCAPAN TERIMA KASIH & APRESIASI RESMI */}
        <div className="text-center my-6 max-w-xl mx-auto px-4">
          <p className="text-xs text-slate-700 leading-relaxed font-normal">
            {gratitudeMessage || 'Terima kasih atas dedikasi, kerja keras, dan komitmen luar biasa yang telah ditunjukkan selama mengikuti program pembelajaran. Semoga pencapaian ini menjadi pijakan kuat untuk meraih kesuksesan akademik dan masa depan yang gemilang.'}
          </p>
        </div>
      </div>

      {/* 5. FOOTER LEGALITAS & TANDA TANGAN */}
      <div className="pt-4 relative z-10">
        <div className="w-full border-t border-slate-300 mb-6" />
        <div className="flex items-end justify-between">
          {/* Info Keaslian / Verifikasi */}
          <div className="text-left space-y-1">
            <p className="text-[11px] font-bold text-slate-900">
              Dokumen Resmi Terverifikasi
            </p>
            <p className="text-[10px] text-slate-500 max-w-xs leading-normal">
              Sertifikat diterbitkan secara sah oleh Kavio Edu Management dan terdaftar dalam basis data akademik resmi.
            </p>
            <p className="text-[9.5px] font-mono text-slate-400 mt-1">
              Security Hash: {verificationHash}
            </p>
          </div>

          {/* Stempel & TTD Founder */}
          <div className="relative text-right flex flex-col items-end min-w-[220px]">
            <p className="text-xs text-slate-600 mb-1">
              {signLocation}, {completionDate}
            </p>

            {/* Area Tanda Tangan & Stempel */}
            <div className="relative w-48 h-20 flex items-center justify-end my-1">
              {/* Digital Signature Overlay */}
              {verification.isSigned && (
                <img
                  src={ttdFatihPng}
                  alt="Tanda Tangan Founder Kavio"
                  style={{
                    height: `${INVOICE_CONFIG.signature.sizeHeightPx || 120}px`,
                    opacity: INVOICE_CONFIG.signature.opacity || 0.95,
                    bottom: `${INVOICE_CONFIG.signature.offsetBottomPx || 5}px`
                  }}
                  className="absolute right-0 w-auto object-contain pointer-events-none z-20"
                />
              )}

              {/* Official Stamp Overlay */}
              {verification.isStamped && (
                <img
                  src={stempelKavioEduPng}
                  alt="Stempel Resmi Kavio Edu"
                  style={{
                    height: `${INVOICE_CONFIG.kavioStamp.sizeHeightPx || 100}px`,
                    opacity: INVOICE_CONFIG.kavioStamp.opacity || 0.75,
                    transform: `rotate(${INVOICE_CONFIG.kavioStamp.rotationDeg || -12}deg)`
                  }}
                  className="absolute -right-4 bottom-0 w-auto object-contain pointer-events-none z-10"
                />
              )}
            </div>

            <p className="text-xs font-bold text-slate-900 border-b border-slate-400 pb-0.5 relative z-30 tracking-tight">
              {directorName}
            </p>
            <p className="text-[10.5px] text-slate-500 block relative z-30 font-semibold mt-0.5">
              {directorTitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
