import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { parseTime } from '../api.js'

export default function ResponseTimeChart({ history }) {
  // History arrives newest first; charts read left (old) to right (new).
  const data = [...history].reverse().map((h) => ({
    time: parseTime(h.checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ms: h.response_time_ms,
  }))

  if (data.length < 2) {
    return <p className="muted small chart-empty">The chart fills in after a few checks (one per minute).</p>
  }

  return (
    <ResponsiveContainer width="100%" height={190}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
        <defs>
          <linearGradient id="rt-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3aa8ff" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#3aa8ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#ececea" vertical={false} />
        <XAxis dataKey="time" stroke="#9a9a96" fontSize={11} tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis stroke="#9a9a96" fontSize={11} tickLine={false} axisLine={false} unit=" ms" width={64} />
        <Tooltip
          formatter={(v) => [`${Math.round(v)} ms`, 'Response']}
          contentStyle={{ background: '#fff', border: '1px solid #e7e7e4', borderRadius: 12, fontSize: 12 }}
        />
        <Area type="monotone" dataKey="ms" stroke="#0e0e0e" strokeWidth={1.6} fill="url(#rt-fill)" dot={false} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
