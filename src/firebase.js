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
      const parsed = JSON.parse(savedConfig)
      // Automatically purge stale cache not matching official project kavio-edu-app
      if (!parsed || parsed.projectId !== 'kavio-edu-app') {
        localStorage.removeItem('kavio_firebase_config')
      } else {
        return parsed
      }
    }
  } catch (e) {
    console.error('Failed to parse saved Firebase config', e)
    try { localStorage.removeItem('kavio_firebase_config') } catch (_) {}
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAyq8wv4TTKGaGHmsdC-oWoM0t-MT4G6Yg",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kavio-edu-app.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kavio-edu-app",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kavio-edu-app.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "790981928166",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:790981928166:web:b27c655b64d4e4836e0727",
    databaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || "(default)"
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

// Seed All Modules (Bulk Upload / Backup Sync) with Robust Chunking
export const seedAllModulesToFirebase = async (modulesList) => {
  if (!Array.isArray(modulesList) || modulesList.length === 0) return false
  try {
    const chunkSize = 20
    for (let i = 0; i < modulesList.length; i += chunkSize) {
      const chunk = modulesList.slice(i, i + chunkSize)
      const batch = writeBatch(db)
      chunk.forEach(m => {
        const ref = doc(db, 'modules', m.id)
        batch.set(ref, m, { merge: true })
      })
      await batch.commit()
    }
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

// Real-time Firestore Roadmaps Listener
export const subscribeRoadmaps = (onDataUpdate, onError) => {
  try {
    const roadmapsCol = collection(db, 'roadmaps')
    return onSnapshot(roadmapsCol, (snapshot) => {
      const roadmapList = []
      snapshot.forEach((docSnap) => {
        roadmapList.push({ id: docSnap.id, ...docSnap.data() })
      })
      onDataUpdate(roadmapList)
    }, (err) => {
      console.warn('Firestore roadmaps subscription error (fallback to local):', err)
      if (onError) onError(err)
    })
  } catch (e) {
    console.warn('Firebase init error:', e)
    if (onError) onError(e)
    return () => {}
  }
}

// Save or Update Single Roadmap to Firestore
export const syncRoadmapToFirebase = async (roadmapItem) => {
  if (!roadmapItem || (!roadmapItem.id && !roadmapItem.studentId)) return
  try {
    const docId = roadmapItem.id || roadmapItem.studentId
    const roadmapDoc = doc(db, 'roadmaps', docId)
    await setDoc(roadmapDoc, { ...roadmapItem, id: docId, updatedAt: new Date().toISOString() }, { merge: true })
  } catch (e) {
    console.error('Error syncing roadmap to Firebase:', e)
  }
}

// Delete Roadmap from Firestore
export const deleteRoadmapFromFirebase = async (docId) => {
  if (!docId) return
  try {
    const roadmapDoc = doc(db, 'roadmaps', docId)
    await deleteDoc(roadmapDoc)
  } catch (e) {
    console.error('Error deleting roadmap from Firebase:', e)
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
