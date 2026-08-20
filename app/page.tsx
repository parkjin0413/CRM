import Link from 'next/link'
import { getCustomers, getSourceOptions, attachBusinessCardUrls } from '@/lib/customers/actions'
import { attachContactSummaries } from '@/lib/customers/contact-log-actions'
import { CustomerListClient } from '@/components/customer-list-client'
import { AppHeader } from '@/components/app-header'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [rawCustomers, sourceOptions] = await Promise.all([getCustomers(), getSourceOptions()])
  const withCards = await attachBusinessCardUrls(rawCustomers)
  const customers = await attachContactSummaries(withCards)

  return (
    <main className="mx-auto max-w-6xl p-6">
      <AppHeader
        title="CRM 시스템"
        actions={
          <>
            <Link href="/customers/new" className="btn-primary">
              개별 등록
            </Link>
            <Link href="/customers/import" className="btn-secondary hidden sm:inline-flex">
              엑셀 일괄등록
            </Link>
            <a href="/api/customers/template" className="btn-secondary hidden sm:inline-flex">
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
