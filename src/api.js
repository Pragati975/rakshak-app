// RAKSHAK data service: the ONLY place the app reads or writes data.
// Demo mode = in-memory data. Live mode = Firebase Auth + Firestore (same function names).
import { initialUnits, initialAlerts, initialMapUnits, initialMissions, initialMessages, initialPersonnel } from './theme.jsx'
import { auth, fdb, firebaseConfig } from './firebase.js'
import { initializeApp, getApps } from 'firebase/app'
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword,
  sendPasswordResetEmail, reauthenticateWithCredential, EmailAuthProvider, deleteUser,
} from 'firebase/auth'
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, deleteField, getDocs, getDoc, writeBatch } from 'firebase/firestore'

// mode 'demo' = in-memory data, mode 'live' = Firestore. App sets it at login.
let live = false
export const setLive = (v) => { live = v }

const clone = (x) => JSON.parse(JSON.stringify(x))
const db = {
  units: clone(initialUnits),
  alerts: clone(initialAlerts),
  mapUnits: clone(initialMapUnits),
  missions: clone(initialMissions),
  messages: clone(initialMessages),
  orders: [],
}
const listeners = { units: new Set(), alerts: new Set(), mapUnits: new Set(), messages: new Set(), missions: new Set(), orders: new Set() }
const emit = (key) => listeners[key].forEach((fn) => fn(db[key]))
const subscribe = (key, cb) => { listeners[key].add(cb); cb(db[key]); return () => listeners[key].delete(cb) }
const nextId = (list) => Math.max(...list.map((i) => i.id), 0) + 1
const hhmm = () => {
  const n = new Date()
  return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`
}

// ---- Live subscriptions (each returns an unsubscribe function) ----
const snap = { units: [], alerts: [], mapUnits: [], messages: [], missions: [], orders: [], roster: [] }
const DAY = 86400000
const ago = (ms) => {
  const m = Math.floor((Date.now() - ms) / 60000)
  return m < 1 ? 'Just now' : m < 60 ? `${m} min ago` : `${Math.floor(m / 60)} h ago`
}
const liveSub = (key, cb, sortFn, mapFn = (x) => x, filterFn = () => true) => {
  const push = () => cb(snap[key].filter(filterFn).map(mapFn))
  const off = onSnapshot(collection(fdb, key), (qs) => {
    snap[key] = qs.docs.map((d) => d.data()).sort(sortFn)
    push()
  }, (e) => console.warn('Firestore', key, e.code))
  const tick = setInterval(push, 30000) // keep "x min ago" fresh
  return () => { off(); clearInterval(tick) }
}
const byId = (a, b) => a.id - b.id
export const subscribeUnits = (cb) => (live
  ? liveSub('units', cb, byId, (u) => (u.lastSeen ? { ...u, lastUpdate: Math.floor((Date.now() - u.lastSeen) / 60000) } : u))
  : subscribe('units', cb))
export const subscribeMapUnits = (cb) => (live ? liveSub('mapUnits', cb, byId) : subscribe('mapUnits', cb))
export const subscribeMessages = (cb) => (live
  ? liveSub('messages', cb, byId, (m) => m, (m) => Date.now() - m.id < 7 * DAY) // chat older than 7 days is hidden
  : subscribe('messages', cb))
export const subscribeAlerts = (cb) => (live
  ? liveSub('alerts', cb, (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
      (a) => (a.createdAt ? { ...a, time: ago(a.createdAt) } : a),
      (a) => !a.createdAt || Date.now() - a.createdAt < 7 * DAY) // alerts older than 7 days are hidden
  : subscribe('alerts', cb))
export const subscribeMissions = (cb) => (live ? liveSub('missions', cb, byId) : subscribe('missions', cb))
// Team roster: one small public doc per field member {id: uid, name, title, unitId}. Demo mode uses the sample people.
const demoRoster = Object.entries(initialPersonnel).flatMap(([unitId, list]) => list.map((p, i) => ({ id: `d${unitId}-${i}`, unitId: Number(unitId), name: p.name, title: p.role, status: p.status })))
export const subscribeRoster = (cb) => (live
  ? liveSub('roster', cb, (a, b) => (a.name || '').localeCompare(b.name || ''))
  : (cb(demoRoster), () => {}))
export const saveRoster = (uid, { name, title, unitId }) => setDoc(doc(fdb, 'roster', uid), { id: uid, name: name.trim(), title: (title || '').trim(), unitId })
export const subscribeOrders = (cb) => (live
  ? liveSub('orders', cb, (a, b) => b.createdAt - a.createdAt, (o) => o, (o) => Date.now() - o.createdAt < DAY)
  : subscribe('orders', cb))

// ---- Reads ----
export const getUnits = async () => (live ? snap.units : db.units)
export const getMissions = async () => (live ? snap.missions : db.missions)

// ---- Writes ----
export async function updateUnit(id, updates) {
  if (live) {
    await updateDoc(doc(fdb, 'units', String(id)), updates)
    if (updates.status) await updateDoc(doc(fdb, 'mapUnits', String(id)), { status: updates.status })
    return
  }
  db.units = db.units.map((u) => (u.id === id ? { ...u, ...updates } : u))
  emit('units')
  if (updates.status) {
    db.mapUnits = db.mapUnits.map((m) => (m.id === id ? { ...m, status: updates.status } : m))
    emit('mapUnits')
  }
}

export async function createAlert(alert) {
  if (live) {
    const id = Date.now()
    await setDoc(doc(fdb, 'alerts', String(id)), { acknowledged: false, resolved: false, ...alert, id, createdAt: id })
    return
  }
  db.alerts = [
    { time: 'Just now', acknowledged: false, resolved: false, ...alert, id: nextId(db.alerts) },
    ...db.alerts,
  ]
  emit('alerts')
}

export async function acknowledgeAlert(id) {
  if (live) return updateDoc(doc(fdb, 'alerts', String(id)), { acknowledged: true })
  db.alerts = db.alerts.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
  emit('alerts')
}

export async function resolveAlert(id) {
  if (live) return updateDoc(doc(fdb, 'alerts', String(id)), { resolved: true, acknowledged: true })
  db.alerts = db.alerts.map((a) => (a.id === id ? { ...a, resolved: true, acknowledged: true } : a))
  emit('alerts')
}

// unitId set  -> SOS from a field unit (unit goes Critical, alert shows its sector)
// unitId null -> SOS broadcast by Command to everyone
export async function triggerSOS({ unitId = null, by = 'Command' } = {}) {
  const unit = unitId ? (live ? snap.units : db.units).find((u) => u.id === unitId) : null
  // Already in SOS? Do nothing (returns false so the app can say so).
  if (unit && unit.status === 'critical' &&
      (live ? snap.alerts : db.alerts).some((a) => a.title === 'EMERGENCY SOS' && !a.resolved && a.desc.includes(unit.name))) return false
  if (unit) await updateUnit(unit.id, { status: 'critical' })
  await createAlert({
    title: 'EMERGENCY SOS',
    desc: unit ? `${unit.name} has triggered an SOS` : `SOS broadcast by ${by} to all units`,
    severity: 'critical',
    location: unit ? unit.location : 'Command Center',
  })
  return true
}

// Field unit says "I'm safe": unit goes back to Safe and its open SOS alerts are resolved.
export async function cancelSOS(unitId) {
  const unit = (live ? snap.units : db.units).find((u) => u.id === unitId)
  if (!unit) return
  await updateUnit(unitId, { status: 'safe' })
  const open = (live ? snap.alerts : db.alerts).filter((a) => a.title === 'EMERGENCY SOS' && !a.resolved && a.desc.includes(unit.name))
  await Promise.all(open.map((a) => resolveAlert(a.id)))
}

// recipient: 'all' | 'command' | unit id. Returns the display name of the target.
// A simulated reply arrives after 2 seconds (remove when you have a real backend).
export async function sendMessage({ text, recipient = 'all', from = 'Command' }) {
  const target =
    recipient === 'all' ? 'All Units'
    : recipient === 'command' ? 'Command'
    : (live ? snap.units : db.units).find((u) => u.id === parseInt(recipient))?.name || 'Command'
  if (live) {
    const id = Date.now()
    await setDoc(doc(fdb, 'messages', String(id)), { id, from, text, recipient: String(recipient), time: hhmm() })
    return target
  }
  db.messages = [...db.messages, { id: nextId(db.messages), from, text, time: hhmm() }]
  emit('messages')

  const replier = from === 'Command' ? (recipient === 'all' ? 'Alpha Team' : target) : 'Command'
  const unitReplies = ['Copy that, Command.', 'Understood. Executing now.', 'Acknowledged. Will comply.', 'Roger that. Standing by.', 'Received. Updating status.']
  const cmdReplies = ['Copy that. Help is on the way.', 'Understood. Stay on channel.', 'Acknowledged. Command is monitoring.']
  const pool = from === 'Command' ? unitReplies : cmdReplies
  setTimeout(() => {
    db.messages = [...db.messages, {
      id: nextId(db.messages), from: replier, text: pool[Math.floor(Math.random() * pool.length)], time: hhmm(),
    }]
    emit('messages')
  }, 2000)
  return target
}

// ---- Missions ----
export async function createMission({ name, objective, priority = 'medium', teams = [], eta = 'TBD' }) {
  const id = live ? Date.now() : nextId(db.missions)
  const m = { id, name, objective, priority, teams, eta, status: 'active', progress: 0 }
  if (live) return setDoc(doc(fdb, 'missions', String(id)), m)
  db.missions = [...db.missions, m]
  emit('missions')
}
export async function updateMission(id, updates) {
  if (live) return updateDoc(doc(fdb, 'missions', String(id)), updates)
  db.missions = db.missions.map((m) => (m.id === id ? { ...m, ...updates } : m))
  emit('missions')
}
export async function deleteMission(id) {
  if (live) return deleteDoc(doc(fdb, 'missions', String(id)))
  db.missions = db.missions.filter((m) => m.id !== id)
  emit('missions')
}

// ---- Orders: ping / sync / redeploy sent by Command to one unit ----
// status: 'sent' -> 'replied' (ping, sync) | 'accepted' | 'rejected' (redeploy)
// Demo mode simulates the field unit answering; live mode waits for the real phone.
export async function sendOrder({ type, unitId, sector = null }) {
  const unit = (live ? snap.units : db.units).find((u) => u.id === unitId)
  const id = Date.now()
  const order = { id, type, to: unitId, toName: unit ? unit.name : 'Unit', from: 'Command', sector, status: 'sent', createdAt: id }
  if (live) { await setDoc(doc(fdb, 'orders', String(id)), order); return id }
  db.orders = [order, ...db.orders]
  emit('orders')
  setTimeout(() => respondOrder(id, type === 'redeploy' ? 'accepted' : 'replied'), type === 'redeploy' ? 2500 : 1200 + Math.random() * 1200)
  return id
}

export async function respondOrder(id, status) {
  const o = (live ? snap.orders : db.orders).find((x) => x.id === id)
  if (!o) return
  if (live) await updateDoc(doc(fdb, 'orders', String(id)), { status, respondedAt: Date.now() })
  else { db.orders = db.orders.map((x) => (x.id === id ? { ...x, status, respondedAt: Date.now() } : x)); emit('orders') }
  if (status === 'accepted' && o.type === 'redeploy' && o.sector) await updateUnit(o.to, { location: o.sector, lastUpdate: 0 })
  if (!live && o.type === 'sync' && status === 'replied') await updateUnit(o.to, { lastUpdate: 0 })
}

// Housekeeping: delete alerts and chat older than 7 days and orders older than a day (Command phone, live mode).
export async function pruneOld() {
  if (!live) return
  const now = Date.now()
  const old = async (name, maxAge, field = 'createdAt') => {
    const qs = await getDocs(collection(fdb, name))
    await Promise.all(qs.docs.filter((d) => { const t = d.data()[field]; return t && now - t > maxAge }).map((d) => deleteDoc(d.ref)))
  }
  await Promise.all([old('alerts', 7 * DAY), old('orders', DAY), old('messages', 7 * DAY, 'id')]).catch((e) => console.warn('prune', e))
}

// ---- Demo simulation (battery drain + map drift). Delete when you have real devices. ----
export function startSimulation() {
  if (live) return () => {}
  const drain = setInterval(() => {
    db.units = db.units.map((u) => {
      if (u.status === 'offline') return u
      const battery = Math.max(0, u.battery - 1)
      let status = u.status
      if (battery === 0) status = 'offline'
      else if (battery < 15) status = 'critical'
      if (status !== u.status) {
        db.mapUnits = db.mapUnits.map((m) => (m.id === u.id ? { ...m, status } : m))
        const off = status === 'offline'
        db.alerts = [{
          id: nextId(db.alerts), title: off ? `${u.name} Went Offline` : `${u.name} Critical`,
          desc: off ? `${u.name} has stopped responding - battery depleted` : `${u.name} battery critically low at ${battery}%`,
          severity: off ? 'offline' : 'critical', time: 'Just now', location: u.location, acknowledged: false, resolved: false,
        }, ...db.alerts]
      }
      return { ...u, battery, lastUpdate: u.lastUpdate + 0.5, status }
    })
    emit('units'); emit('mapUnits'); emit('alerts')
  }, 120000)

  const drift = setInterval(() => {
    db.mapUnits = db.mapUnits.map((u) => {
      if (u.status === 'offline') return u
      return {
        ...u,
        x: Math.max(8, Math.min(92, u.x + (Math.random() - 0.5) * 1.5)),
        y: Math.max(8, Math.min(88, u.y + (Math.random() - 0.5) * 1.5)),
      }
    })
    emit('mapUnits')
  }, 8000)

  return () => { clearInterval(drain); clearInterval(drift) }
}

// ---- Auth + roles (live mode) ----
// users/{uid} holds { role, unitId }, written by a commander when the account is created.
async function loadProfile(user) {
  const got = await getDoc(doc(fdb, 'users', user.uid))
  if (got.exists()) return got.data()
  // Accounts are created by a commander (Settings > Team accounts), which also writes this document.
  throw Object.assign(new Error('Account not set up'), { code: 'rakshak/no-profile' })
}

// First user to log in fills an empty database with the starting data.
async function seedMissionsIfEmpty() {
  const ms = await getDocs(collection(fdb, 'missions'))
  if (!ms.empty) return
  const b = writeBatch(fdb)
  initialMissions.forEach((x) => b.set(doc(fdb, 'missions', String(x.id)), x))
  await b.commit()
}

async function seedIfEmpty() {
  await seedMissionsIfEmpty().catch(() => {})
  const existing = await getDocs(collection(fdb, 'units'))
  if (!existing.empty) return
  const now = Date.now()
  const b = writeBatch(fdb)
  initialUnits.forEach((x) => b.set(doc(fdb, 'units', String(x.id)), x))
  initialMapUnits.forEach((x) => b.set(doc(fdb, 'mapUnits', String(x.id)), x))
  initialAlerts.forEach((x, i) => b.set(doc(fdb, 'alerts', String(x.id)), { ...x, createdAt: now - (i + 1) * 300000 }))
  initialMessages.forEach((x) => b.set(doc(fdb, 'messages', String(x.id)), x))
  await b.commit()
}

export async function signIn(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, email.trim(), password)
  setLive(true)
  let profile
  try { profile = await loadProfile(user) } catch (e) { setLive(false); await signOut(auth); throw e }
  await seedIfEmpty().catch(() => {})
  return profile
}

// Stay signed in between app launches.
export const restoreSession = () => new Promise((resolve) => {
  setTimeout(() => resolve(null), 3500) // never get stuck on the splash if offline
  const off = onAuthStateChanged(auth, async (user) => {
    off()
    if (!user) return resolve(null)
    try { setLive(true); resolve(await loadProfile(user)) } catch { setLive(false); resolve(null) }
  })
})

export async function signOutUser() {
  // Stop push to this phone for the account that is signing out
  try { if (auth.currentUser) await updateDoc(doc(fdb, 'users', auth.currentUser.uid), { fcmToken: deleteField() }) } catch {}
  setLive(false)
  try { await signOut(auth) } catch {}
}

// ---- Accounts ----
export const currentUser = () => (auth.currentUser ? { uid: auth.currentUser.uid, email: auth.currentUser.email } : null)
export const sendReset = (email) => sendPasswordResetEmail(auth, email.trim())

// Commander creates an account. A second Firebase app instance is used so the commander stays signed in.
// The new person gets an email link to choose their own password (that also proves the address is theirs).
export async function createAccount({ email, role, unitId, name, title }) {
  const secondary = getApps().find((a) => a.name === 'secondary') || initializeApp(firebaseConfig, 'secondary')
  const auth2 = getAuth(secondary)
  const tempPassword = `${crypto.randomUUID()}Aa1!`
  const cred = await createUserWithEmailAndPassword(auth2, email.trim(), tempPassword)
  try {
    await setDoc(doc(fdb, 'users', cred.user.uid), {
      role, unitId: role === 'commander' ? 1 : unitId, email: email.trim().toLowerCase(), createdBy: auth.currentUser.uid, createdAt: Date.now(),
    })
    if (role === 'field') await saveRoster(cred.user.uid, { name, title, unitId })
    await sendPasswordResetEmail(auth2, email.trim())
  } finally { await signOut(auth2) }
}

export async function listAccounts() {
  const qs = await getDocs(collection(fdb, 'users'))
  return qs.docs.map((d) => ({ uid: d.id, ...d.data() })).sort((a, b) => (a.email || '').localeCompare(b.email || ''))
}

// Required by Google Play: a user can delete their own account from inside the app.
export async function deleteMyAccount(password) {
  const u = auth.currentUser
  if (!u) return
  await reauthenticateWithCredential(u, EmailAuthProvider.credential(u.email, password))
  await deleteDoc(doc(fdb, 'roster', u.uid)).catch(() => {})
  await deleteDoc(doc(fdb, 'users', u.uid))
  await deleteUser(u)
  setLive(false)
}

// Push token for this phone (read by the Cloud Functions in /functions)
export async function saveToken(token) {
  if (auth.currentUser) await updateDoc(doc(fdb, 'users', auth.currentUser.uid), { fcmToken: token })
}

// ---- Real device data (live mode, field phones) ----
// First phone to report sets the map centre (config/base). Each sector is 100 m wide:
// the map covers 500 m east-west and 800 m north-south around that point.
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
export async function reportDevice(unitId, { battery, lat, lng } = {}) {
  if (!live) return
  const upd = { lastSeen: Date.now(), lastUpdate: 0 }
  if (typeof battery === 'number') upd.battery = clamp(battery, 0, 100)
  if (typeof lat === 'number' && typeof lng === 'number') {
    const baseRef = doc(fdb, 'config', 'base')
    let base = (await getDoc(baseRef)).data()
    if (!base) { base = { lat, lng }; await setDoc(baseRef, base) }
    const dx = (lng - base.lng) * 111320 * Math.cos((base.lat * Math.PI) / 180)
    const dy = (lat - base.lat) * 110540
    const col = clamp(Math.floor(2.5 + dx / 100), 0, 4)
    const row = clamp(Math.floor(4 - dy / 100), 0, 7)
    upd.lat = lat
    upd.lng = lng
    upd.location = `Sector ${'ABCDE'[col]}-${row + 1}`
  }
  await updateDoc(doc(fdb, 'units', String(unitId)), upd)
}
