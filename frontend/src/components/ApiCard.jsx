import Sparkline from './Sparkline.jsx'
import { ArrowRight, Refresh } from './Icons.jsx'
import { formatMs, timeAgo } from '../api.js'

export const STATUS_LABEL = { up: 'Operational', down: 'Down', unknown: 'Waiting' }

// Each API is shown as a card: a coloured "art" area that reflects its status,
// then its name and the key numbers.
export function toneFor(endpoint) {
  if (!endpoint.is_active) return 'tone-paused'
  return { up: 'tone-up', down: 'tone-down', unknown: 'tone-paused' }[endpoint.current_status]
}

export default function ApiCard({ endpoint: ep, busy, onOpen, onCheckNow }) {
  const label = ep.is_active ? STATUS_LABEL[ep.current_status] : 'Paused'
  // The HTTP code from the latest check; "ERR" when the API did not answer at all.
  const code = ep.current_status === 'unknown' ? '---' : (ep.last_status_code ?? 'ERR')

  return (
    <article className="api-card" onClick={onOpen}>
      <div className={`api-art ${toneFor(ep)}`}>
        <span className={`status-tag s-${ep.is_active ? ep.current_status : 'paused'}`}><i />{label}</span>
        <span className="code-chip mono">{code}</span>
      </div>

      <div className="api-body">
        <h3>{ep.name}</h3>
        <p className="mono api-url" title={ep.url}><span className="method">{ep.method}</span> {ep.url.replace(/^https?:\/\//, '')}</p>

        <div className="api-stats">
          <div><span>Response</span><b>{formatMs(ep.last_response_time_ms)}</b></div>
          <div><span>Uptime 24h</span><b>{ep.total_checks_24h ? `${ep.uptime_percent_24h}%` : '--'}</b></div>
          <div><span>Checked</span><b>{timeAgo(ep.last_checked_at)}</b></div>
        </div>

        <Sparkline data={ep.recent_latencies} isDown={ep.current_status === 'down'} />
      </div>

      <div className="api-foot">
        <button
          className="btn-ghost"
          disabled={busy}
          onClick={(e) => { e.stopPropagation(); onCheckNow() }}
        >
          <Refresh className={busy ? 'spin' : ''} /> {busy ? 'Checking' : 'Check now'}
        </button>
        <span className="circle-btn is-small is-dark" aria-hidden="true"><ArrowRight width={16} height={16} /></span>
      </div>
    </article>
  )
}
