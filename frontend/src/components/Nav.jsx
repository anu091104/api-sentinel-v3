import { Link, NavLink } from 'react-router-dom'
import Logo from './Logo.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import { API_BASE } from '../api.js'

const GITHUB_URL = 'https://github.com/anu091104'

export default function Nav({ page }) {
  return (
    <header className="nav">
      <Link to="/" className="nav-brand">
        <Logo />
        <span className="nav-brand-text">/ api-sentinel</span>
      </Link>

      <nav className="nav-links">
        {page === 'home' ? (
          <>
            <a href="#how">How it works</a>
            <span className="nav-dot">.</span>
            <a href="#metrics">What you see</a>
            <span className="nav-dot">.</span>
            <a href="#stack">Under the hood</a>
          </>
        ) : (
          <>
            <NavLink to="/" end>Home</NavLink>
            <span className="nav-dot">.</span>
            <NavLink to="/monitor">Monitor</NavLink>
          </>
        )}
        <span className="nav-dot">.</span>
        <a href={`${API_BASE}/docs`} target="_blank" rel="noreferrer">API docs</a>
      </nav>

      <div className="nav-right">
        <ThemeToggle />
        <a className="nav-plain" href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
        <span className="nav-divider" />
        {page === 'home' ? (
          <Link to="/monitor" className="pill-outline">
            <b>Open Monitor</b> <span className="muted">&mdash; It&rsquo;s free</span>
          </Link>
        ) : (
          <Link to="/" className="pill-outline">Back to home</Link>
        )}
      </div>
    </header>
  )
}
