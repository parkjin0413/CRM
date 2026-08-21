import { login } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>
}) {
  const { error, from } = await searchParams

  return (
    <main className="mx-auto mt-28 flex max-w-xs flex-col items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="KANGSAN 고객 관리" width={40} height={40} className="mb-3" />
      <h1 className="mb-6 text-lg font-semibold text-ink">KANGSAN 고객 관리</h1>
      <form action={login} className="card flex w-full flex-col gap-3 p-6">
        <input type="hidden" name="from" value={from ?? '/'} />
        <input type="password" name="password" placeholder="비밀번호" required className="input" autoFocus />
        <button type="submit" className="btn-primary">
          입장
        </button>
        {error && (
          <p role="alert" className="text-sm text-stamp">
            비밀번호가 올바르지 않습니다.
          </p>
        )}
      </form>
    </main>
  )
}
