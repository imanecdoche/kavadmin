import React, { useState, useEffect, useRef } from 'react'
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Printer,
  Calendar,
  Building2,
  User,
  Phone,
  GraduationCap,
  Clock,
  BookOpen,
  Home,
  Check
} from 'lucide-react'
import { logoSvg, stempelKavioEduPng } from '../assets'
import KavioInvestamaLogo from '../components/common/KavioInvestamaLogo'
import { syncStudentToFirebase } from '../firebase'

const TOTAL_STEPS = 9

// Capitalize first letter of each word (Title Case)
const toTitleCase = (str) => {
  if (!str) return ''
  return str.replace(/(^|[\s\-\.'])\S/g, (char) => char.toUpperCase())
}

export default function PublicRegistrationPage({ onBackToHome }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [registrationResult, setRegistrationResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [keyboardOffset, setKeyboardOffset] = useState(0)

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    nickname: '',
    gender: 'Laki-laki',
    birthPlaceDate: '',
    age: '',
    school: '',
    grade: '',
    address: '',
    studentPhone: '',
    parentName: '',
    parentPhone: '',
    parentRelation: 'Orang Tua',
    cefrTarget: 'Menunggu Placement Test',
    classType: 'Semi-Privat',
    learningMode: 'Tatap Muka (Offline)',
    packageType: 'GROW',
    durationMonths: '3',
    preferredDays: '',
    preferredTime: '',
    learningTarget: ''
  })

  const inputRef = useRef(null)

  // Track visualViewport to ensure navigation buttons are never covered by mobile virtual keypad
  useEffect(() => {
    if (typeof window === 'undefined') return
    const vv = window.visualViewport

    const updateOffset = () => {
      if (window.visualViewport) {
        const offset = Math.max(0, window.innerHeight - (window.visualViewport.offsetTop + window.visualViewport.height))
        setKeyboardOffset(offset)
      }
    }

    if (vv) {
      vv.addEventListener('resize', updateOffset)
      vv.addEventListener('scroll', updateOffset)
    }
    window.addEventListener('resize', updateOffset)

    return () => {
      if (vv) {
        vv.removeEventListener('resize', updateOffset)
        vv.removeEventListener('scroll', updateOffset)
      }
      window.removeEventListener('resize', updateOffset)
    }
  }, [])

  useEffect(() => {
    // Auto focus current step input on step change
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
    setErrorMsg('')
  }, [currentStep])

  const handleChange = (field, value) => {
    let formattedValue = value
    // Automatically uppercase first letter of each word for name fields
    if (field === 'fullName' || field === 'nickname' || field === 'parentName') {
      formattedValue = toTitleCase(value)
    }
    setFormData(prev => ({ ...prev, [field]: formattedValue }))
    if (errorMsg) setErrorMsg('')
  }

  // Validation before advancing to next step
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.fullName.trim()) {
          setErrorMsg('Silakan masukkan nama lengkap calon siswa.')
          return false
        }
        return true
      case 2:
        if (!formData.nickname.trim()) {
          setErrorMsg('Silakan masukkan nama panggilan.')
          return false
        }
        return true
      case 3:
        if (!formData.age && !formData.birthPlaceDate) {
          setErrorMsg('Silakan masukkan usia atau tempat/tanggal lahir.')
          return false
        }
        return true
      case 4:
        if (!formData.school.trim() || !formData.grade.trim()) {
          setErrorMsg('Silakan lengkapi asal sekolah dan kelas.')
          return false
        }
        return true
      case 5:
        if (!formData.address.trim()) {
          setErrorMsg('Silakan masukkan alamat domisili.')
          return false
        }
        return true
      case 6:
        if (!formData.studentPhone.trim() || !formData.parentPhone.trim()) {
          setErrorMsg('Silakan masukkan nomor WhatsApp siswa dan orang tua/wali.')
          return false
        }
        return true
      case 7:
      case 8:
        return true
      case 9:
        if (!formData.preferredDays.trim()) {
          setErrorMsg('Silakan sebutkan preferensi hari/waktu belajar.')
          return false
        }
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (!validateCurrentStep()) return
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleNext()
    }
  }

  // Submit Handler
  const handleSubmit = async () => {
    if (!validateCurrentStep()) return
    setIsSubmitting(true)
    setErrorMsg('')

    const currentYear = new Date().getFullYear()
    const randomSuffix = String(Math.floor(1000 + Math.random() * 9000))
    const registrationId = `REG-KAV-${currentYear}-${randomSuffix}`
    const studentDocId = `stu_${Date.now()}`

    const newStudentRecord = {
      id: studentDocId,
      registrationId: registrationId,
      name: formData.fullName.trim(),
      nickname: formData.nickname.trim(),
      gender: formData.gender,
      age: Number(formData.age) || 0,
      birthPlaceDate: formData.birthPlaceDate.trim(),
      school: formData.school.trim(),
      grade: formData.grade.trim(),
      address: formData.address.trim(),
      studentPhone: formData.studentPhone.trim(),
      parentName: formData.parentName.trim(),
      parentPhone: formData.parentPhone.trim(),
      parentRelation: formData.parentRelation,
      cefrTarget: formData.cefrTarget,
      classType: formData.classType,
      learningMode: formData.learningMode,
      packageType: formData.packageType,
      durationMonths: Number(formData.durationMonths) || 3,
      schedule: `${formData.preferredDays.trim()}${formData.preferredTime ? ' (' + formData.preferredTime.trim() + ')' : ''}`,
      learningTarget: formData.learningTarget.trim() || 'Peningkatan Kemampuan Bahasa Inggris Komprehensif',
      status: 'Pendaftar Baru',
      registrationDate: new Date().toISOString().split('T')[0],
      notes: `Pendaftaran Online: ${formData.packageType} (${formData.durationMonths} Bulan) • ${formData.classType}`,
      createdAt: new Date().toISOString()
    }

    try {
      // 1. Sync directly to Firestore
      await syncStudentToFirebase(newStudentRecord)

      // 2. Sync to local storage
      try {
        const saved = localStorage.getItem('kavio_students')
        const currentList = saved ? JSON.parse(saved) : []
        const updatedList = [newStudentRecord, ...currentList.filter(s => s.id !== studentDocId)]
        localStorage.setItem('kavio_students', JSON.stringify(updatedList))
      } catch (locErr) {
        console.warn('LocalStorage save warning:', locErr)
      }

      setRegistrationResult(newStudentRecord)
      setIsSubmitted(true)
    } catch (err) {
      console.error('Registration submit error:', err)
      setErrorMsg('Terjadi kendala saat mengirim data. Silakan coba kembali.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Print Receipt
  const handlePrint = () => {
    window.print()
  }

  // Render Success Screen
  if (isSubmitted && registrationResult) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-800 font-sans p-4 sm:p-8 antialiased flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full bg-white border border-slate-300 rounded shadow-sm overflow-hidden print:border-none print:shadow-none">
          {/* Header Bukti Pendaftaran */}
          <div className="p-6 bg-slate-50 border-b border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <KavioInvestamaLogo className="h-8 w-auto text-slate-900" />
              <div className="border-l border-slate-300 pl-3">
                <span className="text-xs font-bold text-slate-900 uppercase block">
                  Tanda Bukti Pendaftaran Siswa Baru
                </span>
                <span className="text-[11px] text-slate-600 block">
                  Kavio Academy • PT Kavio Investama Global
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                Nomor Registrasi
              </span>
              <span className="text-sm font-mono font-bold text-slate-900">
                {registrationResult.registrationId}
              </span>
            </div>
          </div>

          {/* Success Banner */}
          <div className="p-6 bg-emerald-50/60 border-b border-emerald-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-emerald-950">
                Pendaftaran Berhasil Terkirim & Terdaftar
              </h2>
              <p className="text-xs text-emerald-800 leading-relaxed mt-0.5">
                Data calon siswa telah tersimpan resmi pada pangkalan data Kavio Academy. Tim administrasi kami akan segera memverifikasi dan mengonfirmasi jadwal placement test serta instruktur.
              </p>
            </div>
          </div>

          {/* Data Summary Table */}
          <div className="p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Ringkasan Formulir Calon Siswa
            </h3>

            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="w-1/3 p-2.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Nama Lengkap Siswa</td>
                  <td className="p-2.5 font-bold text-slate-900">{registrationResult.name} ({registrationResult.nickname})</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Jenis Kelamin / Usia</td>
                  <td className="p-2.5 text-slate-800">{registrationResult.gender} • {registrationResult.age} Tahun</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Asal Sekolah & Kelas</td>
                  <td className="p-2.5 text-slate-800">{registrationResult.school} ({registrationResult.grade})</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">WhatsApp Siswa</td>
                  <td className="p-2.5 font-mono text-slate-900">{registrationResult.studentPhone}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Orang Tua / Wali</td>
                  <td className="p-2.5 text-slate-800">{registrationResult.parentName} ({registrationResult.parentRelation}) — <span className="font-mono">{registrationResult.parentPhone}</span></td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Target Level CEFR</td>
                  <td className="p-2.5 font-semibold text-slate-900">{registrationResult.cefrTarget}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Paket & Tipe Kelas</td>
                  <td className="p-2.5 text-slate-800">Paket {registrationResult.packageType} ({registrationResult.durationMonths} Bulan) • {registrationResult.classType} ({registrationResult.learningMode})</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Preferensi Jadwal</td>
                  <td className="p-2.5 text-slate-800">{registrationResult.schedule}</td>
                </tr>
                <tr>
                  <td className="p-2.5 bg-slate-50 font-semibold text-slate-600 border-r border-slate-200">Harapan / Target Belajar</td>
                  <td className="p-2.5 text-slate-800">{registrationResult.learningTarget}</td>
                </tr>
              </tbody>
            </table>

            {/* Official Stamped Validation Notice */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-200">
              <div className="text-[11px] text-slate-600">
                <span className="font-semibold block text-slate-900">Kantor Pusat Kavio Academy</span>
                <span>Jl. Raya Labuan, Cikedal, Pandeglang, Banten 42266</span>
                <span className="block font-mono text-slate-500">NIB: 2311260068864 • KBLI: 85595</span>
              </div>
              <img src={stempelKavioEduPng} alt="Stempel Resmi" className="h-16 w-16 object-contain" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 bg-slate-50 border-t border-slate-300 flex items-center justify-end gap-3 print:hidden">
            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded border border-slate-300 transition-colors"
              >
                Kembali ke Beranda
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded transition-colors inline-flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Unduh Bukti PDF</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Typeform Progress Percentage
  const progressPercent = Math.round((currentStep / TOTAL_STEPS) * 100)

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col justify-between antialiased selection:bg-slate-900 selection:text-white">
      {/* Top Fixed Header with Progress Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KavioInvestamaLogo className="h-7 w-auto text-slate-900" />
            <div className="hidden sm:block border-l border-slate-300 pl-2">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                Formulir Pendaftaran Siswa Baru
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-medium text-slate-500">
              {currentStep} / {TOTAL_STEPS}
            </span>
            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
                title="Batal & Kembali"
              >
                Batal
              </button>
            )}
          </div>
        </div>

        {/* Thin Progress Bar */}
        <div className="w-full h-1 bg-slate-100">
          <div
            className="h-full bg-slate-900 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Main Form Body: Single Field Focused (Typeform Concept) */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 pt-6 pb-28 sm:pb-36 flex flex-col justify-center">
        {errorMsg && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-300 rounded text-rose-800 text-xs font-semibold animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: Nama Lengkap */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Langkah 1 • Identitas Calon Siswa
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              Siapa nama lengkap calon siswa?
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Tuliskan nama lengkap resmi calon siswa sesuai dokumen identitas atau raport sekolah.
            </p>
            <div className="pt-2">
              <input
                ref={inputRef}
                type="text"
                autoCapitalize="words"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik nama lengkap di sini..."
                className="w-full text-lg sm:text-2xl py-3 border-b-2 border-slate-300 focus:border-slate-900 focus:outline-none bg-transparent transition-colors placeholder-slate-300 font-medium"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Nama Panggilan & Jenis Kelamin */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Langkah 2 • Panggilan & Gender
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              Nama panggilan akrab & jenis kelamin calon siswa?
            </h1>
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Panggilan
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  autoCapitalize="words"
                  value={formData.nickname}
                  onChange={(e) => handleChange('nickname', e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Contoh: Alya / Fatih"
                  className="w-full text-lg sm:text-xl py-2.5 border-b-2 border-slate-300 focus:border-slate-900 focus:outline-none bg-transparent font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Jenis Kelamin
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Laki-laki', 'Perempuan'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => handleChange('gender', g)}
                      className={`p-3 text-xs sm:text-sm font-semibold rounded border transition-all text-left flex items-center justify-between ${
                        formData.gender === g
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span>{g}</span>
                      {formData.gender === g && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Usia & Tempat/Tgl Lahir */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Langkah 3 • Usia & Tanggal Lahir
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              Berapa usia calon siswa saat ini?
            </h1>
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Usia (Tahun)
                </label>
                <input
                  ref={inputRef}
                  type="number"
                  min="5"
                  max="70"
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Contoh: 16"
                  className="w-full text-lg sm:text-xl py-2.5 border-b-2 border-slate-300 focus:border-slate-900 focus:outline-none bg-transparent font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Tempat & Tanggal Lahir (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.birthPlaceDate}
                  onChange={(e) => handleChange('birthPlaceDate', e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Contoh: Pandeglang, 14 Mei 2008"
                  className="w-full text-sm sm:text-base py-2.5 border-b-2 border-slate-300 focus:border-slate-900 focus:outline-none bg-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Asal Sekolah & Tingkat Kelas */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Langkah 4 • Jenjang Pendidikan
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              Dari sekolah mana calon siswa dan saat ini di kelas berapa?
            </h1>
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Asal Sekolah / Kampus / Instansi
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={formData.school}
                  onChange={(e) => handleChange('school', e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Contoh: SMAN 1 Pandeglang"
                  className="w-full text-lg sm:text-xl py-2.5 border-b-2 border-slate-300 focus:border-slate-900 focus:outline-none bg-transparent font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Tingkat Kelas / Semester
                </label>
                <input
                  type="text"
                  value={formData.grade}
                  onChange={(e) => handleChange('grade', e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Contoh: Kelas 10 SMA / Kuliah Semester 3"
                  className="w-full text-base sm:text-lg py-2.5 border-b-2 border-slate-300 focus:border-slate-900 focus:outline-none bg-transparent font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Alamat Domisili */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Langkah 5 • Alamat Tempat Tinggal
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              Di mana alamat domisili calon siswa saat ini?
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Cantumkan nama jalan, kelurahan, dan kecamatan/kabupaten tempat tinggal.
            </p>
            <div className="pt-2">
              <textarea
                ref={inputRef}
                rows={3}
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Contoh: Jl. Raya Labuan, Ds. Dahu, Kec. Cikedal, Kab. Pandeglang, Banten"
                className="w-full text-base sm:text-lg p-3 border-2 border-slate-300 focus:border-slate-900 focus:outline-none rounded bg-slate-50 focus:bg-white transition-colors"
              />
            </div>
          </div>
        )}

        {/* STEP 6: Kontak Siswa & Orang Tua/Wali */}
        {currentStep === 6 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Langkah 6 • Nomor Kontak & Komunikasi
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              Nomor WhatsApp aktif siswa dan orang tua/wali?
            </h1>
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nomor WhatsApp Calon Siswa
                </label>
                <input
                  ref={inputRef}
                  type="tel"
                  value={formData.studentPhone}
                  onChange={(e) => handleChange('studentPhone', e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Contoh: 0812-3456-7890"
                  className="w-full text-base sm:text-lg py-2 border-b-2 border-slate-300 focus:border-slate-900 focus:outline-none bg-transparent font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Orang Tua / Wali
                  </label>
                  <input
                    type="text"
                    autoCapitalize="words"
                    value={formData.parentName}
                    onChange={(e) => handleChange('parentName', e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Contoh: Ibu Rina"
                    className="w-full text-base py-2 border-b-2 border-slate-300 focus:border-slate-900 focus:outline-none bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    WhatsApp Orang Tua / Wali
                  </label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => handleChange('parentPhone', e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Contoh: 0852-1234-5678"
                    className="w-full text-base py-2 border-b-2 border-slate-300 focus:border-slate-900 focus:outline-none bg-transparent font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Target CEFR & Tipe Kelas */}
        {currentStep === 7 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Langkah 7 • Pilihan Target Level & Tipe Kelas
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              Target tingkatan level & tipe bimbingan yang diinginkan?
            </h1>
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Target Level CEFR
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'Menunggu Placement Test',
                    'A1 (Beginner)',
                    'A2 (Elementary)',
                    'B1 (Intermediate)',
                    'B2 (Upper-Int)',
                    'C1–C2 (Advanced)'
                  ].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleChange('cefrTarget', lvl)}
                      className={`p-2.5 text-xs font-semibold rounded border text-left transition-all ${
                        formData.cefrTarget === lvl
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Tipe & Moda Kelas
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {['Reguler', 'Semi-Privat', 'Privat'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleChange('classType', t)}
                      className={`p-2 text-xs font-semibold rounded border text-center transition-all ${
                        formData.classType === t
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['Tatap Muka (Offline)', 'Online Virtual'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleChange('learningMode', m)}
                      className={`p-2 text-xs font-semibold rounded border text-center transition-all ${
                        formData.learningMode === m
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: Paket Intensitas Belajar */}
        {currentStep === 8 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Langkah 8 • Paket Intensitas & Durasi
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              Pilihan paket ritme belajar bulanan?
            </h1>
            <div className="space-y-3 pt-2">
              {[
                { id: 'SEED', title: 'SEED — 3 Sesi / Bulan', desc: 'Pendampingan terarah & bertahap (60 menit per sesi)' },
                { id: 'GROW', title: 'GROW — 4 Sesi / Bulan (Standar)', desc: 'Ritme mingguan teratur (1 sesi/pekan, 60 menit per sesi)' },
                { id: 'BOOST', title: 'BOOST — 8 Sesi / Bulan', desc: 'Akselerasi intensif (2 sesi/pekan, 60 menit per sesi)' },
                { id: 'MASTER', title: 'MASTER — 8 Sesi / Bulan (90 Menit)', desc: 'Pendalaman komprehensif intensitas tinggi (90 menit per sesi)' }
              ].map(pkg => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => handleChange('packageType', pkg.id)}
                  className={`w-full p-3.5 text-left rounded border transition-all flex items-start justify-between ${
                    formData.packageType === pkg.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <span className="text-xs sm:text-sm font-bold block">{pkg.title}</span>
                    <span className={`text-[11px] block mt-0.5 ${formData.packageType === pkg.id ? 'text-slate-300' : 'text-slate-600'}`}>
                      {pkg.desc}
                    </span>
                  </div>
                  {formData.packageType === pkg.id && <Check className="w-4 h-4 shrink-0 mt-0.5" />}
                </button>
              ))}

              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Komitmen Durasi Kurikulum Dasar
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: '3', label: '3 Bulan (12 Sesi)' },
                    { val: '6', label: '6 Bulan (24 Sesi)' },
                    { val: '12', label: '12 Bulan (48 Sesi)' }
                  ].map(d => (
                    <button
                      key={d.val}
                      type="button"
                      onClick={() => handleChange('durationMonths', d.val)}
                      className={`p-2.5 text-xs font-semibold rounded border text-center transition-all ${
                        formData.durationMonths === d.val
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 9: Jadwal & Harapan Belajar */}
        {currentStep === 9 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Langkah 9 • Preferensi Jadwal & Harapan
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              Kapan waktu luang belajar dan apa tujuan utama yang ingin dicapai?
            </h1>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Preferensi Hari Belajar
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    value={formData.preferredDays}
                    onChange={(e) => handleChange('preferredDays', e.target.value)}
                    placeholder="Contoh: Selasa & Kamis / Akhir Pekan"
                    className="w-full text-sm sm:text-base py-2 border-b-2 border-slate-300 focus:border-slate-900 focus:outline-none bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Preferensi Jam Belajar
                  </label>
                  <input
                    type="text"
                    value={formData.preferredTime}
                    onChange={(e) => handleChange('preferredTime', e.target.value)}
                    placeholder="Contoh: 15.30 WIB / 19.30 WIB"
                    className="w-full text-sm sm:text-base py-2 border-b-2 border-slate-300 focus:border-slate-900 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Harapan / Target Utama Belajar
                </label>
                <textarea
                  rows={2}
                  value={formData.learningTarget}
                  onChange={(e) => handleChange('learningTarget', e.target.value)}
                  placeholder="Contoh: Menguasai speaking aktif bebas ragu, persiapan ujian sekolah, pembenahan grammar..."
                  className="w-full text-xs sm:text-sm p-3 border-2 border-slate-300 focus:border-slate-900 focus:outline-none rounded bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Legal Confirmation Box */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 leading-relaxed">
                <span className="font-semibold block text-slate-800 mb-0.5">Pernyataan Komitmen Belajar:</span>
                Dengan menekan tombol kirim di bawah, saya menyatakan data yang diisi adalah benar dan bersedia mengikuti proses evaluasi akademik serta tata tertib belajar di Kavio Academy.
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Navigation Controls (Keyboard-Safe & Viewport-Adaptive) */}
      <footer
        style={{
          bottom: `${keyboardOffset}px`,
          paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))'
        }}
        className="fixed left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 sm:px-6 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] transition-[bottom] duration-150 ease-out"
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 text-xs sm:text-sm font-semibold rounded border border-slate-300 transition-colors inline-flex items-center gap-1.5 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-slate-400 font-mono">
              Tekan Enter ↵
            </span>
            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-black disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded transition-colors inline-flex items-center gap-2 shadow-sm"
            >
              <span>{currentStep === TOTAL_STEPS ? (isSubmitting ? 'Mengirim Data...' : 'Kirim Pendaftaran') : 'Lanjut'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
