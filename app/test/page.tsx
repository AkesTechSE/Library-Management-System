'use client'

import { useEffect, useState } from 'react'
import { isFirebaseConfigured, tryGetFirebaseAuth, getFirebaseApp } from '@/lib/firebase/config'
import { loginWithEmail } from '@/lib/firebase/auth'

export default function TestPage() {
  const [status, setStatus] = useState('Checking Firebase configuration...')
  const [firebaseApp, setFirebaseApp] = useState<any>(null)
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('password123')

  useEffect(() => {
    // Test 1: Check if Firebase is configured
    if (isFirebaseConfigured()) {
      setStatus('✅ Firebase is configured!')
      
      // Test 2: Try to get Firebase app
      try {
        const app = getFirebaseApp()
        setFirebaseApp(app)
        console.log('Firebase App:', app)
        setStatus(prev => `${prev}\n✅ Firebase app initialized: ${app.name}`)
      } catch (error: any) {
        setStatus(prev => `${prev}\n❌ Failed to initialize Firebase: ${error.message}`)
      }
      
      // Test 3: Check auth
      const auth = tryGetFirebaseAuth()
      if (auth) {
        setStatus(prev => `${prev}\n✅ Firebase Auth is available`)
      } else {
        setStatus(prev => `${prev}\n❌ Firebase Auth is not available`)
      }
    } else {
      setStatus('❌ Firebase is NOT configured. Check your .env.local file.')
    }
  }, [])

  const handleTestLogin = async () => {
    setStatus('Testing login...')
    try {
      const result = await loginWithEmail(email, password)
      if (result.success) {
        setStatus(`✅ Login successful! User: ${result.user?.email}`)
      } else {
        setStatus(`❌ Login failed: ${result.message}`)
      }
    } catch (error: any) {
      setStatus(`❌ Login error: ${error.message}`)
    }
  }

  const handleTestEnvironment = () => {
    setStatus('Checking environment variables...\n')
    
    // List all env vars (client-side accessible ones)
    const envVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID',
      'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'
    ]
    
    envVars.forEach(key => {
      const value = process.env[key]
      if (value) {
        setStatus(prev => `${prev}\n✅ ${key}: ${value.substring(0, 10)}...`)
      } else {
        setStatus(prev => `${prev}\n❌ ${key}: MISSING`)
      }
    })
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Firebase Test Page</h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Status</h2>
        <pre className="whitespace-pre-wrap bg-white p-4 rounded">
          {status}
        </pre>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleTestEnvironment}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Check Environment Variables
        </button>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Test Login</h3>
          <div className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-2 border rounded"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-2 border rounded"
            />
            <button
              onClick={handleTestLogin}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Test Login
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mr-2"
          >
            Go Home
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  )
}