import { login } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>
}) {
  const { error, from } = await searchParams

  return (
    <main className="mx-auto mt-24 max-w-xs font-sans">
      <h1 className="mb-4 text-xl font-semibold">CRM 로그인</h1>
      <form action={login} className="flex flex-col gap-2">
        <input type="hidden" name="from" value={from ?? '/'} />
        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          required
          className="rounded border border-gray-300 px-3 py-2"
        />
        <button type="submit" className="rounded bg-black px-3 py-2 text-white">
          입장
        </button>
        {error && <p className="text-sm text-red-600">비밀번호가 올바르지 않습니다.</p>}
      </form>
    </main>
  )
}
