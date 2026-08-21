'use client'

import { useEffect } from 'react'

const RELOAD_GUARD_KEY = 'crm-chunk-reload-guard'

function isStaleDeployError(error: Error) {
  return (
    /ChunkLoadError/i.test(error.name) ||
    /loading chunk [\d]+ failed/i.test(error.message) ||
    /failed to fetch dynamically imported module/i.test(error.message) ||
    /failed to import/i.test(error.message)
  )
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)

    if (!isStaleDeployError(error)) return

    // A new deploy while this tab was open leaves it holding JS chunk
    // references the server no longer has. reset() only re-renders — it
    // can't fetch the new chunks — so a full reload is the actual fix.
    // Guarded to once per tab session so a genuinely broken deploy falls
    // back to the button instead of reload-looping.
    let alreadyReloaded = false
    try {
      alreadyReloaded = sessionStorage.getItem(RELOAD_GUARD_KEY) === '1'
    } catch {
      // sessionStorage unavailable (private mode, etc.) — fall back to manual retry.
    }
    if (alreadyReloaded) return

    try {
      sessionStorage.setItem(RELOAD_GUARD_KEY, '1')
    } catch {
      return
    }
    window.location.reload()
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
