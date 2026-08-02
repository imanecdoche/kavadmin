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
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1097982274898:web:59939771464f15b331de8b"
  }
}

const firebaseConfig = getFirebaseConfig()

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
export const db = getFirestore(app)

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

// Seed All Students (Bulk Upload / Backup Sync)
export const seedAllStudentsToFirebase = async (studentsList) => {
  if (!Array.isArray(studentsList) || studentsList.length === 0) return
  try {
    const batch = writeBatch(db)
    studentsList.forEach(student => {
      const ref = doc(db, 'students', student.id)
      batch.set(ref, student, { merge: true })
    })
    await batch.commit()
    return true
  } catch (e) {
    console.error('Error seeding data to Firebase:', e)
    return false
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
