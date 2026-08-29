import React, { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { CloudUpload, CheckCircle2, AlertCircle } from 'lucide-react'
import Navigation from './components/Navigation'
import Dashboard from './components/Dashboard'
import InvoiceGenerator from './components/InvoiceGenerator'
import WhatsAppStudio from './components/WhatsAppStudio'
import StudentRoadmap from './components/StudentRoadmap'
import ModulesManager from './components/modules/ModulesManager'
import ReportCardStudio from './components/reports/ReportCardStudio'
import PublicReportViewer from './components/reports/PublicReportViewer'
import CursorTooltip from './components/CursorTooltip'
import SplashScreen from './components/SplashScreen'
import ExitConfirmModal from './components/ExitConfirmModal'
import {
  subscribeStudents,
  syncStudentToFirebase,
  deleteStudentFromFirebase,
  seedAllStudentsToFirebase,
  subscribeModules,
  syncModuleToFirebase,
  deleteModuleFromFirebase,
  seedAllModulesToFirebase,
  subscribeReports,
  syncReportToFirebase,
  deleteReportFromFirebase,
  saveCustomFirebaseConfig
} from './firebase'
import { INITIAL_STUDENTS_BACKUP } from './backupData'
import { INITIAL_MODULES_BACKUP } from './utils/defaultModules'

import { parseInvoiceShareLink } from './utils/invoiceShare'
import { parseReportShareLink } from './utils/reportShare'
import PublicInvoiceView from './components/PublicInvoiceView'

export default function App() {
  const [isAppLoading, setIsAppLoading] = useState(true)
  const [showExitModal, setShowExitModal] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [publicInvoiceData, setPublicInvoiceData] = useState(() => parseInvoiceShareLink())
  const [publicReportData, setPublicReportData] = useState(() => parseReportShareLink())

  // Browser navigation and popstate listener
  useEffect(() => {
    const handlePopState = () => {
      setPublicInvoiceData(parseInvoiceShareLink())
      setPublicReportData(parseReportShareLink())
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Browser beforeunload confirmation dialog
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
      return ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Electron Standalone window close event listener
  useEffect(() => {
    if (window.electronAPI && typeof window.electronAPI.onCloseRequested === 'function') {
      const unsubscribe = window.electronAPI.onCloseRequested(() => {
        setShowExitModal(true)
      })
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe()
      }
    }
  }, [])

  // Confirm close application handler
  const handleConfirmExit = () => {
    setShowExitModal(false)
    if (window.electronAPI && typeof window.electronAPI.confirmClose === 'function') {
      window.electronAPI.confirmClose()
    } else {
      window.close()
    }
  }

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

  // Modules Library State (LocalStorage & Firebase Sync)
  const [modules, setModules] = useState(() => {
    try {
      const saved = localStorage.getItem('kavio_modules')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {
      console.error('Failed to load modules from localStorage', e)
    }
    return INITIAL_MODULES_BACKUP
  })

  // Reports State (LocalStorage & Firebase Sync)
  const [reports, setReports] = useState(() => {
    try {
      const saved = localStorage.getItem('kavio_reports')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {
      console.error('Failed to load reports from localStorage', e)
    }
    return []
  })

  const [selectedStudentForInvoice, setSelectedStudentForInvoice] = useState(null)
  const [selectedStudentForRoadmap, setSelectedStudentForRoadmap] = useState(null)
  const [selectedStudentForReport, setSelectedStudentForReport] = useState(null)
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)

  // Firebase Real-time Students Subscription Listener
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

  // Firebase Real-time Modules Subscription Listener
  useEffect(() => {
    let isMounted = true
    const unsubscribe = subscribeModules(
      (realtimeModules) => {
        if (!isMounted) return
        if (Array.isArray(realtimeModules) && realtimeModules.length > 0) {
          setModules(realtimeModules)
        }
      },
      (error) => {
        if (!isMounted) return
        console.warn('Using LocalStorage mode for modules library.')
      }
    )

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  // Firebase Real-time Reports Subscription Listener
  useEffect(() => {
    let isMounted = true
    const unsubscribe = subscribeReports(
      (realtimeReports) => {
        if (!isMounted) return
        if (Array.isArray(realtimeReports) && realtimeReports.length > 0) {
          setReports(realtimeReports)
        }
      },
      (error) => {
        if (!isMounted) return
        console.warn('Using LocalStorage mode for reports.')
      }
    )

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  // Persist reports to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('kavio_reports', JSON.stringify(reports))
    } catch (e) {
      console.error('Failed to save reports to localStorage', e)
    }
  }, [reports])

  // Persist modules to LocalStorage whenever modules state changes
  useEffect(() => {
    try {
      localStorage.setItem('kavio_modules', JSON.stringify(modules))
    } catch (e) {
      console.error('Failed to save modules to localStorage', e)
    }
  }, [modules])

  // Persist to LocalStorage whenever students state changes
  useEffect(() => {
    try {
      localStorage.setItem('kavio_students', JSON.stringify(students))
    } catch (e) {
      console.error('Failed to save students to localStorage', e)
    }
  }, [students])

  // Save / Update Module Handler
  const handleSaveModule = (moduleRecord) => {
    setModules(prev => {
      const exists = prev.some(m => m.id === moduleRecord.id)
      const next = exists
        ? prev.map(m => m.id === moduleRecord.id ? moduleRecord : m)
        : [moduleRecord, ...prev]
      syncModuleToFirebase(moduleRecord)
      return next
    })
    showToast('Modul pembelajaran berhasil disimpan!', 'success')
  }

  // Delete Module Handler
  const handleDeleteModule = (moduleId) => {
    setModules(prev => prev.filter(m => m.id !== moduleId))
    deleteModuleFromFirebase(moduleId)
    showToast('Modul pembelajaran berhasil dihapus.', 'success')
  }

  // Save / Update Report Handler
  const handleSaveReport = (reportRecord) => {
    if (!reportRecord || !reportRecord.id) return
    setReports(prev => {
      const exists = prev.some(r => r.id === reportRecord.id)
      const next = exists
        ? prev.map(r => r.id === reportRecord.id ? reportRecord : r)
        : [reportRecord, ...prev]
      syncReportToFirebase(reportRecord)
      return next
    })
    showToast('Laporan rapor akademik berhasil disimpan ke database!', 'success')
  }

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

  // Handle navigating to student roadmap from dashboard
  const handleOpenRoadmapFromDashboard = (student) => {
    setSelectedStudentForRoadmap(student)
    setActiveTab('roadmap')
  }

  // Handle navigating to student report card from dashboard / drawer
  const handleOpenReportCardFromDashboard = (student, reportData = null) => {
    setSelectedStudentForReport(student)
    setActiveTab('reports')
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
  const [isSyncingCloud, setIsSyncingCloud] = useState(false)
  const [syncCloudSuccess, setSyncCloudSuccess] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type })
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  const handleSyncToFirebase = async () => {
    setIsSyncingCloud(true)
    setSyncCloudSuccess(false)
    try {
      const timeoutPromise = new Promise((resolve) =>
        setTimeout(() => resolve(false), 5500)
      )

      const ok = await Promise.race([
        seedAllStudentsToFirebase(students),
        timeoutPromise
      ])

      if (ok) {
        setIsFirebaseConnected(true)
        setSyncCloudSuccess(true)
        showToast('Data berhasil disimpan dan disinkronkan ke Cloud Firebase!', 'success')
        setTimeout(() => setSyncCloudSuccess(false), 3500)
      } else {
        showToast('Koneksi ke Firebase Cloud diblokir/timeout. Silakan buka Firestore Security Rules di Console Firebase.', 'error')
      }
    } catch (err) {
      console.error('Cloud sync error:', err)
      showToast('Terjadi kesalahan saat menyinkronkan data ke Cloud.', 'error')
    } finally {
      setIsSyncingCloud(false)
    }
  }

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

  if (publicReportData) {
    return (
      <PublicReportViewer
        reportData={publicReportData}
        onBack={() => {
          window.history.pushState({}, '', window.location.pathname)
          setPublicReportData(null)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-fluent-bg text-fluent-text font-sans flex flex-col antialiased selection:bg-fluent-blue selection:text-white">

      {/* App Launch & Refresh Splash Screen */}
      <AnimatePresence>
        {isAppLoading && (
          <SplashScreen onFinish={() => setIsAppLoading(false)} />
        )}
      </AnimatePresence>

      {/* Top Header & Navigation Bar */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />


      {/* Main Container - Keeps all tabs mounted */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className={activeTab === 'dashboard' ? 'block' : 'hidden'}>
          <Dashboard
            students={students}
            setStudents={updateStudentsWithSync}
            onGenerateInvoice={handleGenerateInvoiceFromDashboard}
            onOpenRoadmap={handleOpenRoadmapFromDashboard}
            onOpenReportCard={handleOpenReportCardFromDashboard}
            reports={reports}
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

        <div className={activeTab === 'reports' ? 'block' : 'hidden'}>
          <ReportCardStudio
            students={students}
            selectedStudent={selectedStudentForReport}
            onSaveReport={handleSaveReport}
          />
        </div>

        <div className={activeTab === 'whatsapp' ? 'block' : 'hidden'}>
          <WhatsAppStudio />
        </div>

        <div className={activeTab === 'roadmap' ? 'block' : 'hidden'}>
          <StudentRoadmap
            students={students}
            selectedStudentId={selectedStudentForRoadmap?.id}
            onSelectStudent={setSelectedStudentForRoadmap}
            onUpdateStudent={(updatedStudent) => {
              updateStudentsWithSync(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s))
            }}
          />
        </div>

        <div className={activeTab === 'modules' ? 'block' : 'hidden'}>
          <ModulesManager
            modules={modules}
            onSaveModule={handleSaveModule}
            onDeleteModule={handleDeleteModule}
          />
        </div>
      </main>

      {/* Firebase Custom Config Modal */}
      {showConfigModal && (
        <FirebaseConfigModal onClose={() => setShowConfigModal(false)} />
      )}

      {/* Exit Application Confirmation Modal */}
      <ExitConfirmModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleConfirmExit}
      />

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

      {/* Custom Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-fadeIn">
          <div className={`px-4 py-3 rounded-fluent shadow-fluent-modal border flex items-center space-x-3 text-xs font-semibold ${toastMessage.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-800'
              : 'bg-emerald-50 border-emerald-300 text-emerald-800'
            }`}>
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            )}
            <span>{toastMessage.text}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-slate-600 font-bold ml-2 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Global Real-Time Cursor Follow Tooltip */}
      <CursorTooltip />

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
    <div className="fixed inset-0 top-0 left-0 z-50 h-screen w-screen bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
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
