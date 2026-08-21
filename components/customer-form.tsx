'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { createCustomer, updateCustomer } from '@/lib/customers/actions'
import type { Customer, CustomerInput } from '@/lib/customers/types'
import { SourceTag } from './source-tag'
import { BusinessCardUpload } from './business-card-upload'

const FIELD_LABELS: Record<string, string> = {
  source: '구분',
  name: '이름',
  company: '소속(회사)',
  phone: '연락처',
}

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
  const errorSummaryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (Object.keys(fieldErrors).length > 0) {
      errorSummaryRef.current?.focus()
    }
  }, [fieldErrors])

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

  const errorFields = Object.keys(fieldErrors)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit(false)
      }}
      className="card flex max-w-md flex-col gap-4 p-6"
    >
      {errorFields.length > 0 && (
        <div
          ref={errorSummaryRef}
          role="alert"
          tabIndex={-1}
          className="rounded-md border border-stamp/30 bg-stamp-bg p-3 text-sm"
        >
          <p className="font-medium text-ink">입력값을 확인해주세요</p>
          <ul className="mt-1 list-disc pl-5 text-stamp">
            {errorFields.map((field) => (
              <li key={field}>
                <a href={`#field-${field}`} className="underline">
                  {fieldErrors[field]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink">
          {FIELD_LABELS.source} <span className="text-stamp">*</span>
        </span>
        <div className="flex items-center gap-2.5">
          <select
            id="field-source"
            value={values.source}
            onChange={(e) => update('source', e.target.value)}
            aria-invalid={!!fieldErrors.source}
            aria-describedby={fieldErrors.source ? 'field-source-error' : undefined}
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
        {fieldErrors.source && (
          <span id="field-source-error" className="text-xs text-stamp">
            {fieldErrors.source}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink">
          {FIELD_LABELS.name} <span className="text-stamp">*</span>
        </span>
        <input
          id="field-name"
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
          aria-invalid={!!fieldErrors.name}
          aria-describedby={fieldErrors.name ? 'field-name-error' : undefined}
          className="input"
        />
        {fieldErrors.name && (
          <span id="field-name-error" className="text-xs text-stamp">
            {fieldErrors.name}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink">
          {FIELD_LABELS.company} <span className="text-stamp">*</span>
        </span>
        <input
          id="field-company"
          value={values.company}
          onChange={(e) => update('company', e.target.value)}
          aria-invalid={!!fieldErrors.company}
          aria-describedby={fieldErrors.company ? 'field-company-error' : undefined}
          className="input"
        />
        {fieldErrors.company && (
          <span id="field-company-error" className="text-xs text-stamp">
            {fieldErrors.company}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink">
          {FIELD_LABELS.phone} <span className="text-stamp">*</span>
        </span>
        <input
          id="field-phone"
          value={values.phone}
          onChange={(e) => update('phone', e.target.value)}
          aria-invalid={!!fieldErrors.phone}
          aria-describedby={fieldErrors.phone ? 'field-phone-error' : undefined}
          className="input font-mono"
        />
        {fieldErrors.phone && (
          <span id="field-phone-error" className="text-xs text-stamp">
            {fieldErrors.phone}
          </span>
        )}
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
        <div role="alert" className="rounded-md border border-stamp/30 bg-stamp-bg p-3 text-sm text-ink">
          <p>
            이미 등록된 연락처입니다: {duplicate.name} ({duplicate.company})
          </p>
          <button type="button" onClick={() => submit(true)} disabled={isPending} className="btn-primary mt-2 bg-stamp hover:opacity-90">
            그래도 등록
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-stamp">
          {error}
        </p>
      )}

      <button type="submit" disabled={isPending} className="btn-primary">
        {mode === 'create' ? '등록' : '저장'}
      </button>
    </form>
  )
}
