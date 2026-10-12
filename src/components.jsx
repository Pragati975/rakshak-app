import { useState, useEffect, useRef } from 'react'
import { signIn, sendReset, createAccount, listAccounts, deleteMyAccount, currentUser, saveRoster } from './api.js'
import { DEMO_ENABLED, APP_VERSION, PRIVACY_URL } from './flags.js'
import { notificationsOn, setNotificationsOn } from './notify.js'
import {
  c, font, display, Icon, statusColor, statusLabel, inputStyle, btnSm, timeAgo, initialPersonnel, initialUnits,
  StatusGlyph, BatteryCells, Wordmark, glyphShape, parseSector, contourPaths,
} from './theme.jsx'

const pageStyle = { padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: '100%' }
const iconBtn = { width: 48, height: 48, background: 'transparent', border: `1px solid ${c.outline}`, borderRadius: 999, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }
const ruleRow = { display: 'flex', alignItems: 'center', gap: 12, minHeight: 56, padding: '8px 4px', borderBottom: `1px solid ${c.outline}`, cursor: 'pointer', borderRadius: 4 }
const mutedText = { fontSize: 13, color: c.textSec }

// ---- Toast --------------------------------------------------------------------
export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (toast) {
      const t = setTimeout(onClose, 2500)
      return () => clearTimeout(t)
    }
  }, [toast, onClose])
  if (!toast) return null
  const critical = toast.type === 'critical'
  return (
    <div role="status" style={{
      position: 'absolute', top: 12, left: 12, right: 12, background: c.elevated, borderRadius: 6,
      padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, zIndex: 100,
      border: `1px solid ${critical ? c.critical : c.outline}`, animation: 'slide-down 0.2s ease',
    }}>
      <StatusGlyph status={critical ? 'critical' : 'safe'} size={18} />
      <span style={{ fontSize: 15, color: c.textPri, fontWeight: 700 }}>{toast.msg}</span>
    </div>
  )
}

// ---- Bottom sheet ------------------------------------------------------------
export function Modal({ open, onClose, title, children, icon }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(10,16,14,0.72)', display: 'flex', alignItems: 'flex-end', zIndex: 90 }}>
      <div role="dialog" aria-label={title} onClick={e => e.stopPropagation()} style={{
        width: '100%', background: c.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
        padding: '8px 20px 24px', maxHeight: '88%', overflow: 'auto', animation: 'slide-up 0.25s ease',
        borderTop: `1px solid ${c.outline}`,
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: c.outline, margin: '4px auto 12px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            {icon}
            <span style={display(22)}>{title}</span>
          </div>
          <button onClick={onClose} aria-label="Close" style={iconBtn}>
            <Icon name="close" size={20} color={c.textPri} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// A full-width action row with an icon
export function ActionRow({ icon, label, onClick, danger }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', minHeight: 52, display: 'flex', alignItems: 'center', gap: 14, padding: '0 4px',
      background: 'transparent', border: 'none', borderBottom: `1px solid ${c.outline}`, cursor: 'pointer',
      color: danger ? c.critical : c.textPri, fontSize: 16, fontWeight: 700, textAlign: 'left',
    }}>
      <Icon name={icon} size={22} color={danger ? c.critical : c.textSec} />
      {label}
    </button>
  )
}

// A fact: small label, bigger value
export function InfoTile({ label, value, valueColor }) {
  return (
    <div style={{ padding: '10px 0', borderTop: `1px solid ${c.outline}` }}>
      <div style={mutedText}>{label}</div>
      <div style={{ fontSize: 17, color: valueColor || c.textPri, fontWeight: 700, marginTop: 2 }}>{value}</div>
    </div>
  )
}

// ---- Splash: a radio tuning in, then locking onto the wordmark ----------------
export function Splash() {
  const reduced = typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [freq, setFreq] = useState(reduced ? 104.3 : 88.0)
  const [locked, setLocked] = useState(reduced)
  useEffect(() => {
    if (reduced) return
    const start = performance.now()
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 1600)
      setFreq(88 + (104.3 - 88) * (1 - Math.pow(1 - t, 3)))
      if (t < 1) raf = requestAnimationFrame(tick)
      else setLocked(true)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduced])
  const needleX = 20 + ((freq - 88) / 20) * 240
  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={display(32, { fontVariantNumeric: 'tabular-nums', opacity: locked ? 0.55 : 1, transition: 'opacity 0.5s' })}>{freq.toFixed(1)}<span style={{ fontSize: 15, fontWeight: 400, marginLeft: 6, color: c.textSec }}>MHz</span></div>
        <svg width="280" height="36" viewBox="0 0 280 36" style={{ marginTop: 8 }} aria-hidden="true">
          {Array.from({ length: 21 }).map((_, i) => (
            <line key={i} x1={20 + i * 12} x2={20 + i * 12} y1={i % 5 === 0 ? 8 : 14} y2="24" stroke={c.outline} strokeWidth="1.5" />
          ))}
          <line x1={needleX} x2={needleX} y1="2" y2="30" stroke={locked ? c.safe : c.textPri} strokeWidth="2" />
        </svg>
      </div>
      <div style={{ textAlign: 'center', opacity: locked ? 1 : 0, transform: locked ? 'none' : 'scale(0.96)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
        <Wordmark size={32} />
        <div style={{ fontSize: 15, color: c.textSec, marginTop: 8 }}>Tactical command platform</div>
      </div>
    </div>
  )
}

// ---- Login -------------------------------------------------------------------
const authMessage = (e) => ({
  'auth/invalid-credential': 'Wrong email or password.',
  'auth/invalid-email': 'That email address is not valid.',
  'auth/user-not-found': 'No account with that email.',
  'auth/network-request-failed': 'No connection. Check your internet and try again.',
  'auth/operation-not-allowed': 'Email/Password sign-in is not enabled in Firebase yet.',
  'auth/too-many-requests': 'Too many attempts. Wait a minute and try again.',
  'auth/requires-recent-login': 'Please sign in again, then retry.',
  'auth/email-already-in-use': 'An account with that email already exists.',
  'auth/weak-password': 'Password is too weak.',
  'rakshak/no-profile': 'This account is not set up yet. Ask your commander to add you.',
  'permission-denied': 'You are not allowed to do that.',
}[e.code] || `Something went wrong (${e.code || e.message}).`)

export function Auth({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState('commander')
  const [unitId, setUnitId] = useState(1)

  const handleSignIn = (demo) => {
    setError(''); setInfo('')
    if (!demo) {
      if (!email || !password) { setError('Enter your email and password.'); return }
      if (!email.includes('@')) { setError('Email needs an @, for example name@example.com.'); return }
    }
    setLoading(true)
    if (demo) { setTimeout(() => { setLoading(false); onLogin('demo', role, unitId) }, 1200); return }
    signIn(email, password)
      .then((p) => onLogin('live', p.role, p.unitId))
      .catch((e) => { setError(authMessage(e)); setLoading(false) })
  }

  const handleForgot = () => {
    setError(''); setInfo('')
    if (!email.includes('@')) { setError('Type your email above first, then tap Forgot password.'); return }
    sendReset(email)
      .then(() => setInfo(`Reset link sent to ${email.trim()}. Check your inbox and spam folder.`))
      .catch((e) => setError(authMessage(e)))
  }

  return (
    <div style={{ position: 'relative', minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px', overflow: 'hidden' }}>
      <svg viewBox="0 0 340 300" preserveAspectRatio="xMidYMin slice" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 300, pointerEvents: 'none' }} aria-hidden="true">
        {contourPaths(250, 80, 9, 20, 2).map((d, i) => <path key={i} d={d} fill="none" stroke={c.outline} strokeWidth="1" opacity="0.5" />)}
      </svg>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <Wordmark size={32} />
          <div style={{ fontSize: 15, color: c.textSec, marginTop: 6 }}>Tactical command platform</div>
        </div>

        {error && (
          <div role="alert" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', border: `1px solid ${c.critical}`, borderRadius: 6, padding: '10px 12px', marginTop: 8 }}>
            <StatusGlyph status="critical" size={18} />
            <span style={{ fontSize: 15, color: c.textPri }}>{error}</span>
          </div>
        )}
        {info && (
          <div role="status" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', border: `1px solid ${c.safe}`, borderRadius: 6, padding: '10px 12px', marginTop: 8 }}>
            <StatusGlyph status="safe" size={18} />
            <span style={{ fontSize: 15, color: c.textPri }}>{info}</span>
          </div>
        )}
        <input aria-label="Email" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={{ ...inputStyle, marginTop: 8 }} />
        <input aria-label="Password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" onKeyDown={e => e.key === 'Enter' && handleSignIn(false)} style={inputStyle} />
        <button onClick={() => handleSignIn(false)} disabled={loading} style={{
          minHeight: 56, background: c.textPri, color: c.onPrimary, border: 'none', borderRadius: 6, fontSize: 17, fontWeight: 800,
          fontFamily: font.display, fontStretch: '112%', cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: loading ? 0.7 : 1,
        }}>
          {loading ? <span style={{ width: 18, height: 18, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> : 'Sign in'}
        </button>
        <button onClick={handleForgot} style={{ minHeight: 44, background: 'none', border: 'none', color: c.textSec, fontSize: 15, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 4 }}>Forgot password?</button>
        <div style={{ fontSize: 13, color: c.textSec, textAlign: 'center' }}>Accounts are created by your commander.</div>

        {DEMO_ENABLED && (
          <div style={{ borderTop: `1px solid ${c.outline}`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13, color: c.textSec }}>Demo mode: sample data only, nothing is saved</div>
            <div role="tablist" aria-label="Demo as" style={{ display: 'flex', gap: 8 }}>
              {[['commander', 'Commander'], ['field', 'Field unit']].map(([k, label]) => (
                <button key={k} role="tab" aria-selected={role === k} onClick={() => setRole(k)} style={{
                  flex: 1, minHeight: 48, borderRadius: 6, cursor: 'pointer', fontSize: 16, fontWeight: 800, fontFamily: font.display, fontStretch: '112%',
                  border: `1px solid ${role === k ? c.textPri : c.outline}`, background: role === k ? c.textPri : 'transparent',
                  color: role === k ? c.onPrimary : c.textSec,
                }}>{label}</button>
              ))}
            </div>
            {role === 'field' && (
              <select aria-label="Your team" value={unitId} onChange={e => setUnitId(Number(e.target.value))} style={inputStyle}>
                {initialUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            )}
            <button onClick={() => handleSignIn(true)} disabled={loading} style={{
              minHeight: 48, background: 'none', border: 'none', color: c.textSec, fontSize: 15, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 4,
            }}>Continue in demo mode</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ---- Unit detail ---------------------------------------------------------------
const personnelStatusToGlyph = (s) => ({ active: 'safe', standby: 'warning', degraded: 'warning', wounded: 'critical', offline: 'offline' })[s] || 'offline'
const personnelStatusLabel = (s) => ({ active: 'Active', standby: 'Standby', wounded: 'Wounded', degraded: 'Degraded', offline: 'Offline' })[s] || s

export function UnitDetailModal({ unit, roster = [], onClose, onUpdate, onToast, onPing, onSync, onRedeploy, onOpenComms }) {
  const [redeploying, setRedeploying] = useState(false)
  const [col, setCol] = useState('A')
  const [row, setRow] = useState(1)
  useEffect(() => { setRedeploying(false) }, [unit && unit.id])
  if (!unit) return null
  const statuses = ['safe', 'warning', 'critical', 'offline']
  const personnel = roster.filter(r => r.unitId === unit.id)
  return (
    <Modal open={!!unit} onClose={onClose} title={unit.name} icon={<StatusGlyph status={unit.status} size={22} />}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {statuses.map(s => {
          const on = unit.status === s
          return (
            <button key={s} aria-pressed={on} onClick={() => { onUpdate(unit.id, { status: s }); onToast(`${unit.name} set to ${statusLabel(s)}`, 'success') }} style={{
              minHeight: 48, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 999, cursor: 'pointer',
              background: on ? c.elevated : 'transparent', border: `${on ? 2 : 1}px solid ${on ? c.textPri : c.outline}`,
              color: on ? c.textPri : c.textSec, fontSize: 15, fontWeight: 700,
            }}>
              <StatusGlyph status={s} size={14} />{statusLabel(s)}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 20, marginBottom: 8 }}>
        <InfoTile label="Sector" value={unit.location.replace('Sector ', '')} />
        <InfoTile label="Last update" value={timeAgo(unit.lastUpdate)} />
        <InfoTile label="Personnel" value={`${unit.personnel} active`} />
        <InfoTile label="Comms" value={unit.comms} valueColor={unit.comms === 'Lost' ? c.critical : unit.comms === 'Degraded' ? c.warning : c.textPri} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: `1px solid ${c.outline}`, borderBottom: `1px solid ${c.outline}`, marginBottom: 8 }}>
        <span style={mutedText}>Battery</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BatteryCells level={unit.battery} />
          <span style={{ fontSize: 17, fontWeight: 700, color: unit.battery < 25 ? c.warning : c.textPri, fontVariantNumeric: 'tabular-nums' }}>{unit.battery}%</span>
        </div>
      </div>
      <ActionRow icon="ping" label="Ping unit" onClick={() => onPing(unit)} />
      <ActionRow icon="radio" label="Open comms" onClick={() => onOpenComms(unit)} />
      <ActionRow icon="deploy" label="Redeploy" onClick={() => setRedeploying(!redeploying)} />
      {redeploying && (
        <div style={{ padding: '12px 0 16px', borderBottom: `1px solid ${c.outline}` }}>
          <div style={{ ...mutedText, marginBottom: 8 }}>Send {unit.name} to sector (now {unit.location.replace('Sector ', '')})</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <select aria-label="Sector column" value={col} onChange={e => setCol(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
              {['A', 'B', 'C', 'D', 'E'].map(l => <option key={l} value={l}>Column {l}</option>)}
            </select>
            <select aria-label="Sector row" value={row} onChange={e => setRow(Number(e.target.value))} style={{ ...inputStyle, flex: 1 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>Row {n}</option>)}
            </select>
          </div>
          <button onClick={() => { onRedeploy(unit, `Sector ${col}-${row}`); setRedeploying(false) }} style={{
            marginTop: 12, width: '100%', minHeight: 52, background: c.textPri, color: c.onPrimary, border: 'none', borderRadius: 6, fontSize: 16, fontWeight: 800, cursor: 'pointer',
          }}>Send order to {col}-{row}</button>
        </div>
      )}
      <ActionRow icon="refresh" label="Force sync" onClick={() => onSync(unit)} />

      <div style={{ ...display(17), margin: '20px 0 4px' }}>Personnel ({personnel.length})</div>
      {personnel.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 52, borderBottom: `1px solid ${c.outline}` }}>
          <StatusGlyph status={p.status ? personnelStatusToGlyph(p.status) : unit.status} size={14} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: c.textPri }}>{p.name}</div>
            <div style={mutedText}>{p.title}</div>
          </div>
          {p.status && <span style={{ fontSize: 13, color: c.textSec }}>{personnelStatusLabel(p.status)}</span>}
        </div>
      ))}
      {personnel.length === 0 && <div style={{ ...mutedText, padding: '12px 0' }}>No members yet. Add field accounts under Settings, Team accounts.</div>}
    </Modal>
  )
}

// ---- SOS: hold for 2 seconds, with a progress ring ------------------------------------
export function SOSButton({ onSOS }) {
  const [hold, setHold] = useState(0)
  const holdRef = useRef(null)
  useEffect(() => () => clearInterval(holdRef.current), [])
  const startHold = () => {
    if (holdRef.current) return
    navigator.vibrate?.(30)
    const start = Date.now()
    holdRef.current = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / 2000) * 100)
      setHold(p)
      if (p >= 100) {
        clearInterval(holdRef.current); holdRef.current = null
        navigator.vibrate?.([200, 100, 200])
        setHold(0); onSOS()
      }
    }, 30)
  }
  const cancelHold = () => { clearInterval(holdRef.current); holdRef.current = null; setHold(0) }
  const R = 22, CIRC = 2 * Math.PI * R
  return (
    <button
      aria-label="Hold for 2 seconds to send SOS"
      onPointerDown={startHold} onPointerUp={cancelHold} onPointerLeave={cancelHold} onPointerCancel={cancelHold}
      onContextMenu={e => e.preventDefault()}
      style={{
        width: '100%', minHeight: 76, padding: '12px 20px', background: c.critical, border: 'none', borderRadius: 28,
        color: c.onPrimary, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', touchAction: 'none',
        userSelect: 'none', WebkitUserSelect: 'none', flexShrink: 0, textAlign: 'left',
      }}>
      <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true" style={{ flexShrink: 0 }}>
        <circle cx="26" cy="26" r={R} fill="none" stroke="rgba(26,38,35,0.28)" strokeWidth="5" />
        <circle cx="26" cy="26" r={R} fill="none" stroke={c.onPrimary} strokeWidth="5" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - hold / 100)} transform="rotate(-90 26 26)" />
        <text x="26" y="31" textAnchor="middle" fontFamily={font.display} fontWeight="800" fontSize="14" fill={c.onPrimary}>SOS</text>
      </svg>
      <span style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={display(22, { color: c.onPrimary })}>{hold > 0 ? 'Keep holding' : 'Hold to send SOS'}</span>
        <span style={{ fontSize: 13, color: c.onPrimary, opacity: 0.85 }}>Hold for 2 seconds</span>
      </span>
    </button>
  )
}

// ---- Sector scope: bearing = sector letter, distance = sector number -------------------
function SectorScope({ units }) {
  const C = 150, R = 128
  const rad = (deg) => (deg * Math.PI) / 180
  const pos = (u) => {
    const { col, row } = parseSector(u.location)
    const a = rad(col * 72 + 36), r = 14 + row * ((R - 28) / 8)
    return { x: C + r * Math.sin(a), y: C - r * Math.cos(a) }
  }
  const edge = (deg, r) => [C + r * Math.sin(rad(deg)), C - r * Math.cos(rad(deg))]
  const [x1, y1] = edge(-34, R)
  return (
    <svg viewBox="0 0 300 300" width="100%" style={{ maxWidth: 340, display: 'block', margin: '0 auto' }} role="img" aria-label="Sector scope showing each team by sector">
      <defs><clipPath id="scope-clip"><circle cx={C} cy={C} r={R} /></clipPath></defs>
      <circle cx={C} cy={C} r={R} fill={c.surface} stroke={c.outline} strokeWidth="1.5" />
      <g clipPath="url(#scope-clip)">
        {contourPaths(112, 128, 8, 15, 1).map((d, i) => <path key={i} d={d} fill="none" stroke={c.outline} strokeWidth="1" opacity="0.5" />)}
      </g>
      {[R / 3, (2 * R) / 3].map((r, i) => <circle key={i} cx={C} cy={C} r={r} fill="none" stroke={c.outline} strokeWidth="1" strokeDasharray="2 5" />)}
      {[0, 1, 2, 3, 4].map(i => { const [ex, ey] = edge(i * 72, R); return <line key={i} x1={C} y1={C} x2={ex} y2={ey} stroke={c.outline} strokeWidth="1" /> })}
      {['A', 'B', 'C', 'D', 'E'].map((l, i) => { const [lx, ly] = edge(i * 72 + 36, R + 11); return <text key={l} x={lx} y={ly + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill={c.textSec}>{l}</text> })}
      <g className="scope-sweep">
        <path d={`M${C} ${C}L${x1.toFixed(1)} ${y1.toFixed(1)}A${R} ${R} 0 0 1 ${C} ${C - R}Z`} fill={c.textPri} opacity="0.07" />
        <line x1={C} y1={C} x2={C} y2={C - R} stroke={c.textPri} strokeWidth="1.5" opacity="0.6" />
      </g>
      <rect x={C - 5} y={C - 5} width="10" height="10" fill={c.textPri} />
      <text x={C} y={C - 11} textAnchor="middle" fontSize="11" fill={c.textSec} stroke={c.surface} strokeWidth="3" paintOrder="stroke">Command</text>
      {units.map(u => {
        const p = pos(u)
        return (
          <g key={u.id}>
            <g transform={`translate(${(p.x - 10).toFixed(1)} ${(p.y - 10).toFixed(1)}) scale(1.25)`}>{glyphShape(u.status, statusColor(u.status))}</g>
            <text x={p.x} y={p.y + 24} textAnchor="middle" fontSize="12" fontWeight="700" fill={c.textPri} stroke={c.surface} strokeWidth="3" paintOrder="stroke">{u.name.replace(' Team', '')}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ---- Home -----------------------------------------------------------------------------
export function Dashboard({ units, alerts, onUnitClick, onSOS, onSettings, mode, onNavigate, onMissionBrief, missionCount = 0 }) {
  const [search, setSearch] = useState('')
  const counts = {
    safe: units.filter(u => u.status === 'safe').length,
    warning: units.filter(u => u.status === 'warning').length,
    critical: units.filter(u => u.status === 'critical').length,
    offline: units.filter(u => u.status === 'offline').length,
  }
  const needAction = alerts.filter(a => !a.resolved && !a.acknowledged && a.severity !== 'safe').length
  const filteredUnits = search ? units.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.location.toLowerCase().includes(search.toLowerCase())) : units

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Wordmark size={22} />
        <button onClick={onSettings} aria-label="Settings" style={iconBtn}><Icon name="settings" size={22} color={c.textPri} /></button>
      </div>

      <div>
        <div style={display(32)}>Command overview</div>
        <div style={{ fontSize: 15, color: c.textSec, marginTop: 6 }}>
          {needAction === 0 ? 'All units reporting' : `${needAction} alert${needAction === 1 ? '' : 's'} need${needAction === 1 ? 's' : ''} action`}
          {mode === 'demo' ? ', demo data' : ''}
        </div>
      </div>

      <SectorScope units={units} />

      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${c.outline}`, borderBottom: `1px solid ${c.outline}` }}>
        {['safe', 'warning', 'critical', 'offline'].map(s => (
          <button key={s} onClick={() => onNavigate('alerts')} aria-label={`${counts[s]} ${statusLabel(s)}. Open alerts`} style={{ flex: 1, minHeight: 64, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <StatusGlyph status={s} size={14} />
              <span style={display(22, { fontVariantNumeric: 'tabular-nums' })}>{counts[s]}</span>
            </span>
            <span style={mutedText}>{statusLabel(s)}</span>
          </button>
        ))}
      </div>

      <button onClick={onMissionBrief} style={{
        display: 'flex', alignItems: 'stretch', width: '100%', minHeight: 60, padding: 0, background: c.surface, border: `1px solid ${c.outline}`,
        borderRadius: 4, cursor: 'pointer', textAlign: 'left', overflow: 'hidden',
      }}>
        <span style={{ width: 8, background: c.textSec, flexShrink: 0 }} />
        <span style={{ flex: 1, padding: '10px 14px' }}>
          <span style={{ ...display(17), display: 'block' }}>Mission briefing</span>
          <span style={{ fontSize: 13, color: c.textSec }}>{missionCount} active operation{missionCount === 1 ? '' : 's'}</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', paddingRight: 14 }}><Icon name="chevron" size={20} color={c.textSec} /></span>
      </button>

      <SOSButton onSOS={onSOS} />

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <span style={display(22)}>Units</span>
          <span style={mutedText}>Tap a unit for details</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${c.outline}`, borderRadius: 6, padding: '0 12px', minHeight: 48, marginBottom: 4 }}>
          <Icon name="search" size={18} color={c.textSec} />
          <input aria-label="Search units or sectors" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search units or sectors" style={{ flex: 1, background: 'none', border: 'none', color: c.textPri, fontSize: 16, outline: 'none', minHeight: 44 }} />
          {search && <button aria-label="Clear search" onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}><Icon name="close" size={16} color={c.textSec} /></button>}
        </div>
        {filteredUnits.length === 0 ? (
          <div style={{ padding: '20px 4px', fontSize: 15, color: c.textSec }}>No units match "{search}". Clear the search to see all units.</div>
        ) : filteredUnits.map(u => (
          <div key={u.id} role="button" tabIndex={0} onClick={() => onUnitClick(u)} onKeyDown={e => e.key === 'Enter' && onUnitClick(u)} style={{ ...ruleRow, minHeight: 64 }}>
            <StatusGlyph status={u.status} size={18} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: c.textPri }}>{u.name}</div>
              <div style={mutedText}>{u.location}, {u.status === 'offline' ? 'lost contact ' : ''}{timeAgo(u.lastUpdate)}</div>
            </div>
            <BatteryCells level={u.battery} />
          </div>
        ))}
      </div>

      <div>
        <div style={{ ...display(22), marginBottom: 4 }}>Radio log</div>
        {alerts.slice(0, 5).map(a => (
          <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '76px 1fr', gap: 8, padding: '10px 4px', borderBottom: `1px solid ${c.outline}`, opacity: a.resolved ? 0.55 : 1 }}>
            <div style={{ fontSize: 13, color: c.textSec, fontVariantNumeric: 'tabular-nums' }}>{a.time}</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <StatusGlyph status={a.severity} size={13} />
                <span style={{ fontSize: 15, fontWeight: 700, color: c.textPri }}>{a.title}</span>
              </div>
              <div style={mutedText}>{a.location}{a.resolved ? ', resolved' : ''}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Alerts -------------------------------------------------------------------------------
export function Alerts({ alerts, onAlertClick, onAcknowledge, onResolve, onAddAlert }) {
  const [filter, setFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [newAlert, setNewAlert] = useState({ title: '', desc: '', severity: 'warning', location: '' })

  const filtered = alerts.filter(a => {
    if (filter === 'all') return true
    if (filter === 'active') return !a.resolved
    return a.severity === filter
  })
  const filters = [{ key: 'all', label: 'All' }, { key: 'active', label: 'Active' }, { key: 'critical', label: 'Critical' }, { key: 'warning', label: 'Warning' }]

  const handleCreate = () => {
    if (!newAlert.title || !newAlert.location) return
    onAddAlert(newAlert)
    setNewAlert({ title: '', desc: '', severity: 'warning', location: '' })
    setShowAdd(false)
  }

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={display(32)}>Alerts</div>
        <button onClick={() => setShowAdd(!showAdd)} aria-label={showAdd ? 'Close new alert form' : 'Create alert'} style={iconBtn}>
          <Icon name={showAdd ? 'close' : 'plus'} size={22} color={c.textPri} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
        {filters.map(f => (
          <button key={f.key} aria-pressed={filter === f.key} onClick={() => setFilter(f.key)} style={{
            minHeight: 48, padding: '0 18px', background: filter === f.key ? c.textPri : 'transparent',
            border: `1px solid ${filter === f.key ? c.textPri : c.outline}`, borderRadius: 999, cursor: 'pointer',
            fontSize: 15, fontWeight: 700, color: filter === f.key ? c.onPrimary : c.textSec, whiteSpace: 'nowrap',
          }}>{f.label}</button>
        ))}
      </div>

      {showAdd && (
        <div style={{ border: `1px solid ${c.outline}`, borderRadius: 6, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, background: c.surface }}>
          <span style={display(17)}>Create alert</span>
          <input aria-label="Alert title" value={newAlert.title} onChange={e => setNewAlert({ ...newAlert, title: e.target.value })} placeholder="Title" style={inputStyle} />
          <input aria-label="Description" value={newAlert.desc} onChange={e => setNewAlert({ ...newAlert, desc: e.target.value })} placeholder="What happened" style={inputStyle} />
          <input aria-label="Sector" value={newAlert.location} onChange={e => setNewAlert({ ...newAlert, location: e.target.value })} placeholder="Sector, for example Sector A-1" style={inputStyle} />
          <div style={{ display: 'flex', gap: 8 }}>
            {['safe', 'warning', 'critical'].map(s => (
              <button key={s} aria-pressed={newAlert.severity === s} onClick={() => setNewAlert({ ...newAlert, severity: s })} style={{
                flex: 1, minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, cursor: 'pointer',
                background: newAlert.severity === s ? c.elevated : 'transparent', border: `${newAlert.severity === s ? 2 : 1}px solid ${newAlert.severity === s ? c.textPri : c.outline}`,
                color: newAlert.severity === s ? c.textPri : c.textSec, fontSize: 15, fontWeight: 700,
              }}><StatusGlyph status={s} size={14} />{statusLabel(s)}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleCreate} disabled={!newAlert.title || !newAlert.location} style={{ flex: 1, minHeight: 52, background: c.textPri, color: c.onPrimary, border: 'none', borderRadius: 6, fontSize: 16, fontWeight: 800, cursor: 'pointer', opacity: !newAlert.title || !newAlert.location ? 0.5 : 1 }}>Create alert</button>
            <button onClick={() => setShowAdd(false)} style={{ ...btnSm(c.outline), borderRadius: 6 }}>Cancel</button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, paddingTop: 24 }}>
          <StatusGlyph status="safe" size={28} />
          <div style={display(22)}>{filter === 'all' ? 'No alerts. All units reporting.' : 'No alerts match this filter.'}</div>
          <button onClick={() => setShowAdd(true)} style={btnSm(c.textPri)}>Create alert</button>
        </div>
      ) : (
        <div>
          {filtered.map(a => {
            const color = statusColor(a.severity)
            return (
              <div key={a.id} role="button" tabIndex={0} onClick={() => onAlertClick(a)} onKeyDown={e => e.key === 'Enter' && onAlertClick(a)} style={{
                display: 'flex', alignItems: 'stretch', minHeight: 76, borderBottom: `1px solid ${c.outline}`, cursor: 'pointer', opacity: a.resolved ? 0.55 : 1,
              }}>
                <div style={{ width: 6, background: color, flexShrink: 0, borderRadius: 1 }} />
                <div style={{ flex: 1, padding: '12px 4px 12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusGlyph status={a.severity} size={16} />
                    <span style={{ fontSize: 17, fontWeight: 700, color: c.textPri, flex: 1 }}>{a.title}</span>
                    {a.resolved && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: c.textSec }}><Icon name="check" size={14} color={c.textSec} />Resolved</span>}
                    {a.acknowledged && !a.resolved && <span style={{ fontSize: 13, color: c.textSec }}>Acknowledged</span>}
                  </div>
                  <div style={{ fontSize: 15, color: c.textSec, marginTop: 4 }}>{a.desc}</div>
                  <div style={{ fontSize: 13, color: c.textSec, marginTop: 6, display: 'flex', gap: 16 }}>
                    <span>{a.location}</span><span>{a.time}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function AlertDetailModal({ alert, onClose, onAcknowledge, onResolve, onToast }) {
  if (!alert) return null
  return (
    <Modal open={!!alert} onClose={onClose} title={alert.title} icon={<StatusGlyph status={alert.severity} size={22} />}>
      <div style={{ fontSize: 17, color: c.textPri, lineHeight: 1.4, marginBottom: 12 }}>{alert.desc}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 20, marginBottom: 8 }}>
        <InfoTile label="Severity" value={statusLabel(alert.severity)} />
        <InfoTile label="Sector" value={alert.location} />
        <InfoTile label="Reported" value={alert.time} />
        <InfoTile label="Status" value={alert.resolved ? 'Resolved' : alert.acknowledged ? 'Acknowledged' : 'Needs action'} valueColor={!alert.resolved && !alert.acknowledged ? c.warning : c.textPri} />
      </div>
      {!alert.acknowledged && <ActionRow icon="check" label="Acknowledge" onClick={() => { onAcknowledge(alert.id); onToast('Alert acknowledged', 'success') }} />}
      {!alert.resolved && <ActionRow icon="check" label="Mark resolved" onClick={() => { onResolve(alert.id); onToast('Alert resolved', 'success') }} />}
      <ActionRow icon="radio" label="Broadcast to all units" onClick={() => onToast(`Alert broadcast to all units: ${alert.title}`, 'critical')} />
    </Modal>
  )
}

// ---- Map: a survey sheet. Columns A-E, rows 1-8 match the "Sector C-7" names. -----------------
const MAP = { x0: 26, y0: 28, colW: 62, rowH: 42 }
export function MapScreen({ mapUnits, units, onUnitSelect, onToast, onPing, onMessage }) {
  const [selected, setSelected] = useState(null)
  const stripRef = useRef(null)
  // Selection card sits under the map; bring it into view when a row lower down is tapped
  useEffect(() => { if (selected && stripRef.current) stripRef.current.scrollIntoView({ block: 'nearest' }) }, [selected])
  const trails = useRef({})

  const place = (u) => {
    const unit = units.find(x => x.id === u.id)
    const { col, row } = parseSector(unit ? unit.location : '')
    return {
      x: MAP.x0 + (col + 0.5) * MAP.colW + ((u.x % 7) - 3.5) * 3,
      y: MAP.y0 + (row - 0.5) * MAP.rowH + ((u.y % 7) - 3.5) * 2.5,
    }
  }
  useEffect(() => {
    mapUnits.forEach(u => {
      const p = place(u)
      const t = trails.current[u.id] || (trails.current[u.id] = [])
      const last = t[t.length - 1]
      if (!last || Math.hypot(last.x - p.x, last.y - p.y) > 3) { t.push(p); if (t.length > 4) t.shift() }
    })
  }, [mapUnits])

  const handleClick = (u) => { setSelected(selected === u.id ? null : u.id); onUnitSelect(u) }
  const sel = selected ? mapUnits.find(m => m.id === selected) : null
  const selFull = sel ? units.find(un => un.id === sel.id) : null

  return (
    <div style={{ ...pageStyle, paddingBottom: 0, gap: 12 }}>
      <div style={display(32)}>Map</div>
      <svg viewBox="0 0 340 392" width="100%" role="img" aria-label="Survey map with team positions" style={{ display: 'block', background: c.surface, border: `1px solid ${c.outline}`, borderRadius: 4 }}>
        <defs><clipPath id="map-clip"><rect x={MAP.x0} y={MAP.y0} width={MAP.colW * 5} height={MAP.rowH * 8} /></clipPath></defs>
        <g clipPath="url(#map-clip)">
          {contourPaths(90, 120, 7, 17, 3).map((d, i) => <path key={'a' + i} d={d} fill="none" stroke={c.outline} strokeWidth="1" opacity="0.55" />)}
          {contourPaths(255, 270, 6, 18, 5).map((d, i) => <path key={'b' + i} d={d} fill="none" stroke={c.outline} strokeWidth="1" opacity="0.55" />)}
        </g>
        {Array.from({ length: 6 }).map((_, i) => <line key={'v' + i} x1={MAP.x0 + i * MAP.colW} x2={MAP.x0 + i * MAP.colW} y1={MAP.y0} y2={MAP.y0 + MAP.rowH * 8} stroke={c.outline} strokeWidth="1" />)}
        {Array.from({ length: 9 }).map((_, i) => <line key={'h' + i} y1={MAP.y0 + i * MAP.rowH} y2={MAP.y0 + i * MAP.rowH} x1={MAP.x0} x2={MAP.x0 + MAP.colW * 5} stroke={c.outline} strokeWidth="1" />)}
        {['A', 'B', 'C', 'D', 'E'].map((l, i) => <text key={l} x={MAP.x0 + (i + 0.5) * MAP.colW} y="20" textAnchor="middle" fontSize="12" fontWeight="700" fill={c.textSec}>{l}</text>)}
        {Array.from({ length: 8 }).map((_, i) => <text key={i} x="14" y={MAP.y0 + (i + 0.5) * MAP.rowH + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill={c.textSec}>{i + 1}</text>)}
        <g transform="translate(318 50)" aria-hidden="true">
          <path d="M0 -14L6 4L0 0L-6 4Z" fill={c.textPri} />
          <text y="18" textAnchor="middle" fontSize="11" fontWeight="700" fill={c.textPri}>N</text>
        </g>
        <g aria-hidden="true">
          <line x1="30" x2="94" y1="380" y2="380" stroke={c.textSec} strokeWidth="1.5" />
          <line x1="30" x2="30" y1="375" y2="385" stroke={c.textSec} strokeWidth="1.5" />
          <line x1="94" x2="94" y1="375" y2="385" stroke={c.textSec} strokeWidth="1.5" />
          <text x="100" y="384" fontSize="11" fill={c.textSec}>500 m</text>
        </g>
        {mapUnits.map(u => {
          const t = trails.current[u.id] || []
          if (t.length < 2 || u.status === 'offline') return null
          return <polyline key={'t' + u.id} points={t.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} fill="none" stroke={c.textSec} strokeWidth="2" strokeLinecap="round" strokeDasharray="0.1 5" />
        })}
        {mapUnits.map(u => {
          const p = place(u)
          const isSel = selected === u.id
          return (
            <g key={u.id} onClick={() => handleClick(u)} style={{ cursor: 'pointer' }} role="button" aria-label={`${u.name}, ${statusLabel(u.status)}`}>
              <circle cx={p.x} cy={p.y} r="24" fill="transparent" />
              {isSel && <circle cx={p.x} cy={p.y} r="17" fill="none" stroke={c.textPri} strokeWidth="2" />}
              <g transform={`translate(${(p.x - 10).toFixed(1)} ${(p.y - 10).toFixed(1)}) scale(1.25)`}>{glyphShape(u.status, statusColor(u.status))}</g>
              <text x={p.x} y={p.y + 26} textAnchor="middle" fontSize="11" fontWeight="700" fill={c.textPri} stroke={c.surface} strokeWidth="3" paintOrder="stroke">{u.name}</text>
            </g>
          )
        })}
      </svg>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
        {['safe', 'warning', 'critical', 'offline'].map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: c.textSec }}><StatusGlyph status={s} size={13} />{statusLabel(s)}</div>
        ))}
      </div>

      {sel && (
        <div ref={stripRef} style={{ padding: '12px 14px 14px', background: c.surface, border: `1px solid ${c.textPri}`, borderRadius: 4, scrollMarginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <StatusGlyph status={sel.status} size={18} />
            <span style={display(17)}>{selFull ? selFull.name : sel.name}</span>
            <span style={{ ...mutedText, flex: 1 }}>{selFull ? selFull.location : ''}</span>
            {selFull && <BatteryCells level={selFull.battery} />}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button onClick={() => onPing(selFull || sel)} style={btnSm(c.outline)}>Ping</button>
            <button onClick={() => onMessage(selFull || sel)} style={btnSm(c.outline)}>Message</button>
            <button onClick={() => onToast(`Tracking ${sel.name} on the map`, 'success')} style={btnSm(c.outline)}>Track</button>
          </div>
        </div>
      )}
      <div>
        <div style={{ ...display(22), marginBottom: 4 }}>Units on map</div>
        {mapUnits.map(u => {
          const full = units.find(x => x.id === u.id)
          return (
            <div key={u.id} role="button" tabIndex={0} onClick={() => handleClick(u)} onKeyDown={e => e.key === 'Enter' && handleClick(u)} style={{ ...ruleRow, background: selected === u.id ? c.elevated : 'transparent' }}>
              <StatusGlyph status={u.status} size={16} />
              <span style={{ fontSize: 17, fontWeight: 700, color: c.textPri, flex: 1 }}>{u.name}</span>
              <span style={mutedText}>{full ? full.location.replace('Sector ', '') : ''}</span>
              <span style={{ fontSize: 15, color: c.textSec, minWidth: 64, textAlign: 'right' }}>{statusLabel(u.status)}</span>
            </div>
          )
        })}
      </div>

      <div style={{ height: 8 }} />
    </div>
  )
}

// ---- Settings -------------------------------------------------------------------------------
export function Settings({ roster = [], mode, role, onLogout, onToast, onClose, onAccountDeleted }) {
  const live = mode === 'live'
  const me = live ? currentUser() : null
  const [notify, setNotify] = useState(notificationsOn())
  const [open, setOpen] = useState(null) // 'team' | 'delete'
  const [accounts, setAccounts] = useState([])
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState('field')
  const [newUnit, setNewUnit] = useState(1)
  const [newName, setNewName] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [editing, setEditing] = useState(null) // uid whose name/role is being edited
  const [eName, setEName] = useState('')
  const [eTitle, setETitle] = useState('')
  const [busy, setBusy] = useState(false)
  const [pw, setPw] = useState('')

  const loadAccounts = () => listAccounts().then(setAccounts).catch((e) => onToast(authMessage(e), 'critical'))
  useEffect(() => { if (open === 'team') loadAccounts() }, [open])

  const toggleNotify = () => { setNotificationsOn(!notify); setNotify(!notify); onToast(`Notifications ${!notify ? 'on' : 'off'}`, 'success') }
  const add = async () => {
    if (!newEmail.includes('@')) { onToast('Enter a valid email', 'critical'); return }
    if (newRole === 'field' && !newName.trim()) { onToast('Enter the member\'s name', 'critical'); return }
    setBusy(true)
    try {
      await createAccount({ email: newEmail, role: newRole, unitId: newUnit, name: newName, title: newTitle })
      onToast(`Account created. ${newEmail.trim()} was emailed a link to set a password.`, 'success')
      setNewEmail(''); setNewName(''); setNewTitle(''); loadAccounts()
    } catch (e) { onToast(authMessage(e), 'critical') }
    setBusy(false)
  }
  const remove = async () => {
    if (!pw) { onToast('Enter your password to confirm', 'critical'); return }
    setBusy(true)
    try { await deleteMyAccount(pw); onAccountDeleted() } catch (e) { onToast(authMessage(e), 'critical'); setBusy(false) }
  }
  const unitName = (id) => (initialUnits.find(u => u.id === id) || {}).name || ''
  const chip = (on) => ({
    minHeight: 44, padding: '0 14px', borderRadius: 999, cursor: 'pointer', fontSize: 15, fontWeight: 700,
    background: on ? c.elevated : 'transparent', border: `${on ? 2 : 1}px solid ${on ? c.textPri : c.outline}`, color: on ? c.textPri : c.textSec,
  })
  const rowBtn = { ...ruleRow, minHeight: 60, width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid ${c.outline}`, cursor: 'pointer', textAlign: 'left', color: c.textPri, fontSize: 17, fontWeight: 700 }

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onClose} aria-label="Back" style={iconBtn}><Icon name="back" size={22} color={c.textPri} /></button>
        <span style={display(32)}>Settings</span>
      </div>
      <div style={{ borderTop: `1px solid ${c.outline}`, borderBottom: `1px solid ${c.outline}`, padding: '14px 4px' }}>
        <div style={display(22)}>{role === 'commander' ? 'Commander' : 'Field unit'}</div>
        {me && <div style={{ fontSize: 15, color: c.textSec, marginTop: 4, wordBreak: 'break-all' }}>{me.email}</div>}
        <div style={{ fontSize: 15, color: c.textPri, marginTop: 8, fontWeight: 700 }}>{live ? 'Live: connected to operations' : 'Demo mode: sample data only'}</div>
      </div>

      <div role="switch" aria-checked={notify} tabIndex={0} onClick={toggleNotify} onKeyDown={e => e.key === 'Enter' && toggleNotify()} style={{ ...ruleRow, minHeight: 68 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: c.textPri }}>Notifications</div>
          <div style={mutedText}>Alert this phone about SOS, pings and orders</div>
        </div>
        <span style={{ fontSize: 15, color: c.textSec, minWidth: 28, textAlign: 'right' }}>{notify ? 'On' : 'Off'}</span>
        <div style={{ width: 46, height: 26, borderRadius: 13, background: notify ? c.textPri : c.outline, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 3, left: notify ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: notify ? c.onPrimary : c.textSec }} />
        </div>
      </div>

      {live && role === 'commander' && (
        <div>
          <button onClick={() => setOpen(open === 'team' ? null : 'team')} aria-expanded={open === 'team'} style={rowBtn}>
            <span style={{ flex: 1 }}>Team accounts</span><span style={{ color: c.textSec, fontSize: 15 }}>{open === 'team' ? 'Hide' : 'Manage'}</span>
          </button>
          {open === 'team' && (
            <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={mutedText}>New people get an email with a link to set their own password.</div>
              <input aria-label="New member email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email of new member" style={inputStyle} />
              <div style={{ display: 'flex', gap: 8 }}>
                {[['field', 'Field unit'], ['commander', 'Commander']].map(([k, l]) => <button key={k} aria-pressed={newRole === k} onClick={() => setNewRole(k)} style={{ ...chip(newRole === k), flex: 1 }}>{l}</button>)}
              </div>
 {newRole === 'field' && (
                <>
                  <input aria-label="Member name" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name (shown in the team roster)" style={inputStyle} />
                  <input aria-label="Member role" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Role, e.g. Scout, Medic (optional)" style={inputStyle} />
                </>
              )}
              {newRole === 'field' && (
                <select aria-label="Team" value={newUnit} onChange={e => setNewUnit(Number(e.target.value))} style={inputStyle}>
                  {initialUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              )}
              <button onClick={add} disabled={busy} style={{ minHeight: 52, background: c.textPri, color: c.onPrimary, border: 'none', borderRadius: 6, fontSize: 16, fontWeight: 800, cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.7 : 1 }}>Create account</button>
              <div style={{ ...display(17), marginTop: 8 }}>Accounts ({accounts.length})</div>
              {accounts.map(a => {
                const r = roster.find(x => x.id === a.uid)
                return (
                  <div key={a.uid} style={{ padding: '8px 0', borderBottom: `1px solid ${c.outline}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontSize: 15, color: c.textPri, wordBreak: 'break-all' }}>{a.email}</span>
                      <span style={{ ...mutedText, whiteSpace: 'nowrap' }}>{a.role === 'commander' ? 'Commander' : unitName(a.unitId)}</span>
                    </div>
                    {a.role === 'field' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                        <span style={mutedText}>{r ? `${r.name}${r.title ? `, ${r.title}` : ''}` : 'No name yet'}</span>
                        <button onClick={() => { setEditing(editing === a.uid ? null : a.uid); setEName(r ? r.name : ''); setETitle(r ? r.title : '') }} style={{ ...btnSm(c.outline), minHeight: 36 }}>{r ? 'Edit' : 'Set name'}</button>
                      </div>
                    )}
                    {editing === a.uid && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                        <input aria-label="Name" value={eName} onChange={e => setEName(e.target.value)} placeholder="Name" style={inputStyle} />
                        <input aria-label="Role" value={eTitle} onChange={e => setETitle(e.target.value)} placeholder="Role (optional)" style={inputStyle} />
                        <button onClick={async () => {
                          if (!eName.trim()) { onToast('Enter a name', 'critical'); return }
                          try { await saveRoster(a.uid, { name: eName, title: eTitle, unitId: a.unitId }); setEditing(null); onToast('Saved', 'success') } catch (e) { onToast(authMessage(e), 'critical') }
                        }} style={{ minHeight: 44, background: c.textPri, color: c.onPrimary, border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>Save</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {live && (
        <div>
          <button onClick={() => setOpen(open === 'delete' ? null : 'delete')} aria-expanded={open === 'delete'} style={{ ...rowBtn, color: c.critical }}>
            <span style={{ flex: 1 }}>Delete my account</span>
          </button>
          {open === 'delete' && (
            <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={mutedText}>This permanently deletes your login and profile. Messages and alerts you already sent stay in the team history for up to 7 days.</div>
              <input aria-label="Password to confirm" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Your password" style={inputStyle} />
              <button onClick={remove} disabled={busy} style={{ minHeight: 52, background: 'transparent', color: c.critical, border: `1px solid ${c.critical}`, borderRadius: 6, fontSize: 16, fontWeight: 800, cursor: busy ? 'wait' : 'pointer' }}>Delete account permanently</button>
            </div>
          )}
        </div>
      )}

      <button onClick={() => window.open(PRIVACY_URL, '_blank')} style={rowBtn}><span style={{ flex: 1 }}>Privacy policy</span><span style={{ color: c.textSec, fontSize: 15 }}>Open</span></button>

      <button onClick={onLogout} style={{ minHeight: 56, background: 'transparent', color: c.textPri, border: `1px solid ${c.outline}`, borderRadius: 6, fontSize: 17, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Icon name="logout" size={18} color={c.textPri} />Sign out
      </button>
      <div style={{ ...mutedText, textAlign: 'center' }}>Rakshak v{APP_VERSION}</div>
    </div>
  )
}
