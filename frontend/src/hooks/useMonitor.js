import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../api.js'

/*
  Loads the list of monitored APIs and keeps it fresh.

  server status:
    'connecting' - first request still in flight
    'ok'         - backend and database answered
    'waking'     - no answer yet; free hosting is probably starting up (< 2 min)
    'database'   - backend is up but the database is not answering (HTTP 503)
    'offline'    - no answer for more than 2 minutes
*/
const NORMAL_POLL_MS = 15000 // when everything works: refresh every 15 s
const RETRY_POLL_MS = 5000   // while waking up: try again every 5 s
const GIVE_UP_AFTER_MS = 120000

export default function useMonitor() {
  const [endpoints, setEndpoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [server, setServer] = useState('connecting')
  const [lastSync, setLastSync] = useState(null)
  const [waitingSince, setWaitingSince] = useState(null)
  const firstFailure = useRef(null)
  const timer = useRef(null)
  const inFlight = useRef(false)

  const refresh = useCallback(async () => {
    if (inFlight.current) return
    inFlight.current = true
    clearTimeout(timer.current)
    let next = NORMAL_POLL_MS
    try {
      const res = await api.get('/apis')
      setEndpoints(res.data)
      setServer('ok')
      setLastSync(new Date())
      firstFailure.current = null
      setWaitingSince(null)
      setLoading(false)
    } catch (err) {
      next = RETRY_POLL_MS
      if (!firstFailure.current) {
        firstFailure.current = Date.now()
        setWaitingSince(firstFailure.current)
      }
      if (err.response?.status === 503) {
        setServer('database')
      } else if (Date.now() - firstFailure.current > GIVE_UP_AFTER_MS) {
        setServer('offline')
        next = NORMAL_POLL_MS
      } else {
        setServer('waking')
      }
    } finally {
      inFlight.current = false
      timer.current = setTimeout(refresh, next)
    }
  }, [])

  useEffect(() => {
    refresh()
    return () => clearTimeout(timer.current)
  }, [refresh])

  return { endpoints, loading, server, lastSync, waitingSince, refresh }
}
