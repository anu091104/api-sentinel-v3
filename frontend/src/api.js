import axios from 'axios'

// The backend URL. On Vercel this comes from the VITE_API_BASE environment
// variable (baked in at build time). Locally it falls back to localhost:8000.
export const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:8000').replace(/\/+$/, '')

// 20 s timeout: long enough for a sleeping free-tier server to start answering.
export const api = axios.create({ baseURL: API_BASE, timeout: 20000 })

// The backend stores times in UTC without a "Z" suffix. Adding it makes the
// browser convert them to the visitor's local time correctly.
export function parseTime(value) {
  if (!value) return null
  const hasZone = /Z$|[+-]\d\d:\d\d$/.test(value)
  return new Date(hasZone ? value : `${value}Z`)
}

export function timeAgo(value) {
  const date = parseTime(value)
  if (!date) return 'never'
  const s = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000))
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.round(s / 60)}m ago`
  if (s < 86400) return `${Math.round(s / 3600)}h ago`
  return `${Math.round(s / 86400)}d ago`
}

export function formatMs(ms) {
  if (ms === null || ms === undefined) return '--'
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${Math.round(ms)} ms`
}

export function nameFromUrl(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '').replace(/^api\./, '')
    const base = host.split('.')[0]
    return base.charAt(0).toUpperCase() + base.slice(1) + ' API'
  } catch {
    return ''
  }
}

// Ready-made examples so a first-time visitor can try the app in one click.
export const EXAMPLES = [
  { name: 'GitHub API', url: 'https://api.github.com', note: 'Should be up' },
  { name: 'JSONPlaceholder', url: 'https://jsonplaceholder.typicode.com/posts/1', note: 'Should be up' },
  { name: 'Cat Facts', url: 'https://catfact.ninja/fact', note: 'Should be up' },
  { name: 'Always failing (demo)', url: 'https://httpbin.org/status/500', note: 'Shows DOWN' },
]
