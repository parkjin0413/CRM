import { login } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>
}) {
  const { error, from } = await searchParams

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-green/25 via-brand-blue/20 to-transparent blur-3xl"
      />
      <div className="relative flex w-full max-w-xs flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="KANGSAN 고객 관리" width={44} height={44} className="mb-3" />
        <h1 className="mb-1 text-lg font-semibold tracking-tight text-ink">KANGSAN 고객 관리</h1>
        <p className="mb-6 text-xs text-ink-muted">CRM 시스템에 로그인하세요</p>
        <form action={login} className="card flex w-full flex-col gap-3 p-6 shadow-[var(--shadow-lg)]">
          <input type="hidden" name="from" value={from ?? '/'} />
          <label className="flex flex-col gap-1.5 text-left text-sm">
            <span className="font-medium text-ink">비밀번호</span>
            <input type="password" name="password" required className="input" autoFocus />
          </label>
          <button type="submit" className="btn-primary mt-1">
            입장
          </button>
          {error && (
            <p role="alert" className="text-sm text-stamp">
              비밀번호가 올바르지 않습니다.
            </p>
          )}
        </form>
      </div>
    </main>
  )
}
