import { notFound } from 'next/navigation'
import { getCustomers, getSourceOptions } from '@/lib/customers/actions'
import { CustomerForm } from '@/components/customer-form'
import { AppHeader } from '@/components/app-header'

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [customers, sourceOptions] = await Promise.all([getCustomers(), getSourceOptions()])
  const customer = customers.find((c) => c.id === id)
  if (!customer) notFound()

  return (
    <main className="mx-auto max-w-2xl p-6">
      <AppHeader title="고객 정보 수정" />
      <CustomerForm
        mode="edit"
        customerId={customer.id}
        sourceOptions={sourceOptions}
        initialValue={{
          source: customer.source,
          name: customer.name,
          company: customer.company,
          phone: customer.phone,
          email: customer.email ?? '',
          memo: customer.memo ?? '',
        }}
      />
    </main>
  )
}
