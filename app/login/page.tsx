import { login } from './actions'
import { SealMark } from '@/components/seal-mark'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>
}) {
  const { error, from } = await searchParams

  return (
    <main className="mx-auto mt-28 flex max-w-xs flex-col items-center">
      <SealMark className="mb-3" />
      <h1 className="mb-6 text-lg font-semibold text-ink">고객 CRM</h1>
      <form action={login} className="card flex w-full flex-col gap-3 p-6">
        <input type="hidden" name="from" value={from ?? '/'} />
        <input type="password" name="password" placeholder="비밀번호" required className="input" autoFocus />
        <button type="submit" className="btn-primary">
          입장
        </button>
        {error && <p className="text-sm text-stamp">비밀번호가 올바르지 않습니다.</p>}
      </form>
    </main>
  )
}
