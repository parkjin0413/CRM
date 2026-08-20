import { getSourceOptions } from '@/lib/customers/actions'
import { CustomerForm } from '@/components/customer-form'
import { AppHeader } from '@/components/app-header'

export const dynamic = 'force-dynamic'

export default async function NewCustomerPage() {
  const sourceOptions = await getSourceOptions()
  return (
    <main className="mx-auto max-w-2xl p-6">
      <AppHeader title="고객 개별 등록" />
      <CustomerForm mode="create" sourceOptions={sourceOptions} />
    </main>
  )
}
