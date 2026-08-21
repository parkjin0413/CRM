export type BarDatum = { label: string; value: number; color: string }

/** Horizontal bar list — part-to-whole / magnitude comparison across categories. */
export function BarChart({ title, data }: { title: string; data: BarDatum[] }) {
  const max = Math.max(1, ...data.map((d) => d.value))

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-ink">{title}</h3>
      {data.length === 0 ? (
        <p className="text-sm text-ink-muted">데이터가 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {data.map((d) => (
            <li key={d.label} className="flex items-center gap-2.5 text-sm">
              <span className="w-20 shrink-0 truncate text-ink-muted">{d.label}</span>
              <div className="h-4 flex-1 overflow-hidden rounded-full bg-paper">
                <div
                  className="h-4 rounded-r-full transition-[width]"
                  style={{ width: `${(d.value / max) * 100}%`, backgroundColor: d.color }}
                  title={`${d.label}: ${d.value}`}
                />
              </div>
              <span className="w-8 shrink-0 text-right font-mono text-[13px] text-ink">{d.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
