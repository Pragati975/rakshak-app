// Firebase setup for RAKSHAK (web SDK works inside the Capacitor WebView).
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore } from 'firebase/firestore'

export const firebaseConfig = {
  apiKey: 'AIzaSyDzFHBKk7mFT8sqdwhjHrbICBV2yRmlXDw',
  authDomain: 'rakshak-73a5a.firebaseapp.com',
  databaseURL: 'https://rakshak-73a5a-default-rtdb.firebaseio.com',
  projectId: 'rakshak-73a5a',
  storageBucket: 'rakshak-73a5a.firebasestorage.app',
  messagingSenderId: '676928179989',
  appId: '1:676928179989:web:571f1c3a4467d7a47e631c',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
// Long-polling auto-detect avoids dropped connections inside Android WebViews.
export const fdb = initializeFirestore(app, { experimentalAutoDetectLongPolling: true })
