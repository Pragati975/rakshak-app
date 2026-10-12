// RAKSHAK theme: a night field radio crossed with a survey map sheet.
// Colour means status and nothing else. Everything else is Bone on Spruce.
export const c = {
  bg: '#1A2623',         // Dark Spruce
  surface: '#223530',    // Spruce Panel
  elevated: '#2C443D',   // Moss Step
  outline: '#3F5750',    // Contour
  textPri: '#ECE7D8',    // Bone
  textSec: '#A9B5AE',    // Fog
  primary: '#ECE7D8',    // buttons are Bone with Spruce text
  onPrimary: '#1A2623',
  priContainer: '#2C443D',
  secondary: '#A9B5AE',
  accent: '#ECE7D8',
  safe: '#9AD65A',       // Lamp Green
  warning: '#F0A830',    // Sodium Amber
  critical: '#FF5A36',   // Flare (danger and SOS only)
  offline: '#7C8A84',    // Ash
}

export const font = {
  display: "'Archivo Variable', 'Archivo', 'Arial Narrow', sans-serif",
  body: "'Atkinson Hyperlegible', 'Segoe UI', Roboto, sans-serif",
  deva: "'Tiro Devanagari Hindi', serif",
}
// Type scale: 32 / 22 / 17 / 15 / 13
export const display = (size, extra) => ({
  fontFamily: font.display, fontWeight: 800, fontSize: size, fontStretch: '115%',
  letterSpacing: '-0.01em', lineHeight: 1.08, color: c.textPri, ...extra,
})

export const statusColor = (s) => ({ safe: c.safe, warning: c.warning, critical: c.critical, offline: c.offline })[s]
export const statusLabel = (s) => ({ safe: 'Safe', warning: 'Warning', critical: 'Critical', offline: 'Offline' })[s]

export const initialUnits = [
  { id: 1, name: 'Alpha Team', status: 'safe', location: 'Sector A-3', lastUpdate: 2, personnel: 6, battery: 87, comms: 'Encrypted' },
  { id: 2, name: 'Bravo Team', status: 'warning', location: 'Sector B-1', lastUpdate: 5, personnel: 4, battery: 23, comms: 'Encrypted' },
  { id: 3, name: 'Charlie Team', status: 'critical', location: 'Sector C-7', lastUpdate: 1, personnel: 8, battery: 12, comms: 'Degraded' },
  { id: 4, name: 'Delta Team', status: 'offline', location: 'Sector D-2', lastUpdate: 12, personnel: 5, battery: 0, comms: 'Lost' },
  { id: 5, name: 'Echo Team', status: 'safe', location: 'Sector E-5', lastUpdate: 3, personnel: 7, battery: 94, comms: 'Encrypted' },
]

export const initialAlerts = [
  { id: 1, title: 'Perimeter Breach', desc: 'Sensor trip detected on north fence line', severity: 'critical', time: '1 min ago', location: 'Sector C-7', acknowledged: false, resolved: false },
  { id: 2, title: 'Low Battery', desc: 'Charlie Team device battery below 15%', severity: 'warning', time: '5 min ago', location: 'Sector C-7', acknowledged: false, resolved: false },
  { id: 3, title: 'Unit Offline', desc: 'Delta Team has stopped reporting', severity: 'offline', time: '12 min ago', location: 'Sector D-2', acknowledged: false, resolved: false },
  { id: 4, title: 'Routine Check', desc: 'Alpha Team completed scheduled patrol', severity: 'safe', time: '18 min ago', location: 'Sector A-3', acknowledged: true, resolved: true },
]

export const initialMapUnits = [
  { id: 1, name: 'Alpha', status: 'safe', x: 25, y: 30 },
  { id: 2, name: 'Bravo', status: 'warning', x: 55, y: 25 },
  { id: 3, name: 'Charlie', status: 'critical', x: 70, y: 65 },
  { id: 4, name: 'Delta', status: 'offline', x: 40, y: 70 },
  { id: 5, name: 'Echo', status: 'safe', x: 80, y: 40 },
]

export const initialMissions = [
  { id: 1, name: 'Operation Nightfall', status: 'active', objective: 'Secure perimeter sectors A through C', teams: ['Alpha', 'Bravo', 'Charlie'], priority: 'high', progress: 65, eta: '2 hours' },
  { id: 2, name: 'Recon Sweep Delta', status: 'planning', objective: 'Reconnaissance of sector D boundary', teams: ['Delta'], priority: 'medium', progress: 0, eta: 'Pending' },
  { id: 3, name: 'Echo Reinforcement', status: 'active', objective: 'Reinforce eastern flank at sector E', teams: ['Echo'], priority: 'low', progress: 90, eta: '30 min' },
]

export const initialMessages = [
  { id: 1, from: 'Alpha Team', text: 'Perimeter A-3 secured. No movement detected.', time: '14:32', outgoing: false },
  { id: 2, from: 'Command', text: 'Copy that Alpha. Hold position and maintain surveillance.', time: '14:33', outgoing: true },
  { id: 3, from: 'Charlie Team', text: 'We have a situation at C-7. Requesting immediate backup.', time: '14:38', outgoing: false },
  { id: 4, from: 'Command', text: 'Backup en route. Hold tight Charlie.', time: '14:39', outgoing: true },
  { id: 5, from: 'Bravo Team', text: 'Battery running low. Requesting resupply at B-1.', time: '14:41', outgoing: false },
]

// Icon paths
export const iconPaths = {
  dashboard: 'M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z',
  map: 'M9 20l-5.5-2V4L9 6m0 14l5.5-2V4L9 6m0 14V6M14.5 4L20 6v14l-5.5-2',
  alerts: 'M12 2a7 7 0 017 7v4l2 3H3l2-3V9a7 7 0 017-7zm0 20a3 3 0 01-3-3h6a3 3 0 01-3 3z',
  comms: 'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z',
  settings: 'M12 8a4 4 0 100 8 4 4 0 000-8zM19.4 13a7.5 7.5 0 000-2l2-1.6-2-3.4-2.4 1a7.5 7.5 0 00-1.7-1l-.4-2.5h-4l-.4 2.5a7.5 7.5 0 00-1.7 1l-2.4-1-2 3.4 2 1.6a7.5 7.5 0 000 2l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 001.7 1l.4 2.5h4l.4-2.5a7.5 7.5 0 001.7-1l2.4 1 2-3.4-2-1.6z',
  back: 'M15 18l-6-6 6-6',
  close: 'M18 6L6 18M6 6l12 12',
  check: 'M5 13l4 4L19 7',
  ping: 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2',
  sos: 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 7v10M7 12h10',
  deploy: 'M12 2l3 7h-6l3-7zM5 22l7-3 7 3M5 22V10l7 3 7-3v12',
  person: 'M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6z',
  filter: 'M3 5h18M6 12h12M10 19h4',
  logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  bell: 'M12 2a7 7 0 017 7v4l2 3H3l2-3V9a7 7 0 017-7z',
  shield: 'M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z',
  refresh: 'M21 12a9 9 0 11-3-6.7L21 8M21 3v5h-5',
  radio: 'M12 12a3 3 0 100-6 3 3 0 000 6zM7 7a7 7 0 000 10M17 7a7 7 0 010 10M5 5a10 10 0 000 14M19 5a10 10 0 010 14',
  search: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  mission: 'M12 2v20M2 12h20M5 5l14 14M19 5L5 19',
  target: 'M12 12m-3 0a3 3 0 106 0a3 3 0 10-6 0M12 12m-7 0a7 7 0 1014 0a7 7 0 10-14 0M12 12m-11 0a11 11 0 1022 0a11 11 0 10-22 0',
  clock: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2',
  plus: 'M12 5v14M5 12h14',
  users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  battery: 'M16 6h2a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h2M14 4h-4v2h4V4zM9 11h6v6H9z',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  alertBadge: 'M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z',
  signal: 'M5 12.5a3.5 3.5 0 017 0M3 9.5a6.5 6.5 0 0113 0M1 6.5a9.5 9.5 0 0118 0',
  chevron: 'M9 18l6-6-6-6',
  timeline: 'M12 8v4l3 2M12 2a10 10 0 100 20 10 10 0 000-20M8 2.5C4 6 4 18 8 21.5M16 2.5c4 3.5 4 15.5 0 19',
  flag: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22V15',
  compass: 'M12 22a10 10 0 100-20 10 10 0 000 20zM16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 100-6 3 3 0 000 6z',
  thermometer: 'M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z',
  crosshair: 'M12 22a10 10 0 100-20 10 10 0 000 20zM22 12h-4M6 12H2M12 6V2M12 22v-4',
}

export const Icon = ({ name, size = 20, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d={iconPaths[name] || ''} />
  </svg>
)

export const inputStyle = {
  width: '100%', padding: '14px 14px', minHeight: 48, background: c.bg, border: `1px solid ${c.outline}`,
  borderRadius: 6, color: c.textPri, fontSize: 16, fontFamily: font.body, outline: 'none',
}

export const btnSm = (color) => ({
  padding: '0 16px', minHeight: 48, background: 'transparent', border: `1px solid ${color || c.outline}`, borderRadius: 999,
  color: c.textPri, fontSize: 15, fontWeight: 700, fontFamily: font.body, cursor: 'pointer',
})

export const initialPersonnel = {
  1: [
    { name: 'Cpt. R. Mehta', role: 'Team Lead', status: 'active' },
    { name: 'Sgt. A. Kumar', role: 'Scout', status: 'active' },
    { name: 'Cpl. S. Reddy', role: 'Comms', status: 'active' },
    { name: 'Pvt. D. Singh', role: 'Support', status: 'active' },
    { name: 'Pvt. J. Rao', role: 'Medic', status: 'standby' },
    { name: 'Pvt. M. Das', role: 'Support', status: 'active' },
  ],
  2: [
    { name: 'Cpt. L. Nair', role: 'Team Lead', status: 'active' },
    { name: 'Sgt. P. Joshi', role: 'Scout', status: 'active' },
    { name: 'Cpl. V. Bose', role: 'Comms', status: 'degraded' },
    { name: 'Pvt. A. Gupta', role: 'Support', status: 'active' },
  ],
  3: [
    { name: 'Cpt. T. Banerjee', role: 'Team Lead', status: 'wounded' },
    { name: 'Sgt. K. Patel', role: 'Scout', status: 'active' },
    { name: 'Cpl. H. Khan', role: 'Comms', status: 'degraded' },
    { name: 'Pvt. R. Shetty', role: 'Support', status: 'active' },
    { name: 'Pvt. N. Verma', role: 'Medic', status: 'active' },
    { name: 'Pvt. F. Ali', role: 'Support', status: 'active' },
    { name: 'Pvt. C. Pillai', role: 'Scout', status: 'active' },
    { name: 'Pvt. G. Menon', role: 'Support', status: 'standby' },
  ],
  4: [
    { name: 'Cpt. O. Thomas', role: 'Team Lead', status: 'offline' },
    { name: 'Sgt. U. Yadav', role: 'Scout', status: 'offline' },
    { name: 'Cpl. I. Chauhan', role: 'Comms', status: 'offline' },
    { name: 'Pvt. X. Jain', role: 'Support', status: 'offline' },
    { name: 'Pvt. Z. Pawar', role: 'Medic', status: 'offline' },
  ],
  5: [
    { name: 'Cpt. B. Iyer', role: 'Team Lead', status: 'active' },
    { name: 'Sgt. Q. Shukla', role: 'Scout', status: 'active' },
    { name: 'Cpl. E. Nair', role: 'Comms', status: 'active' },
    { name: 'Pvt. W. Menon', role: 'Support', status: 'active' },
    { name: 'Pvt. Y. Pillai', role: 'Medic', status: 'active' },
    { name: 'Pvt. V. Raman', role: 'Support', status: 'active' },
    { name: 'Pvt. L. Krishnan', role: 'Scout', status: 'standby' },
  ],
}

export function timeAgo(min) {
  if (min === 0) return 'Just now'
  if (min < 1) return 'Just now'
  if (min < 60) return `${Math.floor(min)} min ago`
  const h = Math.floor(min / 60)
  return `${h}h ${Math.floor(min % 60)}m ago`
}

// ---- Shared visual pieces ----------------------------------------------------

// Status is a shape AND a colour: safe = circle, warning = triangle, critical = diamond, offline = hollow square.
export const glyphShape = (status, col) => {
  if (status === 'safe') return <circle cx="8" cy="8" r="6" fill={col} />
  if (status === 'warning') return <path d="M8 1.5L15 14H1z" fill={col} />
  if (status === 'critical') return <path d="M8 .8L15.2 8 8 15.2.8 8z" fill={col} />
  return (
    <g>
      <rect x="2" y="2" width="12" height="12" fill="none" stroke={col} strokeWidth="1.8" />
      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke={col} strokeWidth="1.6" strokeLinecap="round" />
    </g>
  )
}

export function StatusGlyph({ status, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" role="img" aria-label={statusLabel(status) || 'Unknown'} style={{ flexShrink: 0 }}>
      {glyphShape(status, statusColor(status) || c.offline)}
    </svg>
  )
}

// Battery as a 5-cell gauge
export function BatteryCells({ level }) {
  const filled = level <= 0 ? 0 : Math.max(1, Math.ceil(level / 20))
  const col = level < 10 ? c.critical : level < 25 ? c.warning : c.textSec
  return (
    <div role="img" aria-label={`Battery ${level} percent`} style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} style={{ width: 6, height: 14, borderRadius: 1, background: i < filled ? col : 'transparent', border: `1px solid ${i < filled ? col : c.outline}` }} />
      ))}
    </div>
  )
}

export function Wordmark({ size = 22 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
      <span style={{ fontFamily: font.deva, fontSize: size * 1.25, color: c.textPri, lineHeight: 1 }}>रक्षक</span>
      <span style={display(size * 0.8)}>Rakshak</span>
    </div>
  )
}

// "Sector C-7": column C (A-E), row 7 (1-8)
export function parseSector(loc) {
  const m = /([A-Z])-(\d+)/.exec(loc || '')
  return m ? { col: Math.min(4, m[1].charCodeAt(0) - 65), row: Math.min(8, Math.max(1, parseInt(m[2], 10))) } : { col: 0, row: 1 }
}

// Deterministic contour lines (wobbly closed loops) for the survey-sheet look
export function contourPaths(cx, cy, count, step, seed = 0) {
  const out = []
  for (let k = 1; k <= count; k++) {
    const r = k * step
    let d = ''
    for (let i = 0; i <= 72; i++) {
      const t = (i / 72) * Math.PI * 2
      const w = 1 + 0.10 * Math.sin(3 * t + k * 0.7 + seed) + 0.06 * Math.sin(5 * t + k * 1.3 + seed * 2)
      const x = cx + Math.cos(t) * r * w * 1.15
      const y = cy + Math.sin(t) * r * w * 0.9
      d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1)
    }
    out.push(d + 'Z')
  }
  return out
}
