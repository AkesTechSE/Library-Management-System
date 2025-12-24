import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getAuth, Auth } from "firebase/auth"
import { initializeFirestore, Firestore } from "firebase/firestore"

const REQUIRED_ENV_KEYS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
] as const

// IMPORTANT:
// In Next.js, only direct `process.env.NEXT_PUBLIC_*` property access is inlined
// into the client bundle. Dynamic lookups like `process.env[key]` will be
// undefined in the browser. Keep this object using direct property access.
const FIREBASE_PUBLIC_ENV = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
} as const

export const getMissingFirebaseEnvKeys = (): string[] =>
  REQUIRED_ENV_KEYS.filter((key) => !FIREBASE_PUBLIC_ENV[key])

export const isFirebaseConfigured = (): boolean => getMissingFirebaseEnvKeys().length === 0

export const getFirebaseConfigErrorMessage = (): string =>
  [
    `Missing required environment variables: ${getMissingFirebaseEnvKeys().join(', ')}`,
    `Create a .env.local file at the project root (copy from .env.example),`,
    `fill in your Firebase web app config values, then restart the dev server.`,
  ].join(' ')

const env = (key: (typeof REQUIRED_ENV_KEYS)[number]): string => {
  const value = FIREBASE_PUBLIC_ENV[key]
  if (!value) {
    throw new Error(getFirebaseConfigErrorMessage())
  }
  return value
}

const buildFirebaseConfig = () => ({
  apiKey: env('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: env('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: env('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: env('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: env('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: env('NEXT_PUBLIC_FIREBASE_APP_ID'),
})

let cached:
  | {
      app: FirebaseApp
      auth: Auth
      db: Firestore
    }
  | undefined

let warnedMissingConfig = false

const initFirebase = () => {
  if (cached) return cached

  const config = buildFirebaseConfig()
  const app = getApps().length ? getApps()[0] : initializeApp(config)
  const auth = getAuth(app)
  const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  })

  cached = { app, auth, db }
  return cached
}

export const tryGetFirebaseApp = (): FirebaseApp | null => {
  if (!isFirebaseConfigured()) {
    if (!warnedMissingConfig && process.env.NODE_ENV !== 'production') {
      warnedMissingConfig = true
      console.warn(getFirebaseConfigErrorMessage())
    }
    return null
  }
  return initFirebase().app
}

export const tryGetFirebaseAuth = (): Auth | null => {
  const app = tryGetFirebaseApp()
  return app ? initFirebase().auth : null
}

export const tryGetFirebaseDb = (): Firestore | null => {
  const app = tryGetFirebaseApp()
  return app ? initFirebase().db : null
}

export const getFirebaseApp = (): FirebaseApp => {
  const app = tryGetFirebaseApp()
  if (!app) throw new Error(getFirebaseConfigErrorMessage())
  return app
}

export const getFirebaseAuth = (): Auth => {
  const auth = tryGetFirebaseAuth()
  if (!auth) throw new Error(getFirebaseConfigErrorMessage())
  return auth
}

export const getFirebaseDb = (): Firestore => {
  const db = tryGetFirebaseDb()
  if (!db) throw new Error(getFirebaseConfigErrorMessage())
  return db
}