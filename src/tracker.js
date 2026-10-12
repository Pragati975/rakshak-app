// Field phones report their real battery level and GPS position to Firestore.
// On Android a foreground service ("Rakshak is sharing your position") keeps GPS running when the screen is off.
import { Capacitor, registerPlugin } from '@capacitor/core'
import { Device } from '@capacitor/device'
import { Geolocation } from '@capacitor/geolocation'
import { reportDevice } from './api.js'

const BackgroundGeolocation = registerPlugin('BackgroundGeolocation')
const EVERY_MS = 60000     // battery heartbeat
const MIN_GAP_MS = 20000   // never write position more often than this

let current = null
// Report battery + GPS right now (used when Command taps Force sync)
export const syncNow = () => current && current(true)

export function startTracking(unitId) {
  const native = Capacitor.isNativePlatform()
  let stopped = false
  let watcherId = null
  let last = { lat: null, lng: null }
  let lastSent = 0

  const battery = async () => {
    try {
      const b = await Device.getBatteryInfo()
      return typeof b.batteryLevel === 'number' ? Math.round(b.batteryLevel * 100) : undefined
    } catch { return undefined }
  }

  const send = async (force = false) => {
    if (stopped) return
    const now = Date.now()
    if (!force && now - lastSent < MIN_GAP_MS) return
    lastSent = now
    const data = { battery: await battery() }
    if (force && native) {
      try {
        const p = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 })
        last = { lat: p.coords.latitude, lng: p.coords.longitude }
      } catch (e) { console.warn('gps', e) }
    }
    if (last.lat != null) { data.lat = last.lat; data.lng = last.lng }
    if (!stopped) reportDevice(unitId, data).catch((e) => console.warn('report', e))
  }

  const begin = async () => {
    if (native) {
      try {
        watcherId = await BackgroundGeolocation.addWatcher(
          {
            backgroundTitle: 'Rakshak is sharing your position',
            backgroundMessage: 'Command can see your location while you are on duty.',
            requestPermissions: true,
            stale: false,
            distanceFilter: 20,
          },
          (loc, err) => {
            if (err) { console.warn('bg gps', err); return }
            if (loc) { last = { lat: loc.latitude, lng: loc.longitude }; send() }
          },
        )
      } catch (e) {
        console.warn('background gps unavailable, using normal GPS', e)
        try { await Geolocation.requestPermissions() } catch {}
      }
    }
    send(true)
  }

  current = send
  begin()
  const timer = setInterval(() => send(true), EVERY_MS)
  return () => {
    stopped = true
    current = null
    clearInterval(timer)
    if (watcherId) BackgroundGeolocation.removeWatcher({ id: watcherId }).catch(() => {})
  }
}
