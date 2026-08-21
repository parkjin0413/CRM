import Link from 'next/link'

export type ActionListItem = { id: string; name: string; company: string; meta: string }

export function ActionList({
  title,
  emptyText,
  items,
}: {
  title: string
  emptyText: string
  items: ActionListItem[]
}) {
  return (
    <div className="card p-4">
      <h3 className="mb-3 text-sm font-semibold text-ink">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-ink-muted">{emptyText}</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/customers/${item.id}`}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-paper"
              >
                <span className="truncate">
                  <span className="font-medium text-ink">{item.name}</span>{' '}
                  <span className="text-ink-muted">· {item.company}</span>
                </span>
                <span className="shrink-0 text-xs text-ink-muted">{item.meta}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
