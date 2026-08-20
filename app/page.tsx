import Link from 'next/link'
import { getCustomers, getSourceOptions } from '@/lib/customers/actions'
import { CustomerListClient } from '@/components/customer-list-client'
import { AppHeader } from '@/components/app-header'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [customers, sourceOptions] = await Promise.all([getCustomers(), getSourceOptions()])

  return (
    <main className="mx-auto max-w-6xl p-6">
      <AppHeader
        title="고객 목록"
        actions={
          <>
            <Link href="/customers/new" className="btn-primary">
              개별 등록
            </Link>
            <Link href="/customers/import" className="btn-secondary">
              엑셀 일괄등록
            </Link>
            <a href="/api/customers/template" className="btn-secondary">
              양식 다운로드
            </a>
            <Link href="/settings/sources" className="btn-secondary">
              구분 관리
            </Link>
          </>
        }
      />
      <CustomerListClient initialCustomers={customers} sourceOptions={sourceOptions} />
    </main>
  )
}
