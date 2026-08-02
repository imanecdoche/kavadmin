import React, { useState, useEffect } from 'react'
import Navigation from './components/Navigation'
import Dashboard from './components/Dashboard'
import InvoiceGenerator from './components/InvoiceGenerator'
import WhatsAppStudio from './components/WhatsAppStudio'
import StudentRoadmap from './components/StudentRoadmap'
import {
  subscribeStudents,
  syncStudentToFirebase,
  deleteStudentFromFirebase,
  seedAllStudentsToFirebase,
  saveCustomFirebaseConfig
} from './firebase'
import { INITIAL_STUDENTS_BACKUP } from './backupData'

import { parseInvoiceShareLink } from './utils/invoiceShare'
import PublicInvoiceView from './components/PublicInvoiceView'

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [publicInvoiceData, setPublicInvoiceData] = useState(() => parseInvoiceShareLink())

  useEffect(() => {
    const handlePopState = () => {
      setPublicInvoiceData(parseInvoiceShareLink())
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Local & Firebase Sync State Initialization
  const [students, setStudents] = useState(() => {
    try {
      const saved = localStorage.getItem('kavio_students')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {
      console.error('Failed to load students from localStorage', e)
    }
    return INITIAL_STUDENTS_BACKUP
  })

  const [selectedStudentForInvoice, setSelectedStudentForInvoice] = useState(null)
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)

  // Firebase Real-time Subscription Listener
  useEffect(() => {
    let isMounted = true
    const unsubscribe = subscribeStudents(
      (realtimeStudents) => {
        if (!isMounted) return
        if (Array.isArray(realtimeStudents) && realtimeStudents.length > 0) {
          setStudents(realtimeStudents)
          setIsFirebaseConnected(true)
        } else {
          setIsFirebaseConnected(true)
        }
      },
      (error) => {
        if (!isMounted) return
        console.warn('Using LocalStorage mode due to Firebase connection status.')
        setIsFirebaseConnected(false)
      }
    )

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  // Persist to LocalStorage whenever students state changes
  useEffect(() => {
    try {
      localStorage.setItem('kavio_students', JSON.stringify(students))
    } catch (e) {
      console.error('Failed to save students to localStorage', e)
    }
  }, [students])

  // Custom setStudents handler with Firebase Sync
  const updateStudentsWithSync = (newStudentsOrUpdater) => {
    setStudents(prev => {
      const nextStudents = typeof newStudentsOrUpdater === 'function'
        ? newStudentsOrUpdater(prev)
        : newStudentsOrUpdater

      // Identify added or modified students
      nextStudents.forEach(st => {
        syncStudentToFirebase(st)
      })

      // Identify deleted students
      const nextIds = new Set(nextStudents.map(s => s.id))
      prev.forEach(prevSt => {
        if (!nextIds.has(prevSt.id)) {
          deleteStudentFromFirebase(prevSt.id)
        }
      })

      return nextStudents
    })
  }

  // Handle generating invoice from dashboard row
  const handleGenerateInvoiceFromDashboard = (student) => {
    setSelectedStudentForInvoice(student)
    setActiveTab('invoice')
  }

  // Handle saving generated invoice into student's history
  const handleSaveInvoiceToHistory = (invoiceData) => {
    if (!invoiceData || !invoiceData.studentName) return

    updateStudentsWithSync(prev => prev.map(student => {
      if (student.name.toLowerCase() === invoiceData.studentName.toLowerCase()) {
        const existingInvoices = student.invoices || []
        const newInvoiceRecord = {
          invoiceNo: invoiceData.invoiceNo,
          invoiceDate: invoiceData.invoiceDate,
          totalInvestment: invoiceData.totalInvestment,
          paidAmount: invoiceData.paidAmount,
          status: invoiceData.status
        }

        const isDuplicate = existingInvoices.some(inv => inv.invoiceNo === invoiceData.invoiceNo)
        if (isDuplicate) return student

        const updated = {
          ...student,
          invoices: [newInvoiceRecord, ...existingInvoices]
        }
        syncStudentToFirebase(updated)
        return updated
      }
      return student
    }))
  }

  // Download JSON Backup
  const handleDownloadBackupJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(students, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", "kavio_backup_students.json")
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  if (publicInvoiceData) {
    return (
      <PublicInvoiceView
        invoiceData={publicInvoiceData}
        onBackToApp={() => {
          window.history.pushState({}, '', window.location.pathname)
          setPublicInvoiceData(null)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-fluent-bg text-fluent-text font-sans flex flex-col antialiased selection:bg-fluent-blue selection:text-white">

      {/* Top Header & Navigation Bar */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Cloud & Backup Notification Ribbon */}
      <div className="bg-white border-b border-fluent-border px-4 py-2 text-xs flex justify-between items-center no-print">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
          <span className="font-semibold text-fluent-textSecondary">
            {isFirebaseConnected ? 'Firebase Realtime Cloud Sync: Aktif' : 'Penyimpanan Lokal: Aktif (Backup JSON Tersedia)'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadBackupJSON}
            className="px-2.5 py-1 bg-fluent-subtle hover:bg-fluent-border text-fluent-text border border-fluent-border rounded-fluent text-[11px] font-medium"
          >
            Download Backup (.json)
          </button>
          {/* <button
            onClick={() => setShowConfigModal(true)}
            className="px-2.5 py-1 bg-fluent-blue hover:bg-fluent-blueHover text-white rounded-fluent text-[11px] font-medium"
          >
            Pengaturan Firebase Keys
          </button> */}
        </div>
      </div>

      {/* Main Container - Keeps all tabs mounted */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className={activeTab === 'dashboard' ? 'block' : 'hidden'}>
          <Dashboard
            students={students}
            setStudents={updateStudentsWithSync}
            onGenerateInvoice={handleGenerateInvoiceFromDashboard}
          />
        </div>

        <div className={activeTab === 'invoice' ? 'block' : 'hidden'}>
          <InvoiceGenerator
            students={students}
            selectedStudent={selectedStudentForInvoice}
            onSaveInvoiceToHistory={handleSaveInvoiceToHistory}
            onSaveToDashboard={(updatedStudent) => {
              updateStudentsWithSync(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s))
            }}
          />
        </div>

        <div className={activeTab === 'whatsapp' ? 'block' : 'hidden'}>
          <WhatsAppStudio />
        </div>

        <div className={activeTab === 'roadmap' ? 'block' : 'hidden'}>
          <StudentRoadmap />
        </div>
      </main>

      {/* Firebase Custom Config Modal */}
      {showConfigModal && (
        <FirebaseConfigModal onClose={() => setShowConfigModal(false)} />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-fluent-border py-4 mt-auto text-center text-xs text-fluent-textSecondary no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            Kavio Edu Management & Invoice Generator System
          </div>
          <div>
            Design by Fatih Farhat Asshidiq © All Rights Reserved | @KavioEdu 2026
          </div>
          <div>
            Firebase Realtime Cloud Database
          </div>
        </div>
      </footer>

    </div>
  )
}

// Sub-component for Firebase API Keys Modal
function FirebaseConfigModal({ onClose }) {
  const [apiKey, setApiKey] = useState('')
  const [authDomain, setAuthDomain] = useState('')
  const [projectId, setProjectId] = useState('')
  const [storageBucket, setStorageBucket] = useState('')
  const [messagingSenderId, setMessagingSenderId] = useState('')
  const [appId, setAppId] = useState('')

  const handleSave = (e) => {
    e.preventDefault()
    saveCustomFirebaseConfig({
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-fluent border border-fluent-border shadow-fluent-modal w-full max-w-md p-6 space-y-4">
        <h3 className="text-base font-bold text-fluent-text border-b border-fluent-border pb-2">
          Pengaturan Firebase Web Credentials
        </h3>
        <p className="text-xs text-fluent-textSecondary">
          Masukkan kunci API Web dari Google Firebase Console untuk mengaktifkan sinkronisasi cloud real-time antar perangkat.
        </p>

        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">API Key (apiKey)</label>
            <input
              type="text"
              required
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-1.5 border border-fluent-border rounded"
              placeholder="AIzaSy..."
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Project ID (projectId)</label>
            <input
              type="text"
              required
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-1.5 border border-fluent-border rounded"
              placeholder="kavio-edu-app"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Auth Domain (authDomain)</label>
            <input
              type="text"
              value={authDomain}
              onChange={(e) => setAuthDomain(e.target.value)}
              className="w-full px-3 py-1.5 border border-fluent-border rounded"
              placeholder="kavio-edu-app.firebaseapp.com"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">App ID (appId)</label>
            <input
              type="text"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              className="w-full px-3 py-1.5 border border-fluent-border rounded"
              placeholder="1:1234567890:web:..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-fluent-border">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-fluent-border hover:bg-fluent-subtle rounded text-fluent-text"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-fluent-blue text-white rounded font-medium"
            >
              Simpan & Hubungkan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
