// Local (on-device) notifications via Capacitor. Silently does nothing in a normal browser.
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

const native = () => Capacitor.isNativePlatform()

// When push is working, the server notifies a phone that is in the background, so skip the local copy.
let pushActive = false
export const setPushActive = (v) => { pushActive = v }

// The "Notifications" switch in Settings
export const notificationsOn = () => { try { return localStorage.getItem('rk_notify') !== 'off' } catch { return true } }
export const setNotificationsOn = (on) => { try { localStorage.setItem('rk_notify', on ? 'on' : 'off') } catch {} }

export async function initNotifications() {
  if (!native()) return
  try {
    const p = await LocalNotifications.checkPermissions()
    if (p.display !== 'granted') await LocalNotifications.requestPermissions()
    await LocalNotifications.createChannel({
      id: 'sos', name: 'SOS and critical alerts', importance: 5, visibility: 1, vibration: true, lights: true,
    })
  } catch (e) { console.warn('notifications init', e) }
}

export async function notify(title, body) {
  if (!native() || !notificationsOn()) return
  if (pushActive && document.hidden) return
  try {
    await LocalNotifications.schedule({
      notifications: [{ id: Date.now() % 2147483647, title, body, channelId: 'sos' }],
    })
  } catch (e) { console.warn('notify', e) }
}
