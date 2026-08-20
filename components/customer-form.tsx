'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { createCustomer, updateCustomer } from '@/lib/customers/actions'
import type { Customer, CustomerInput } from '@/lib/customers/types'
import { SourceTag } from './source-tag'
import { BusinessCardUpload } from './business-card-upload'

export function CustomerForm({
  mode,
  customerId,
  initialValue,
  sourceOptions,
  existingBusinessCardUrl,
}: {
  mode: 'create' | 'edit'
  customerId?: string
  initialValue?: CustomerInput
  sourceOptions: string[]
  existingBusinessCardUrl?: string | null
}) {
  const router = useRouter()
  const [values, setValues] = useState<CustomerInput>(
    initialValue ?? { source: sourceOptions[0] ?? '', name: '', company: '', phone: '', email: '', memo: '' }
  )
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [duplicate, setDuplicate] = useState<Customer | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [businessCardFile, setBusinessCardFile] = useState<File | null>(null)
  const [removeBusinessCard, setRemoveBusinessCard] = useState(false)

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
          const result = await updateCustomer(customerId, values, {
            businessCardFile,
            removeBusinessCard,
          })
          if (result.status === 'invalid') {
            setFieldErrors(Object.fromEntries(result.errors.map((e) => [e.field, e.message])))
            return
          }
          router.push('/')
          return
        }

        const result = await createCustomer(values, { force, businessCardFile })
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
      className="card flex max-w-md flex-col gap-4 p-6"
    >
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink">
          구분 <span className="text-stamp">*</span>
        </span>
        <div className="flex items-center gap-2.5">
          <select
            value={values.source}
            onChange={(e) => update('source', e.target.value)}
            className="input"
          >
            {sourceOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {values.source && <SourceTag value={values.source} />}
        </div>
        {fieldErrors.source && <span className="text-xs text-stamp">{fieldErrors.source}</span>}
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink">
          이름 <span className="text-stamp">*</span>
        </span>
        <input value={values.name} onChange={(e) => update('name', e.target.value)} className="input" />
        {fieldErrors.name && <span className="text-xs text-stamp">{fieldErrors.name}</span>}
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink">
          소속(회사) <span className="text-stamp">*</span>
        </span>
        <input value={values.company} onChange={(e) => update('company', e.target.value)} className="input" />
        {fieldErrors.company && <span className="text-xs text-stamp">{fieldErrors.company}</span>}
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink">
          연락처 <span className="text-stamp">*</span>
        </span>
        <input value={values.phone} onChange={(e) => update('phone', e.target.value)} className="input font-mono" />
        {fieldErrors.phone && <span className="text-xs text-stamp">{fieldErrors.phone}</span>}
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink">이메일</span>
        <input value={values.email ?? ''} onChange={(e) => update('email', e.target.value)} className="input" />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink">메모</span>
        <textarea value={values.memo ?? ''} onChange={(e) => update('memo', e.target.value)} rows={3} className="input" />
      </label>

      <BusinessCardUpload
        existingUrl={existingBusinessCardUrl}
        onChange={(file, removed) => {
          setBusinessCardFile(file)
          setRemoveBusinessCard(removed)
        }}
      />

      {duplicate && (
        <div className="rounded-md border border-stamp/30 bg-stamp-bg p-3 text-sm text-ink">
          <p>
            이미 등록된 연락처입니다: {duplicate.name} ({duplicate.company})
          </p>
          <button type="button" onClick={() => submit(true)} disabled={isPending} className="btn-primary mt-2 bg-stamp hover:opacity-90">
            그래도 등록
          </button>
        </div>
      )}

      {error && <p className="text-sm text-stamp">{error}</p>}

      <button type="submit" disabled={isPending} className="btn-primary">
        {mode === 'create' ? '등록' : '저장'}
      </button>
    </form>
  )
}
