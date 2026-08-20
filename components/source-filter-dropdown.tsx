'use client'

import { useEffect, useRef, useState } from 'react'
import { tagColorFor } from './source-tag'

export function SourceFilterDropdown({
  options,
  selected,
  onChange,
}: {
  options: string[]
  selected: string[]
  onChange: (next: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function toggle(value: string) {
    onChange(selected.includes(value) ? selected.filter((s) => s !== value) : [...selected, value])
  }

  const label = selected.length === 0 ? '구분 전체' : `구분 ${selected.length}개 선택`

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="btn-secondary min-w-40 justify-between"
      >
        <span>{label}</span>
        <span
          aria-hidden
          className={`text-ink-muted transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="card absolute z-10 mt-1.5 w-60 p-2"
        >
          <div className="flex items-center justify-between px-1.5 pb-1.5 text-xs text-ink-muted">
            <span>{options.length}개 항목</span>
            {selected.length > 0 && (
              <button type="button" onClick={() => onChange([])} className="btn-link">
                전체 해제
              </button>
            )}
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {options.map((option) => {
              const { bg } = tagColorFor(option)
              return (
                <li key={option}>
                  <label className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1.5 text-sm hover:bg-paper">
                    <input
                      type="checkbox"
                      checked={selected.includes(option)}
                      onChange={() => toggle(option)}
                      className="accent-accent"
                    />
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: bg }} aria-hidden />
                    <span className="text-ink">{option}</span>
                  </label>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
