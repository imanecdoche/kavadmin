import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HiKey, HiEye, HiEyeSlash, HiShieldExclamation, HiExclamationCircle } from 'react-icons/hi2'
import { RiLoader4Line, RiTimeFill } from 'react-icons/ri'
import { logoSvg } from '../../assets'
import { useAuth } from '../../context/AuthContext'

const MAX_ATTEMPTS = 5
const LOCKOUT_STORAGE_KEY = 'kavadmin_lockout_until'
const ATTEMPTS_STORAGE_KEY = 'kavadmin_failed_attempts'

export default function PasscodeGate() {
  const { loginWithPasscode, sessionConflictMessage, clearConflictMessage } = useAuth()
  const [passcode, setPasscode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(() => {
    try {
      return parseInt(localStorage.getItem(ATTEMPTS_STORAGE_KEY) || '0', 10)
    } catch {
      return 0
    }
  })
  const [lockoutSeconds, setLockoutSeconds] = useState(0)
  const [shake, setShake] = useState(false)
  const inputRef = useRef(null)

  // Check existing lockout state on mount and update countdown
  useEffect(() => {
    const checkLockout = () => {
      try {
        const lockoutUntil = parseInt(localStorage.getItem(LOCKOUT_STORAGE_KEY) || '0', 10)
        const now = Date.now()
        if (lockoutUntil > now) {
          setLockoutSeconds(Math.ceil((lockoutUntil - now) / 1000))
        } else {
          setLockoutSeconds(0)
          localStorage.removeItem(LOCKOUT_STORAGE_KEY)
        }
      } catch {
        setLockoutSeconds(0)
      }
    }

    checkLockout()
    const interval = setInterval(checkLockout, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (lockoutSeconds === 0 && inputRef.current) {
      inputRef.current.focus()
    }
  }, [lockoutSeconds])

  const triggerLockout = (seconds = 30) => {
    const lockoutUntil = Date.now() + seconds * 1000
    try {
      localStorage.setItem(LOCKOUT_STORAGE_KEY, lockoutUntil.toString())
    } catch (e) {
      console.warn('Storage error:', e)
    }
    setLockoutSeconds(seconds)
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (lockoutSeconds > 0) return

    if (!passcode.trim()) {
      setError('Silakan masukkan kode akses.')
      return
    }

    setError('')
    setIsSubmitting(true)
    if (sessionConflictMessage) clearConflictMessage()

    try {
      await loginWithPasscode(passcode)
      // Login sukses: Bersihkan catatan kegagalan
      localStorage.removeItem(ATTEMPTS_STORAGE_KEY)
      localStorage.removeItem(LOCKOUT_STORAGE_KEY)
      setFailedAttempts(0)
    } catch (err) {
      const newAttempts = failedAttempts + 1
      setFailedAttempts(newAttempts)
      try {
        localStorage.setItem(ATTEMPTS_STORAGE_KEY, newAttempts.toString())
      } catch (e) {
        console.warn('Storage error:', e)
      }

      setShake(true)
      setTimeout(() => setShake(false), 500)

      if (newAttempts >= MAX_ATTEMPTS) {
        const lockoutDuration = newAttempts >= 10 ? 300 : newAttempts >= 7 ? 60 : 30
        triggerLockout(lockoutDuration)
        setError(`Terlalu banyak percobaan gagal (${newAttempts}/${MAX_ATTEMPTS}). Akses ditangguhkan selama ${lockoutDuration} detik.`)
      } else {
        const remaining = MAX_ATTEMPTS - newAttempts
        setError(`${err.message || 'Kode akses tidak sesuai.'} (Sisa kesempatan: ${remaining}x)`)
      }

      setPasscode('')
      if (inputRef.current && lockoutSeconds === 0) inputRef.current.focus()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  const isLocked = lockoutSeconds > 0

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans text-slate-100">
      {/* Subtle Background Glow Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Passcode Container (Unboxed) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          x: shake ? [-8, 8, -6, 6, -3, 3, 0] : 0
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-sm relative z-10 space-y-6"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <img src={logoSvg} alt="Kavio Edu Logo" className="h-12 w-auto object-contain brightness-0 invert drop-shadow-md" />
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              KAVADMIN ACCESS GATE
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Sistem Manajemen Internal & Administrasi Akademik Kavio Edu
            </p>
          </div>
        </div>

        {/* Lockout Active Alert */}
        {isLocked && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-xl flex items-start gap-3 text-xs text-rose-200"
          >
            <HiShieldExclamation className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-rose-200 flex items-center gap-1.5">
                <span>Proteksi Anti Brute-Force Aktif</span>
                <RiTimeFill className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              </p>
              <p className="text-[11px] leading-relaxed text-rose-300/90">
                Formulir dikunci sementara untuk mencegah serangan tebakan otomatis. Silakan tunggu <span className="font-bold font-mono text-rose-100 underline">{lockoutSeconds} detik</span> lagi.
              </p>
            </div>
          </motion.div>
        )}

        {/* Remote Logout / Session Conflict Alert */}
        {!isLocked && sessionConflictMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-start gap-2.5 text-xs text-amber-300"
          >
            <HiExclamationCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-amber-200">Sesi Terputus</p>
              <p className="text-[11px] leading-relaxed text-amber-300/90">{sessionConflictMessage}</p>
            </div>
          </motion.div>
        )}

        {/* Error Alert */}
        {!isLocked && error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-center gap-2.5 text-xs text-rose-300"
          >
            <HiExclamationCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Passcode Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <HiKey className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Masukkan Kode Akses</span>
              </label>
              <button
                type="button"
                disabled={isLocked}
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                aria-label={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-40 transition-colors flex items-center justify-center rounded"
              >
                {showPassword ? (
                  <HiEyeSlash className="w-3.5 h-3.5" />
                ) : (
                  <HiEye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="relative">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={12}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value)
                  if (error) setError('')
                  if (sessionConflictMessage) clearConflictMessage()
                }}
                onKeyDown={handleKeyDown}
                placeholder={isLocked ? 'TERKUNCI' : '••••••'}
                disabled={isSubmitting || isLocked}
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 disabled:bg-slate-900/50 disabled:border-rose-900/50 disabled:text-rose-400 rounded-xl text-center text-xl tracking-[0.3em] font-mono font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !passcode || isLocked}
            className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20"
          >
            {isSubmitting ? (
              <>
                <RiLoader4Line className="w-4 h-4 animate-spin" />
                <span>Memverifikasi Sesi...</span>
              </>
            ) : isLocked ? (
              <>
                <RiTimeFill className="w-4 h-4 animate-spin" />
                <span>Terkunci ({lockoutSeconds}s)</span>
              </>
            ) : (
              <span>Masuk</span>
            )}
          </button>
        </form>
      </motion.div>

      {/* Footer Copy */}
      <footer className="mt-8 text-center text-[11px] text-slate-600 relative z-10">
        Kavio Edu Management System © 2026 • Authorized Personnel Only
      </footer>
    </div>
  )
}
