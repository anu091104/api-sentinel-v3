import { useEffect, useState } from 'react'
import { API_BASE } from '../api.js'
import { Refresh } from './Icons.jsx'

// Explains in plain words why data is missing, instead of a scary error.
export default function ServerBanner({ server, waitingSince, onRetry }) {
  const [, tick] = useState(0)
  useEffect(() => {
    if (!waitingSince) return
    const id = setInterval(() => tick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [waitingSince])

  if (server === 'ok' || server === 'connecting') return null
  const seconds = waitingSince ? Math.round((Date.now() - waitingSince) / 1000) : 0

  const content = {
    waking: {
      tone: 'is-waiting',
      title: 'Waking up the server',
      text: `The backend runs on free hosting that sleeps when nobody is using it. Starting it takes up to a minute. Retrying automatically (${seconds}s).`,
      progress: Math.min(100, (seconds / 60) * 100),
    },
    database: {
      tone: 'is-waiting',
      title: 'Server is up, database is waking',
      text: 'The Neon database sleeps after a few idle minutes. It usually answers within a few seconds. Retrying automatically.',
    },
    offline: {
      tone: 'is-error',
      title: 'Cannot reach the server',
      text: <>No answer from <code>{API_BASE}</code> for over two minutes. Check the backend on Render.</>,
    },
  }[server]

  return (
    <div className={`banner ${content.tone}`} role="status">
      <div className="banner-text">
        <b>{content.title}</b>
        <span>{content.text}</span>
        {content.progress !== undefined && (
          <div className="banner-bar"><i style={{ width: `${content.progress}%` }} /></div>
        )}
      </div>
      <button className="btn-ghost" onClick={onRetry}><Refresh /> Retry now</button>
    </div>
  )
}
