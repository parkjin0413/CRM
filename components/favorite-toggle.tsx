'use client'

import { useState, useTransition } from 'react'
import { toggleFavorite } from '@/lib/customers/actions'

export function FavoriteToggle({
  id,
  initialValue,
  onToggle,
}: {
  id: string
  initialValue: boolean
  /** Notifies a parent that owns a copy of this value (e.g. for row styling) so it can stay in sync. */
  onToggle?: (isFavorite: boolean) => void
}) {
  const [isFavorite, setIsFavorite] = useState(initialValue)
  const [isPending, startTransition] = useTransition()

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const next = !isFavorite
    setIsFavorite(next)
    onToggle?.(next)
    startTransition(async () => {
      try {
        await toggleFavorite(id, next)
      } catch {
        setIsFavorite(!next)
        onToggle?.(!next)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
      className="text-lg leading-none disabled:opacity-50"
    >
      <span aria-hidden className={isFavorite ? 'text-favorite' : 'text-ink-muted'}>
        {isFavorite ? '★' : '☆'}
      </span>
    </button>
  )
}
