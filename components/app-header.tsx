import type { ReactNode } from 'react'
import { SealMark } from './seal-mark'

export function AppHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
      <div className="flex items-center gap-3">
        <SealMark />
        <div>
          <p className="text-xs tracking-wide text-ink-muted">고객 CRM</p>
          <h1 className="text-2xl font-semibold text-ink">{title}</h1>
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  )
}
