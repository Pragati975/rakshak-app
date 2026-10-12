// Crash and error reporting (Firebase Crashlytics, Android native). Does nothing in a browser.
import { Capacitor } from '@capacitor/core'
import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics'

const native = () => Capacitor.isNativePlatform()

export function initMonitoring() {
  if (!native()) return
  // JavaScript errors never reach the native crash handler, so forward them as non-fatal reports.
  window.addEventListener('error', (e) => report(e.error || e.message))
  window.addEventListener('unhandledrejection', (e) => report(e.reason))
}

export function report(err) {
  if (!native()) return
  try {
    const message = String((err && err.message) || err || 'Unknown error').slice(0, 300)
    FirebaseCrashlytics.recordException({ message }).catch(() => {})
  } catch { /* never let reporting break the app */ }
}

export function setMonitoringUser(uid) {
  if (!native()) return
  FirebaseCrashlytics.setUserId({ userId: uid || '' }).catch(() => {})
}
