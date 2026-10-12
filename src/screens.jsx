import { useState, useEffect, useRef } from 'react'
import { c, display, Icon, statusColor, statusLabel, timeAgo, StatusGlyph, BatteryCells, inputStyle } from './theme.jsx'
import { ActionRow, Modal, InfoTile, SOSButton } from './components'

const mutedText = { fontSize: 13, color: c.textSec }
const iconBtn = { width: 48, height: 48, background: 'transparent', border: `1px solid ${c.outline}`, borderRadius: 999, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }
const PROWORDS = ['Copy', 'Say again', 'Stand by', 'Moving', 'Need help']

// ---- Comms: a radio transcript, with quick radio phrases ------------------------------------
export function CommsScreen({ messages, onSend, units, onToast, role, target = null }) {
  const [input, setInput] = useState('')
  const [recipient, setRecipient] = useState(role === 'field' ? 'command' : (target || 'all'))
  const [showChannels, setShowChannels] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    onSend(input.trim(), recipient)
    setInput('')
  }

  const allChannels = [
    { key: 'all', label: 'All units', status: null },
    ...(units || []).map(u => ({ key: String(u.id), label: u.name, status: u.status })),
  ]
  const channels = role === 'field' ? [{ key: 'command', label: 'Command', status: null }] : allChannels
  const activeChannel = channels.find(ch => ch.key === recipient) || channels[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '16px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <div style={display(32)}>Comms</div>
          <div style={{ ...mutedText, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <StatusGlyph status="safe" size={10} />Channel open
          </div>
        </div>
        <button onClick={() => setShowChannels(!showChannels)} aria-expanded={showChannels} style={{
          minHeight: 48, padding: '0 16px', background: 'transparent', border: `1px solid ${c.outline}`, borderRadius: 999, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8, color: c.textPri, fontSize: 15, fontWeight: 700,
        }}>
          <Icon name="radio" size={18} color={c.textSec} />{activeChannel.label}
        </button>
      </div>

      {showChannels && (
        <div style={{ padding: '0 16px 8px' }}>
          {channels.map(ch => (
            <button key={ch.key} onClick={() => { setRecipient(ch.key); setShowChannels(false); onToast(`Talking to ${ch.label}`, 'success') }} style={{
              width: '100%', minHeight: 48, padding: '0 8px', background: recipient === ch.key ? c.elevated : 'transparent', border: 'none', borderBottom: `1px solid ${c.outline}`,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', color: c.textPri, fontSize: 16, fontWeight: 700,
            }}>
              {ch.status ? <StatusGlyph status={ch.status} size={14} /> : <Icon name="radio" size={14} color={c.textSec} />}
              {ch.label}
            </button>
          ))}
        </div>
      )}

      <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', padding: '8px 16px' }}>
        {messages.length === 0 && <div style={{ fontSize: 15, color: c.textSec, padding: '24px 0' }}>No messages yet. Send a phrase below to open the channel.</div>}
        {messages.map(m => (
          <div key={m.id} style={{
            display: 'grid', gridTemplateColumns: '78px 1fr', gap: 10, padding: '12px 0', borderBottom: `1px solid ${c.outline}`,
            marginLeft: m.outgoing ? 20 : 0, paddingLeft: m.outgoing ? 12 : 0, borderLeft: m.outgoing ? `3px solid ${c.textPri}` : 'none',
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: m.outgoing ? c.textPri : c.textSec }}>{m.from}</div>
              <div style={{ fontSize: 13, color: c.textSec, fontVariantNumeric: 'tabular-nums' }}>{m.time}</div>
            </div>
            <div style={{ fontSize: 16, lineHeight: 1.4, color: c.textPri }}>{m.text}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 16px 12px', background: c.surface, borderTop: `1px solid ${c.outline}` }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10 }}>
          {PROWORDS.map(p => (
            <button key={p} onClick={() => onSend(p, recipient)} style={{
              minHeight: 48, padding: '0 16px', background: 'transparent', border: `1px solid ${c.outline}`, borderRadius: 999, cursor: 'pointer',
              color: c.textPri, fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap',
            }}>{p}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            aria-label={`Message ${activeChannel.label}`}
            value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={`Message ${activeChannel.label}`}
            style={{ flex: 1, minHeight: 48, padding: '0 16px', background: c.bg, border: `1px solid ${c.outline}`, borderRadius: 999, color: c.textPri, fontSize: 16, outline: 'none' }}
          />
          <button onClick={handleSend} disabled={!input.trim()} aria-label="Send message" style={{
            width: 48, height: 48, borderRadius: '50%', background: input.trim() ? c.textPri : 'transparent', border: `1px solid ${input.trim() ? c.textPri : c.outline}`,
            cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="send" size={20} color={input.trim() ? c.onPrimary : c.textSec} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Mission briefing -------------------------------------------------------------------------
const priorityStatus = (p) => ({ high: 'critical', medium: 'warning', low: 'safe' })[p] || 'safe'

export function MissionBriefingModal({ missions, units = [], onClose, onToast, onCreate, onUpdate, onDelete, onBrief }) {
  const [selected, setSelected] = useState(null)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [objective, setObjective] = useState('')
  const [priority, setPriority] = useState('medium')
  const [eta, setEta] = useState('')
  const [teams, setTeams] = useState([])
  const shortName = (u) => u.name.replace(' Team', '')
  const toggleTeam = (t) => setTeams(teams.includes(t) ? teams.filter(x => x !== t) : [...teams, t])
  const canCreate = name.trim() && objective.trim() && teams.length > 0
  const chip = (on) => ({
    minHeight: 44, padding: '0 14px', borderRadius: 999, cursor: 'pointer', fontSize: 15, fontWeight: 700,
    background: on ? c.elevated : 'transparent', border: `${on ? 2 : 1}px solid ${on ? c.textPri : c.outline}`, color: on ? c.textPri : c.textSec,
  })
  const submit = async () => {
    await onCreate({ name: name.trim(), objective: objective.trim(), priority, teams, eta: eta.trim() || 'TBD' })
    onToast(`Mission "${name.trim()}" created`, 'success')
    setName(''); setObjective(''); setEta(''); setTeams([]); setPriority('medium'); setCreating(false)
  }
  return (
    <Modal open onClose={onClose} title="Mission briefing" icon={<Icon name="target" size={22} color={c.textSec} />}>
      <button onClick={() => setCreating(!creating)} aria-expanded={creating} style={{
        width: '100%', minHeight: 52, background: 'transparent', border: `1px solid ${c.outline}`, borderRadius: 6, color: c.textPri, fontSize: 16, fontWeight: 800, cursor: 'pointer', marginBottom: 8,
      }}>{creating ? 'Cancel' : '+ New mission'}</button>
      {creating && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 0 16px', borderBottom: `1px solid ${c.outline}` }}>
          <input aria-label="Mission name" value={name} onChange={e => setName(e.target.value)} placeholder="Mission name" style={inputStyle} />
          <input aria-label="Objective" value={objective} onChange={e => setObjective(e.target.value)} placeholder="Objective" style={inputStyle} />
          <div style={{ display: 'flex', gap: 8 }}>
            {['high', 'medium', 'low'].map(p => <button key={p} aria-pressed={priority === p} onClick={() => setPriority(p)} style={{ ...chip(priority === p), flex: 1 }}>{p}</button>)}
          </div>
          <div style={mutedText}>Assign teams</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {units.map(u => <button key={u.id} aria-pressed={teams.includes(shortName(u))} onClick={() => toggleTeam(shortName(u))} style={chip(teams.includes(shortName(u)))}>{shortName(u)}</button>)}
          </div>
          <input aria-label="ETA" value={eta} onChange={e => setEta(e.target.value)} placeholder="ETA, for example 3 hours" style={inputStyle} />
          <button onClick={submit} disabled={!canCreate} style={{
            minHeight: 52, background: canCreate ? c.textPri : 'transparent', color: canCreate ? c.onPrimary : c.textSec, border: `1px solid ${canCreate ? c.textPri : c.outline}`,
            borderRadius: 6, fontSize: 16, fontWeight: 800, cursor: canCreate ? 'pointer' : 'default',
          }}>Create mission</button>
        </div>
      )}
      {missions.length === 0 && !creating && <div style={{ fontSize: 15, color: c.textSec, padding: '20px 0' }}>No missions yet. Create one above.</div>}
      {missions.map(m => {
        const isSel = selected === m.id
        const cells = Math.round(m.progress / 10)
        return (
          <div key={m.id} style={{ borderBottom: `1px solid ${c.outline}`, padding: '12px 0' }}>
            <div role="button" tabIndex={0} aria-expanded={isSel} onClick={() => setSelected(isSel ? null : m.id)} onKeyDown={e => e.key === 'Enter' && setSelected(isSel ? null : m.id)} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span style={display(17)}>{m.name}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: c.textSec }}>
                  <StatusGlyph status={priorityStatus(m.priority)} size={13} />{m.priority} priority
                </span>
              </div>
              <div style={{ fontSize: 15, color: c.textSec, margin: '6px 0 10px' }}>{m.objective}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', gap: 3, flex: 1 }} role="img" aria-label={`${m.progress} percent complete`}>
                  {Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ flex: 1, height: 12, borderRadius: 1, background: i < cells ? c.textPri : 'transparent', border: `1px solid ${i < cells ? c.textPri : c.outline}` }} />)}
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: c.textPri, fontVariantNumeric: 'tabular-nums', minWidth: 40, textAlign: 'right' }}>{m.progress}%</span>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 13, color: c.textSec, marginTop: 8, flexWrap: 'wrap' }}>
                <span>{m.status === 'active' ? 'Active' : m.status === 'planning' ? 'Planning' : 'Completed'}</span>
                <span>Teams: {(m.teams || []).join(', ')}</span>
                <span>ETA {m.eta}</span>
              </div>
            </div>
            {isSel && (
              <div style={{ marginTop: 8 }}>
                {m.status !== 'complete' && <ActionRow icon="deploy" label="Progress +10%" onClick={() => {
                  const p = Math.min(100, m.progress + 10)
                  onUpdate(m.id, p >= 100 ? { progress: 100, status: 'complete' } : { progress: p, status: m.status === 'planning' ? 'active' : m.status })
                  onToast(`${m.name} at ${p}%`, 'success')
                }} />}
                {m.status !== 'complete' && <ActionRow icon="check" label="Mark complete" onClick={() => { onUpdate(m.id, { progress: 100, status: 'complete' }); onToast(`${m.name} marked complete`, 'success') }} />}
                <ActionRow icon="radio" label="Send briefing to all units" onClick={() => { onBrief(m); onClose() }} />
                <ActionRow icon="close" label="Delete mission" onClick={() => { onDelete(m.id); setSelected(null); onToast(`${m.name} deleted`, 'success') }} />
              </div>
            )}
          </div>
        )
      })}
    </Modal>
  )
}

// ---- Redeploy order prompt, shown on the field phone -----------------------------------------
export function RedeployPrompt({ order, unit, onAccept, onReject }) {
  if (!order) return null
  return (
    <Modal open onClose={onReject} title="Redeploy order" icon={<Icon name="deploy" size={22} color={c.textSec} />}>
      <div style={{ fontSize: 17, color: c.textPri, lineHeight: 1.4, padding: '4px 0 8px' }}>
        Command orders {unit ? unit.name : 'your team'} to move to <strong>{order.sector}</strong>.
      </div>
      {unit && <div style={{ ...mutedText, paddingBottom: 16 }}>Current position: {unit.location}</div>}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onReject} style={{ flex: 1, minHeight: 56, background: 'transparent', border: `1px solid ${c.outline}`, borderRadius: 6, color: c.textPri, fontSize: 17, fontWeight: 800, cursor: 'pointer' }}>Reject</button>
        <button onClick={onAccept} style={{ flex: 1, minHeight: 56, background: c.textPri, border: 'none', borderRadius: 6, color: c.onPrimary, fontSize: 17, fontWeight: 800, cursor: 'pointer' }}>Accept</button>
      </div>
    </Modal>
  )
}

// ---- Field unit home: only your own unit, plus SOS ------------------------------------------
export function FieldScreen({ unit, alerts, onSOS, onCancelSOS, onLogout }) {
  if (!unit) return null
  const nearby = alerts.filter(a => a.location === unit.location && !a.resolved).slice(0, 3)
  return (
    <div style={{ padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: '100%' }}>
      <div>
        <div style={display(32)}>{unit.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 15, color: c.textSec }}>
          <StatusGlyph status={unit.status} size={16} />{statusLabel(unit.status)}, {unit.location}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 20 }}>
        <InfoTile label="Comms" value={unit.comms} valueColor={unit.comms === 'Lost' ? c.critical : unit.comms === 'Degraded' ? c.warning : c.textPri} />
        <InfoTile label="Last update" value={timeAgo(unit.lastUpdate)} />
        <InfoTile label="Personnel" value={`${unit.personnel} active`} />
        <div style={{ padding: '10px 0', borderTop: `1px solid ${c.outline}` }}>
          <div style={mutedText}>Battery</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <BatteryCells level={unit.battery} />
            <span style={{ fontSize: 17, fontWeight: 700, color: unit.battery < 25 ? c.warning : c.textPri }}>{unit.battery}%</span>
          </div>
        </div>
      </div>
      <SOSButton onSOS={onSOS} />
      {unit.status === 'critical' && onCancelSOS && (
        <button onClick={onCancelSOS} style={{ minHeight: 56, background: 'transparent', border: `1px solid ${c.safe}`, borderRadius: 6, color: c.safe, fontSize: 17, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <StatusGlyph status="safe" size={16} />I'm safe, cancel SOS
        </button>
      )}
      <div>
        <div style={{ ...display(22), marginBottom: 4 }}>Alerts in your sector</div>
        {nearby.length === 0 ? (
          <div style={{ fontSize: 15, color: c.textSec, padding: '12px 0' }}>No active alerts in {unit.location}.</div>
        ) : nearby.map(a => (
          <div key={a.id} style={{ display: 'flex', alignItems: 'stretch', borderBottom: `1px solid ${c.outline}`, minHeight: 64 }}>
            <div style={{ width: 6, background: statusColor(a.severity), flexShrink: 0 }} />
            <div style={{ padding: '10px 4px 10px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><StatusGlyph status={a.severity} size={14} /><span style={{ fontSize: 16, fontWeight: 700, color: c.textPri }}>{a.title}</span></div>
              <div style={mutedText}>{a.desc}, {a.time}</div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={onLogout} style={{ minHeight: 56, background: 'transparent', border: `1px solid ${c.outline}`, borderRadius: 6, color: c.textPri, fontSize: 17, fontWeight: 800, cursor: 'pointer' }}>Sign out</button>
    </div>
  )
}

// ---- Location disclosure: Google Play requires this before location is requested ----------------
export function LocationDisclosure({ onAllow, onDecline }) {
  return (
    <Modal open onClose={onDecline} title="Share your location?" icon={<Icon name="map" size={22} color={c.textSec} />}>
      <div style={{ fontSize: 16, color: c.textPri, lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 0 16px' }}>
        <div>Rakshak collects your <strong>location</strong> and your phone's <strong>battery level</strong> and sends them to your commander so your team can see where you are.</div>
        <div>This keeps running <strong>in the background, even when the app is closed or the screen is off</strong>, for as long as you are signed in. A notification stays visible while it is on. Signing out stops it.</div>
        <div style={{ color: c.textSec, fontSize: 14 }}>Without it, Command will not see your position or battery.</div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onDecline} style={{ flex: 1, minHeight: 56, background: 'transparent', border: `1px solid ${c.outline}`, borderRadius: 6, color: c.textPri, fontSize: 17, fontWeight: 800, cursor: 'pointer' }}>Not now</button>
        <button onClick={onAllow} style={{ flex: 1, minHeight: 56, background: c.textPri, border: 'none', borderRadius: 6, color: c.onPrimary, fontSize: 17, fontWeight: 800, cursor: 'pointer' }}>Allow</button>
      </div>
    </Modal>
  )
}
