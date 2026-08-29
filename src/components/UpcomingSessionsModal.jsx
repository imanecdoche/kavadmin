import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Calendar,
  Clock,
  MessageSquare,
  Eye,
  MapPin,
  BookOpen,
  Search,
  Users,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function UpcomingSessionsModal({
  isOpen,
  onClose,
  upcoming3DaysData = [],
  totalUpcoming3DaysCount = 0,
  onSelectStudent,
  getCleanWhatsAppPhone,
  createSessionReminderMessage
}) {
  const [modalSearch, setModalSearch] = useState('')
  const [selectedDayFilter, setSelectedDayFilter] = useState('ALL') // 'ALL', 'Hari Ini', 'Besok', 'Lusa'

  // Keyboard shortcut listener for ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.documentElement.classList.add('lenis-stopped')
    }
    return () => {
      document.body.style.overflow = ''
      document.documentElement.classList.remove('lenis-stopped')
    }
  }, [isOpen])

  if (!isOpen) return null

  // Filter data based on search and selected day filter
  const filteredDaysData = upcoming3DaysData.map(dayItem => {
    if (selectedDayFilter !== 'ALL' && dayItem.dateLabel !== selectedDayFilter) {
      return { ...dayItem, sessions: [], isHidden: true }
    }

    const filteredSessions = dayItem.sessions.filter(sess => {
      if (!modalSearch.trim()) return true
      const q = modalSearch.toLowerCase()
      const sName = (sess.student?.name || '').toLowerCase()
      const sGrade = (sess.student?.grade || '').toLowerCase()
      const sAddress = (sess.student?.address || '').toLowerCase()
      const sTarget = (sess.student?.learningTarget || '').toLowerCase()
      const sPackage = (sess.student?.packageType || '').toLowerCase()
      const sTime = (sess.timeLabel || '').toLowerCase()

      return (
        sName.includes(q) ||
        sGrade.includes(q) ||
        sAddress.includes(q) ||
        sTarget.includes(q) ||
        sPackage.includes(q) ||
        sTime.includes(q)
      )
    })

    return {
      ...dayItem,
      sessions: filteredSessions,
      isHidden: false
    }
  }).filter(day => !day.isHidden)

  const totalFilteredSessionsCount = filteredDaysData.reduce((acc, curr) => acc + curr.sessions.length, 0)

  return typeof document !== 'undefined' ? createPortal(
    <AnimatePresence>
      <motion.div
        data-lenis-prevent="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={onClose}
        className="fixed inset-0 top-0 left-0 w-screen h-screen z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
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
          className="bg-white rounded-fluent border border-fluent-border shadow-fluent-modal w-full max-w-5xl flex flex-col max-h-[92vh] overflow-hidden my-auto will-change-transform"
        >
          {/* Modal Header */}
          <div className="p-4 sm:p-5 border-b border-fluent-border bg-gradient-to-r from-fluent-subtle via-white to-fluent-subtle/50 flex items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-fluent-blue/10 text-fluent-blue rounded-fluent">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-fluent-text">
                    Detail Sesi Bimbingan Mendatang
                  </h3>
                  <span className="px-2.5 py-0.5 bg-fluent-blue text-white text-xs font-bold rounded-full">
                    3 Hari Ke Depan
                  </span>
                </div>
                <p className="text-xs text-fluent-textSecondary mt-0.5">
                  Rincian jadwal bimbingan, materi/target belajar, dan pengingat WhatsApp langsung.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="hidden sm:inline-flex px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full border border-slate-200">
                {totalUpcoming3DaysCount} Sesi Terjadwal
              </span>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-fluent-textSecondary hover:text-fluent-text hover:bg-fluent-subtle rounded-fluent transition-colors"
                title="Tutup (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="p-3 sm:px-5 sm:py-3 border-b border-fluent-border bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-fluent-textSecondary" />
              <input
                type="text"
                placeholder="Cari nama siswa, target materi, atau paket..."
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue focus:ring-1 focus:ring-fluent-blue/30"
              />
            </div>

            {/* Day Filter Tabs */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'ALL', label: 'Semua (3 Hari)' },
                { id: 'Hari Ini', label: 'Hari Ini' },
                { id: 'Besok', label: 'Besok' },
                { id: 'Lusa', label: 'Lusa' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedDayFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-fluent text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedDayFilter === tab.id
                      ? 'bg-fluent-blue text-white shadow-xs'
                      : 'bg-white text-fluent-textSecondary hover:text-fluent-text border border-fluent-border hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Body: Days Grid */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-fluent-subtle/20 space-y-4">
            {totalFilteredSessionsCount === 0 && modalSearch ? (
              <div className="py-12 px-4 text-center bg-white rounded-fluent border border-dashed border-fluent-border space-y-2">
                <Search className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-fluent-text">
                  Tidak ditemukan sesi yang cocok
                </p>
                <p className="text-xs text-fluent-textSecondary">
                  Tidak ada jadwal yang cocok dengan kata kunci "{modalSearch}". Coba kata kunci lain atau reset pencarian.
                </p>
                <button
                  type="button"
                  onClick={() => setModalSearch('')}
                  className="mt-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded text-slate-700"
                >
                  Reset Pencarian
                </button>
              </div>
            ) : (
              <div className={`grid grid-cols-1 ${selectedDayFilter === 'ALL' ? 'md:grid-cols-3' : 'md:grid-cols-1'} gap-4`}>
                {filteredDaysData.map((dayItem, dayIdx) => (
                  <div
                    key={dayIdx}
                    className={`rounded-fluent border p-4 space-y-3.5 flex flex-col bg-white shadow-xs ${
                      dayItem.dateLabel === 'Hari Ini'
                        ? 'border-blue-200 ring-1 ring-blue-100'
                        : 'border-fluent-border'
                    }`}
                  >
                    {/* Day Column Header */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-fluent-border">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2.5 py-0.5 text-xs font-bold rounded ${
                            dayItem.dateLabel === 'Hari Ini'
                              ? 'bg-fluent-blue text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {dayItem.dateLabel}
                        </span>
                        <span className="text-xs font-bold text-fluent-text">
                          {dayItem.dateFormatted}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-fluent-subtle text-fluent-text text-xs font-bold rounded border border-fluent-border">
                        {dayItem.sessions.length} Sesi
                      </span>
                    </div>

                    {/* Sessions List in Day Column */}
                    {dayItem.sessions.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center py-8 px-3 text-center text-xs text-fluent-textSecondary bg-slate-50/60 rounded border border-dashed border-slate-200">
                        <Calendar className="w-6 h-6 text-slate-300 mb-1.5" />
                        <span>Tidak ada sesi bimbingan pada hari ini</span>
                      </div>
                    ) : (
                      <div className="space-y-3 flex-1">
                        {dayItem.sessions.map((sess, sessIdx) => {
                          const waPhone = getCleanWhatsAppPhone ? getCleanWhatsAppPhone(sess.student) : null
                          const hasPhone = Boolean(waPhone)

                          return (
                            <div
                              key={sessIdx}
                              className="p-3.5 bg-white hover:bg-slate-50/90 rounded-fluent border border-fluent-border hover:border-fluent-blue/50 transition-all space-y-2.5 shadow-2xs group relative"
                            >
                              {/* Session Top Bar: Time & Package & WA Button */}
                              <div className="flex items-center justify-between gap-2">
                                <span className="inline-flex items-center text-xs font-bold text-fluent-blue bg-fluent-blue/10 px-2 py-0.5 rounded">
                                  <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                                  {sess.timeLabel}
                                </span>

                                <div className="flex items-center space-x-1.5">
                                  <span className="text-[10px] font-bold text-fluent-textSecondary bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                    {sess.student.packageType || 'GROW'}
                                  </span>

                                  {/* WhatsApp Reminder Button */}
                                  <button
                                    type="button"
                                    disabled={!hasPhone}
                                    onClick={() => {
                                      if (!hasPhone) return
                                      const text = createSessionReminderMessage
                                        ? createSessionReminderMessage(sess.student, dayItem, sess)
                                        : `Halo, ini pengingat sesi bimbingan belajar Kavio Edu untuk ${sess.student.name || 'Siswa'} pada ${dayItem.dateFormatted} jam ${sess.timeLabel}. Terima kasih.`
                                      const url = `https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`
                                      window.open(url, '_blank', 'noopener,noreferrer')
                                    }}
                                    className={`px-2 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1 ${
                                      hasPhone
                                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 hover:border-emerald-300'
                                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                                    }`}
                                    title={
                                      hasPhone
                                        ? `Kirim reminder WhatsApp ke +${waPhone}`
                                        : 'Nomor WhatsApp siswa/orang tua tidak tersedia'
                                    }
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    <span>WA</span>
                                  </button>
                                </div>
                              </div>

                              {/* Student Name & Clickable Action */}
                              <div
                                onClick={() => onSelectStudent && onSelectStudent(sess.student)}
                                className="cursor-pointer space-y-1 hover:text-fluent-blue transition-colors"
                                title="Klik untuk membuka detail profil lengkap siswa"
                              >
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-bold text-fluent-text group-hover:text-fluent-blue flex items-center gap-1">
                                    {sess.student.name}
                                    <Eye className="w-3 h-3 text-fluent-textSecondary opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </h4>
                                  <span className="text-[10px] text-fluent-blue group-hover:underline">
                                    Lihat Profil &rarr;
                                  </span>
                                </div>

                                <p className="text-[11px] text-fluent-textSecondary truncate">
                                  {sess.student.grade || 'Siswa'} • {sess.student.address || 'Alamat belum diatur'}
                                </p>
                              </div>

                              {/* Target Materi Belajar */}
                              {sess.student.learningTarget && (
                                <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 space-y-0.5">
                                  <span className="font-semibold text-slate-500 text-[10px] block uppercase tracking-wider">
                                    Target Belajar:
                                  </span>
                                  <p className="line-clamp-2 leading-relaxed">
                                    {sess.student.learningTarget}
                                  </p>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-3 sm:px-5 sm:py-3.5 border-t border-fluent-border bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-2.5 flex-shrink-0 text-xs">
            <div className="flex items-center gap-2 text-fluent-textSecondary flex-wrap">
              <span className="font-medium">Ringkasan:</span>
              {upcoming3DaysData.map((d, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-fluent-border text-[11px]">
                  <strong className="text-fluent-text">{d.dateLabel}:</strong> {d.sessions.length} Sesi
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-1.5 bg-white border border-fluent-border hover:bg-fluent-subtle text-fluent-text rounded-fluent text-xs font-semibold transition-colors"
            >
              Tutup Jendela
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  ) : null
}
