// Firebase push (FCM). Lets Command and field units get SOS, ping and order alerts even when the app is closed.
// Needs: google-services.json in android/app, and the Cloud Functions in /functions deployed.
import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { saveToken } from './api.js'
import { setPushActive } from './notify.js'

let started = false

export async function initPush() {
  if (!Capacitor.isNativePlatform() || started) return
  started = true
  try {
    let p = await PushNotifications.checkPermissions()
    if (p.receive !== 'granted') p = await PushNotifications.requestPermissions()
    if (p.receive !== 'granted') return
    await PushNotifications.createChannel({ id: 'sos', name: 'SOS and critical alerts', importance: 5, visibility: 1, vibration: true })
    await PushNotifications.addListener('registration', async (t) => {
      try { await saveToken(t.value); setPushActive(true) } catch (e) { console.warn('push token', e) }
    })
    await PushNotifications.addListener('registrationError', (e) => console.warn('push registration', e))
    await PushNotifications.register()
  } catch (e) { started = false; console.warn('push init', e) }
}
