import useEscape from '../hooks/useEscape.js'
import { useState } from 'react'
import { api, nameFromUrl } from '../api.js'
import { Close } from './Icons.jsx'

export default function AddApiModal({ initialUrl = '', onClose, onAdded }) {
  useEscape(onClose)
  const [url, setUrl] = useState(initialUrl)
  const [name, setName] = useState(nameFromUrl(initialUrl))
  const [nameTouched, setNameTouched] = useState(false)
  const [method, setMethod] = useState('GET')
  const [expected, setExpected] = useState(200)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const changeUrl = (value) => {
    setUrl(value)
    if (!nameTouched) setName(nameFromUrl(value))   // suggest a name from the URL
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!/^https?:\/\/.+/i.test(url.trim())) return setError('The URL must start with http:// or https://')
    if (!name.trim()) return setError('Give it a short name')
    setSaving(true)
    setError('')
    try {
      await api.post('/apis', {
        name: name.trim(),
        url: url.trim(),
        method,
        expected_status: Number(expected) || 200,
      })
      onAdded(name.trim())
    } catch (err) {
      setError(err.response ? 'The server rejected it. Check the details.' : 'Cannot reach the server yet. Wait for it to wake up and try again.')
      setSaving(false)
    }
  }

  return (
    <div className="overlay" onMouseDown={onClose}>
      <form className="modal" onMouseDown={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal-head">
          <div>
            <span className="eyebrow">New monitor</span>
            <h2>Add an API</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><Close /></button>
        </div>

        <label className="field">
          <span>URL</span>
          <input autoFocus value={url} onChange={(e) => changeUrl(e.target.value)} placeholder="https://api.github.com" />
        </label>

        <label className="field">
          <span>Name</span>
          <input value={name} onChange={(e) => { setName(e.target.value); setNameTouched(true) }} placeholder="GitHub API" />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Method</span>
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              {['GET', 'HEAD', 'POST', 'PUT', 'DELETE'].map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Healthy status code</span>
            <input type="number" value={expected} onChange={(e) => setExpected(e.target.value)} />
          </label>
        </div>

        <p className="hint">
          Most APIs answer <b>200</b> when healthy. APIs that need a login (Spotify, YouTube) answer <b>401</b> or <b>403</b> without one,
          so use that code if you only want to know the service is alive.
        </p>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-black" disabled={saving}>{saving ? 'Adding and checking...' : 'Start monitoring'}</button>
        </div>
      </form>
    </div>
  )
}
