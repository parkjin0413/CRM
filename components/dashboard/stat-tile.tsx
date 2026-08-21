export function StatTile({
  label,
  value,
  delta,
  deltaLabel,
}: {
  label: string
  value: number | string
  delta?: number
  deltaLabel?: string
}) {
  return (
    <div className="card p-5">
      <p className="text-xs font-medium tracking-wide text-ink-muted">{label}</p>
      <p className="mt-1.5 text-3xl font-semibold tracking-tight text-ink">{value}</p>
      {delta !== undefined && (
        <p className="mt-1.5 text-xs text-ink-muted">
          <span className={delta >= 0 ? 'text-brand-green-text' : 'text-stamp'}>
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}
          </span>
          {deltaLabel ? ` ${deltaLabel}` : ''}
        </p>
      )}
    </div>
  )
}
