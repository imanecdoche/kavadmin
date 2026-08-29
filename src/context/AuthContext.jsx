import React, { createContext, useContext, useState, useEffect } from 'react'
import { db } from '../firebase'
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'

const AuthContext = createContext()

const PASSCODE_HASH = '200805'
const SESSION_STORAGE_KEY = 'kavadmin_session_token'
const AUTH_DOC_PATH = 'system_auth'
const AUTH_DOC_ID = 'global_session'

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionConflictMessage, setSessionConflictMessage] = useState('')

  // Handle remote / automatic logout
  const handleRemoteLogout = (message = '') => {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    setIsAuthenticated(false)
    if (message) setSessionConflictMessage(message)
  }

  // 1. Verifikasi sesi lokal terhadap Firestore saat aplikasi dimuat & pantau onSnapshot
  useEffect(() => {
    const localToken = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!localToken) {
      setIsAuthenticated(false)
      setIsLoading(false)
      return
    }

    // Pantau perubahan sesi global secara real-time via onSnapshot
    try {
      const sessionDocRef = doc(db, AUTH_DOC_PATH, AUTH_DOC_ID)
      const unsubscribe = onSnapshot(
        sessionDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data()
            if (data.activeSessionId === localToken) {
              setIsAuthenticated(true)
              setSessionConflictMessage('')
            } else {
              // Token di database telah digantikan oleh login baru di tempat lain
              handleRemoteLogout('Sesi Anda telah berakhir karena akun dibuka di perangkat/tab lain.')
            }
          } else {
            // Jika dokumen belum ada, validasi token lokal saat ini
            setIsAuthenticated(true)
          }
          setIsLoading(false)
        },
        (error) => {
          console.warn('[Auth Listener Fallback]:', error)
          // Fallback lokal jika jaringan offline / Firestore timeout
          setIsAuthenticated(true)
          setIsLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      console.warn('[Auth Init Error]:', err)
      setIsAuthenticated(true)
      setIsLoading(false)
    }
  }, [])

  // 2. Fungsi Login dengan pembuatan Sesi Tunggal Baru
  const loginWithPasscode = async (inputCode) => {
    if (!inputCode || inputCode.trim() !== PASSCODE_HASH) {
      throw new Error('Kode akses salah. Silakan coba lagi.')
    }

    try {
      // Buat token unik untuk sesi ini
      const newSessionToken = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      
      // Update dokumen sesi global di Firestore
      const sessionDocRef = doc(db, AUTH_DOC_PATH, AUTH_DOC_ID)
      await setDoc(
        sessionDocRef,
        {
          activeSessionId: newSessionToken,
          lastLoginAt: serverTimestamp(),
          deviceAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'WebClient'
        },
        { merge: true }
      )

      // Simpan ke storage lokal
      localStorage.setItem(SESSION_STORAGE_KEY, newSessionToken)
      setIsAuthenticated(true)
      setSessionConflictMessage('')
      return true
    } catch (err) {
      console.error('[Login Error]:', err)
      // Jika jaringan gagal kontak Firestore, tetap simpan sesi lokal
      const fallbackToken = `sess_local_${Date.now()}`
      localStorage.setItem(SESSION_STORAGE_KEY, fallbackToken)
      setIsAuthenticated(true)
      setSessionConflictMessage('')
      return true
    }
  }

  // 3. Fungsi Logout Manual
  const logout = () => {
    handleRemoteLogout()
  }

  const clearConflictMessage = () => {
    setSessionConflictMessage('')
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        loginWithPasscode,
        logout,
        sessionConflictMessage,
        clearConflictMessage
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
