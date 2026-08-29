import { initializeApp, getApps, getApp } from 'firebase/app'
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore'

// Official Firebase Credentials from User
const getFirebaseConfig = () => {
  try {
    const savedConfig = localStorage.getItem('kavio_firebase_config')
    if (savedConfig) {
      return JSON.parse(savedConfig)
    }
  } catch (e) {
    console.error('Failed to parse saved Firebase config', e)
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCrU4DL_8xWnCTxR2tZ6jjkHfysnmfZ0Ns",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0731211118.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0731211118",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0731211118.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1097982274898",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1097982274898:web:59939771464f15b331de8b",
    databaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-09bff8b7-febf-4d2b-8f14-8d69d279f13d"
  }
}

const firebaseConfig = getFirebaseConfig()

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

// Support named Database ID (e.g. ai-studio-09bff8b7-febf-4d2b-8f14-8d69d279f13d)
export const db = firebaseConfig.databaseId && firebaseConfig.databaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.databaseId)
  : getFirestore(app)

// Real-time Firestore Listener
export const subscribeStudents = (onDataUpdate, onError) => {
  try {
    const studentsCol = collection(db, 'students')
    return onSnapshot(studentsCol, (snapshot) => {
      const studentList = []
      snapshot.forEach((docSnap) => {
        studentList.push({ id: docSnap.id, ...docSnap.data() })
      })
      onDataUpdate(studentList)
    }, (err) => {
      console.warn('Firestore subscription error (fallback to local):', err)
      if (onError) onError(err)
    })
  } catch (e) {
    console.warn('Firebase init error:', e)
    if (onError) onError(e)
    return () => {}
  }
}

// Save or Update Single Student to Firestore
export const syncStudentToFirebase = async (student) => {
  if (!student || !student.id) return
  try {
    const studentDoc = doc(db, 'students', student.id)
    await setDoc(studentDoc, student, { merge: true })
  } catch (e) {
    console.error('Error syncing student to Firebase:', e)
  }
}

// Delete Student from Firestore
export const deleteStudentFromFirebase = async (studentId) => {
  if (!studentId) return
  try {
    const studentDoc = doc(db, 'students', studentId)
    await deleteDoc(studentDoc)
  } catch (e) {
    console.error('Error deleting student from Firebase:', e)
  }
}

// Seed All Students (Bulk Upload / Backup Sync) with Timeout
export const seedAllStudentsToFirebase = async (studentsList) => {
  if (!Array.isArray(studentsList) || studentsList.length === 0) return false
  try {
    const batch = writeBatch(db)
    studentsList.forEach(student => {
      const ref = doc(db, 'students', student.id)
      batch.set(ref, student, { merge: true })
    })

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firebase timeout (5s)')), 5000)
    )

    await Promise.race([batch.commit(), timeoutPromise])
    return true
  } catch (e) {
    console.error('Error seeding data to Firebase:', e)
    return false
  }
}

// Real-time Firestore Modules Listener
export const subscribeModules = (onDataUpdate, onError) => {
  try {
    const modulesCol = collection(db, 'modules')
    return onSnapshot(modulesCol, (snapshot) => {
      const moduleList = []
      snapshot.forEach((docSnap) => {
        moduleList.push({ id: docSnap.id, ...docSnap.data() })
      })
      onDataUpdate(moduleList)
    }, (err) => {
      console.warn('Firestore modules subscription error (fallback to local):', err)
      if (onError) onError(err)
    })
  } catch (e) {
    console.warn('Firebase init error:', e)
    if (onError) onError(e)
    return () => {}
  }
}

// Save or Update Single Module to Firestore
export const syncModuleToFirebase = async (moduleItem) => {
  if (!moduleItem || !moduleItem.id) return
  try {
    const moduleDoc = doc(db, 'modules', moduleItem.id)
    await setDoc(moduleDoc, moduleItem, { merge: true })
  } catch (e) {
    console.error('Error syncing module to Firebase:', e)
  }
}

// Delete Module from Firestore
export const deleteModuleFromFirebase = async (moduleId) => {
  if (!moduleId) return
  try {
    const moduleDoc = doc(db, 'modules', moduleId)
    await deleteDoc(moduleDoc)
  } catch (e) {
    console.error('Error deleting module from Firebase:', e)
  }
}

// Seed All Modules (Bulk Upload / Backup Sync) with Timeout
export const seedAllModulesToFirebase = async (modulesList) => {
  if (!Array.isArray(modulesList) || modulesList.length === 0) return false
  try {
    const batch = writeBatch(db)
    modulesList.forEach(m => {
      const ref = doc(db, 'modules', m.id)
      batch.set(ref, m, { merge: true })
    })

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firebase timeout (5s)')), 5000)
    )

    await Promise.race([batch.commit(), timeoutPromise])
    return true
  } catch (e) {
    console.error('Error seeding modules to Firebase:', e)
    return false
  }
}

// Real-time Firestore Reports Listener
export const subscribeReports = (onDataUpdate, onError) => {
  try {
    const reportsCol = collection(db, 'reports')
    return onSnapshot(reportsCol, (snapshot) => {
      const reportList = []
      snapshot.forEach((docSnap) => {
        reportList.push({ id: docSnap.id, ...docSnap.data() })
      })
      onDataUpdate(reportList)
    }, (err) => {
      console.warn('Firestore reports subscription error (fallback to local):', err)
      if (onError) onError(err)
    })
  } catch (e) {
    console.warn('Firebase init error:', e)
    if (onError) onError(e)
    return () => {}
  }
}

// Save or Update Single Report to Firestore
export const syncReportToFirebase = async (reportItem) => {
  if (!reportItem || !reportItem.id) return
  try {
    const reportDoc = doc(db, 'reports', reportItem.id)
    await setDoc(reportDoc, { ...reportItem, updatedAt: new Date().toISOString() }, { merge: true })
  } catch (e) {
    console.error('Error syncing report to Firebase:', e)
  }
}

// Delete Report from Firestore
export const deleteReportFromFirebase = async (reportId) => {
  if (!reportId) return
  try {
    const reportDoc = doc(db, 'reports', reportId)
    await deleteDoc(reportDoc)
  } catch (e) {
    console.error('Error deleting report from Firebase:', e)
  }
}

// Save Custom Firebase Credentials to LocalStorage
export const saveCustomFirebaseConfig = (newConfig) => {
  try {
    localStorage.setItem('kavio_firebase_config', JSON.stringify(newConfig))
    window.location.reload()
  } catch (e) {
    console.error('Failed to save Firebase config:', e)
  }
}
