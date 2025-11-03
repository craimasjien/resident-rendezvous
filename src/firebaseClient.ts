import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
}

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => typeof value === 'undefined' || value === '')
  .map(([key]) => key)

if (missingKeys.length > 0) {
  console.warn(
    `Firebase configuration is missing values for: ${missingKeys.join(', ')}. ` +
      'Double-check your environment variables.'
  )
}

let cachedApp: FirebaseApp | undefined

export const getFirebaseApp = () => {
  if (!cachedApp) {
    cachedApp = initializeApp(firebaseConfig)
  }

  return cachedApp
}

export const initAnonymousAuth = async () => {
  const app = getFirebaseApp()
  const auth = getAuth(app)

  try {
    const currentUser = auth.currentUser ?? (await signInAnonymously(auth)).user

    return { auth, user: currentUser }
  } catch (error) {
    console.error('Failed to initialize anonymous auth', error)
    throw error
  }
}

export const observeAuth = (callback: (userId: string | null) => void) => {
  const app = getFirebaseApp()
  const auth = getAuth(app)

  return onAuthStateChanged(auth, (user) => {
    callback(user?.uid ?? null)
  })
}

