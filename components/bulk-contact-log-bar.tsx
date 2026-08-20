'use client'

import { useState, useTransition } from 'react'
import { addContactLogBulk } from '@/lib/customers/contact-log-actions'
import { CONTACT_METHODS } from '@/lib/customers/contact-log'

function todayLocalDate() {
  const d = new Date()
  const offset = d.getTimezoneOffset()
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10)
}

export function BulkContactLogBar({
  selectedIds,
  onDone,
  onClear,
}: {
  selectedIds: string[]
  onDone: () => void
  onClear: () => void
}) {
  const [contactedAt, setContactedAt] = useState(todayLocalDate())
  const [method, setMethod] = useState<string>(CONTACT_METHODS[0])
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleApply() {
    setError(null)
    startTransition(async () => {
      try {
        await addContactLogBulk(selectedIds, { contactedAt, method, note })
        setNote('')
        onDone()
      } catch (e) {
        setError(e instanceof Error ? e.message : '일괄 기록 중 오류가 발생했습니다.')
      }
    })
  }

  return (
    <div className="card sticky top-4 z-10 mb-4 flex flex-wrap items-end gap-2 p-3">
      <p className="mr-1 shrink-0 text-sm font-medium text-ink">{selectedIds.length}명 선택됨</p>
      <label className="flex flex-col gap-1 text-xs text-ink-muted">
        날짜
        <input
          type="date"
          value={contactedAt}
          onChange={(e) => setContactedAt(e.target.value)}
          className="input"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-ink-muted">
        방법
        <select value={method} onChange={(e) => setMethod(e.target.value)} className="input">
          {CONTACT_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>
      <label className="flex min-w-40 flex-1 flex-col gap-1 text-xs text-ink-muted">
        메모(선택)
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="예: 가을 프로모션 문자 발송"
          className="input"
        />
      </label>
      <button type="button" onClick={handleApply} disabled={isPending} className="btn-primary">
        선택한 {selectedIds.length}명에 기록 추가
      </button>
      <button type="button" onClick={onClear} className="btn-secondary">
        선택 해제
      </button>
      {error && <p className="w-full text-sm text-stamp">{error}</p>}
    </div>
  )
}
