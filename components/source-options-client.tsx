'use client'

import { useState, useTransition } from 'react'
import { addSourceOption, deleteSourceOption } from '@/lib/customers/actions'
import { SourceTag } from './source-tag'

export function SourceOptionsClient({ initialOptions }: { initialOptions: string[] }) {
  const [options, setOptions] = useState(initialOptions)
  const [newValue, setNewValue] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleAdd() {
    setError('')
    startTransition(async () => {
      const result = await addSourceOption(newValue)
      if (result.status === 'error') {
        setError(result.message)
        return
      }
      setOptions((prev) => [...prev, newValue.trim()])
      setNewValue('')
    })
  }

  function handleDelete(value: string) {
    if (!confirm(`"${value}" 구분을 삭제할까요?`)) return
    setError('')
    startTransition(async () => {
      const result = await deleteSourceOption(value)
      if (result.status === 'error') {
        setError(result.message)
        return
      }
      setOptions((prev) => prev.filter((o) => o !== value))
    })
  }

  return (
    <div className="card max-w-md p-6">
      <ul className="mb-4 flex flex-col gap-2">
        {options.map((option) => (
          <li key={option} className="flex items-center justify-between rounded-md border border-line bg-paper px-3 py-2">
            <SourceTag value={option} />
            <button
              onClick={() => handleDelete(option)}
              disabled={isPending}
              className="inline-flex min-h-6 items-center text-sm text-stamp hover:underline"
            >
              삭제
            </button>
          </li>
        ))}
        {options.length === 0 && <p className="text-sm text-ink-muted">등록된 구분이 없습니다.</p>}
      </ul>
      <div className="flex gap-2">
        <input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="새 구분 값"
          className="input flex-1"
        />
        <button onClick={handleAdd} disabled={isPending || !newValue.trim()} className="btn-primary shrink-0">
          추가
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-stamp">
          {error}
        </p>
      )}
    </div>
  )
}
