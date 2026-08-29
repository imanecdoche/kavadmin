import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { db } from '../firebase'
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'

const AuthContext = createContext()

const PASSCODE_HASH = '200805'
const SESSION_STORAGE_KEY = 'kavadmin_session_token'
const AUTH_DOC_PATH = 'system_auth'
const AUTH_DOC_ID = 'global_session'

export const AuthProvider = ({ children }) => {
  const [sessionToken, setSessionToken] = useState(() => {
    try {
      return localStorage.getItem(SESSION_STORAGE_KEY) || null
    } catch {
      return null
    }
  })
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionConflictMessage, setSessionConflictMessage] = useState('')

  // Handle remote / automatic logout when another session overrides
  const handleRemoteLogout = useCallback((message = '') => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY)
    } catch (e) {
      console.warn('Storage error:', e)
    }
    setSessionToken(null)
    setIsAuthenticated(false)
    if (message) {
      setSessionConflictMessage(message)
    }
  }, [])

  // 1. Reactive Real-time Firestore Listener for Single Active Session
  useEffect(() => {
    if (!sessionToken) {
      setIsAuthenticated(false)
      setIsLoading(false)
      return
    }

    try {
      const sessionDocRef = doc(db, AUTH_DOC_PATH, AUTH_DOC_ID)
      const unsubscribe = onSnapshot(
        sessionDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data()
            if (data.activeSessionId === sessionToken) {
              // Sesi saat ini sah dan aktif sebagai pemegang sesi tunggal
              setIsAuthenticated(true)
              setSessionConflictMessage('')
            } else {
              // Token di database telah digantikan oleh login baru di perangkat lain
              handleRemoteLogout('Sesi Anda telah berakhir karena akun dibuka di perangkat/tab lain.')
            }
          } else {
            // Jika dokumen belum dibuat di server, buat atau tolak sesi lama
            handleRemoteLogout('Sesi tidak valid atau telah berakhir di server.')
          }
          setIsLoading(false)
        },
        (error) => {
          console.error('[Auth Listener Error]:', error)
          handleRemoteLogout('Gagal memvalidasi sesi keamanan ke server cloud.')
          setIsLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      console.error('[Auth Init Error]:', err)
      handleRemoteLogout('Terjadi kesalahan inisialisasi otorisasi server.')
      setIsLoading(false)
    }
  }, [sessionToken, handleRemoteLogout])

  // 2. Login function: Sesi terbaru selalu MENGAMBIL ALIH & MEMUTUS sesi lama
  const loginWithPasscode = async (inputCode) => {
    if (!inputCode || inputCode.trim() !== PASSCODE_HASH) {
      throw new Error('Kode akses salah. Silakan coba lagi.')
    }

    try {
      // Hapus pesan peringatan konflik sebelumnya
      setSessionConflictMessage('')

      // Buat token unik baru untuk sesi terbaru ini
      const newSessionToken = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      
      // Update dokumen sesi global di Firestore (ini otomatis memutus sesi di perangkat lain)
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

      // Simpan ke storage lokal dan aktifkan state sesi
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, newSessionToken)
      } catch (e) {
        console.warn('Storage set error:', e)
      }

      setSessionToken(newSessionToken)
      setIsAuthenticated(true)
      setSessionConflictMessage('')
      return true
    } catch (err) {
      console.error('[Login Error - Fail Closed]:', err)
      throw new Error('Gagal mengamankan sesi ke cloud server. Periksa koneksi internet Anda.')
    }
  }

  // 3. Logout Manual
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
