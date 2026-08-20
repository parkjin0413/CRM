import type { ReactNode } from 'react'
import Link from 'next/link'

export function AppHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
      <Link href="/" className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="KANGSAN 고객 관리" width={28} height={28} className="shrink-0" />
        <div>
          <p className="text-xs tracking-wide text-ink-muted">KANGSAN 고객 관리</p>
          <h1 className="text-2xl font-semibold text-ink">{title}</h1>
        </div>
      </Link>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  )
}
