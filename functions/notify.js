// Pure helper: decides who gets a push and what it says. Kept separate so it can be tested without Firebase.
const ALERT_BROADCAST = 'SOS broadcast by'

// Returns null (send nothing) or { audience, title, body }
// audience: { role: 'commander' } | { role: 'field' } | { role: 'field', unitId: n }
function describe(kind, d) {
  if (!d) return null
  if (kind === 'alert') {
    if (d.severity !== 'critical' || d.resolved) return null
    const body = `${d.desc || ''}${d.location ? ` (${d.location})` : ''}`.trim()
    if (typeof d.desc === 'string' && d.desc.startsWith(ALERT_BROADCAST)) return { audience: { role: 'field' }, title: d.title || 'EMERGENCY SOS', body }
    return { audience: { role: 'commander' }, title: d.title || 'Critical alert', body }
  }
  if (kind === 'order') {
    if (d.status !== 'sent') return null
    if (d.type === 'ping') return { audience: { role: 'field', unitId: d.to }, title: 'Ping from Command', body: 'Command is checking in. Open Rakshak to reply.' }
    if (d.type === 'redeploy') return { audience: { role: 'field', unitId: d.to }, title: 'Redeploy order', body: `Command orders you to move to ${d.sector}.` }
    return null // sync only works while the app is open
  }
  if (kind === 'message') {
    const text = String(d.text || '').slice(0, 140)
    if (d.from === 'Command') {
      const unitId = parseInt(d.recipient, 10)
      if (d.recipient === 'all' || !d.recipient) return { audience: { role: 'field' }, title: 'Command', body: text }
      if (!Number.isNaN(unitId)) return { audience: { role: 'field', unitId }, title: 'Command', body: text }
      return null
    }
    return { audience: { role: 'commander' }, title: d.from || 'Field unit', body: text }
  }
  return null
}

module.exports = { describe }
