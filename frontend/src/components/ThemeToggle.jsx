import { useRef } from 'react'
import { useTheme } from '../theme/ThemeContext.jsx'
import { Sun, Moon, Monitor } from './Icons.jsx'

const OPTIONS = [
  { value: 'light', label: 'Light theme', Icon: Sun },
  { value: 'dark', label: 'Dark theme', Icon: Moon },
  { value: 'system', label: 'Use system theme', Icon: Monitor },
]

/*
  A three-way switch: Light / Dark / System.
  Built as an ARIA radio group: Tab focuses it, the arrow keys move between
  options, and Enter or Space selects one.
*/
export default function ThemeToggle() {
  const { preference, setPreference } = useTheme()
  const refs = useRef([])

  const onKeyDown = (e, index) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
    if (!step) return
    e.preventDefault()
    const next = (index + step + OPTIONS.length) % OPTIONS.length
    setPreference(OPTIONS[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div className="theme-toggle" role="radiogroup" aria-label="Colour theme">
      {OPTIONS.map(({ value, label, Icon }, i) => {
        const checked = preference === value
        return (
          <button
            key={value}
            ref={(el) => { refs.current[i] = el }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={label}
            title={label}
            tabIndex={checked ? 0 : -1}
            className={checked ? 'is-on' : ''}
            onClick={() => setPreference(value)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            <Icon />
          </button>
        )
      })}
    </div>
  )
}
