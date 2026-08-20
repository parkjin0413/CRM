import { HoverCard } from './hover-card'

type ContactLogEntry = { contactedAt: string; method: string; note: string | null }

export function ContactHistoryPreview({
  label,
  logs,
}: {
  label: string
  logs?: ContactLogEntry[]
}) {
  if (!logs || logs.length === 0) {
    return <span>{label}</span>
  }

  return (
    <HoverCard
      triggerClassName="underline decoration-dotted decoration-line underline-offset-4 hover:decoration-accent"
      trigger={label}
      panel={
        <ul className="flex min-w-52 flex-col gap-2 text-sm">
          {logs.map((log, i) => (
            <li key={i} className="border-b border-line pb-2 last:border-0 last:pb-0">
              <p>
                <span className="font-mono text-[13px] text-ink-muted">{log.contactedAt}</span>{' '}
                <span className="font-medium text-ink">{log.method}</span>
              </p>
              {log.note && <p className="mt-0.5 text-ink-muted">{log.note}</p>}
            </li>
          ))}
        </ul>
      }
    />
  )
}
