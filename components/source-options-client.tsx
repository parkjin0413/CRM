'use client'

import { useState, useTransition } from 'react'
import { addSourceOption, deleteSourceOption } from '@/lib/customers/actions'

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
    <div className="max-w-md font-sans">
      <ul className="mb-4 flex flex-col gap-2">
        {options.map((option) => (
          <li key={option} className="flex items-center justify-between rounded border border-gray-300 px-3 py-2">
            {option}
            <button onClick={() => handleDelete(option)} disabled={isPending} className="text-sm text-red-600">
              삭제
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="새 구분 값"
          className="flex-1 rounded border border-gray-300 px-3 py-2"
        />
        <button onClick={handleAdd} disabled={isPending} className="rounded bg-black px-3 py-2 text-white">
          추가
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
