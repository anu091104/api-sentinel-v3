import { createContext, useCallback, useContext, useEffect, useState } from 'react'

/*
  Theme preference: 'light' | 'dark' | 'system'  (default: 'system').
  The resolved theme ('light' | 'dark') is written to <html data-theme="...">,
  and all colours in index.css switch through CSS variables.

  The very first paint is handled by a tiny inline script in index.html,
  so the page never flashes the wrong theme while React loads.
*/
const STORAGE_KEY = 'api-sentinel-theme'
const media = () => window.matchMedia('(prefers-color-scheme: dark)')

function readPreference() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
  } catch { /* storage blocked: fall back to system */ }
  return 'system'
}

function resolve(pref) {
  if (pref === 'system') return media().matches ? 'dark' : 'light'
  return pref
}

function apply(resolved) {
  const root = document.documentElement
  root.dataset.theme = resolved
  root.style.colorScheme = resolved
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', resolved === 'dark' ? '#0b0c0e' : '#f1f1ef')
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(readPreference)
  const [resolved, setResolved] = useState(() => resolve(readPreference()))

  // Apply whenever the preference changes, and follow the OS while on "system".
  useEffect(() => {
    const update = () => {
      const r = resolve(preference)
      setResolved(r)
      apply(r)
    }
    update()
    if (preference !== 'system') return
    const mq = media()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [preference])

  const setPreference = useCallback((value) => {
    setPreferenceState(value)
    try { localStorage.setItem(STORAGE_KEY, value) } catch { /* ignore */ }
  }, [])

  return (
    <ThemeContext.Provider value={{ preference, resolved, setPreference }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}

// Colours for the charts (SVG attributes can't read CSS variables directly).
export const CHART_COLORS = {
  light: { line: '#0e0e0e', fill: '#3aa8ff', grid: '#ececea', axis: '#9a9a96', down: '#e5484d' },
  dark: { line: '#ecebe6', fill: '#4cb8ff', grid: '#24282e', axis: '#7f8590', down: '#ff6b70' },
}
