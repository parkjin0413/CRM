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
    <div className="card p-4">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
      {delta !== undefined && (
        <p className="mt-1 text-xs text-ink-muted">
          {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}
          {deltaLabel ? ` ${deltaLabel}` : ''}
        </p>
      )}
    </div>
  )
}
