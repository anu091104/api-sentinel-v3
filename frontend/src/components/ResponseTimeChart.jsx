import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { parseTime } from '../api.js'
import { useTheme, CHART_COLORS } from '../theme/ThemeContext.jsx'

export default function ResponseTimeChart({ history }) {
  const { resolved } = useTheme()
  const c = CHART_COLORS[resolved]
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
            <stop offset="0%" stopColor={c.fill} stopOpacity={0.28} />
            <stop offset="100%" stopColor={c.fill} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={c.grid} vertical={false} />
        <XAxis dataKey="time" stroke={c.axis} fontSize={11} tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis stroke={c.axis} fontSize={11} tickLine={false} axisLine={false} unit=" ms" width={64} />
        <Tooltip
          formatter={(v) => [`${Math.round(v)} ms`, 'Response']}
          contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, fontSize: 12, color: 'var(--ink)' }}
          labelStyle={{ color: 'var(--muted)' }}
        />
        <Area type="monotone" dataKey="ms" stroke={c.line} strokeWidth={1.6} fill="url(#rt-fill)" dot={false} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
