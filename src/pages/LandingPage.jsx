import React, { useState } from 'react'
import {
  ShieldCheck,
  Building2,
  GraduationCap,
  Search,
  FileText,
  Lock,
  ArrowRight,
  CheckCircle2,
  MapPin,
  ExternalLink,
  BookOpen,
  Award,
  ChevronRight
} from 'lucide-react'
import { stempelKavioEduPng } from '../assets'
import KavioInvestamaLogo from '../components/common/KavioInvestamaLogo'

export default function LandingPage({ onNavigateAdmin, onNavigateVerify }) {
  const [certQuery, setCertQuery] = useState('')

  const handleVerifySubmit = (e) => {
    e.preventDefault()
    const trimmed = certQuery.trim()
    if (!trimmed) return
    if (onNavigateVerify) {
      onNavigateVerify(trimmed)
    } else {
      window.location.href = `/verify?id=${encodeURIComponent(trimmed)}`
    }
  }

  const handleAdminClick = () => {
    if (onNavigateAdmin) {
      onNavigateAdmin()
    } else {
      window.location.href = '/admin'
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KavioInvestamaLogo className="h-8 sm:h-9 w-auto text-slate-900" />
            <div className="hidden sm:block border-l border-slate-300 pl-3">
              <span className="text-[11px] font-semibold text-slate-600 block">
                Pendidikan Bimbingan Belajar • NIB 2311260068864
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
              <a href="#profil" className="hover:text-slate-900 transition-colors">Profil Holding</a>
              <a href="#unit-usaha" className="hover:text-slate-900 transition-colors">Unit Usaha</a>
              <a href="#verifikasi" className="hover:text-slate-900 transition-colors">Verifikasi Dokumen</a>
              <a href="#kontak" className="hover:text-slate-900 transition-colors">Kontak & Legalitas</a>
            </nav>

            <button
              onClick={handleAdminClick}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded border border-slate-900 transition-colors inline-flex items-center gap-1.5 shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Portal Administrasi</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 2. Hero Section: Corporate Overview & Legal Identity */}
        <section id="profil" className="bg-white border-b border-slate-300 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-4">
                <Building2 className="w-4 h-4 text-slate-700" />
                <span>Profil Korporasi & Entitas Hukum Resmi</span>
              </div>
              
              {/* Official Corporate Logo */}
              <div className="mb-6">
                <KavioInvestamaLogo className="h-14 sm:h-16 lg:h-20 w-auto text-slate-900" />
              </div>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                Lembaga induk berbadan hukum resmi yang menaungi penyelenggaraan pendidikan bimbingan belajar swasta, riset linguistik terapan, perumusan kurikulum berbasis kerangka kompetensi internasional, dan penerbitan sertifikasi kredensial akademik terverifikasi.
              </p>
            </div>

            {/* Corporate Fact Sheet Table */}
            <div className="bg-slate-50 border border-slate-300 rounded overflow-hidden">
              <div className="px-4 py-3 bg-slate-100 border-b border-slate-300 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Ketetapan Hukum & Legalitas Institusi
                </span>
                <span className="text-[11px] font-mono text-slate-600">
                  Status: Terdaftar & Terverifikasi Aktif
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="w-1/3 p-3 bg-white font-semibold text-slate-600 border-r border-slate-200">
                        Nama Entitas Badan Hukum
                      </td>
                      <td className="p-3 font-bold text-slate-900">
                        PT Kavio Investama Global
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-3 bg-white font-semibold text-slate-600 border-r border-slate-200">
                        Nomor Induk Berusaha (NIB)
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        2311260068864
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-3 bg-white font-semibold text-slate-600 border-r border-slate-200">
                        Klasifikasi Baku Lapangan Usaha (KBLI)
                      </td>
                      <td className="p-3 text-slate-800">
                        85595 — Pendidikan Bimbingan Belajar dan Konseling Swasta
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-3 bg-white font-semibold text-slate-600 border-r border-slate-200">
                        Otoritas Perizinan & Pengesahan
                      </td>
                      <td className="p-3 text-slate-800">
                        Kementerian Investasi dan Hilirisasi / BKPM Republik Indonesia
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-3 bg-white font-semibold text-slate-600 border-r border-slate-200">
                        Unit Penyelenggara Pendidikan
                      </td>
                      <td className="p-3 font-semibold text-slate-800">
                        Kavio Academy • Kavio English Education
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-3 bg-white font-semibold text-slate-600 border-r border-slate-200">
                        Penanggung Jawab / Formulator Kurikulum
                      </td>
                      <td className="p-3 text-slate-900">
                        <span className="font-bold">Fatih Farhat Asshidiq</span> (Lead Instructor & Managing Director)
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 bg-white font-semibold text-slate-600 border-r border-slate-200">
                        Alamat Kantor Pusat Resmi
                      </td>
                      <td className="p-3 text-slate-800">
                        Jl. Raya Labuan, Kp. Bojong Canar, Ds. Dahu, Kec. Cikedal, Kab. Pandeglang, Banten 42266
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Section 2: Educational Division (Kavio Academy) */}
        <section id="unit-usaha" className="py-12 sm:py-16 bg-slate-50 border-b border-slate-300">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="mb-8">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                <GraduationCap className="w-4 h-4 text-slate-700" />
                <span>Unit Operasional Pendidikan</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Kavio Academy & Kavio English Education
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1 leading-relaxed">
                Pusat bimbingan belajar bahasa Inggris terstruktur yang memadukan ketelitian analisis tata bahasa dengan pemahaman intuitif bagi pembelajar Indonesia.
              </p>
            </div>

            {/* 3 Core Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pillar 1 */}
              <div className="bg-white p-6 rounded border border-slate-300 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-800 mb-4 border border-slate-200">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">
                    Standar Kurikulum CEFR
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Materi pembelajaran disusun secara runtut dan terukur mengacu pada Common European Framework of Reference for Languages (A1 hingga C2) dengan modul master dan panduan terstandarisasi.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 text-[11px] font-mono text-slate-500">
                  Capaian: A1 • A2 • B1 • B2 • C1 • C2
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="bg-white p-6 rounded border border-slate-300 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-800 mb-4 border border-slate-200">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">
                    Pendekatan Pedagogis "The Why Factor"
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Setiap struktur kalimat dibedah hingga ke akar alasan linguistiknya, mengikis keraguan interferensi bahasa ibu dan membangun pemahaman logika bahasa Inggris yang kokoh.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 text-[11px] font-mono text-slate-500">
                  Metode: Konseptual & Analitis Mendalam
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="bg-white p-6 rounded border border-slate-300 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-800 mb-4 border border-slate-200">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">
                    Evaluasi Tuntas & Sertifikasi Kredensial
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Setiap kelulusan disertai pengesahan resmi Rapor Hasil Evaluasi Belajar dan Sertifikat Kelulusan resmi ber-QR Code yang terdaftar di pangkalan data verifikasi publik.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 text-[11px] font-mono text-slate-500">
                  Integritas: QR Code Digital Registry
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Section 3: Official Credential Verification Tool */}
        <section id="verifikasi" className="py-12 sm:py-16 bg-white border-b border-slate-300">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              Pangkalan Data Verifikasi Kredensial Resmi
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto mb-6 leading-relaxed">
              Layanan publik terbuka bagi institusi pendidikan, industri kerja, maupun pihak berkepentingan untuk mengonfirmasi keaslian dan status keabsahan dokumen sertifikat resmi terbitan Kavio Academy.
            </p>

            {/* Direct Verification Form */}
            <div className="bg-slate-50 p-6 rounded border border-slate-300 shadow-sm text-left max-w-2xl mx-auto">
              <form onSubmit={handleVerifySubmit} className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nomor Verifikasi Dokumen (Verification ID)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={certQuery}
                      onChange={(e) => setCertQuery(e.target.value)}
                      placeholder="Masukkan ID (Contoh: REG-KAV-2026-081)..."
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-600"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded transition-colors inline-flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <span>Periksa Dokumen</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Mendukung kode pindaian QR Code dari sertifikat fisik maupun digital.</span>
                  <a
                    href="/verify?id=REG-KAV-2026-081"
                    onClick={(e) => {
                      e.preventDefault()
                      if (onNavigateVerify) onNavigateVerify('REG-KAV-2026-081')
                      else window.location.href = '/verify?id=REG-KAV-2026-081'
                    }}
                    className="text-slate-700 hover:text-slate-900 font-semibold underline"
                  >
                    Uji Contoh Data
                  </a>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* 5. Section 4: Operational Office & Legal Decree */}
        <section id="kontak" className="py-12 sm:py-16 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Left Column: Office & Contacts */}
              <div className="bg-white p-6 rounded border border-slate-300">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                  <MapPin className="w-4 h-4 text-slate-700" />
                  <span>Kantor Pusat & Pusat Pembelajaran</span>
                </div>
                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <div>
                    <span className="font-bold block text-slate-900">Alamat Korespondensi Resmi:</span>
                    <p className="text-slate-600">
                      Jl. Raya Labuan, Kp. Bojong Canar, Ds. Dahu, Kec. Cikedal, Kab. Pandeglang, Provinsi Banten, Kode Pos 42266
                    </p>
                  </div>
                  <div>
                    <span className="font-bold block text-slate-900">Wilayah Yurisdiksi Hukum:</span>
                    <p className="text-slate-600">
                      Republik Indonesia • Wilayah Kerja BKPM & Dinas Penanaman Modal Terpadu Satu Pintu
                    </p>
                  </div>
                  <div>
                    <span className="font-bold block text-slate-900">Saluran Layanan Informasi Resmi:</span>
                    <p className="text-slate-600">
                      Portal Daring: kavioid.vercel.app • Email: info@kavio.id
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Corporate Governance */}
              <div className="bg-white p-6 rounded border border-slate-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Tata Kelola & Ketetapan Badan Hukum</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Pemberian izin operasional dan otonomi kurikulum unit usaha Kavio Academy ditetapkan berdasarkan Surat Keputusan Direksi Nomor <span className="font-mono font-bold text-slate-800">001/SK-DIR/KIG/XI/2026</span> tentang Penetapan Pendirian, Pemberian Izin Operasional, dan Mandat Penyelenggaraan Pendidikan dan Pelatihan.
                  </p>
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs">
                    <span className="font-semibold text-slate-800 block">Pemberitahuan Sistem:</span>
                    <span className="text-slate-600">
                      Pangkalan data evaluasi akademik disinkronkan secara terpusat dengan otentikasi Firebase Cloud Engine.
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">
                    NIB: 2311260068864
                  </span>
                  <button
                    onClick={handleAdminClick}
                    className="text-xs font-bold text-slate-900 hover:text-slate-700 inline-flex items-center gap-1"
                  >
                    <span>Masuk Portal Administrasi</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Formal Footer */}
      <footer className="border-t border-slate-300 py-6 px-4 sm:px-6 bg-white text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <KavioInvestamaLogo className="h-6 w-auto text-slate-800 mb-2" />
            <p className="text-[11px] text-slate-500">
              NIB: 2311260068864 • KBLI: 85595 • Lembaga Pendidikan Bimbingan Belajar Swasta
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-medium text-slate-600">
            <a
              href="/verify?id=REG-KAV-2026-081"
              onClick={(e) => {
                e.preventDefault()
                if (onNavigateVerify) onNavigateVerify('REG-KAV-2026-081')
                else window.location.href = '/verify?id=REG-KAV-2026-081'
              }}
              className="hover:text-slate-900 transition-colors"
            >
              Cek Sertifikat
            </a>
            <span className="text-slate-300">•</span>
            <button
              onClick={handleAdminClick}
              className="hover:text-slate-900 transition-colors"
            >
              Portal Admin
            </button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200 text-[10px] text-slate-400 font-mono">
          Hak Cipta Dilindungi Undang-Undang © 2026 PT Kavio Investama Global. All Rights Reserved.
        </div>
      </footer>
    </div>
  )
}
