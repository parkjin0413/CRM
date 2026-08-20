import { getSourceOptions } from '@/lib/customers/actions'
import { CustomerForm } from '@/components/customer-form'

export const dynamic = 'force-dynamic'

export default async function NewCustomerPage() {
  const sourceOptions = await getSourceOptions()
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-xl font-semibold">고객 개별 등록</h1>
      <CustomerForm mode="create" sourceOptions={sourceOptions} />
    </main>
  )
}
