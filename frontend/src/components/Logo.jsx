// A small "radar" mark: a solid disc with a sweep line and a blip.
// Colours come from CSS variables so the mark inverts in dark mode.
export default function Logo({ size = 30 }) {
  const disc = { fill: 'var(--logo-disc)' }
  const mark = { stroke: 'var(--logo-mark)' }
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="15" style={disc} />
      <circle cx="16" cy="16" r="9" fill="none" style={mark} strokeOpacity="0.28" strokeWidth="1.2" />
      <path d="M16 16 L16 4 A12 12 0 0 1 26.4 10 Z" style={{ fill: 'var(--logo-mark)' }} fillOpacity="0.22" />
      <line x1="16" y1="16" x2="26.4" y2="10" style={mark} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="21" cy="9.6" r="2" fill="#5fe3a1" />
    </svg>
  )
}
