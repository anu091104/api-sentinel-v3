import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import ServerBanner from '../components/ServerBanner.jsx'
import ApiCard from '../components/ApiCard.jsx'
import SkeletonCard from '../components/SkeletonCard.jsx'
import AddApiModal from '../components/AddApiModal.jsx'
import DetailModal from '../components/DetailModal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { Plus, Search } from '../components/Icons.jsx'
import useMonitor from '../hooks/useMonitor.js'
import { useToast } from '../context/ToastContext.jsx'
import { api, EXAMPLES } from '../api.js'

const SORTS = [
  ['status', 'Problems first'],
  ['name', 'Name'],
  ['uptime', 'Uptime'],
  ['latency', 'Slowest'],
]

export default function Monitor() {
  const { showToast } = useToast()
  const { endpoints, loading, server, lastSync, waitingSince, refresh } = useMonitor()
  const [params, setParams] = useSearchParams()

  const [addUrl, setAddUrl] = useState(null)       // null = add dialog closed
  const [selectedId, setSelectedId] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('status')
  const [busyId, setBusyId] = useState(null)

  // Arriving from the home page with "?add=<url>" opens the add dialog pre-filled.
  useEffect(() => {
    const incoming = params.get('add')
    if (incoming) {
      setAddUrl(incoming)
      setParams({}, { replace: true })
    }
  }, [params, setParams])

  const summary = useMemo(() => {
    const total = endpoints.length
    const up = endpoints.filter((e) => e.current_status === 'up').length
    const down = endpoints.filter((e) => e.current_status === 'down').length
    const avg = total ? endpoints.reduce((s, e) => s + e.uptime_percent_24h, 0) / total : null
    return { total, up, down, avg }
  }, [endpoints])

  const visible = useMemo(() => {
    const q = search.toLowerCase()
    const list = endpoints.filter((e) => e.name.toLowerCase().includes(q) || e.url.toLowerCase().includes(q))
    const rank = { down: 0, unknown: 1, up: 2 }
    const sorters = {
      status: (a, b) => rank[a.current_status] - rank[b.current_status] || a.name.localeCompare(b.name),
      name: (a, b) => a.name.localeCompare(b.name),
      uptime: (a, b) => a.uptime_percent_24h - b.uptime_percent_24h,
      latency: (a, b) => (b.last_response_time_ms || 0) - (a.last_response_time_ms || 0),
    }
    return [...list].sort(sorters[sortBy])
  }, [endpoints, search, sortBy])

  const addExample = async (ex) => {
    try {
      await api.post('/apis', { name: ex.name, url: ex.url })
      showToast(`${ex.name} added. First check done.`, 'success')
      refresh()
    } catch {
      showToast('Could not add it. Is the server awake?', 'error')
    }
  }

  const checkNow = async (ep) => {
    setBusyId(ep.id)
    try {
      await api.post(`/apis/${ep.id}/check-now`)
      showToast(`Checked ${ep.name}`)
      refresh()
    } catch {
      showToast('Check failed. Try again.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const togglePause = async (ep) => {
    try {
      await api.patch(`/apis/${ep.id}`, { is_active: !ep.is_active })
      showToast(ep.is_active ? `${ep.name} paused` : `${ep.name} resumed`)
      refresh()
    } catch {
      showToast('Could not update. Try again.', 'error')
    }
  }

  const confirmDelete = async () => {
    const ep = pendingDelete
    setPendingDelete(null)
    setSelectedId(null)
    try {
      await api.delete(`/apis/${ep.id}`)
      showToast(`${ep.name} removed`)
      refresh()
    } catch {
      showToast('Could not remove. Try again.', 'error')
    }
  }

  const selected = endpoints.find((e) => e.id === selectedId)

  return (
    <div className="page">
      <div className="canvas">
        <Nav page="monitor" />

        <section className="mon-head">
          <div>
            <h1 className="mon-title">Monitor</h1>
            <p className="mon-sub">Each API is checked every 60 seconds. This page refreshes itself every 15 seconds.</p>
          </div>
          <div className="mon-actions">
            <span className={`live-pill ${server === 'ok' ? 'is-live' : ''}`}>
              <i />
              {server === 'ok' && lastSync
                ? `Live, updated ${lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                : 'Connecting'}
            </span>
            <button className="btn-black" onClick={() => setAddUrl('')}><Plus /> Add API</button>
          </div>
        </section>

        <ServerBanner server={server} waitingSince={waitingSince} onRetry={refresh} />

        <section className="summary">
          <div><span>Monitored</span><b>{loading ? '--' : summary.total}</b></div>
          <div><span>Operational</span><b className={summary.up ? 'c-up' : ''}>{loading ? '--' : summary.up}</b></div>
          <div><span>Down</span><b className={summary.down ? 'c-down' : ''}>{loading ? '--' : summary.down}</b></div>
          <div><span>Avg uptime, 24h</span><b>{summary.avg === null ? '--' : `${summary.avg.toFixed(1)}%`}</b></div>
        </section>

        {endpoints.length > 0 && (
          <section className="toolbar">
            <label className="search">
              <Search />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or URL" />
            </label>
            <div className="segmented" role="tablist" aria-label="Sort">
              {SORTS.map(([key, label]) => (
                <button key={key} className={sortBy === key ? 'is-on' : ''} onClick={() => setSortBy(key)}>{label}</button>
              ))}
            </div>
          </section>
        )}

        {loading ? (
          <section className="grid">{[0, 1, 2].map((i) => <SkeletonCard key={i} />)}</section>
        ) : endpoints.length === 0 ? (
          <section className="empty">
            <h2>Nothing is being monitored yet</h2>
            <p>Add your own API, or click one of these examples to see how it works.</p>
            <div className="examples">
              {EXAMPLES.map((ex) => (
                <button key={ex.url} className="example" onClick={() => addExample(ex)}>
                  <b>{ex.name}</b>
                  <span className="mono">{ex.url.replace(/^https?:\/\//, '')}</span>
                  <small>{ex.note}</small>
                </button>
              ))}
            </div>
            <button className="btn-black" onClick={() => setAddUrl('')}><Plus /> Add your own API</button>
          </section>
        ) : visible.length === 0 ? (
          <p className="no-match">No API matches &ldquo;{search}&rdquo;.</p>
        ) : (
          <section className="grid">
            {visible.map((ep) => (
              <ApiCard
                key={ep.id}
                endpoint={ep}
                busy={busyId === ep.id}
                onOpen={() => setSelectedId(ep.id)}
                onCheckNow={() => checkNow(ep)}
              />
            ))}
          </section>
        )}

        <footer className="footer">
          <span>Up = the API answered with the status code you expected. Down = a different code, an error or no answer within 10 s.</span>
        </footer>
      </div>

      {addUrl !== null && (
        <AddApiModal
          initialUrl={addUrl}
          onClose={() => setAddUrl(null)}
          onAdded={(name) => { setAddUrl(null); showToast(`${name} added. First check done.`, 'success'); refresh() }}
        />
      )}

      {selected && (
        <DetailModal
          endpoint={selected}
          onClose={() => setSelectedId(null)}
          onCheckNow={() => checkNow(selected)}
          onTogglePause={() => togglePause(selected)}
          onDelete={() => setPendingDelete(selected)}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Remove this API?"
          message={`This stops monitoring "${pendingDelete.name}" and deletes its check history. This cannot be undone.`}
          confirmLabel="Remove"
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}
