export type DonutDatum = { label: string; value: number; color: string }

const SIZE = 160
const STROKE = 26
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const GAP = 3

/** Part-to-whole with a small number of categories — a ring plus a legend that carries the exact values. */
export function DonutChart({ title, data }: { title: string; data: DonutDatum[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  const lengths = data.map((d) => (total > 0 ? (d.value / total) * CIRCUMFERENCE : 0))
  const segments = data.map((d, i) => {
    const length = lengths[i]
    const cumulative = lengths.slice(0, i).reduce((sum, l) => sum + l, 0)
    return {
      ...d,
      fraction: total > 0 ? d.value / total : 0,
      dash: Math.max(length - GAP, 0),
      offset: -cumulative,
    }
  })

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-ink">{title}</h3>
      {total === 0 ? (
        <p className="text-sm text-ink-muted">데이터가 없습니다.</p>
      ) : (
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
            <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={title}>
              <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
                <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="var(--paper)" strokeWidth={STROKE} />
                {segments.map((s) => (
                  <circle
                    key={s.label}
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={STROKE}
                    strokeDasharray={`${s.dash} ${CIRCUMFERENCE - s.dash}`}
                    strokeDashoffset={s.offset}
                    strokeLinecap="round"
                  >
                    <title>{`${s.label}: ${s.value}명 (${Math.round(s.fraction * 100)}%)`}</title>
                  </circle>
                ))}
              </g>
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-semibold text-ink">{total}</span>
              <span className="text-[11px] text-ink-muted">전체</span>
            </div>
          </div>
          <ul className="flex w-full min-w-0 flex-col gap-1.5">
            {segments.map((s) => (
              <li key={s.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: s.color }}
                    aria-hidden
                  />
                  <span className="truncate text-ink">{s.label}</span>
                </span>
                <span className="shrink-0 font-mono text-[13px] text-ink-muted">
                  {s.value} · {Math.round(s.fraction * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
