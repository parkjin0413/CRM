'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { deleteCustomer } from '@/lib/customers/actions'

export function DeleteCustomerButton({ id }: { id: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('이 고객 정보를 삭제할까요?')) return
    setError(null)
    startTransition(async () => {
      try {
        await deleteCustomer(id)
        router.push('/')
      } catch (e) {
        setError(e instanceof Error ? e.message : '삭제 중 오류가 발생했습니다.')
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={handleDelete} disabled={isPending} className="btn-danger">
        삭제
      </button>
      {error && <span className="text-xs text-stamp">{error}</span>}
    </div>
  )
}
