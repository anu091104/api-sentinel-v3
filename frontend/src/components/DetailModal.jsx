import useEscape from '../hooks/useEscape.js'
import { useEffect, useState } from 'react'
import { api, formatMs, parseTime } from '../api.js'
import ResponseTimeChart from './ResponseTimeChart.jsx'
import { STATUS_LABEL, toneFor } from './ApiCard.jsx'
import { Close, Refresh } from './Icons.jsx'

// Full view of one API: stats, response-time chart and the latest checks.
export default function DetailModal({ endpoint: ep, onClose, onCheckNow, onTogglePause, onDelete }) {
  useEscape(onClose)
  const [history, setHistory] = useState(null)

  // Reload history whenever the endpoint gets a new check.
  useEffect(() => {
    let cancelled = false
    api.get(`/apis/${ep.id}/history?limit=60`)
      .then((res) => { if (!cancelled) setHistory(res.data) })
      .catch(() => { if (!cancelled) setHistory([]) })
    return () => { cancelled = true }
  }, [ep.id, ep.last_checked_at])

  const label = ep.is_active ? STATUS_LABEL[ep.current_status] : 'Paused'

  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className="modal is-wide" onMouseDown={(e) => e.stopPropagation()}>
        <div className={`detail-art ${toneFor(ep)}`}>
          <span className={`status-tag s-${ep.is_active ? ep.current_status : 'paused'}`}><i />{label}</span>
          <button className="icon-btn on-art" onClick={onClose} aria-label="Close"><Close /></button>
        </div>

        <div className="detail-head">
          <h2>{ep.name}</h2>
          <p className="mono api-url"><span className="method">{ep.method}</span> {ep.url}</p>
          <p className="muted small">Healthy when it answers <b>{ep.expected_status}</b>. Checked every 60 seconds.</p>
        </div>

        <div className="summary is-compact">
          <div><span>Last response</span><b>{formatMs(ep.last_response_time_ms)}</b></div>
          <div><span>Uptime 24h</span><b>{ep.total_checks_24h ? `${ep.uptime_percent_24h}%` : '--'}</b></div>
          <div><span>Failure rate</span><b>{ep.total_checks_24h ? `${ep.failure_rate_24h}%` : '--'}</b></div>
          <div><span>Checks 24h</span><b>{ep.total_checks_24h}</b></div>
        </div>

        <h4 className="detail-label">Response time</h4>
        {history === null ? <div className="sk-line shimmer" style={{ height: 180 }} /> : <ResponseTimeChart history={history} />}

        <h4 className="detail-label">Latest checks</h4>
        <div className="checks">
          {(history || []).slice(0, 8).map((h) => (
            <div key={h.id} className="check-row">
              <span className={`dot ${h.is_up ? 'd-up' : 'd-down'}`} />
              <span className="mono">{parseTime(h.checked_at).toLocaleTimeString()}</span>
              <span className="mono">{h.status_code ?? 'ERR'}</span>
              <span className="mono">{formatMs(h.response_time_ms)}</span>
              <span className="check-msg" title={h.error_message || ''}>{h.is_up ? 'OK' : (h.error_message || 'Failed')}</span>
            </div>
          ))}
          {history && history.length === 0 && <p className="muted small">No checks yet.</p>}
        </div>

        <div className="modal-actions is-split">
          <button className="btn-danger" onClick={onDelete}>Remove</button>
          <div>
            <button className="btn-ghost" onClick={onTogglePause}>{ep.is_active ? 'Pause' : 'Resume'}</button>
            <button className="btn-black" onClick={onCheckNow}><Refresh /> Check now</button>
          </div>
        </div>
      </div>
    </div>
  )
}
