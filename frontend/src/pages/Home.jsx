import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import { ArrowLeft, ArrowRight, LinkIcon } from '../components/Icons.jsx'

// The three "How it works" cards. The middle one is shown larger, like a carousel.
const STEPS = [
  {
    kicker: 'Step 01',
    title: ['Add', 'Your API'],
    text: 'Paste any URL you want to watch. The first check runs straight away.',
    foot: 'POST /apis',
    tone: 'tone-amber',
  },
  {
    kicker: 'Step 02',
    title: ['We Check It', 'Every 60 Seconds'],
    text: 'A background job on the server calls each URL and times the answer.',
    foot: 'GET  200  142 ms',
    tone: 'tone-ice',
  },
  {
    kicker: 'Step 03',
    title: ['See Uptime', 'And Speed'],
    text: 'Status, response time and 24-hour reliability, on one screen.',
    foot: '99.3% uptime',
    tone: 'tone-violet',
  },
]

const METRICS = [
  ['Status', 'Up or down right now, based on the latest check. Up means the API answered with the status code you expected.'],
  ['Response time', 'How long the API took to answer, in milliseconds. Lower is faster.'],
  ['Uptime (24h)', 'Out of all checks in the last 24 hours, the share that succeeded.'],
  ['Failure rate', 'The opposite of uptime: the share of checks that failed or timed out.'],
]

export default function Home() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [active, setActive] = useState(1)
  const [error, setError] = useState('')

  // One click from the home page to the monitor, with the URL already filled in.
  const start = (e) => {
    e.preventDefault()
    const value = url.trim()
    if (!value) return navigate('/monitor')
    if (!/^https?:\/\//i.test(value)) {
      setError('Start the URL with http:// or https://')
      return
    }
    navigate(`/monitor?add=${encodeURIComponent(value)}`)
  }

  const order = [(active + 2) % 3, active, (active + 1) % 3]

  return (
    <div className="page">
      <div className="canvas">
        <Nav page="home" />

        <section className="hero">
          <h1 className="hero-title">Know Before Your Users Do</h1>
          <p className="hero-sub">
            API Sentinel checks your APIs every minute and shows whether they are up,
            how fast they answer and how reliable they have been, on one simple screen.
          </p>

          <form className="hero-form" onSubmit={start}>
            <LinkIcon />
            <input
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError('') }}
              placeholder="Paste an API URL, e.g. https://api.github.com"
              aria-label="API URL"
            />
            <button className="btn-black" type="submit">Start Monitoring</button>
          </form>
          <p className={`hero-note ${error ? 'is-error' : ''}`}>
            {error || <>* No sign-up needed. Or <Link to="/monitor">open the monitor</Link> and try a ready-made example.</>}
          </p>
        </section>

        <section id="how" className="steps">
          <button className="circle-btn" onClick={() => setActive((active + 2) % 3)} aria-label="Previous step">
            <ArrowLeft />
          </button>

          <div className="steps-track">
            {order.map((i, pos) => {
              const s = STEPS[i]
              return (
                <article
                  key={s.kicker}
                  className={`step-card ${pos === 1 ? 'is-center' : ''}`}
                  onClick={() => setActive(i)}
                >
                  <div className={`step-art ${s.tone}`}>
                    <span className="step-chip mono">{s.kicker.slice(-2)}</span>
                  </div>
                  <div className="step-body">
                    <h3>{s.title[0]}<br />{s.title[1]}</h3>
                    {pos === 1 && <p>{s.text}</p>}
                  </div>
                  <div className="step-foot">
                    <span className="mono">{s.foot}</span>
                    <span className="step-kicker">{s.kicker}</span>
                  </div>
                </article>
              )
            })}
          </div>

          <button className="circle-btn is-dark" onClick={() => setActive((active + 1) % 3)} aria-label="Next step">
            <ArrowRight />
          </button>
        </section>

        <section id="metrics" className="metrics">
          <div className="section-head">
            <span className="eyebrow">What you see</span>
            <h2>Four numbers, in plain words</h2>
          </div>
          <div className="metrics-grid">
            {METRICS.map(([title, text]) => (
              <div key={title} className="metric">
                <h4>{title}</h4>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="stack" className="stack">
          <div className="section-head">
            <span className="eyebrow">Under the hood</span>
            <h2>Three parts, three hosts</h2>
          </div>
          <div className="stack-row">
            <div className="stack-box">
              <span className="mono">Frontend</span>
              <b>React + Vite</b>
              <small>The screen you are looking at. Hosted on Vercel.</small>
            </div>
            <span className="stack-arrow">&rarr;</span>
            <div className="stack-box">
              <span className="mono">Backend</span>
              <b>FastAPI + APScheduler</b>
              <small>Runs the checks every 60 s. Hosted on Render.</small>
            </div>
            <span className="stack-arrow">&rarr;</span>
            <div className="stack-box">
              <span className="mono">Database</span>
              <b>PostgreSQL</b>
              <small>Stores every check result. Hosted on Neon.</small>
            </div>
          </div>
          <div className="cta-row">
            <Link to="/monitor" className="btn-black">Open the Monitor</Link>
          </div>
        </section>

        <footer className="footer">
          <span>API Sentinel v3</span>
          <span className="muted">Built by Anushka Srivastava</span>
        </footer>
      </div>
    </div>
  )
}
