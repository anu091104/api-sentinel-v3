import useEscape from '../hooks/useEscape.js'
// "Are you sure?" box shown before anything destructive.
export default function ConfirmDialog({ title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  useEscape(onCancel)
  return (
    <div className="overlay is-top" onMouseDown={onCancel}>
      <div className="modal is-small" onMouseDown={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p className="muted">{message}</p>
        <div className="modal-actions">
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn-danger is-solid" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
