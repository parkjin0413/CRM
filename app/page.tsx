import Link from 'next/link'
import { getCustomers, getSourceOptions } from '@/lib/customers/actions'
import { CustomerListClient } from '@/components/customer-list-client'

export default async function HomePage() {
  const [customers, sourceOptions] = await Promise.all([getCustomers(), getSourceOptions()])

  return (
    <main className="mx-auto max-w-6xl p-6 font-sans">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">고객 목록</h1>
        <div className="flex gap-2">
          <Link href="/customers/new" className="rounded bg-black px-3 py-2 text-sm text-white">
            개별 등록
          </Link>
          <Link href="/customers/import" className="rounded border border-gray-300 px-3 py-2 text-sm">
            엑셀 일괄등록
          </Link>
          <a href="/api/customers/template" className="rounded border border-gray-300 px-3 py-2 text-sm">
            양식 다운로드
          </a>
          <a href="/api/customers/export" className="rounded border border-gray-300 px-3 py-2 text-sm">
            엑셀 내보내기
          </a>
        </div>
      </div>
      <CustomerListClient initialCustomers={customers} sourceOptions={sourceOptions} />
    </main>
  )
}
