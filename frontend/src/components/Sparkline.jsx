import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts'
import { useTheme, CHART_COLORS } from '../theme/ThemeContext.jsx'

// Tiny chart of the last 10 response times, drawn on each card.
export default function Sparkline({ data, isDown }) {
  const { resolved } = useTheme()
  const palette = CHART_COLORS[resolved]
  if (!data || data.length < 2) {
    return <div className="spark-empty">Trend appears after a couple of checks</div>
  }
  const points = data.map((v, i) => ({ i, v }))
  const color = isDown ? palette.down : palette.line
  const id = `spark-${isDown ? 'down' : 'up'}-${resolved}`

  return (
    <div className="spark">
      <ResponsiveContainer width="100%" height={40}>
        <AreaChart data={points} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.16} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.4} fill={`url(#${id})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
