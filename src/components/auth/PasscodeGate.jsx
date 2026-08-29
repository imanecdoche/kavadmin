import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, KeyRound, AlertCircle, ArrowRight, ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react'
import { logoSvg } from '../../assets'
import { useAuth } from '../../context/AuthContext'

export default function PasscodeGate() {
  const { loginWithPasscode, sessionConflictMessage, clearConflictMessage } = useAuth()
  const [passcode, setPasscode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!passcode.trim()) {
      setError('Silakan masukkan kode akses.')
      return
    }

    setError('')
    setIsSubmitting(true)
    if (sessionConflictMessage) clearConflictMessage()

    try {
      await loginWithPasscode(passcode)
    } catch (err) {
      setError(err.message || 'Kode akses tidak sesuai.')
      setPasscode('')
      if (inputRef.current) inputRef.current.focus()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans text-slate-100">
      {/* Subtle Background Glow Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Passcode Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-7 sm:p-8 shadow-2xl relative z-10 space-y-6"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="p-3 bg-slate-800/70 border border-slate-700/60 rounded-2xl shadow-inner">
            <img src={logoSvg} alt="Kavio Edu Logo" className="h-10 w-auto object-contain" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              <span>KAVADMIN ACCESS GATE</span>
              <Lock className="w-4 h-4 text-sky-400" />
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Sistem Manajemen Internal & Administrasi Akademik Kavio Edu
            </p>
          </div>
        </div>

        {/* Remote Logout / Session Conflict Alert */}
        {sessionConflictMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-start gap-2.5 text-xs text-amber-300"
          >
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-amber-200">Sesi Terputus</p>
              <p className="text-[11px] leading-relaxed text-amber-300/90">{sessionConflictMessage}</p>
            </div>
          </motion.div>
        )}

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-center gap-2.5 text-xs text-rose-300"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Passcode Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-sky-400" />
                <span>Masukkan Kode Akses</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
              >
                {showPassword ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Sembunyikan</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Tampilkan</span>
                  </>
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
                }}
                onKeyDown={handleKeyDown}
                placeholder="••••••"
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-center text-xl tracking-[0.3em] font-mono font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !passcode}
            className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memverifikasi Sesi...</span>
              </>
            ) : (
              <>
                <span>Buka Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Feature Badges Footer */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Single Active Session</span>
          </div>
          <span className="font-mono text-[10px]">Cloud Firestore Real-Time</span>
        </div>
      </motion.div>

      {/* Footer Copy */}
      <footer className="mt-8 text-center text-[11px] text-slate-600 relative z-10">
        Kavio Edu Management System © 2026 • Authorized Personnel Only
      </footer>
    </div>
  )
}
