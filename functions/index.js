// Push notifications for RAKSHAK. Deploy with:  firebase deploy --only functions   (needs the Blaze plan)
const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const { getMessaging } = require('firebase-admin/messaging')
const { describe } = require('./notify')

initializeApp()
const db = getFirestore()

// Must be the same region as your Firestore database (Firebase console > Firestore > the location shown at the top).
const REGION = 'asia-south1'

async function tokensFor(audience) {
  let q = db.collection('users').where('role', '==', audience.role)
  if (audience.unitId != null) q = q.where('unitId', '==', audience.unitId)
  const snap = await q.get()
  return snap.docs.filter((d) => d.data().fcmToken).map((d) => ({ ref: d.ref, token: d.data().fcmToken }))
}

async function push(kind, data) {
  const msg = describe(kind, data)
  if (!msg) return
  const targets = await tokensFor(msg.audience)
  if (!targets.length) return
  const res = await getMessaging().sendEachForMulticast({
    tokens: targets.map((t) => t.token),
    notification: { title: msg.title, body: msg.body },
    data: { kind },
    android: { priority: 'high', notification: { channelId: 'sos', sound: 'default' } },
  })
  // Forget phones that uninstalled the app or signed out
  await Promise.all(res.responses.map((r, i) => {
    const code = r.error && r.error.code
    if (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token') {
      return targets[i].ref.update({ fcmToken: FieldValue.delete() }).catch(() => {})
    }
    return null
  }))
}

const opts = (document) => ({ document, region: REGION })
exports.onAlert = onDocumentCreated(opts('alerts/{id}'), (e) => push('alert', e.data && e.data.data()))
exports.onOrder = onDocumentCreated(opts('orders/{id}'), (e) => push('order', e.data && e.data.data()))
exports.onMessage = onDocumentCreated(opts('messages/{id}'), (e) => push('message', e.data && e.data.data()))
