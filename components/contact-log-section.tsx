'use client'

import { useState, useTransition } from 'react'
import { addContactLog, deleteContactLog } from '@/lib/customers/contact-log-actions'
import { CONTACT_METHODS, type ContactLog } from '@/lib/customers/contact-log'
import { formatRelativeDays } from '@/lib/customers/relative-time'

function todayLocalDate() {
  const d = new Date()
  const offset = d.getTimezoneOffset()
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10)
}

export function ContactLogSection({
  customerId,
  initialLogs,
}: {
  customerId: string
  initialLogs: ContactLog[]
}) {
  const [logs, setLogs] = useState(initialLogs)
  const [contactedAt, setContactedAt] = useState(todayLocalDate())
  const [method, setMethod] = useState<string>(CONTACT_METHODS[0])
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleAdd() {
    setError(null)
    startTransition(async () => {
      try {
        const log = await addContactLog(customerId, { contactedAt, method, note })
        setLogs((prev) => [log, ...prev].sort((a, b) => (a.contactedAt < b.contactedAt ? 1 : -1)))
        setNote('')
      } catch (e) {
        setError(e instanceof Error ? e.message : '기록 중 오류가 발생했습니다.')
      }
    })
  }

  function handleDelete(id: string) {
    setError(null)
    startTransition(async () => {
      try {
        await deleteContactLog(id, customerId)
        setLogs((prev) => prev.filter((l) => l.id !== id))
      } catch (e) {
        setError(e instanceof Error ? e.message : '삭제 중 오류가 발생했습니다.')
      }
    })
  }

  return (
    <div className="card flex flex-col gap-4 p-6">
      <h2 className="text-sm font-semibold text-ink">연락 기록</h2>

      <div className="flex flex-wrap items-end gap-2">
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
        <label className="flex min-w-32 flex-1 flex-col gap-1 text-xs text-ink-muted">
          메모(선택)
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="예: 견적서 발송"
            className="input"
          />
        </label>
        <button type="button" onClick={handleAdd} disabled={isPending} className="btn-primary">
          기록 추가
        </button>
      </div>

      {error && <p className="text-sm text-stamp">{error}</p>}

      {logs.length === 0 ? (
        <p className="text-sm text-ink-muted">아직 연락 기록이 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {logs.map((log) => (
            <li
              key={log.id}
              className="flex items-start justify-between gap-3 rounded-md border border-line bg-paper px-3 py-2 text-sm"
            >
              <div>
                <p>
                  <span className="font-mono text-[13px] text-ink-muted">{log.contactedAt}</span>{' '}
                  <span className="text-ink-muted">({formatRelativeDays(log.contactedAt)})</span>{' '}
                  <span className="font-medium text-ink">{log.method}</span>
                </p>
                {log.note && <p className="mt-0.5 text-ink-muted">{log.note}</p>}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(log.id)}
                disabled={isPending}
                className="shrink-0 text-xs text-stamp hover:underline"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
