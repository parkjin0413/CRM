'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { createCustomer, updateCustomer } from '@/lib/customers/actions'
import type { Customer, CustomerInput } from '@/lib/customers/types'

export function CustomerForm({
  mode,
  customerId,
  initialValue,
  sourceOptions,
}: {
  mode: 'create' | 'edit'
  customerId?: string
  initialValue?: CustomerInput
  sourceOptions: string[]
}) {
  const router = useRouter()
  const [values, setValues] = useState<CustomerInput>(
    initialValue ?? { source: sourceOptions[0] ?? '', name: '', company: '', phone: '', email: '', memo: '' }
  )
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [duplicate, setDuplicate] = useState<Customer | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function update<K extends keyof CustomerInput>(key: K, value: CustomerInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function submit(force: boolean) {
    setFieldErrors({})
    setDuplicate(null)
    setError(null)

    startTransition(async () => {
      try {
        if (mode === 'edit' && customerId) {
          const result = await updateCustomer(customerId, values)
          if (result.status === 'invalid') {
            setFieldErrors(Object.fromEntries(result.errors.map((e) => [e.field, e.message])))
            return
          }
          router.push('/')
          return
        }

        const result = await createCustomer(values, { force })
        if (result.status === 'invalid') {
          setFieldErrors(Object.fromEntries(result.errors.map((e) => [e.field, e.message])))
          return
        }
        if (result.status === 'duplicate') {
          setDuplicate(result.existing)
          return
        }
        router.push('/')
      } catch (e) {
        setError(e instanceof Error ? e.message : '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      }
    })
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit(false)
      }}
      className="flex max-w-md flex-col gap-3 font-sans"
    >
      <label className="flex flex-col gap-1 text-sm">
        구분 *
        <select
          value={values.source}
          onChange={(e) => update('source', e.target.value)}
          className="rounded border border-gray-300 px-3 py-2"
        >
          {sourceOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {fieldErrors.source && <span className="text-red-600">{fieldErrors.source}</span>}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        이름 *
        <input
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
          className="rounded border border-gray-300 px-3 py-2"
        />
        {fieldErrors.name && <span className="text-red-600">{fieldErrors.name}</span>}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        소속(회사) *
        <input
          value={values.company}
          onChange={(e) => update('company', e.target.value)}
          className="rounded border border-gray-300 px-3 py-2"
        />
        {fieldErrors.company && <span className="text-red-600">{fieldErrors.company}</span>}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        연락처 *
        <input
          value={values.phone}
          onChange={(e) => update('phone', e.target.value)}
          className="rounded border border-gray-300 px-3 py-2"
        />
        {fieldErrors.phone && <span className="text-red-600">{fieldErrors.phone}</span>}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        이메일
        <input
          value={values.email ?? ''}
          onChange={(e) => update('email', e.target.value)}
          className="rounded border border-gray-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        메모
        <textarea
          value={values.memo ?? ''}
          onChange={(e) => update('memo', e.target.value)}
          className="rounded border border-gray-300 px-3 py-2"
        />
      </label>

      {duplicate && (
        <div className="rounded border border-yellow-400 bg-yellow-50 p-3 text-sm">
          <p>
            이미 등록된 연락처입니다: {duplicate.name} ({duplicate.company})
          </p>
          <button
            type="button"
            onClick={() => submit(true)}
            disabled={isPending}
            className="mt-2 rounded bg-black px-3 py-1 text-white"
          >
            그래도 등록
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={isPending} className="rounded bg-black px-3 py-2 text-white">
        {mode === 'create' ? '등록' : '저장'}
      </button>
    </form>
  )
}
