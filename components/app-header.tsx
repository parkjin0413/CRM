import type { ReactNode } from 'react'
import Link from 'next/link'

export function AppHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <header className="relative mb-8 flex flex-wrap items-center justify-between gap-3 pb-4">
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-brand-green via-brand-blue to-transparent"
      />
      <Link href="/" className="group flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="KANGSAN 고객 관리"
          width={30}
          height={30}
          className="shrink-0 transition-transform duration-150 group-hover:scale-105"
        />
        <div>
          <p className="text-xs font-medium tracking-wide text-ink-muted">KANGSAN 고객 관리</p>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        </div>
      </Link>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  )
}
