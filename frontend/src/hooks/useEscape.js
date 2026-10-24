import { useEffect } from 'react'

// Close a dialog when the user presses the Escape key.
export default function useEscape(onEscape) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onEscape() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onEscape])
}
