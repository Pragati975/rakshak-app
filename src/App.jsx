import '@fontsource-variable/archivo/wdth.css'
import '@fontsource/atkinson-hyperlegible/400.css'
import '@fontsource/atkinson-hyperlegible/700.css'
import '@fontsource/tiro-devanagari-hindi/400.css'
import { useState, useEffect, useRef, useMemo } from 'react'
import { c, font, Icon } from './theme.jsx'
import {
  Toast, Auth, Splash, Dashboard, Alerts, AlertDetailModal,
  UnitDetailModal, MapScreen, Settings,
} from './components'
import { CommsScreen, MissionBriefingModal, FieldScreen, RedeployPrompt, LocationDisclosure } from './screens'
import * as api from './api.js'
import { initNotifications, notify } from './notify.js'
import { startTracking, syncNow } from './tracker.js'
import { initPush } from './push.js'
import { initMonitoring, setMonitoringUser } from './monitor.js'
import { PUSH_ENABLED } from './flags.js'

function PhoneFrame({ children, overlays, screen, onNav, alertCount, commsBadge, role }) {
  const navItems = [
    { key: 'dashboard', label: 'Home', icon: 'dashboard' },
    { key: 'map', label: 'Map', icon: 'map' },
    { key: 'alerts', label: 'Alerts', icon: 'alerts', badge: alertCount },
    { key: 'comms', label: 'Comms', icon: 'comms', badge: commsBadge },
  ].filter(n => role !== 'field' || n.key === 'dashboard' || n.key === 'comms')
  return (
    <div style={{
      width: '100%', height: '100dvh', background: c.bg, overflow: 'hidden', position: 'relative',
      display: 'flex', flexDirection: 'column', paddingTop: 'env(safe-area-inset-top)',
    }}>
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>{children}</div>
      {screen !== 'splash' && screen !== 'auth' && screen !== 'settings' && (
        <nav aria-label="Main" style={{ flexShrink: 0, background: c.surface, borderTop: `1px solid ${c.outline}`, display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {navItems.map(nav => {
            const active = screen === nav.key
            return (
              <button key={nav.key} onClick={() => onNav(nav.key)} aria-current={active ? 'page' : undefined} style={{
                flex: 1, minHeight: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                background: 'transparent', border: 'none', borderTop: `3px solid ${active ? c.textPri : 'transparent'}`, cursor: 'pointer',
                color: active ? c.textPri : c.textSec,
              }}>
                <span style={{ position: 'relative', display: 'flex' }}>
                  <Icon name={nav.icon} size={22} color={active ? c.textPri : c.textSec} />
                  {nav.badge > 0 && (
                    <span aria-label={`${nav.badge} new`} style={{
                      position: 'absolute', top: -7, right: -12, minWidth: 18, height: 18, borderRadius: 9, background: c.critical,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: c.onPrimary, padding: '0 5px',
                    }}>{nav.badge}</span>
                  )}
                </span>
                <span style={{ fontSize: 13, fontWeight: active ? 700 : 400 }}>{nav.label}</span>
              </button>
            )
          })}
        </nav>
      )}
      {overlays}
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState('splash')
  const [mode, setMode] = useState('demo')
  const [role, setRole] = useState('commander') // 'commander' | 'field'
  const [myUnitId, setMyUnitId] = useState(1)
  const [rawUnits, setUnits] = useState([])
  const [roster, setRoster] = useState([])
  // Live mode: the Personnel count is the number of real members on the team
  const units = useMemo(() => (mode === 'live' ? rawUnits.map(u => ({ ...u, personnel: roster.filter(r => r.unitId === u.id).length })) : rawUnits), [rawUnits, roster, mode])
  const [alerts, setAlerts] = useState([])
  const [mapUnits, setMapUnits] = useState([])
  const [missions, setMissions] = useState([])
  const [messages, setMessages] = useState([])
  const [orders, setOrders] = useState([])
  const [commsTarget, setCommsTarget] = useState(null)
  const [pendingOrder, setPendingOrder] = useState(null)
  const watching = useRef(new Set())
  const orderStatus = useRef({})
  const handledOrders = useRef(new Set())
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [showMissions, setShowMissions] = useState(false)
  const [toast, setToast] = useState(null)
  const [prevScreen, setPrevScreen] = useState('dashboard')
  const [unreadComms, setUnreadComms] = useState(0)
  const prevMsgCount = useRef(null)
  const seenAlerts = useRef(null)

  const loggedIn = screen !== 'splash' && screen !== 'auth'
  const myUnit = units.find(u => u.id === myUnitId)
  const me = role === 'field' ? (myUnit ? myUnit.name : 'Field Unit') : 'Command'

  // Live data from the data service (src/api.js)
  useEffect(() => {
    if (!loggedIn) return
    api.setLive(mode === 'live')
    const offs = [
      api.subscribeUnits(setUnits),
      api.subscribeRoster(setRoster),
      api.subscribeAlerts(setAlerts),
      api.subscribeMapUnits(setMapUnits),
      api.subscribeMessages(setMessages),
      api.subscribeMissions(setMissions),
      api.subscribeOrders(setOrders),
    ]
    return () => offs.forEach(off => off())
  }, [loggedIn, mode])

  useEffect(() => {
    if (screen === 'splash') {
      let dead = false
      const minWait = new Promise(r => setTimeout(r, 2800))
      Promise.all([api.restoreSession().catch(() => null), minWait]).then(([p]) => {
        if (dead) return
        if (p) handleLogin('live', p.role, p.unitId)
        else setScreen('auth')
      })
      return () => { dead = true }
    }
  }, [screen])

  // Demo simulation only runs while logged in (keeps running across tab changes)
  useEffect(() => {
    if (!loggedIn || mode !== 'demo') return
    return api.startSimulation()
  }, [loggedIn, mode])

  // Crash and error reports (native Crashlytics, no-op in a browser)
  useEffect(() => { initMonitoring() }, [])

  // Push notifications when the app is closed (turn on with VITE_ENABLE_PUSH=true after deploying /functions)
  useEffect(() => {
    if (loggedIn && mode === 'live' && PUSH_ENABLED) initPush()
    if (loggedIn && mode === 'live') { const u = api.currentUser(); setMonitoringUser(u ? u.uid : '') }
  }, [loggedIn, mode])

  // Command phone tidies old data (alerts older than 7 days, stale orders)
  useEffect(() => {
    if (loggedIn && mode === 'live' && role === 'commander') api.pruneOld()
  }, [loggedIn, mode, role])

  // Field phone: answer orders from Command
  useEffect(() => {
    if (!loggedIn || role !== 'field') return
    orders.filter(o => o.to === myUnitId && o.status === 'sent' && !handledOrders.current.has(o.id) && Date.now() - o.createdAt < 120000).forEach(o => {
      handledOrders.current.add(o.id)
      if (o.type === 'ping') {
        api.respondOrder(o.id, 'replied')
        notify('Ping from Command', 'Command is checking in. Your reply was sent automatically.')
        showToast('Command pinged you. Reply sent.', 'success')
      } else if (o.type === 'sync') {
        syncNow()
        api.respondOrder(o.id, 'replied')
        showToast('Command requested a sync. Position and battery sent.', 'success')
      } else if (o.type === 'redeploy') {
        setPendingOrder(o)
        notify('Redeploy order', `Command orders you to move to ${o.sector}`)
      }
    })
  }, [orders, loggedIn, role, myUnitId])

  // Command phone: tell the commander how each order was answered
  useEffect(() => {
    orders.forEach(o => {
      const prev = orderStatus.current[o.id]
      orderStatus.current[o.id] = o.status
      if (role !== 'commander' || o.status === 'sent' || prev === o.status || !watching.current.has(o.id)) return
      watching.current.delete(o.id)
      const secs = o.respondedAt ? Math.max(1, Math.round((o.respondedAt - o.createdAt) / 1000)) : null
      if (o.type === 'ping') showToast(`${o.toName} responded to ping${secs ? ` in ${secs}s` : ''}`, 'success')
      else if (o.type === 'sync') showToast(`${o.toName} synced`, 'success')
      else if (o.status === 'accepted') showToast(`${o.toName} accepted the order to ${o.sector}`, 'success')
      else showToast(`${o.toName} rejected the order to ${o.sector}`, 'warning')
    })
  }, [orders, role])

  // Field phones in live mode report real battery + GPS, but only after the person agrees (Google Play rule)
  const readConsent = () => { try { return localStorage.getItem('rk_loc_consent') === 'yes' } catch { return false } }
  const [locConsent, setLocConsent] = useState(readConsent)
  const [consentDeclined, setConsentDeclined] = useState(false)
  const allowLocation = () => { try { localStorage.setItem('rk_loc_consent', 'yes') } catch {} ; setLocConsent(true) }
  useEffect(() => {
    if (!loggedIn || mode !== 'live' || role !== 'field' || !locConsent) return
    return startTracking(myUnitId)
  }, [loggedIn, mode, role, myUnitId, locConsent])
  useEffect(() => { if (!loggedIn) setConsentDeclined(false) }, [loggedIn])

  // Unread badge: count new messages from others while not on the Comms screen
  useEffect(() => {
    if (prevMsgCount.current !== null && messages.length > prevMsgCount.current) {
      const last = messages[messages.length - 1]
      if (last.from !== me && screen !== 'comms') setUnreadComms(n => n + 1)
    }
    prevMsgCount.current = messages.length
  }, [messages])

  useEffect(() => { if (screen === 'comms') setUnreadComms(0) }, [screen])

  // Ask for notification permission once logged in; forget seen alerts on logout
  useEffect(() => {
    if (loggedIn) initNotifications()
    else seenAlerts.current = null
  }, [loggedIn])

  // New critical alert for Command: toast + phone notification (first snapshot is just loaded, not announced)
  useEffect(() => {
    if (!loggedIn) return
    if (seenAlerts.current === null) { if (alerts.length) seenAlerts.current = new Set(alerts.map(a => a.id)); return }
    const fresh = alerts.filter(a => !seenAlerts.current.has(a.id))
    fresh.forEach(a => seenAlerts.current.add(a.id))
    if (role !== 'commander') return
    fresh.filter(a => a.severity === 'critical' && !a.resolved && !a.desc.startsWith('SOS broadcast by')).forEach(a => {
      showToast(`${a.title}: ${a.desc}`, 'critical')
      notify(a.title, `${a.desc} (${a.location})`)
    })
  }, [alerts])

  const showToast = (msg, type = 'success') => setToast({ msg, type, id: Date.now() })
  const handleLogin = (m, r = 'commander', unitId = 1) => { setMode(m); setRole(r); setMyUnitId(unitId); setScreen('dashboard') }
  const handleLogout = () => {
    api.signOutUser()
    setScreen('auth'); setMode('demo'); setRole('commander')
    setSelectedUnit(null); setSelectedAlert(null); setShowMissions(false); setUnreadComms(0)
    showToast('Signed out successfully')
  }
  const handleAccountDeleted = () => {
    setScreen('auth'); setMode('demo'); setRole('commander')
    setSelectedUnit(null); setSelectedAlert(null); setShowMissions(false); setUnreadComms(0)
    showToast('Account deleted')
  }
  const handleNav = (s) => { if (s === 'comms') setCommsTarget(null); setPrevScreen(screen); setScreen(s) }

  const handleSOS = async () => {
    if (role === 'field' && myUnit) {
      const sent = await api.triggerSOS({ unitId: myUnit.id, by: myUnit.name })
      if (sent === false) showToast('SOS is already active. Command has been told.', 'warning')
      else showToast(`SOS sent from ${myUnit.name} to Command`, 'critical')
    } else {
      api.triggerSOS({ by: 'Command' })
      showToast('EMERGENCY SOS broadcast to all units and command center', 'critical')
    }
  }

  const handleCancelSOS = () => {
    if (!myUnit) return
    api.cancelSOS(myUnit.id)
    showToast('SOS cancelled. Command has been told you are safe.', 'success')
  }

  // Orders from Command to one unit. The reply shows up as a toast when the unit answers.
  const sendOrder = async (type, unit, sector = null) => {
    const label = { ping: `Ping sent to ${unit.name}. Waiting for reply...`, sync: `Sync requested from ${unit.name}...`, redeploy: `Order sent: ${unit.name} to ${sector}. Waiting...` }[type]
    showToast(label, 'success')
    const id = await api.sendOrder({ type, unitId: unit.id, sector })
    watching.current.add(id)
    setTimeout(() => {
      if (watching.current.delete(id)) showToast(`No response from ${unit.name}`, 'warning')
    }, type === 'redeploy' ? 45000 : 15000)
  }
  const openComms = (unit) => {
    setSelectedUnit(null)
    setCommsTarget(String(unit.id))
    setPrevScreen(screen)
    setScreen('comms')
  }
  const sendBriefing = (m) => {
    api.sendMessage({ text: `Briefing, ${m.name}: ${m.objective}`, recipient: 'all', from: 'Command' })
    showToast(`${m.name} briefing sent to all units`, 'success')
  }
  const answerRedeploy = (accept) => {
    if (!pendingOrder) return
    api.respondOrder(pendingOrder.id, accept ? 'accepted' : 'rejected')
    showToast(accept ? `Moving to ${pendingOrder.sector}` : 'Order rejected', accept ? 'success' : 'warning')
    setPendingOrder(null)
  }
  const livePending = pendingOrder ? orders.find(o => o.id === pendingOrder.id) : null

  const addAlert = (a) => { api.createAlert(a); showToast('Manual alert created', 'success') }
  const sendMessage = async (text, recipient) => {
    const target = await api.sendMessage({ text, recipient, from: me })
    showToast(`Message sent to ${target}`, 'success')
  }

  // Modals always show the latest data for the selected id
  const liveUnit = selectedUnit ? units.find(u => u.id === selectedUnit.id) || null : null
  const liveAlert = selectedAlert ? alerts.find(a => a.id === selectedAlert.id) || null : null
  const chatMessages = messages.map(m => ({ ...m, outgoing: m.from === me }))

  const content = () => {
    switch (screen) {
      case 'splash': return <Splash />
      case 'auth': return <Auth onLogin={handleLogin} />
      case 'dashboard':
        return role === 'field'
          ? <FieldScreen unit={myUnit} alerts={alerts} onSOS={handleSOS} onCancelSOS={handleCancelSOS} onLogout={handleLogout} />
          : <Dashboard units={units} alerts={alerts} onUnitClick={setSelectedUnit} onSOS={handleSOS} onSettings={() => { setPrevScreen('dashboard'); setScreen('settings') }} mode={mode} onNavigate={handleNav} onMissionBrief={() => setShowMissions(true)} missionCount={missions.filter(m => m.status === 'active').length} />
      case 'map': return <MapScreen mapUnits={mapUnits} units={units} onUnitSelect={(u) => showToast(`${u.name} selected on map`, 'success')} onToast={showToast} onPing={(u) => sendOrder('ping', u)} onMessage={openComms} />
      case 'alerts': return <Alerts alerts={alerts} onAlertClick={setSelectedAlert} onAcknowledge={api.acknowledgeAlert} onResolve={api.resolveAlert} onAddAlert={addAlert} />
      case 'comms': return <CommsScreen key={commsTarget || 'default'} messages={chatMessages} onSend={sendMessage} units={units} onToast={showToast} role={role} target={commsTarget} />
      case 'settings': return <Settings roster={roster} mode={mode} role={role} onLogout={handleLogout} onToast={showToast} onClose={() => setScreen(prevScreen)} onAccountDeleted={handleAccountDeleted} />
      default: return null
    }
  }

  return (
    <div style={{ height: '100dvh', background: c.bg, display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes sweep { to { transform: rotate(360deg); } }
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        html, body { background: ${c.bg}; margin: 0; }
        body { font-family: ${font.body}; color: ${c.textPri}; font-size: 16px; font-variant-numeric: tabular-nums; -webkit-font-smoothing: antialiased; }
        button, input, select { font-family: inherit; }
        .scope-sweep { transform-origin: 150px 150px; animation: sweep 6s linear infinite; }
        input::placeholder { color: ${c.textSec}; opacity: 0.8; }
        input:focus, select:focus { border-color: ${c.textPri} !important; }
        :focus-visible { outline: 2px solid ${c.textPri}; outline-offset: 2px; }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 0; }
        @media (prefers-reduced-motion: reduce) {
          .scope-sweep { animation: none; }
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
      <PhoneFrame screen={screen} onNav={handleNav} role={role} overlays={(
        <>
          <Toast toast={toast} onClose={() => setToast(null)} />
          <UnitDetailModal unit={liveUnit} roster={roster} onClose={() => setSelectedUnit(null)} onUpdate={api.updateUnit} onToast={showToast} onPing={(u) => sendOrder('ping', u)} onSync={(u) => sendOrder('sync', u)} onRedeploy={(u, sector) => sendOrder('redeploy', u, sector)} onOpenComms={openComms} />
          <AlertDetailModal alert={liveAlert} onClose={() => setSelectedAlert(null)} onAcknowledge={api.acknowledgeAlert} onResolve={api.resolveAlert} onToast={showToast} />
          {showMissions && (
            <MissionBriefingModal missions={missions} units={units} onClose={() => setShowMissions(false)} onToast={showToast} onCreate={api.createMission} onUpdate={api.updateMission} onDelete={api.deleteMission} onBrief={sendBriefing} />
          )}
          {loggedIn && mode === 'live' && role === 'field' && !locConsent && !consentDeclined && (
            <LocationDisclosure onAllow={allowLocation} onDecline={() => setConsentDeclined(true)} />
          )}
          {role === 'field' && livePending && livePending.status === 'sent' && (
            <RedeployPrompt order={livePending} unit={myUnit} onAccept={() => answerRedeploy(true)} onReject={() => answerRedeploy(false)} />
          )}
        </>
      )} alertCount={alerts.filter(a => !a.resolved && a.severity !== 'safe').length} commsBadge={screen !== 'comms' ? unreadComms : 0}>
        {content()}
      </PhoneFrame>
    </div>
  )
}
