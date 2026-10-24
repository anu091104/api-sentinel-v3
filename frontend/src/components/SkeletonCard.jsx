// Grey placeholder shown while the first data loads, so the page never looks empty.
export default function SkeletonCard() {
  return (
    <div className="api-card is-skeleton" aria-hidden="true">
      <div className="api-art shimmer" />
      <div className="api-body">
        <div className="sk-line shimmer" style={{ width: '60%', height: 18 }} />
        <div className="sk-line shimmer" style={{ width: '85%' }} />
        <div className="sk-line shimmer" style={{ width: '100%', height: 40, marginTop: 18 }} />
      </div>
    </div>
  )
}
