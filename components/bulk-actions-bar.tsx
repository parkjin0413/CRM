'use client'

import { useState, useTransition } from 'react'
import { addContactLogBulk } from '@/lib/customers/contact-log-actions'
import { updateSourceBulk, deleteCustomerBulk } from '@/lib/customers/actions'
import { CONTACT_METHODS } from '@/lib/customers/contact-log'

function todayLocalDate() {
  const d = new Date()
  const offset = d.getTimezoneOffset()
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10)
}

export function BulkActionsBar({
  selectedIds,
  sourceOptions,
  onDone,
  onClear,
}: {
  selectedIds: string[]
  sourceOptions: string[]
  onDone: () => void
  onClear: () => void
}) {
  const [contactedAt, setContactedAt] = useState(todayLocalDate())
  const [method, setMethod] = useState<string>(CONTACT_METHODS[0])
  const [note, setNote] = useState('')
  const [newSource, setNewSource] = useState(sourceOptions[0] ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleAddContactLog() {
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

  function handleDelete() {
    if (!confirm(`선택한 ${selectedIds.length}명의 고객 정보를 삭제할까요? 되돌릴 수 없습니다.`)) return
    setError(null)
    startTransition(async () => {
      try {
        await deleteCustomerBulk(selectedIds)
        onDone()
      } catch (e) {
        setError(e instanceof Error ? e.message : '일괄 삭제 중 오류가 발생했습니다.')
      }
    })
  }

  function handleChangeSource() {
    if (!newSource) return
    if (!confirm(`선택한 ${selectedIds.length}명의 구분을 "${newSource}"(으)로 변경할까요?`)) return
    setError(null)
    startTransition(async () => {
      try {
        await updateSourceBulk(selectedIds, newSource)
        onDone()
      } catch (e) {
        setError(e instanceof Error ? e.message : '일괄 변경 중 오류가 발생했습니다.')
      }
    })
  }

  return (
    <div className="card sticky top-4 z-10 mb-4 flex flex-col gap-3 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink">{selectedIds.length}명 선택됨</p>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onClear} className="text-xs text-ink-muted hover:text-ink hover:underline">
            선택 해제
          </button>
          <button type="button" onClick={handleDelete} disabled={isPending} className="text-xs text-stamp hover:underline disabled:opacity-50">
            고객 삭제
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2 border-t border-line pt-3">
        <span className="w-full text-xs font-medium text-ink-muted sm:w-auto sm:self-center">연락 기록 추가</span>
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
        <button type="button" onClick={handleAddContactLog} disabled={isPending} className="btn-primary">
          기록 추가
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-2 border-t border-line pt-3">
        <span className="w-full text-xs font-medium text-ink-muted sm:w-auto sm:self-center">구분 일괄 변경</span>
        <select value={newSource} onChange={(e) => setNewSource(e.target.value)} className="input w-40">
          {sourceOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="button" onClick={handleChangeSource} disabled={isPending} className="btn-secondary">
          변경 적용
        </button>
      </div>

      {error && <p className="text-sm text-stamp">{error}</p>}
    </div>
  )
}
