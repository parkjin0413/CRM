'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto mt-24 flex max-w-sm flex-col items-center text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="KANGSAN 고객 관리" width={40} height={40} className="mb-3" />
      <h1 className="mb-2 text-lg font-semibold text-ink">일시적인 오류가 발생했어요</h1>
      <p className="mb-6 text-sm text-ink-muted">
        네트워크가 잠깐 불안정했거나 서버가 막 재시작된 경우일 수 있어요. 다시 시도해주세요.
      </p>
      <button type="button" onClick={() => reset()} className="btn-primary">
        다시 시도
      </button>
    </main>
  )
}
